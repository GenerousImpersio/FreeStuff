import { Item, Weapon } from "./item"
import Config from "../config.json";
import { InventoryManager } from "./inventorymanager";
import { IsItAWeapon, isEmpty } from "../utils/utils";

interface Dictionary<T> {
    [Key: string]: T;
}

class Inventory {
    type: string;
    owner: string;
    items: Dictionary<Item | Weapon>;
    Locked: boolean;
    weight: number;
    playersViewing: Array<number>;

    constructor (type: string, owner: string, items: Dictionary<Item | Weapon>) {
        this.type = type;
        this.owner = owner;
        this.items = items;
        this.Locked = false;
        this.weight = this.CalculateInventoryWeight();
    }

    GetFirstAvailableSlot() {
        for (let index = 1; index <= Config.playerInventorySlotCount; index++) {
            if (!(index in this.items)) {
                return index;
            }
        }
        return -1;
    }

    GetItem(itemName: string) {
        let requestedItems : Item[] = [];

        for (const [slot, item] of Object.entries(this.items)) {
            if (item.itemName == itemName) {
                requestedItems[slot] = item;
            }
        }

        return requestedItems;
    }

    Refresh() {
        let inventoryToCompare = { type:this.type, owner: this.owner };
        let playersToUpdate = InventoryManager.GetPlayerIdentifiersViewingInventory(inventoryToCompare);
    
        for (let index = 0; index < playersToUpdate.length; index++) {
            let player = playersToUpdate[index];
            emitNet("client-force-update-inventories", player); 
        }
    }

    async UpdateDatabase(callback: Function) {
        exports.ghmattimysql.execute("UPDATE generous_inv_player SET inventory = @inventory WHERE identifier = @identifier", { 
            inventory: JSON.stringify(this.items), 
            identifier: this.owner 
        }, (result: any) => {
            callback();
        });
    }

    async AddItem(itemName: string, itemCount: number, itemData?: object) {
        // Checking is item valid.
        if (!(itemName in InventoryManager.ItemBaseTypes)) {
            console.log("Specified item was not valid at inventory: " + this.owner + " Item name: " + itemName);
            return;
        }

        let IsItAWeapon : boolean = itemName.includes(Config.weaponPrefix);

        // Check if item can store data
        if (InventoryManager.ItemBaseTypes[itemName].canStacked || !IsItAWeapon) {
            // Can't have metadata

            let foundItems = this.GetItem(itemName);
            // Check if already there is a stack
            if (foundItems.length == 0) {
                // There are no stacks
                let firstAvailableSlot = this.GetFirstAvailableSlot();
                if (firstAvailableSlot == -1) {
                    console.log("There is no room for another item!");
                    return;
                }

                this.items[this.GetFirstAvailableSlot()] = new Item(itemName, InventoryManager.ItemBaseTypes[itemName].label, itemCount, itemData);
                this.Refresh()
                await this.UpdateDatabase(() => {});
            } else {
                // There are at least one stack
                // TODO: Implement chosing best stack according to stack limit.
                let chosenItemsFirstStackKey = Object.keys(foundItems)[0];
                let chosenStack: Item = foundItems[chosenItemsFirstStackKey];

                chosenStack.itemCount = itemCount + chosenStack.itemCount;
                this.items[chosenItemsFirstStackKey] = chosenStack;
            
                this.Refresh()
                await this.UpdateDatabase(() => {});
            }
        } else {
            // Can have metadata
            let firstAvailableSlot = this.GetFirstAvailableSlot();
            if (firstAvailableSlot == -1) {
                console.log("There is no room for another item!");
            }
            
            this.items[firstAvailableSlot] = IsItAWeapon ? new Weapon(itemName, InventoryManager.ItemBaseTypes[itemName].label) : 
                new Item(itemName, InventoryManager.ItemBaseTypes[itemName].label, itemCount);
            
            this.Refresh()
            await this.UpdateDatabase(() => {});
        }
            
    }

    HasEnoughOfItem(itemName: any, count: number) {
        return this.GetItemCountInventoryHas(itemName) >= count;
    }
    
    GetItemCountInventoryHas(itemName: string) {
        let count = 0;
        let items = this.GetItem(itemName);
        if (IsItAWeapon(itemName)) {
            return items.length;
        } else {
            items.forEach((item) => {
                count += item.itemCount;
            });
        }
    
        return count;
    }

    async RemoveItem(itemName: string, itemCount: number) {

        // Checking is item valid.
        if (!(itemName in InventoryManager.ItemBaseTypes)) {
            console.log("Specified item was not valid at inventory: " + this.owner + " Item name: " + itemName);
            return;
        }

        let foundItems = this.GetItem(itemName);
        if (isEmpty(foundItems)) {
            // Player don't have that item
            console.log("ERROR: Tried to remove an item player don't have!");
            return;
        }

        if (!this.HasEnoughOfItem(itemName, itemCount)) {
            console.log("ERROR: Tried to remove more items than player has!");
            return;
        }

        if (IsItAWeapon(itemName)) {
            // It is a weapon

            for (let index = 0; index < itemCount; index++) {
                let itemSlot = Object.keys(foundItems)[index];
                delete this.items[itemSlot];

                this.Refresh()
                await this.UpdateDatabase(() => {});
            }
        } else {
            // It isn't a weapon
            let itemCountToDelete = itemCount;
            for (let index = 0; index < foundItems.length; index++) {
                let slot = Object.keys(foundItems)[index];
                let item = foundItems[slot];
                if (item.itemCount > itemCountToDelete) {        
                    item.itemCount -= itemCountToDelete;
                    break;
                } else if (item.itemCount == itemCountToDelete) {
                    delete this.items[slot];
                    break;
                } else {
                    itemCountToDelete -= item.itemCount;
                    delete this.items[slot];
                }
            }
            this.Refresh()
            await this.UpdateDatabase(() => {});
        }
    }

    GetItemFromInventory(itemName: string) {
        let requestedItems = {};
        let items = this.items;
        for (var key in items) {
            let value = items[key];
            if (value.itemName == itemName) {
                requestedItems[key] = value;
            }
        }
    
        return requestedItems;
    }

    GetItemBySlot(slot: string) {
        let items = this.items;
        if (slot in items) {
            return items[slot];
        } else {
            return null;
        }
    }

    CalculateInventoryWeight() {
        let inventoryWeight = 0;

        for (const [slot, item] of Object.entries(this.items)) {
            let itemWeight = InventoryManager.ItemBaseTypes[item.itemName].weight;
            if (itemWeight == null) {
                itemWeight = 0.1;
            }
            inventoryWeight += itemWeight * (item.itemCount || 1);
        }
    
        return inventoryWeight;
    }

    CanCarryItem(itemName: string, count: number) {
        if (this.type == "drop") return true;

        let maximumWeight = Config.playerInventoryMaximumWeight;
        let totalWeightNeeded = InventoryManager.ItemBaseTypes[itemName].weight * count;
        let currentInventoryWeight = this.weight;
    
        return (currentInventoryWeight + totalWeightNeeded) <= maximumWeight;
    }

    IsEmpty() {
        return Object.keys(this.items).length == 0;
    }
}

class TrunkInventory extends Inventory {
    constructor (owner: any, items: any) {
        super("trunk", owner, items)
        this.Locked = false;
    }

    async UpdateDatabase(callback: Function) {
        exports.ghmattimysql.execute("UPDATE generous_inv_trunks SET inventory = @inventory WHERE identifier = @plate", { 
            inventory: JSON.stringify(this.items), 
            plate: this.owner 
        }, (result: any) => {
            callback();
        });
    }
}

class GloveboxInventory extends Inventory {
    constructor (owner: any, items: any) {
        super("glovebox", owner, items)
        this.Locked = false;
    }

    async UpdateDatabase(callback: Function) {
        exports.ghmattimysql.execute("UPDATE generous_inv_gloveboxes SET inventory = @inventory WHERE identifier = @plate", { 
            inventory: JSON.stringify(this.items), 
            plate: this.owner 
        }, (result: any) => {
            callback();
        });
    }
}

class StashInventory extends Inventory {
    stashName: string;
    constructor (stashName: any, owner: any, items: any) {
        super("stash", owner, items)
        this.stashName = stashName;
        this.Locked = false;
    }

    async UpdateDatabase(callback: Function) {
        exports.ghmattimysql.execute("UPDATE generous_inv_stashes SET inventory = @inventory WHERE identifier = @identifier", { 
            inventory: JSON.stringify(this.items), 
            identifier: this.owner 
        }, (result: any) => {
            callback();
        });
    }
}

class DropInventory extends Inventory {
    constructor (coords: any, items: any) {
        super("drop", coords, items)
        this.Locked = false;
    }

    async UpdateDatabase() {
        InventoryManager.inventories["drop"][this.owner].items = this.items;
        
        if (!this.IsEmpty()) {
            emitNet('client-register-new-drop', -1, this.owner);
            if (Config.DeleteDrops.Enabled) {
                setTimeout(() => {
                    emitNet('client-remove-drop', -1, this.owner);
                }, Config.DeleteDrops.Time * 1000);
            }
        } else {
            emitNet('client-remove-drop', -1, this.owner);
            return;
        }
    }
}

class ShopInventory extends Inventory {
    constructor (name: any, items: any) {
        super("shop", name, items)
    }
}

export {Inventory, TrunkInventory, GloveboxInventory, StashInventory, DropInventory, ShopInventory}