import {Inventory, TrunkInventory, GloveboxInventory, StashInventory, DropInventory, ShopInventory} from "./inventory";
import Logger from "../utils/logger"
import Config from "../config.json";
import {Item, Weapon} from "./item";

import {IsItAWeapon, isEmpty} from "../utils/utils"

let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

interface Dictionary<T> {
    [Key: string]: T;
}


interface IItemBaseType {
    name: string;
    label: string;
    weight: number;
    can_stacked: boolean;
    can_remove: boolean;
    price: number;
}

class InventoryManager {
    static viewedInventories: Dictionary<{ type: string; owner: string; }>;
    static inventories: Dictionary<Dictionary<Inventory>>;
    static stashes: Record<string, Record<string, StashInventory>>;

    static ItemBaseTypes: Array<IItemBaseType>;

    public static InitItems(): Promise<IItemBaseType[]> {
        Logger.LogInfo("Initializing items from database.");
        return new Promise((resolve) => {
            exports.ghmattimysql.execute("SELECT * FROM items", { 
            }, (data: Dictionary<IItemBaseType>)  => {
                for (const [key, itemData] of Object.entries(data)) {
                    if (IsItAWeapon(itemData.name)) {
                        this.ItemBaseTypes[itemData.name] = 
                        {
                            name: itemData.name,
                            label: itemData.label,
                            weight: itemData.weight,
                            canStacked: false,
                            canRemove: true,
                            price: itemData.price
                        };
                    } else {
                        this.ItemBaseTypes[itemData.name] = {
                            name: itemData.name,
                            label: itemData.label,
                            weight: itemData.weight,
                            canStacked: itemData.can_stacked,
                            canRemove: itemData.can_remove,
                            price: itemData.price
                        };
                    }
                }
                Logger.LogInfo("Items initialized.");
                return resolve(this.ItemBaseTypes);
            });
        });
    }

    public static InitWeaponEvents() {
        Object.keys(this.ItemBaseTypes).forEach((itemName) => {
            if (IsItAWeapon(itemName)) {
                ESX.RegisterUsableItem(itemName, function(source: number) {
                    emitNet('generous_inventory:client:useWeapon', source, itemName)
                });
            } 
        });   
    }

    public static InitShopInventories() {
        for (const [name, market] of Object.entries(Config.MarketList)) {
            let shopInventory = new ShopInventory(name, {});
            for (let index = 0; index < market.items.length; index++) {
                let item = market.items[index];
                shopInventory.AddItem(item.name, item.price);
                this.inventories["shop"][name] = shopInventory;
            }
        }
        
    }

    public static async InitSharedStashInventories() {
        for (const [stashName, stash] of Object.entries(Config.Stashes)) {
            if (stash.job != "all") {
                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_stashes WHERE stashname = @stashname AND identifier = @identifier`, { 
                    stashname: stashName,
                    identifier: stash.job
                }, (data)  => {
                    if (data[0] == undefined) {
                        exports.ghmattimysql.execute(`INSERT INTO generous_inv_stashes (stashname, identifier, inventory) VALUES (?, ?, ?)`,
                            [stashName, stash.job, JSON.stringify({})], (result) => { 
                                let stashInventory = new StashInventory(stashName, stash.job, {});
                                this.stashes[stashName][stash.job] = stashInventory;
                            }
                        );
                    } else {
                        let stashInventory = new StashInventory(stashName, stash.job, (JSON.parse(data[0].inventory)));
                        this.stashes[stashName][stash.job] = stashInventory;
                    }
                });
            }
    
        }
    }

    public static async InitPersonalStashInventories(source) {
        let playerIdentifier = GetPlayerIdentifier(source, 0);
        for (const [stashName, stash] of Object.entries(Config.Stashes)) {
            if (stash.job == "all") {
                exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_stashes WHERE stashname = @stashname AND identifier = @identifier`, { 
                    stashname: stashName,
                    identifier: playerIdentifier
                }, (data)  => {
                    if (data[0] == undefined) {
                        exports.ghmattimysql.execute(`INSERT INTO generous_inv_stashes (stashname, identifier, inventory) VALUES (?, ?, ?)`,
                            [stashName, playerIdentifier, JSON.stringify({})], (result) => { 
                                let stashInventory = new StashInventory(stashName, playerIdentifier, {});
                                this.stashes[stashName][playerIdentifier] = stashInventory;
                            }
                        );
                    } else {
                        let stashInventory = new StashInventory(stashName, stash.job, (JSON.parse(data[0].inventory)));
                        this.stashes[stashName][playerIdentifier] = stashInventory;
                    }
                });
            }
        }
    }

    public static async InitializePlayerInventory(source: number) {
        const identifier = GetPlayerIdentifier(source.toString(), 0);
        exports.ghmattimysql.execute(`SELECT inventory FROM generous_inv_player WHERE identifier = @identifier`, { 
            identifier: identifier 
        }, (data)  => {
            if (data[0] == undefined) {
                exports.ghmattimysql.execute(`INSERT INTO generous_inv_player (identifier, inventory) VALUES (?, ?)`,
                    [identifier, JSON.stringify({})], () => { 
                        let playerInventory = new Inventory("player", identifier, {});
                        this.inventories["player"][identifier] = playerInventory;
                    }
                );
            } else {
                let playerInventory = new Inventory("player", identifier, (JSON.parse(data[0].inventory)));
                this.inventories["player"][identifier] = playerInventory;
            }
        });
    }

    public static GetInventory(inventoryType: string, identifier:string, stashName?: string): Inventory {
        let requestedInventories = typeof stashName === 'undefined' ? this.inventories[inventoryType] : this.stashes[stashName];
        if (identifier in requestedInventories) {
            return requestedInventories[identifier];
        }
    }

    public static DeletePlayerStashesOnLogOut(playerIdentifier: string) {
        delete InventoryManager.inventories["player"][playerIdentifier];
        Object.entries(InventoryManager.stashes).forEach(([stashName, idenStashPair]) => {
            Object.keys(idenStashPair).forEach(([stashIdentifier]) => {
                if (stashIdentifier == playerIdentifier)
                    delete InventoryManager.stashes[stashName][stashIdentifier];
            });
        })
    }

    public static GetPlayerIdentifiersViewingInventory(inventoryData: {type: string; owner: string}) {
        let identifiers = [];
        if (inventoryData.type == "player")
            identifiers.push(inventoryData.owner);
        
        Object.keys(this.viewedInventories).filter(source => {
            const inventoryDataToCompare = this.viewedInventories[source];
            if (JSON.stringify(inventoryData) === JSON.stringify(inventoryDataToCompare))
                return true;

            return false;
        }).concat(identifiers);

        return [ ...new Set(identifiers) ];;
    }
}


export {InventoryManager}