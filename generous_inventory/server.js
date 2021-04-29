let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

let dropInventories = {}

let viewedInventories = {}

let preventedInventories = [];

let inventoriesStored = {};


/* TEST VARIABLES BEGIN */

let testHex1 = "steam:11000010676fce5";
let testHex2 = "steam:1100001113dd8c0";

/* TEST VARIABLES END */

class Inventory {
    constructor (type, owner, items) {
        this.type = type;
        this.owner = owner;
        this.items = items;
    } 
}

class Item {
    constructor (itemName, itemLabel, itemCount, itemData) {
        this.itemName = itemName;
        this.itemLabel = itemLabel;
        this.itemCount = itemCount;
        this.itemData = itemData;
    }
}

class Weapon {
    constructor (itemName, itemLabel, itemData) {
        this.itemName = itemName;
        this.itemLabel = itemLabel;
        this.itemData = itemData;
    }
}

let Generous = {
    Items: {}
}

Main();

async function Main() {
    await InitializeItemData();
    InitializeWeaponEvents();
  

    //let testInventory1 = await GetInventory("player", testHex1);

    //let testInventory2 = await GetInventory("player", testHex2);

    //await TradeItems(testInventory1, 2, testInventory2, 1);

    //console.log(GetItemBySlot(testInventory1, 1));

    //await AddItem(testInventory1, "WEAPON_PISTOL", 1);
    //console.log(await GetItemCountInventoryHas(testHex1, "WEAPON_"));
}

function GetInventoryItemESX(identifier, itemName) {
    let inventory = GetInventory("player", identifier);
    return GetItem(inventory, itemName);
}

on("playerDropped", () => {
    let src = global.source;
    delete inventoriesStored[GetPlayerIdentifier(src, 0)];
});

exports("GetInventoryItemType", (itemName, id) => {
    let inventory = GetInventory("player", id);
    if (GetItemCountInventoryHas(inventory, itemName) > 0) {
        return ParseGenerousItemsToESXItem(inventory, GetItem(inventory, itemName));
    } else {
        let itemCommonData = Generous.Items[itemName];
    
        let returnedItem = {
            name: itemName,
            count: 0,
            label: itemCommonData.itemLabel,
            weight: itemCommonData.weight,
            canRemove: itemCommonData.canRemove
        }
    
        return returnedItem;
    }
});


exports("CanPlayerCarryItem", (itemName, count, id) => {
    let inventory = GetInventory("player", id);

    return CanCarryItem(inventory, itemName, count);
});

function ParseGenerousItemsToESXItem(inventory, items) {

    let sampleItem = items[Object.keys(items)[0]];
    let itemCommonData = Generous.Items[sampleItem.itemName];

    let returnedItem = {
        name: toString(sampleItem.itemName),
        count: parseInt(GetItemCountInventoryHas(inventory, sampleItem.itemName)),
        label: toString(sampleItem.itemLabel),
        weight: parseInt(itemCommonData.weight),
        canRemove: parseInt(itemCommonData.canRemove)
    }

    return returnedItem;
}

function InitializeWeaponEvents() {

    let weapons = [];

    for (let index = 0; index < Object.keys(Generous.Items).length; index++) {
        let item = Generous.Items[Object.keys(Generous.Items)[index]];
        if (IsItAWeapon(item.name)) {
            weapons.push(item);
        }    
    }

    weapons.forEach((item, index) => {
        ESX.RegisterUsableItem(item.name, function(source) {
            emitNet('generous_inventory:client:useWeapon', source, item.name)
        });
    });
    
}

ESX.RegisterServerCallback('generous_inventory:server:getAmmoCount', function(source, cb, hash, weaponSlot) {
    let player = ESX.GetPlayerFromId(source)

    let item = GetItemBySlot(GetInventory("player", player.getIdentifier()), weaponSlot);

    if (item != null) {
        let itemData = item.itemData;
        let ammoCount = itemData.ammoCount;

        if (ammoCount != null) {
            cb(ammoCount, 0, 0, 0, 0, 0, 0)
        }
    }
});

ESX.RegisterServerCallback('generous_inventory:server:getPlayerIdentifier', function(source, cb, targetSource) {
    let player = ESX.GetPlayerFromId(targetSource);
    cb(player.getIdentifier());
});

ESX.RegisterServerCallback('generous_inventory:server:getPlayerIdentifierOwn', function(source, cb) {
    let player = ESX.GetPlayerFromId(source);
    cb(player.getIdentifier());
});

RegisterServerEvent("client-actionbar-request")
onNet("client-actionbar-request", async (slot) => {
    let src = source
    let player = ESX.GetPlayerFromId(src)
    let playerInventory = await GetInventory("player", player.getIdentifier());
    let item = GetItemBySlot(playerInventory, slot);
    if (item != null) {
        emitNet('client-use-item', src, item.itemName, slot)
    }

});

RegisterServerEvent("client-inventory-update-request")
onNet("client-inventory-update-request", async (currentSlot, targetSlot, currentIdentifier, targetIdentifier, itemAmount) => {
    let src = source
    let currentInventory = await GetInventory(currentIdentifier.type, currentIdentifier.owner);
    let targetInventory = await GetInventory(targetIdentifier.type, targetIdentifier.owner);

    if (GetItemBySlot(currentInventory, currentSlot) != null) {
        if (IsItAWeapon(GetItemBySlot(currentInventory, currentSlot).itemName)) {
            emitNet('server-remove-removed-weapon', src, targetSlot, targetInventory, currentSlot);
        }
    }

    await TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemAmount, currentIdentifier.base, targetIdentifier.base);
});

// data format { type: "trunk", owner: "ABC 123" } { type: "drop", owner: "[x, y, z]" } { type: "glovebox", owner: "ABC 123" }
RegisterServerEvent('client-request-open')
onNet('client-request-open', async (data) => {
    let dataParsed = JSON.parse(data);
    let src = source
    if (!preventedInventories.includes(src) && dataParsed != null) {
        let type = dataParsed.type;
        let identifier = dataParsed.owner;
        if (dataParsed.type == "player") {
            lockInventory(identifier, true);
            let xPlayer = ESX.GetPlayerFromId(identifier)
            dataParsed.owner = xPlayer.getIdentifier();
        }
        let inventoryRequested;
        if (dataParsed.type == "stashes") {
            inventoryRequested =  await GetInventory(type, identifier, dataParsed.stashname);
        } else {
            inventoryRequested = await GetInventory(type, dataParsed.owner);
        }
        let playerIdentifier = GetPlayerIdentifier(src, 0);
        let playerInventory = await GetInventory("player", playerIdentifier);

        viewedInventories[src] = { primary: { type: "player", owner: playerIdentifier }, secondary: dataParsed };
        emitNet("server-open-inventory", src, playerInventory, inventoryRequested);
    } else {
        // console.log('Action prevented!');
    }
});

RegisterServerEvent('client-inventory-set-busy-request')
onNet('client-inventory-set-busy-request', async (inventoryType, inventoryOwner, itemSlot, isBusy) => {
    let inventoryToCompare = { type:inventoryType, owner: inventoryOwner };
    let playersToSetBusy = getKeyByValue(viewedInventories, inventoryToCompare);
    for (let index = 0; index < playersToSetBusy.length; index++) {
        let player = playersToSetBusy[index];
        emitNet('client-set-inventory-item-busy', player, inventoryType, inventoryOwner, itemSlot, isBusy, inventoryToCompare.inventoryID)
    }
});

RegisterServerEvent('client-inventory-give-item-request')
onNet('client-inventory-give-item-request', async (currentSlot, currentIdentifier, itemAmount, focusedPedId) => {
    let src = source
    let xPlayer = ESX.GetPlayerFromId(focusedPedId);

    let currentInventory = await GetInventory(currentIdentifier.type, currentIdentifier.owner);
    let targetInventory = await GetInventory("player", xPlayer.getIdentifier());

    let targetSlot = GetFirstAvailableSlot(targetInventory);

    if (GetItemBySlot(currentInventory, currentSlot) != null) {
        if (IsItAWeapon(GetItemBySlot(currentInventory, currentSlot).itemName)) {
            emitNet('server-remove-removed-weapon', src, targetSlot, targetInventory, currentSlot);
        }
    }

    await TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemAmount, currentIdentifier.base, "secondaryInventory");
});

function getKeyByValue(object, value) {   
    return Object.keys(object).filter((key) =>  { 
        if (JSON.stringify(object[key].primary) === JSON.stringify(value)) {
            value.inventoryID = 1;
            return true;
        } else if (JSON.stringify(object[key].secondary) === JSON.stringify(value)) {
            value.inventoryID = 2;
            return true
        } else {
            return false;
        }
    });
}


RegisterServerEvent("client-request-close-inv")
onNet("client-request-close-inv", async (data) => {
    let src = source
    if (data != null) {
        // secondary inventory was a player inventory
        let parsedData = JSON.parse(data);
        lockInventory(parsedData.owner, false);
    }

    delete viewedInventories[src];
});

function GenerateWeaponLicenseKey() {
    let randomLicenseKey = "";

    for (let index = 0; index < Config.licenseNumberCount; index++) {
        let randomNumber = Math.floor(Math.random() * 10);
        randomLicenseKey += randomNumber; 
    }

    return Config.licensePrefix + randomLicenseKey;
}

function InitializeItemData() {
    return new Promise((resolve) => {
        exports.ghmattimysql.execute("SELECT * FROM items", { 
        }, (data)  => {
            // Looping through all items
            for (let key in data) {
                let value = data[key];
                // Checking if it's a weapon 
                if (IsItAWeapon(value.name)) {
                    Generous.Items[value.name] = 
                    {
                        name: value.name,
                        label: value.label,
                        weight: value.weight,
                        canStacked: false,
                        canRemove: true,
                        price: value.price
                    };
                } else {
                    Generous.Items[value.name] = {
                        name: value.name,
                        label: value.label,
                        weight: value.weight,
                        canStacked: value.can_stacked,
                        canRemove: value.can_remove,
                        price: value.price
                    };
                }

            }

            return resolve(Generous.Items);
        });
    });
}

function IsValidItem(item) {
    if (item.itemName in Generous.Items && item.itemCount >= 0 && (typeof(item.itemData) == "object" || item.itemData == null)) {
        return true;
    } else {
        return false;
    }
}

function IsValidWeapon(weapon) {
    if (weapon.weaponName in Generous.Items && typeof(weapon.weaponData) == "object") {
        return true;
    } else {
        return false;
    }
}

RegisterServerEvent('generous_inventory:server:updateAmmoCount')
onNet('generous_inventory:server:updateAmmoCount', async (hash, ammoCount, weaponSlotID, inventory) => {
    let player = ESX.GetPlayerFromId(source);

    let inventoryToUse;

    if (inventory == null) {
        inventoryToUse = await GetInventory("player", player.getIdentifier());
    } else {
        inventoryToUse = inventory;
    }

    let weapon = inventoryToUse.items[weaponSlotID];

    if (weapon != null) {
        let weaponItemData = weapon.itemData;
        if (weaponItemData != null) {
            weaponItemData.ammoCount = ammoCount;
            await UpdateInventorySql(inventoryToUse, JSON.stringify(inventoryToUse.items), () => {});
        }
    }
});

RegisterServerEvent('new-client-connected')
onNet('new-client-connected', async () => {
    let xPlayer = ESX.GetPlayerFromId(source);
    await GetInventory("player", xPlayer.getIdentifier());
});

onNet("esx:onAddInventoryItem", async (source, item, count) => {
    let xPlayer = ESX.GetPlayerFromId(source);
    let playerInventory = await GetInventory("player", xPlayer.getIdentifier());
    if (CanCarryItem(playerInventory, item, count)) {
        await AddItem(playerInventory, item, count);
        emitNet("server-update-inventory-primary-data", source, playerInventory); 
    }
});

onNet("esx:onRemoveInventoryItem", async (source, item, count) => {
    let xPlayer = ESX.GetPlayerFromId(source);
    let playerInventory = await GetInventory("player", xPlayer.getIdentifier());
    await RemoveItem(playerInventory, item, count);
    emitNet("server-update-inventory-primary-data", source, playerInventory); 
});

function GetInventory(inventoryType, identifier, stashName) {
		
    if (inventoryType == "drop") {
        if (identifier in dropInventories) {
            return { type: inventoryType, owner: identifier, items: dropInventories[identifier].items };
        } else {
            dropInventories[identifier] = { type: inventoryType, owner: identifier, items: {} };
            return dropInventories[identifier];
        }
    } else if(inventoryType == "shop") {
        if (identifier in inventoriesStored) {
            return inventoriesStored[identifier];
        } else {
            let shopInventory = { type: inventoryType, owner: identifier, items: {} };
            let marketChoosed = Config.MarketList[identifier]
            for (let index = 0; index < marketChoosed.items.length; index++) {
                let item = marketChoosed.items[index];
                AddItem(shopInventory, item.name, item.price);
                inventoriesStored[identifier] = shopInventory;
            }
    
            return shopInventory;
        }
    } else {
        if (inventoryType == "stashes") {
            return new Promise((resolve) => {
                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_stashes WHERE identifier = @identifier`, { 
                    identifier: identifier 
                }, (data)  => {
                    if (data[0] == undefined) {
                        exports.ghmattimysql.execute(`INSERT INTO generous_inv_stashes (stashname, identifier, inventory) VALUES (?, ?, ?)`,
                            [stashName, identifier, JSON.stringify({})], (result) => { 
                                let stash = new Inventory("stashes", identifier, {});
                                stash.weight = CalculateInventoryWeight(stash);
                                return resolve(stash);
                            }
                        );
                    } else {
                        let result = new Inventory(inventoryType, identifier, (JSON.parse(data[0].inventory)));
                        result.weight = CalculateInventoryWeight(result);
                        return resolve(result);
                    }
                });
            });
        }
        if (identifier in inventoriesStored) {
            let inventoryToReturn = inventoriesStored[identifier];
            inventoryToReturn.weight = CalculateInventoryWeight(inventoryToReturn);
            return inventoryToReturn;
        } else {
            return new Promise((resolve) => {
                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_${inventoryType} WHERE identifier = @identifier`, { 
                    identifier: identifier 
                }, (data)  => {
                    if (data[0] == undefined) {
                        exports.ghmattimysql.execute(`INSERT INTO generous_inv_${inventoryType} (identifier, inventory) VALUES (?, ?)`,
                            [identifier, JSON.stringify({})], (result) => { 
                                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_${inventoryType} WHERE identifier = @identifier`, { 
                                    identifier: identifier 
                                }, (data)  => {
                                    let result = new Inventory(inventoryType, identifier, (JSON.parse(data[0].inventory)));
                                    result.weight = CalculateInventoryWeight(result);
                                    inventoriesStored[identifier] = result;
                                    return resolve(result);
                                });
                            }
                        );
                    } else {
                        let result = new Inventory(inventoryType, identifier, (JSON.parse(data[0].inventory)));
                        result.weight = CalculateInventoryWeight(result);

                        inventoriesStored[identifier] = result;
                        return resolve(result);
                    }
                });
            });
        }
    }

}


RegisterServerEvent('generous_inventory:resetInventory')
onNet('generous_inventory:resetInventory', async (identifier) => {
    let inventory = GetInventory("player", identifier);
    inventory.items = {};
    UpdateInventorySql(inventory, JSON.stringify({}), () => {
        RefreshInventories(inventory);
    });
});


function CalculateInventoryWeight(inventory) {
    let inventoryWeight = 0;

    let items = inventory.items;
    for (let index = 0; index < Object.keys(items).length; index++) {
        const item = items[Object.keys(items)[index]];
        let itemWeight = Generous.Items[item.itemName].weight;
        if (itemWeight == null) {
            itemWeight = 0.1;
        }
        inventoryWeight += itemWeight * (item.itemCount || 1);
    }

    return inventoryWeight;
}

function CanCarryItem(inventory, itemName, count) {
    if (inventory.type != "drop") {
        let maximumWeight = Config.playerInventoryMaximumWeight;
        let totalWeightNeeded = Generous.Items[itemName].weight * count;
        let currentInventoryWeight = inventory.weight || 0;

        if ((currentInventoryWeight + totalWeightNeeded) <= maximumWeight) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

}

async function AddItem(inventory, itemName, itemCount, itemData) {

    if (itemName in Generous.Items) {
        // Is it a weapon ?
        if (IsItAWeapon(itemName)) {
            // It is a weapon
            let firstAvailableSlot = GetFirstAvailableSlot(inventory);
            if (firstAvailableSlot != null) {
                let inventoryDictionary = inventory.items;
                inventoryDictionary[firstAvailableSlot] = new Weapon(itemName, Generous.Items[itemName].label, GenerateNewWeaponData());
                if (inventory.type == "shop") {
                    inventoryDictionary[firstAvailableSlot].itemCount = itemCount;
                }
                await UpdateInventorySql(inventory, JSON.stringify(inventoryDictionary), () => {});
            } else {
                console.log("There is no room for another item!");
            }
        } else {
            // It isn't a weapon
            // Check if item can store data / can be stacked
            if (Generous.Items[itemName].canStacked) {
                // Can't have metadata
                let foundItem = GetItem(inventory, itemName);

                // Check if already there is a stack
                if (isEmpty(foundItem)) {
                    // There are no stacks
                    let firstAvailableSlot = GetFirstAvailableSlot(inventory);
                    if (firstAvailableSlot != null) {
                        let inventoryDictionary = inventory.items;
                        inventoryDictionary[GetFirstAvailableSlot(inventory)] = new Item(itemName, Generous.Items[itemName].label, itemCount, itemData);
                        RefreshInventories(inventory)
                        await UpdateInventorySql(inventory, JSON.stringify(inventoryDictionary), () => {});
                    } else {
                        console.log("There is no room for another item!");
                    }
                } else {
                    // There are at least one stack
                    // TODO: Implement chosing best stack according to stack limit.
                    let chosenItemKey = Object.keys(foundItem)[0];
                    let chosenItemValue = foundItem[chosenItemKey];

                    chosenItemValue.itemCount = parseInt(itemCount) + parseInt(chosenItemValue.itemCount);

                    delete inventory.items[chosenItemKey];
                    inventory.items[chosenItemKey] = chosenItemValue;
                
                    RefreshInventories(inventory)
                    await UpdateInventorySql(inventory, JSON.stringify(inventory.items), () => {});
                }
            } else {
                // Can have metadata
                let firstAvailableSlot = GetFirstAvailableSlot(inventory);
                if (firstAvailableSlot != null) {
                    let inventoryDictionary = inventory.items;
                    inventoryDictionary[GetFirstAvailableSlot(inventory)] = new Item(itemName, Generous.Items[itemName].label, itemCount, itemData);
                    RefreshInventories(inventory)
                    await UpdateInventorySql(inventory, JSON.stringify(inventoryDictionary), () => {});
                } else {
                    console.log("There is no room for another item!");
                }
            }
        }
    } else {
        console.log("Specified item was not valid at inventory: " + inventory.owner + " Item name: " + itemName);
    }
}

async function RemoveItem(inventory, itemName, itemCount) {

    // Checking is requested item registered on database!
    if (itemName in Generous.Items) {
        // It is a valid item!

        let foundItems = GetItem(inventory, itemName);
        // Player has item check
        if (!isEmpty(foundItems)) {
            // Player has that item

            if (GetItemCountInventoryHas(inventory, itemName) >= parseInt(itemCount)) {
                // Weapon check
                if (IsItAWeapon(itemName)) {
                    // It is a weapon
                    for (let index = 0; index < parseInt(itemCount); index++) {
                        let chosenItemKey = Object.keys(foundItems)[index];
                        delete inventory.items[chosenItemKey];
    
                        RefreshInventories(inventory)
                        await UpdateInventorySql(inventory, JSON.stringify(inventory.items), () => {});
                    }
                } else {
                    // It isn't a weapon

                    let itemCountWillBeRemoved = parseInt(itemCount);
                    for (let index = 0; index < Object.keys(foundItems).length; index++) {
                        let chosenItemKey = Object.keys(foundItems)[index];
                        let chosenItemValue = foundItems[chosenItemKey];
                        if (chosenItemValue.itemCount > itemCountWillBeRemoved) {        
                            chosenItemValue.itemCount -= itemCountWillBeRemoved;
                            delete inventory.items[chosenItemKey];
                            inventory.items[chosenItemKey] = chosenItemValue;
                            break;
                        } else if (chosenItemValue.itemCount == itemCountWillBeRemoved) {
                            delete inventory.items[chosenItemKey];
                            break;
                        } else {
                            itemCountWillBeRemoved -= chosenItemValue.itemCount;
                            delete inventory.items[chosenItemKey];
                        }
                    }
                    RefreshInventories(inventory)
                    await UpdateInventorySql(inventory, JSON.stringify(inventory.items), () => {});
                }
            } else {
                console.log("ERROR: Tried to remove more items than player has!");
            }
        } else {
            // Player don't have that item
            console.log("ERROR: Tried to remove an item player don't have!");
        }
    } else {
        console.log("Specified item was not valid at inventory: " + inventory.owner + " Item name: " + itemName);
    }
}

async function TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemCountToTrade, currentInventoryStatus, targetInventoryStatus) {

    if (!(currentInventory.type == "shop" || targetInventory.type == "shop")) {

        if (JSON.stringify(currentInventory) === JSON.stringify(targetInventory)) {
            let firstRequestedItem = GetItemBySlot(currentInventory, targetSlot);
            let secondRequestedItem = GetItemBySlot(currentInventory, currentSlot);

            if (IsItAWeapon(secondRequestedItem.itemName)) {
                currentInventory.items[currentSlot] = firstRequestedItem;
            
                currentInventory.items[targetSlot] = secondRequestedItem;  
        
                
                if (currentInventory.items[currentSlot] == null) {
                    delete currentInventory.items[currentSlot];
                }
                
                if (currentInventory.items[targetSlot] == null) {
                    delete currentInventory.items[targetSlot];
                }
            } else {
                if (firstRequestedItem == null) {
                    if (itemCountToTrade == 0) {
                        currentInventory.items[currentSlot] = firstRequestedItem;
                
                        currentInventory.items[targetSlot] = secondRequestedItem;  
                
                        
                        if (currentInventory.items[currentSlot] == null) {
                            delete currentInventory.items[currentSlot];
                        }
                        
                        if (currentInventory.items[targetSlot] == null) {
                            delete currentInventory.items[targetSlot];
                        }
                    } else {
                        let itemToCopy = currentInventory.items[currentSlot];
                        if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                            currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                            currentInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                        } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                            delete currentInventory.items[currentSlot];
                            currentInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                        }
                    }
                } else {
                    if (IsItAWeapon(firstRequestedItem.itemName)) {
                        currentInventory.items[currentSlot] = firstRequestedItem;
            
                        currentInventory.items[targetSlot] = secondRequestedItem;  
                
                        
                        if (currentInventory.items[currentSlot] == null) {
                            delete currentInventory.items[currentSlot];
                        }
                        
                        if (currentInventory.items[targetSlot] == null) {
                            delete currentInventory.items[targetSlot];
                        }
                    } else {
                        if (firstRequestedItem.itemName == secondRequestedItem.itemName) {
                            if (itemCountToTrade == 0) {
                                currentInventory.items[currentSlot] = null;
        
                                let itemToReturn = secondRequestedItem;
                                secondRequestedItem.itemCount = parseInt(firstRequestedItem.itemCount) + parseInt(secondRequestedItem.itemCount);
                        
                                currentInventory.items[targetSlot] = itemToReturn;  
                        
                                
                                if (currentInventory.items[currentSlot] == null) {
                                    delete currentInventory.items[currentSlot];
                                }
                                
                                if (currentInventory.items[targetSlot] == null) {
                                    delete currentInventory.items[targetSlot];
                                }
                            } else {
                                if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                                    currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                                    currentInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(currentInventory.items[targetSlot].itemCount);
                                } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                                    delete currentInventory.items[currentSlot];
                                    currentInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(currentInventory.items[targetSlot].itemCount);
                                }
                            }
                        } else {
                            currentInventory.items[currentSlot] = firstRequestedItem;
                    
                            currentInventory.items[targetSlot] = secondRequestedItem;  
                    
                            
                            if (currentInventory.items[currentSlot] == null) {
                                delete currentInventory.items[currentSlot];
                            }
                            
                            if (currentInventory.items[targetSlot] == null) {
                                delete currentInventory.items[targetSlot];
                            }
                        }
                    }
                } 
            }

            if (currentInventory.type == "stashes" || targetInventory.type == "stashes") {
                await UpdateInventorySql(currentInventory, JSON.stringify(currentInventory.items), () => { RefreshInventories(currentInventory, targetInventory) });
            } else {
                RefreshInventories(currentInventory, targetInventory)
                await UpdateInventorySql(currentInventory, JSON.stringify(currentInventory.items), () => {});
            }
            
            RefreshInventories(currentInventory, targetInventory)
            await UpdateInventorySql(currentInventory, JSON.stringify(currentInventory.items), () => {});
        } else {
            let firstRequestedItem = GetItemBySlot(targetInventory, targetSlot);
            let secondRequestedItem = GetItemBySlot(currentInventory, currentSlot);

            if (IsTransactionValid(targetInventory, secondRequestedItem, currentInventory, firstRequestedItem)) {
                if (IsItAWeapon(secondRequestedItem.itemName)) {
                    currentInventory.items[currentSlot] = firstRequestedItem;
                
                    targetInventory.items[targetSlot] = secondRequestedItem;  
            
                    
                    if (currentInventory.items[currentSlot] == null) {
                        delete currentInventory.items[currentSlot];
                    }
                    
                    if (targetInventory.items[targetSlot] == null) {
                        delete targetInventory.items[targetSlot];
                    }
                } else {
                    if (firstRequestedItem == null) {
                        if (itemCountToTrade == 0) {
                            currentInventory.items[currentSlot] = firstRequestedItem;
                    
                            targetInventory.items[targetSlot] = secondRequestedItem;  
                    
                            
                            if (currentInventory.items[currentSlot] == null) {
                                delete currentInventory.items[currentSlot];
                            }
                            
                            if (targetInventory.items[targetSlot] == null) {
                                delete targetInventory.items[targetSlot];
                            }
                        } else {
                            let itemToCopy = currentInventory.items[currentSlot];
                            if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                                currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                                targetInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                            } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                                delete currentInventory.items[currentSlot];
                                targetInventory.items[targetSlot] = new Item(itemToCopy.itemName, itemToCopy.itemLabel, itemCountToTrade);
                            }
                        }
                    } else {
                        if (IsItAWeapon(firstRequestedItem.itemName)) {
                            currentInventory.items[currentSlot] = firstRequestedItem;
                
                            targetInventory.items[targetSlot] = secondRequestedItem;  
                    
                            
                            if (currentInventory.items[currentSlot] == null) {
                                delete currentInventory.items[currentSlot];
                            }
                            
                            if (targetInventory.items[targetSlot] == null) {
                                delete targetInventory.items[targetSlot];
                            }
                        } else {
                            if (firstRequestedItem.itemName == secondRequestedItem.itemName) {
                                if (itemCountToTrade == 0) {
                                    currentInventory.items[currentSlot] = null;
            
                                    let itemToReturn = secondRequestedItem;
                                    secondRequestedItem.itemCount = parseInt(firstRequestedItem.itemCount) + parseInt(secondRequestedItem.itemCount);
                            
                                    targetInventory.items[targetSlot] = itemToReturn;  
                            
                                    
                                    if (currentInventory.items[currentSlot] == null) {
                                        delete currentInventory.items[currentSlot];
                                    }
                                    
                                    if (targetInventory.items[targetSlot] == null) {
                                        delete targetInventory.items[targetSlot];
                                    }
                                } else {
                                    if (parseInt(secondRequestedItem.itemCount) > itemCountToTrade) {
                                        currentInventory.items[currentSlot].itemCount -= itemCountToTrade;
                                        targetInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(targetInventory.items[targetSlot].itemCount);
                                    } else if (secondRequestedItem.itemCount == itemCountToTrade) {
                                        delete currentInventory.items[currentSlot];
                                        targetInventory.items[targetSlot].itemCount = parseInt(itemCountToTrade) + parseInt(targetInventory.items[targetSlot].itemCount);
                                    }
                                }
                            } else {
                                currentInventory.items[currentSlot] = firstRequestedItem;
                        
                                targetInventory.items[targetSlot] = secondRequestedItem;  
                        
                                
                                if (currentInventory.items[currentSlot] == null) {
                                    delete currentInventory.items[currentSlot];
                                }
                                
                                if (targetInventory.items[targetSlot] == null) {
                                    delete targetInventory.items[targetSlot];
                                }
                            }
                        }
                    } 
                }
    
                if (currentInventory.type == "stashes" || targetInventory.type == "stashes") {
                    await UpdateInventorySql(currentInventory, JSON.stringify(currentInventory.items), () => {});
                    await UpdateInventorySql(targetInventory, JSON.stringify(targetInventory.items), () => {RefreshInventories(currentInventory, targetInventory)});
                } else {
                    RefreshInventories(currentInventory, targetInventory)
                    await UpdateInventorySql(currentInventory, JSON.stringify(currentInventory.items), () => {});
                    await UpdateInventorySql(targetInventory, JSON.stringify(targetInventory.items), () => {});
                }   
            } else {
                console.log("taşıyamadın amk");
            }
        }
    } else {
        if (itemCountToTrade == null || itemCountToTrade == 0) {
            itemCountToTrade = 1;
        }
        // Shop transaction request potential

        if (targetInventory.type == "player") {
            // Shop transaction request 
            let itemBought = GetItemBySlot(currentInventory, currentSlot);

            if (CanCarryItem(targetInventory, itemBought.itemName, itemCountToTrade)) {
                if (HasEnoughOfItem(targetInventory, "cash", currentInventory.items[currentSlot].itemCount * itemCountToTrade)) {
                    await RemoveItem(targetInventory, "cash", currentInventory.items[currentSlot].itemCount * itemCountToTrade)
                    await AddItem(targetInventory, itemBought.itemName, itemCountToTrade);
                } else {
                    console.log("Not enough money!");
                }
            } else {
                console.log("ERROR: Player couldn't carry given items!")
            }
        }
    }

    targetInventory.weight = CalculateInventoryWeight(targetInventory);
    currentInventory.weight = CalculateInventoryWeight(currentInventory);
}

function RefreshInventories(currentInventory, targetInventory) {
    let inventoryToCompare = { type:currentInventory.type, owner: currentInventory.owner };
    let playersToUpdate = getKeyByValue(viewedInventories, inventoryToCompare);

    if (targetInventory != null) {
        let inventoryToCompare2 = { type:targetInventory.type, owner: targetInventory.owner };
        let taregtInventoryViewers = getKeyByValue(viewedInventories, inventoryToCompare2);

        playersToUpdate = playersToUpdate.concat(taregtInventoryViewers);
    }

    let uniquePlayersToUpdate = [...new Set(playersToUpdate)];

    for (let index = 0; index < uniquePlayersToUpdate.length; index++) {
        let player = uniquePlayersToUpdate[index];
        emitNet("client-force-update-inventories", player); 
    }
}

function HasEnoughOfItem(inventory, itemName, count) {
    return GetItemCountInventoryHas(inventory, itemName) >= count;
}

function GetItemCountInventoryHas(inventory, itemName) {
    let count = 0;
    let items = GetItem(inventory, itemName);
    if (IsItAWeapon(itemName)) {
        for (let index = 0; index < Object.keys(items).length; index++) {
            count += 1;
        }
    } else {
        for (let index = 0; index < Object.keys(items).length; index++) {
            let chosenItem = items[Object.keys(items)[index]];
            count += chosenItem.itemCount;
        }
    }

    return count;
}

function GenerateNewWeaponData() {
    let weaponLicense = GenerateWeaponLicenseKey();
    return { license: weaponLicense, durability: Config.defaultWeaponDurability, ammoCount: 0 };
}

function GetFirstAvailableSlot(inventory) {
    let inventoryToResearch = inventory.items;
    for (let index = 1; index < Config.playerInventorySlotCount + 1; index++) {
        if (!(index in inventoryToResearch)) {
            return index;
        }
    }
    return null;
}

function GetItem(inventory, itemName) {
    let requestedItems = {};
    let items = inventory.items;
    for (var key in items) {
        let value = items[key];
        if (value.itemName == itemName || value.weaponName == itemName) {
            requestedItems[key] = value;
        }
    }

    return requestedItems;
}

function GetItemFromInventory(inventory, itemName) {
    let requestedItems = {};
    let items = inventory.items;
    for (var key in items) {
        let value = items[key];
        if (value.itemName == itemName || value.weaponName == itemName) {
            requestedItems[key] = value;
        }
    }

    return requestedItems;
}

function IsTransactionValid(targetInventory, item2, currentInventory, item1) {
    
    if (CanCarryItem(targetInventory, item2.itemName, item2.itemCount || 1)) {
        if (item1 != null) {
            if (CanCarryItem(currentInventory, item1.itemName, item1.itemCount || 1)) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    } else {
        return false;
    }
}

function GetItemBySlot(inventory, slot) {
    let items = inventory.items;
    if (slot in items) {
        return items[slot];
    } else {
        return null;
    }
}

function lockInventory(source, isLocked) {
    if (isLocked) {
        if (!preventedInventories.includes(source)) {
            preventedInventories.push(source);
        }
    } else {
        if (preventedInventories.includes(source)) {
            let index = preventedInventories.indexOf(source);
            if (index > -1) {
                preventedInventories.splice(index, 1);
            }
        }
    }
}

async function UpdateInventorySql(inventory, updatedInventoryObject, callback) {
    switch(inventory.type) {
        case "player":
            exports.ghmattimysql.execute("UPDATE generous_inv_player SET inventory = @inventory WHERE identifier = @identifier", { 
                inventory: updatedInventoryObject, 
                identifier: inventory.owner 
            }, (result) => {
                callback();
            });
            break;
        case "trunks":
            exports.ghmattimysql.execute("UPDATE generous_inv_trunks SET inventory = @inventory WHERE identifier = @plate", { 
                inventory: updatedInventoryObject, 
                plate: inventory.owner 
            }, (result) => {
                callback();
            });
            break;
        case "gloveboxes":
            exports.ghmattimysql.execute("UPDATE generous_inv_gloveboxes SET inventory = @inventory WHERE identifier = @plate", { 
                inventory: updatedInventoryObject, 
                plate: inventory.owner 
            }, (result) => {
                callback();
            });
            break;
        case "stashes":
            exports.ghmattimysql.execute("UPDATE generous_inv_stashes SET inventory = @inventory WHERE identifier = @identifier", { 
                inventory: updatedInventoryObject, 
                identifier: inventory.owner 
            }, (result) => {
                callback();
            });
            break;
        case "drop":
            dropInventories[inventory.owner].items = JSON.parse(updatedInventoryObject);
            if (Object.keys(dropInventories[inventory.owner].items).length == 0) {
                emitNet('client-remove-drop', -1, inventory.owner);
            } else {
                emitNet('client-register-new-drop', -1, inventory.owner);
                if (Config.DeleteDrops.Enabled) {
                    setTimeout(() => {
                        emitNet('client-remove-drop', -1, inventory.owner);
                    }, Config.DeleteDrops.Time * 1000);
                }
            }
            break;
    }
}