let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

import Logger from "../utils/logger"
import Config from "../config.json";
import {Item, Weapon} from "./item";
import { InventoryManager } from "./inventorymanager";
import { IsItAWeapon, isEmpty } from "../utils/utils";
import { Inventory, StashInventory } from "./inventory";

interface Dictionary<T> {
    [Key: string]: T;
}

Main();

async function Main() {
    InventoryManager.InitItems();
    InventoryManager.InitWeaponEvents();
    InventoryManager.InitShopInventories();
    await InventoryManager.InitSharedStashInventories();
}

async function TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemCountToTrade) {

    if (!(currentInventory.type == "shop" || targetInventory.type == "shop")) {

        if (JSON.stringify(currentInventory) === JSON.stringify(targetInventory)) {
            let firstRequestedItem = currentInventory.GetItemBySlot(targetSlot);
            let secondRequestedItem = currentInventory.GetItemBySlot(currentSlot);

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

            if (currentInventory.type == "stash" || targetInventory.type == "stash") {
                await currentInventory.UpdateDatabase(() => { 
                    currentInventory.Refresh();
                    targetInventory.Refresh(); 
                });
            } else {
                currentInventory.Refresh();
                targetInventory.Refresh(); 
                await currentInventory.UpdateDatabase(() => {});
            }
            
            currentInventory.Refresh();
            targetInventory.Refresh(); 
            await currentInventory.UpdateDatabase(() => {});
        } else {
            let firstRequestedItem = targetInventory.GetItemBySlot(targetSlot);
            let secondRequestedItem = currentInventory.GetItemBySlot(currentSlot);

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
    
                if (currentInventory.type == "stash" || targetInventory.type == "stash") {
                    currentInventory.UpdateDatabase(() => {});
                    targetInventory.UpdateDatabase(() => {
                        currentInventory.Refresh();
                        targetInventory.Refresh();
                    });
                } else {
                    currentInventory.Refresh();
                    targetInventory.Refresh();
                    currentInventory.UpdateDatabase(() => {});
                    targetInventory.UpdateDatabase(() => {});
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
            let itemBought = currentInventory.GetItemBySlot(currentSlot);

            if (targetInventory.CanCarryItem(itemBought.itemName, itemCountToTrade)) {
                if (targetInventory.HasEnoughOfItem("cash", currentInventory.items[currentSlot].itemCount * itemCountToTrade)) {
                    targetInventory.RemoveItem("cash", currentInventory.items[currentSlot].itemCount * itemCountToTrade)
                    IsItAWeapon(itemBought.itemName) ? currentInventory.AddWeapon(itemBought.itemName) : currentInventory.AddItem(itemBought.itemName, itemCountToTrade);
                } else {
                    console.log("Not enough money!");
                }
            } else {
                Logger.LogError("Player couldn't carry given items!")
            }
        }
    }

    targetInventory.weight = targetInventory.CalculateInventoryWeight();
    currentInventory.weight = currentInventory.CalculateInventoryWeight();
}

function IsTransactionValid(targetInventory, item2, currentInventory, item1) {
    
    if (!targetInventory.CanCarryItem(item2.itemName, item2.itemCount || 1)) return false;

    if (item1 == null) return true;

    if (!currentInventory.CanCarryItem(item1.itemName, item1.itemCount || 1)) return false;

    return true;
}

function ParseGenerousItemsToESXItem(inventory, items) {

    let sampleItem = items[Object.keys(items)[0]];
    let itemCommonData = InventoryManager.ItemBaseTypes[sampleItem.itemName];

    let returnedItem = {
        name: sampleItem.itemName,
        count: inventory.GetItemCountInventoryHas(sampleItem.itemName),
        label: sampleItem.itemLabel,
        weight: itemCommonData.weight,
        canRemove: itemCommonData.can_remove
    }

    return returnedItem;
}


function GetInventoryItemESX(identifier, itemName) {
    let inventory = InventoryManager.GetInventory("player", identifier);
    return inventory.GetItem(itemName);
}
































on("playerDropped", () => {
    let src = global.source;
    let playerIdentifier = GetPlayerIdentifier(src.toString(), 0);
    InventoryManager.DeletePlayerStashesOnLogOut(playerIdentifier);
});


exports("GetInventoryItemType", (itemName, id) => {
    let inventory = InventoryManager.GetInventory("player", id);
    if (inventory.GetItemCountInventoryHas(itemName) > 0) {
        return ParseGenerousItemsToESXItem(inventory, inventory.GetItem(itemName));
    } else {
        let itemCommonData = InventoryManager.ItemBaseTypes[itemName];
    
        let returnedItem = {
            name: itemName,
            count: 0,
            label: itemCommonData.label,
            weight: itemCommonData.weight,
            canRemove: itemCommonData.can_remove
        }
    
        return returnedItem;
    }
});


exports("CanPlayerCarryItem", (itemName, count, id) => {
    let inventory = InventoryManager.GetInventory("player", id);

    return inventory.CanCarryItem(itemName, count);
});

ESX.RegisterServerCallback('generous_inventory:server:getAmmoCount', function(source, cb, hash, weaponSlot) {
    let player = ESX.GetPlayerFromId(source)
    let inventory = InventoryManager.GetInventory("player", player.getIdentifier())

    let weapon = inventory.GetItemBySlot(weaponSlot);


    if (weapon == null) return;

    let itemData = weapon.itemData;
    let ammoCount = itemData.ammoCount;

    if (ammoCount == null) return;

    cb(ammoCount, 0, 0, 0, 0, 0, 0)
});

ESX.RegisterServerCallback('generous_inventory:server:getPlayerIdentifier', function(source, cb, targetSource) {
    let player = ESX.GetPlayerFromId(targetSource);
    cb(player.getIdentifier());
});

ESX.RegisterServerCallback('generous_inventory:server:getPlayerIdentifierOwn', function(source, cb) {
    let player = ESX.GetPlayerFromId(source);
    cb(player.getIdentifier());
});

onNet("client-actionbar-request", async (slot) => {
    let src = source
    let player = ESX.GetPlayerFromId(src)
    let playerInventory = InventoryManager.GetInventory("player", player.getIdentifier());
    let item = playerInventory.GetItemBySlot(slot);
    if (item == null) return;
    emitNet('client-use-item', src, item.itemName, slot)
});

onNet("client-inventory-update-request", async (currentSlot, targetSlot, currentIdentifier, targetIdentifier, itemAmount) => {
    let src = source
    let currentInventory = InventoryManager.GetInventory(currentIdentifier.type, currentIdentifier.owner);
    let targetInventory = InventoryManager.GetInventory(targetIdentifier.type, targetIdentifier.owner);

    let item = currentInventory.GetItemBySlot(currentSlot)

    if (item != null) {
        if (IsItAWeapon(item.itemName)) {
            emitNet('server-remove-removed-weapon', src, targetSlot, targetInventory, currentSlot);
        }
    }


    TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemAmount);
});

// data format { type: "trunk", owner: "ABC 123" } { type: "drop", owner: "[x, y, z]" } { type: "glovebox", owner: "ABC 123" }
onNet('client-request-open-player', async (data) => {
    let dataParsed: { type: string; owner: string; } = JSON.parse(data);
    let src = source

    if (dataParsed == null) {
        Logger.LogError("Passed data was null!");
        return;
    }

    let identifier = dataParsed.owner;

    let targetPlayerInventory = InventoryManager.GetInventory("player", identifier);
    targetPlayerInventory.Locked = true;

    let playerIdentifier = GetPlayerIdentifier(src.toString(), 0);
    let playerInventory = InventoryManager.GetInventory("player", playerIdentifier);

    if (playerInventory.Locked) {
        Logger.LogInfo("Player tried to open inventory while locked! Source: " + src);
        return;
    }

    InventoryManager.viewedInventories[src] = dataParsed;
    playerInventory.playersViewing.push(src);
    emitNet("server-open-inventory", src, playerInventory, targetPlayerInventory);
});

onNet('client-request-open-drop', async (data) => {
    let dataParsed = JSON.parse(data);
    let src = source

    if (dataParsed == null) {
        Logger.LogError("Passed data was null!");
        return;
    }
    
    let coords = dataParsed.owner;

    let dropInventory = InventoryManager.GetInventory("drop", coords);

    let playerIdentifier = GetPlayerIdentifier(src.toString(), 0);
    let playerInventory = InventoryManager.GetInventory("player", playerIdentifier);

    if (playerInventory.Locked) {
        Logger.LogInfo("Player tried to open inventory while locked! Source: " + src);
        return;
    }

    InventoryManager.viewedInventories[src] = dataParsed;
    dropInventory.playersViewing.push(src);
    emitNet("server-open-inventory", src, playerInventory, dropInventory);
});

onNet('client-request-open-stash', async (data) => {
    let dataParsed = JSON.parse(data);
    let src = source

    if (dataParsed == null) {
        Logger.LogError("Passed data was null!");
        return;
    }
    
    let stashName = dataParsed.stashName;
    let identifier = dataParsed.owner;

    let stashInventory = InventoryManager.GetInventory(stashName, identifier, stashName)

    let playerIdentifier = GetPlayerIdentifier(src.toString(), 0);
    let playerInventory = InventoryManager.GetInventory("player", playerIdentifier);

    if (playerInventory.Locked) {
        Logger.LogInfo("Player tried to open inventory while locked! Source: " + src);
        return;
    }

    InventoryManager.viewedInventories[src] = dataParsed;
    stashInventory.playersViewing.push(src);
    emitNet("server-open-inventory", src, playerInventory, stashInventory);
});

onNet('client-inventory-set-busy-request', async (inventoryType, inventoryOwner, itemSlot, isBusy) => {
    let inventoryToCompare = { type:inventoryType, owner: inventoryOwner };
    let playersToSetBusy = InventoryManager.GetPlayerIdentifiersViewingInventory(inventoryToCompare);
    for (let index = 0; index < playersToSetBusy.length; index++) {
        let player = playersToSetBusy[index];
        emitNet('client-set-inventory-item-busy', player, inventoryType, inventoryOwner, itemSlot, isBusy)
    }
});

onNet('client-inventory-give-item-request', async (currentSlot, currentIdentifier, itemAmount, focusedPedId) => {
    let src = source
    let xPlayer = ESX.GetPlayerFromId(focusedPedId);

    let currentInventory = InventoryManager.GetInventory(currentIdentifier.type, currentIdentifier.owner);
    let targetInventory = InventoryManager.GetInventory("player", xPlayer.getIdentifier());

    let targetSlot = targetInventory.GetFirstAvailableSlot();
    let currentSlotItem = currentInventory.GetItemBySlot(currentSlot);
    if (currentSlotItem != null) {
        if (IsItAWeapon(currentSlot.itemName)) {
            emitNet('server-remove-removed-weapon', src, targetSlot, targetInventory, currentSlot);
        }
    }


    TradeItems(currentInventory, currentSlot, targetInventory, targetSlot, itemAmount);
});

onNet("client-request-close-inv", async (data) => {
    let src = source

    let parsedData: { type: string; owner: string; stashName?: string } = JSON.parse(data);
    let targetSrc = parsedData.owner;
    InventoryManager.GetInventory("player", GetPlayerIdentifier(targetSrc, 0)).Locked = false;
    InventoryManager.GetInventory(parsedData.type, parsedData.owner, parsedData.stashName).playersViewing;
    
});


onNet('generous_inventory:server:updateAmmoCount', async (hash, ammoCount, weaponSlotID, inventory) => {
    let player = ESX.GetPlayerFromId(source);

    let inventoryToUse: Inventory;

    if (inventory == null) {
        inventoryToUse = InventoryManager.GetInventory("player", player.getIdentifier());
    } else {
        inventoryToUse = inventory;
    }

    let weapon = inventoryToUse.items[weaponSlotID];

    if (weapon != null) {
        let weaponItemData = weapon.itemData;
        if (weaponItemData != null) {
            weaponItemData.ammoCount = ammoCount;
            inventoryToUse.UpdateDatabase(() => {});
        }
    }
});

onNet('new-client-connected', async () => {
    let src = global.source
    InventoryManager.InitializePlayerInventory(src);
    InventoryManager.InitPersonalStashInventories(src);
});

onNet("esx:onAddInventoryItem", async (source, item: string, count: number) => {
    let playerInventory = InventoryManager.GetInventory("player", GetPlayerIdentifier(source, 0))
    if (playerInventory.CanCarryItem(item, count)) {
        playerInventory.AddItem(item, count);
        emitNet("server-update-inventory-primary-data", source, playerInventory); 
    }
});

onNet("esx:onRemoveInventoryItem", async (source, item, count) => {
    let playerInventory = InventoryManager.GetInventory("player", GetPlayerIdentifier(source, 0));
    playerInventory.RemoveItem(item, count);
    emitNet("server-update-inventory-primary-data", source, playerInventory); 
});

onNet('generous_inventory:resetInventory', async (identifier) => {
    let inventory = InventoryManager.GetInventory("player", identifier);
    inventory.items = {};
    inventory.UpdateDatabase(() => {
        inventory.Refresh();
    });
});