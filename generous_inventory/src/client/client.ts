let ESX = null;
emit('esx:getSharedObject', (obj) => (ESX = obj));

import Config from "../config.json";
import { IsItAWeapon } from "../utils/utils";

let lastOpenSecondaryInventory = null;
let lastUsedWeaponSlot;
let playerInventory = '{}';
let dropsInWorld = [];

let isInInventory = false;

declare global {
    interface Array<T> {
        remove(o: T): Array<T>;
    }
}

exports("GetWeaponSlotID", () => {
    return lastUsedWeaponSlot;
});

Main();

function Main() {
    if (GetSelectedPedWeapon(PlayerPedId()) != GetHashKey('WEAPON_UNARMED')) {
        RemoveWeaponFromPed(PlayerPedId(), GetSelectedPedWeapon(PlayerPedId()));
    }
    emitNet('new-client-connected');
}

on('esx:playerLoaded', (playerData) => {

    ESX.PlayerData = playerData

    for (let index = 0; index < Object.keys(Config.MarketList).length; index++) {
        let market = Config.MarketList[Object.keys(Config.MarketList)[index]];

        if (market.blip != null) {
            if (market.blip) {
                if (market.job.includes("all") || market.job.includes(playerData.job.name)) {
                    for (let i = 0; i < market.coords.length; i++) {
                        let coord = market.coords[i];
                        CreateBlipAtCoords(coord, market.blip.id, market.blip.scale, market.blip.color, market.blip.title)
                    }
                }
            }
        }
    } 

    
});

function CreateBlipAtCoords(coord, id, scale, color, title) {
    let _blip = AddBlipForCoord(coord[0], coord[1], coord[2])
    
    SetBlipSprite(_blip, id || 1)
    SetBlipDisplay(_blip, 4)
    SetBlipScale(_blip, scale || 0.5)
    SetBlipColour(_blip, color || 1)
    SetBlipAsShortRange(_blip, true)
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString(title || 'null')
    EndTextCommandSetBlipName(_blip)
}

on('generous_inventory:requestMotelRoom', (data) => {
    requestOpenInventory(JSON.stringify(data));
});

RegisterCommand("soy", async (source, args) => {
    let closestPlayerData = ESX.Game.GetClosestPlayer();
    let closestPlayer = closestPlayerData[0];
    let closestPlayerDistance = closestPlayerData[1];

    if (GetSelectedPedWeapon(PlayerPedId()) != GetHashKey('WEAPON_UNARMED')) {
        if (closestPlayer == -1 || closestPlayerDistance > 1.0) {
            ESX.ShowNotification('Yakınında herhangi bir oyuncu yok!')
        } else {
            if (IsEntityPlayingAnim(GetPlayerPed(closestPlayer), "missminuteman_1ig_2", "handsup_enter", 3) || IsEntityPlayingAnim(GetPlayerPed(closestPlayer), "misslamar1dead_body", "dead_idle", 3)) {
                requestOpenInventory(JSON.stringify({ type: "player", owner: GetPlayerServerId(closestPlayer) }));
            } else {
                ESX.ShowNotification('Oyuncu ellerini kaldırmıyor!');
            }
        }           
    } else {
        ESX.ShowNotification('Elinde silah olmadan adamı soyamazsın!');
    }
}, false);


on('police-request-search-player', () => {
    let closestPlayerData = ESX.Game.GetClosestPlayer();
    let closestPlayer = closestPlayerData[0];
    let closestPlayerDistance = closestPlayerData[1];
    
    if (GetSelectedPedWeapon(PlayerPedId()) != GetHashKey('WEAPON_UNARMED')) {
        if (closestPlayer == -1 || closestPlayerDistance > 1.0) {
            ESX.ShowNotification('Yakınında herhangi bir oyuncu yok!')
        } else {
            if (IsEntityPlayingAnim(GetPlayerPed(closestPlayer), "missminuteman_1ig_2", "handsup_enter", 3) || IsEntityPlayingAnim(GetPlayerPed(closestPlayer), "misslamar1dead_body", "dead_idle", 3)) {
                requestOpenInventory(JSON.stringify({ type: "player", owner: GetPlayerServerId(closestPlayer) }));
            } else {
                ESX.ShowNotification('Oyuncu ellerini kaldırmıyor!');
            }
        }           
    } else {
        ESX.ShowNotification('Elinde silah olmadan adamı soyamazsın!');
    }
});

on('server-update-inventory-data', (inventory, inventory2) => {
    playerInventory = inventory;

    SendNuiMessage(JSON.stringify({
        type: 'inventoryUpdateRequest',
        primaryInventoryData: playerInventory,
        secondaryInventoryData: inventory2
    }));
});

on('server-update-inventory-primary-data', (inventory) => {
    playerInventory = inventory;

    SendNuiMessage(JSON.stringify({
        type: 'inventoryUpdateRequest',
        primaryInventoryData: playerInventory
    }));
});


on('server-update-inventory-secondary-data', (inventory) => {

    SendNuiMessage(JSON.stringify({
        type: 'inventoryUpdateRequest',
        secondaryInventoryData: inventory
    }));
});

on('server-open-inventory', (primaryInventory, secondaryInventory) => {
    if (!IsEntityPlayingAnim(PlayerPedId(), "random@mugging3", "handsup_standing_base", 3)) {
        ESX.Streaming.RequestAnimDict('pickup_object', function() {
            TaskPlayAnim(PlayerPedId(), 'pickup_object', 'putdown_low', 8.0, -8, -1, 48, 0, false, false, false);
        });
        ESX.UI.Menu.CloseAll();
        playerInventory = primaryInventory;
        openInventoryNUI();
        SendNuiMessage(JSON.stringify({
            type: 'inventoryUpdateRequest',
            primaryInventoryData: playerInventory,
            secondaryInventoryData: secondaryInventory
        }));
    }
});

on('server-remove-removed-weapon', (targetSlot, targetInventory, currentSlot) => {
    if (currentSlot == lastUsedWeaponSlot) {
        RemoveWeapon(currentWeapon, targetSlot, targetInventory);
        lastUsedWeaponSlot = targetSlot;
    }
});

on('client-register-new-drop', (coordinates) => {
    dropsInWorld.push(coordinates);
});

on('client-remove-drop', (coordinates) => {
    dropsInWorld.remove(coordinates);
});

RegisterNuiCallbackType('requestMoveItem') // register the type
on('__cfx_nui:requestMoveItem', (data, cb) => {
    ESX.Streaming.RequestAnimDict('pickup_object', function() {
        TaskPlayAnim(PlayerPedId(), 'pickup_object', 'putdown_low', 8.0, -8, -1, 48, 0, false, false, false);
    });
    let currentSlot = data.currentSlot;
    let targetSlot = data.targetSlot;
    let targetIdentifier = data.targetInv;
    let currentIdentifier = data.currentInv;
    let itemAmount = data.amount;
    
    emitNet("client-inventory-update-request", currentSlot, targetSlot, currentIdentifier, targetIdentifier, itemAmount);

    cb({});
});

RegisterNuiCallbackType('requestGiveItem') // register the type
on('__cfx_nui:requestGiveItem', (data, cb) => {
    ESX.Streaming.RequestAnimDict('pickup_object', function() {
        TaskPlayAnim(PlayerPedId(), 'pickup_object', 'putdown_low', 8.0, -8, -1, 48, 0, false, false, false);
    });
    let currentSlot = data.currentSlot;
    let currentIdentifier = data.currentInv;
    let itemAmount = data.amount;

    SelectPlayerToGive(currentSlot, currentIdentifier, itemAmount);
    cb({});
});

RegisterNuiCallbackType('SetInventorySlotAsBusy') // register the type
on('__cfx_nui:SetInventorySlotAsBusy', (data, cb) => {
    let inventoryType = data.inventoryType;
    let inventoryOwner = data.inventoryOwner;
    let itemSlot = data.itemSlot;
    let isBusy = data.isBusy;

    emitNet("client-inventory-set-busy-request", inventoryType, inventoryOwner, itemSlot, isBusy);

    cb({});
});

on('client-set-inventory-item-busy', (inventoryType, inventoryOwner, itemSlot, isBusy, inventoryID) => {
    SendNuiMessage(JSON.stringify({
        type: 'inventorySetSlotBusy',
        //inventoryType: inventoryType,
        //inventoryOwner: inventoryOwner,
        itemSlot: itemSlot,
        isBusy: isBusy,
        inventoryID: inventoryID
    }));
});


let currentWeapon = null;

on('generous_inventory:client:useWeapon', (weapon) => {
    if (currentWeapon != null) {
        if (GetSelectedPedWeapon(PlayerPedId()) == GetHashKey(currentWeapon)) {
            RemoveWeapon(currentWeapon)
            currentWeapon = null
            return
        } else {
            RemoveWeapon(currentWeapon)

            currentWeapon = weapon
            GiveWeapon(currentWeapon)
            ClearPedTasks(PlayerPedId())
        }
    } else {
        currentWeapon = weapon
        GiveWeapon(currentWeapon)
        ClearPedTasks(PlayerPedId())
    }
});

on('client-force-update-inventories', () => {
    requestOpenInventory(lastOpenSecondaryInventory);
});

on('client-use-item', (itemName, slot) => {

    if (itemName != null) {
        if (!IsItAWeapon(itemName)) {
            emitNet("esx:useItem", itemName, 1);
        } else {
            emitNet("esx:useItem", itemName, 1);

            if (IsPedInAnyVehicle(PlayerPedId(), true)) {
                if (GetSelectedPedWeapon(PlayerPedId()) != GetHashKey('WEAPON_UNARMED')) {
                    lastUsedWeaponSlot = slot;
                }

            } else {
                if (GetSelectedPedWeapon(PlayerPedId()) == GetHashKey('WEAPON_UNARMED')) {
                    lastUsedWeaponSlot = slot;
                }
            }
        }
    }
});

on('esx:setJob', (job) => {
    ESX.PlayerData.job = job
});

function GiveWeapon(weapon) {
    let playerPed = PlayerPedId();
    let hash = GetHashKey(weapon);
    ESX.TriggerServerCallback('generous_inventory:server:getAmmoCount', function(ammoCount) {

        SetPedAmmo(playerPed, hash, ammoCount || 0);

    }, hash, lastUsedWeaponSlot);
}

function RemoveWeapon(weapon, targetSlot?, targetInventory?) {
    let playerPed = PlayerPedId()
    let hash = GetHashKey(weapon)
    let ammoCount = GetAmmoInPedWeapon(playerPed, hash)
    if (targetSlot != null && targetInventory != null) {
        TriggerServerEvent('generous_inventory:server:updateAmmoCount', hash, ammoCount, targetSlot, targetInventory)
    } else {
        TriggerServerEvent('generous_inventory:server:updateAmmoCount', hash, ammoCount, lastUsedWeaponSlot)
    }
    RemoveWeaponFromPed(playerPed, hash)
    SetCurrentPedWeapon(PlayerPedId(), "WEAPON_UNARMED", true)
}

async function SelectPlayerToGive(currentSlot, currentIdentifier, itemAmount) {

    // Close inventory until operation is finished
    SendNuiMessage(JSON.stringify({
        type: 'inventoryCloseRequest'
    }));
    isInInventory = false;
    SetNuiFocus(false, false);
    ClearPedSecondaryTask(PlayerPedId());

    let localPlayerPed = PlayerPedId();
    let localCoords = GetEntityCoords(localPlayerPed);
    let playersInArea = ESX.Game.GetPlayersInArea({ x: localCoords[0], y: localCoords[1], z: localCoords[2] }, 2.0);
    let focusedPedIndex = 0;

    let foundPedIDs = [];
    for (let index = 0; index < playersInArea.length; index++) {
        const playerID = playersInArea[index];
        if (playerID != PlayerId()) {
            const playerPedID = GetPlayerPed(playerID);
            foundPedIDs.push(playerPedID)
        }
    }

    if (foundPedIDs.length == 0) {
        requestOpenInventory(lastOpenSecondaryInventory);
        console.log("No one near!");
        return -1;
    }

    let waitingForInput1 = true;
    while (waitingForInput1) {
        await Wait(1);

        let waitingForInput2 = true;
        while (waitingForInput2) {
            await Wait(1);

            DisableAllControlActions(0)
            EnableControlAction(0, 175, true)
            EnableControlAction(0, 174, true)
            EnableControlAction(0, 191, true)
            EnableControlAction(0, 177, true)
            EnableControlAction(0, 1, true)
            EnableControlAction(0, 2, true)
            ESX.ShowHelpNotification("~INPUT_CELLPHONE_CANCEL~ Tuşuna Basarak Bu Ekrandan Çıkabilir, ENTER ile vereceğiniz kişiyi onaylayabilir, ~INPUT_FRONTEND_LEFT~ ve ~INPUT_FRONTEND_RIGHT~ ile eşyayı vereceğiniz oyuncuyu seçebilirsiniz.")

            let focusedPedId = foundPedIDs[focusedPedIndex];
            let targetCoords = GetEntityCoords(focusedPedId);

            
            if (Vdist2(targetCoords[0], targetCoords[1], targetCoords[2], localCoords[0], localCoords[1], localCoords[2]) > 2) {
                const focusedID = foundPedIDs.indexOf(focusedPedId);
                if (focusedID > -1) {
                    foundPedIDs.splice(focusedID, 1);
                }

                if (foundPedIDs.length == 0) {
                    requestOpenInventory(lastOpenSecondaryInventory);
                    return -1;
                } else {
                    focusedPedIndex = 0;
                }
            }
            DrawMarker(2, targetCoords[0], targetCoords[1], targetCoords[2] + 1.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2, 0.2, 55, 255, 55, 100, false, true, 2, false, null, null, true);

            if (IsControlJustPressed(0, 175)) {
                console.log(focusedPedIndex)
                // Increment focusedPedIndex by 1
                focusedPedIndex += 1;
                if (focusedPedIndex == foundPedIDs.length) {
                    focusedPedIndex = 0;
                }
                waitingForInput2 = false;
            }

            if (IsControlJustPressed(0, 174)) {
                // Decrement focusedPedIndex by 1
                focusedPedIndex -= 1;
                if (focusedPedIndex == -1) {
                    focusedPedIndex = foundPedIDs.length - 1;
                }
                waitingForInput2 = false;
            }

            if (IsControlJustPressed(0, 191)) {
                // Player choosed
				emitNet('client-inventory-give-item-request', currentSlot, currentIdentifier, itemAmount, GetPlayerServerId(NetworkGetPlayerIndexFromPed(focusedPedId)));
                requestOpenInventory(lastOpenSecondaryInventory);
                return focusedPedId;
            }

            if (IsControlJustPressed(0, 177)) {
                // Player choosed
                requestOpenInventory(lastOpenSecondaryInventory);
                return -1;
            }
        }
    }
    requestOpenInventory(lastOpenSecondaryInventory);
}


RegisterNuiCallbackType('UseItem') // register the type
on('__cfx_nui:UseItem', async (data, cb) => {

    let usedItemData = data.itemData;
    let usedItemSlot = data.itemSlot;

    if (usedItemData.itemName != null) {
        if (!IsItAWeapon(usedItemData.itemName)) {
            emitNet("esx:useItem", usedItemData.itemName, usedItemData.itemCount);
        } else {
            emitNet("esx:useItem", usedItemData.itemName, 1);

            if (IsPedInAnyVehicle(PlayerPedId(), true)) {
                if (GetSelectedPedWeapon(PlayerPedId()) != GetHashKey('WEAPON_UNARMED')) {
                    lastUsedWeaponSlot = usedItemSlot;
                }

            } else {
                if (GetSelectedPedWeapon(PlayerPedId()) == GetHashKey('WEAPON_UNARMED')) {
                    lastUsedWeaponSlot = usedItemSlot;
                }
            }
        }
    }

    if (shouldCloseInventory(usedItemData.itemName)) {
        closeInventory()
        SendNuiMessage(JSON.stringify({
            type: 'inventoryCloseRequest'
        }));
    } else {
        let dataToSend = JSON.stringify({ type: "drop", owner: JSON.stringify(RoundCoordinates(GetEntityCoords(PlayerPedId()))) });
        emitNet("client-request-open-drop", dataToSend);
    }


    cb({});
});

function shouldCloseInventory(itemName) {
    return Config.CloseUiItems.includes(itemName);
}

function requestOpenInventory(dataToSend) {
    if (lastOpenSecondaryInventory != dataToSend) {
        lastOpenSecondaryInventory = dataToSend;
    }
    emitNet("client-request-open-" + dataToSend.type, dataToSend);
}



function openInventoryNUI() {
    isInInventory = true;
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({
        type: 'inventoryOpenRequest'
    }));
}

function DrawText3D(x, y, z, scale, text) {
    let worldToScreenOutput = GetScreenCoordFromWorldCoord(x, y, z); 
    let _x = worldToScreenOutput[1];
    let _y = worldToScreenOutput[2];
    SetTextScale(scale, scale); 
    SetTextFont(4); 
    SetTextProportional(true); 
    SetTextEntry("STRING"); 
    SetTextCentre(true); 
    SetTextColour(255, 255, 255, 215); 
    AddTextComponentString(text); 
    DrawText(_x, _y); 
    let factor = (text.length) / 700; 
    DrawRect(_x, _y + 0.0150, 0.075 + factor, 0.03, 41, 11, 41, 100);
}



RegisterNuiCallbackType('InventoryClosed') // register the type
on('__cfx_nui:InventoryClosed', () => {
    closeInventory();
});

function closeInventory() {
    isInInventory = false;
    SetNuiFocus(false, false);
    ClearPedSecondaryTask(PlayerPedId());

    emitNet("client-request-close-inv", lastOpenSecondaryInventory);
    lastOpenSecondaryInventory = null;
}


Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


// Market tick
setTick(async() => {

    if (ESX != null && ESX.PlayerData.job != null) {
        for (let index = 0; index < Object.keys(Config.MarketList).length; index++) {
            let market = Config.MarketList[Object.keys(Config.MarketList)[index]];
            if (market.job.includes(ESX.PlayerData.job.name) || market.job.includes("all")) {
                for (let i = 0; i < market.coords.length; i++) {
                    let coord = market.coords[i];
                    let playerCoords = GetEntityCoords(PlayerPedId());
                    let distance = Vdist2(coord[0], coord[1], coord[2], playerCoords[0], playerCoords[1], playerCoords[2]);
                    if (distance < 25) {
                        DrawMarker(market.markerType || 1, coord[0], coord[1], coord[2], 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, market.markerSize[0] || 0.2, market.markerSize[1] || 0.2, market.markerSize[2] || 0.2, market.markerColor[0] || 55, market.markerColor[0] || 255, market.markerColor[0] || 55, 100, false, true, 2, true, null, null, true);
                        if (distance < 5) {
                            if (market.use3DText) {
                                DrawText3D(coord[0], coord[1], coord[2] + 0.3, 0.4, market.msg || '[E]');
                            } else {
                                ESX.ShowHelpNotification(market.msg || '~INPUT_CONTEXT~');
                            }
                            if (IsControlJustReleased(0, 46)) {
                                requestOpenInventory(JSON.stringify({ type: "shop", owner: Object.keys(Config.MarketList)[index] }));
                            }
                        }
                    }
                }
            }
        } 
    }
});

// Actionbar tick
setTick(async() => {
    if (!IsEntityPlayingAnim(PlayerPedId(), 'misslamar1dead_body', 'dead_idle', 3)) {
        if (IsDisabledControlJustReleased(1, 157)) {
            emitNet("client-actionbar-request", 1);
        } else if (IsDisabledControlJustReleased(1, 158)) {
            emitNet("client-actionbar-request", 2);
        } else if (IsDisabledControlJustReleased(1, 160)) {
            emitNet("client-actionbar-request", 3);
        } else if (IsDisabledControlJustReleased(1, 164)) {
            emitNet("client-actionbar-request", 4);
        } else if (IsDisabledControlJustReleased(1, 165)) {
            emitNet("client-actionbar-request", 5);
        }
    }
});

// Disabling Input In Inventory Mode
setTick(async() => {
    if (isInInventory) {
        DisableAllControlActions(0)
        EnableControlAction(0, 47, true)
        EnableControlAction(0, 245, true)
        EnableControlAction(0, 38, true)
    }
});

// Drop and Utils Tick
setTick(async () => {
    if (IsControlJustReleased(0, 289)) {
        requestOpenInventory(JSON.stringify({ type: "drop", owner: JSON.stringify(RoundCoordinates(GetEntityCoords(PlayerPedId()))) }));
    }

    BlockWeaponWheelThisFrame();
	HideHudComponentThisFrame(19);
	HideHudComponentThisFrame(20);
    DisableControlAction(2, 37, true);

    let playerCoords = GetEntityCoords(PlayerPedId());

    for (let index = 0; index < dropsInWorld.length; index++) {
        let coord = JSON.parse(dropsInWorld[index]);
        
        let distance = Vdist2(playerCoords[0], playerCoords[1], playerCoords[2], coord[0], coord[1], coord[2]);
        if (distance < 10) {
            DrawMarker(2, coord[0], coord[1], coord[2], 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2, 0.2, 255, 0, 0, 100, false, true, 2, false, null, null, true);
        }
    }

    // Ammo reload input handling
    if (IsControlJustReleased(0, 45)) {
        emitNet("esx:useItem", GetAmmoItemType(GetSelectedPedWeapon(PlayerPedId())));
    }
});

function GetAmmoItemType(hash) {
    let pistols = [
        GetHashKey(`WEAPON_PISTOL`),
        GetHashKey(`WEAPON_APPISTOL`),
        GetHashKey(`WEAPON_SNSPISTOL`),
        GetHashKey(`WEAPON_COMBATPISTOL`),
        GetHashKey(`WEAPON_HEAVYPISTOL`),
        GetHashKey(`WEAPON_MACHINEPISTOL`),
        GetHashKey(`WEAPON_MARKSMANPISTOL`),
        GetHashKey(`WEAPON_PISTOL50`),
        GetHashKey(`WEAPON_VINTAGEPISTOL`),
        GetHashKey(`WEAPON_PISTOL_MK2`),
        GetHashKey(`WEAPON_DOUBLEACTION`)
    ];
    let shotguns = [
        GetHashKey(`WEAPON_ASSAULTSHOTGUN`),
        GetHashKey(`WEAPON_AUTOSHOTGUN`),
        GetHashKey(`WEAPON_BULLPUPSHOTGUN`),
        GetHashKey(`WEAPON_DBSHOTGUN`),
        GetHashKey(`WEAPON_HEAVYSHOTGUN`),
        GetHashKey(`WEAPON_PUMPSHOTGUN`),
        GetHashKey(`WEAPON_SAWNOFFSHOTGUN`),
        GetHashKey(`WEAPON_PUMPSHOTGUN_MK2`)
    ];
    let smgs = [
        GetHashKey(`WEAPON_ASSAULTSMG`),
        GetHashKey(`WEAPON_MICROSMG`),
        GetHashKey(`WEAPON_MINISMG`),
        GetHashKey(`WEAPON_SMG`),
        GetHashKey(`WEAPON_COMBATPDW`),
        GetHashKey(`WEAPON_GUSENBERG`),
        GetHashKey(`WEAPON_MG`),
        GetHashKey(`WEAPON_COMBATMG_MK2`),
        GetHashKey(`WEAPON_SMG_MK2`)
    ];
    let rifles = [
        GetHashKey(`WEAPON_ADVANCEDRIFLE`),
        GetHashKey(`WEAPON_ASSAULTRIFLE`),
        GetHashKey(`WEAPON_BULLPUPRIFLE`),
        GetHashKey(`WEAPON_CARBINERIFLE`),
        GetHashKey(`WEAPON_SPECIALCARBINE`),
        GetHashKey(`WEAPON_COMPACTRIFLE`),
        GetHashKey(`WEAPON_CARBINERIFLE_MK2`)
    ];
    let snipers = [
        GetHashKey(`WEAPON_SNIPERRIFLE`),
        GetHashKey(`WEAPON_HEAVYSNIPER`),
        GetHashKey(`WEAPON_MARKSMANRIFLE`)
    ];

    if (pistols.includes(hash)) {
        return "disc_ammo_pistol";
    } else if (shotguns.includes(hash)) {
        return "disc_ammo_shotgun";
    } else if (smgs.includes(hash)) {
        return "disc_ammo_smg";
    } else if (rifles.includes(hash)) {
        return "disc_ammo_rifle";
    } else if (snipers.includes(hash)) {
        return "disc_ammo_snp";
    }

    return null;
}


// Glovebox Tick
setTick(async() => {
    await Wait(0);
    let playerPed = PlayerPedId()
    if (IsControlJustReleased(0, Config.TrunkAndGloveboxOpenControl) && IsPedInAnyVehicle(playerPed, false))  {
        let vehicle = GetVehiclePedIsIn(playerPed, false)
        if (DoesEntityExist(vehicle) && Config.VehicleGloveboxs[GetVehicleClass(vehicle)] > 0) {
            if ((GetPedInVehicleSeat(vehicle, -1) == playerPed) || (GetPedInVehicleSeat(vehicle, 0) == playerPed)) {
                requestOpenInventory(JSON.stringify({ type: "gloveboxes", owner: GetVehicleNumberPlateText(vehicle) }));
            }
        }
    }
});

// Trunk tick
setTick(async() => {
    if (IsControlJustReleased(0, Config.TrunkAndGloveboxOpenControl)) {
        let playerPed = PlayerPedId();
        let vehicle = ESX.Game.GetVehicleInDirection();
        if (DoesEntityExist(vehicle) && GetVehiclePedIsIn(playerPed, false) == 0) {
            let locked = GetVehicleDoorLockStatus(vehicle) == 2;
            if (!locked) {
                let boneIndex = GetEntityBoneIndexByName(vehicle, 'platelight');
                let vehicleCoords = GetWorldPositionOfEntityBone(vehicle, boneIndex);
                let playerCoords = GetEntityCoords(playerPed);
                let distance = GetDistanceBetweenCoords(vehicleCoords[0], vehicleCoords[1], vehicleCoords[2], playerCoords[0], playerCoords[1], playerCoords[2], true);
                if (distance < 3 && Config.VehicleTrunks[GetVehicleClass(vehicle)] > 0) {
                    requestOpenInventory(JSON.stringify({ type: "trunks", owner: GetVehicleNumberPlateText(vehicle) }));
                    SetVehicleDoorOpen(vehicle, 5, false, true);
                    let playerPed = PlayerPedId();
                    if (!IsEntityPlayingAnim(playerPed, 'mini@repair', 'fixing_a_player', 3)) {
                        ESX.Streaming.RequestAnimDict('mini@repair', function() {
                            TaskPlayAnim(playerPed, 'mini@repair', 'fixing_a_player', 8.0, -8, -1, 49, 0, false, false, false);
                        });
                    }
                }
            }
        }
    }
});


// Stash
setTick(async () => {
    if (ESX != null && ESX.PlayerData.job != null) {
        let playerPed = PlayerPedId();
        let pcoords = GetEntityCoords(playerPed);
        for (let index = 0; index < Object.keys(Config.Stashes).length; index++) {
            let stash = Config.Stashes[Object.keys(Config.Stashes)[index]];
            if ((stash.job == 'all' || ESX.PlayerData.job.name == stash.job) && stash.useMarker) {
                for (let i = 0; i < stash.coords.length; i++) {
                    let coord = stash.coords[i];
                    let distance = Vdist2(coord[0], coord[1], coord[2], pcoords[0], pcoords[1], pcoords[2]);
                    if (distance < 10) {
                        DrawMarker(stash.markerType || 2, coord[0], coord[1], coord[2], 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, stash.markerSize[0] || 0.2, stash.markerSize[0] || 0.2, stash.markerSize[0] || 0.2, stash.markerColour[0] || 55, stash.markerColour[0] || 255, stash.markerColour[0] || 55, 100, false, true, 2, false, null, null, true);
                        if (distance < 1) {
                            if (stash.use3dtext) {
                                DrawText3D(coord[0], coord[1], coord[2] + 0.3, 0.4, stash.msg || '[E]')
                            } else {
                                ESX.ShowHelpNotification(stash.msg || '~INPUT_CONTEXT~');
                            }
                            if (IsControlJustPressed(0, 38)) {
                                if (ESX.PlayerData.job.name == stash.job) {
                                    requestOpenInventory(JSON.stringify({ type: "stash", owner: stash.job, stashName: Object.keys(Config.Stashes)[index] }));
                                } else {
                                    ESX.TriggerServerCallback('generous_inventory:server:getPlayerIdentifierOwn', (identifier) => {
                                        requestOpenInventory(JSON.stringify({ type: "stash", owner: identifier, stashName: Object.keys(Config.Stashes)[index] }));
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});

on('client-stash-open-request', (stashName) => {
    if (stashName in Config.Stashes) {
        let stash = Config.Stashes[stashName];
        if (stash.job == 'all') {
            ESX.TriggerServerCallback('generous_inventory:server:getPlayerIdentifierOwn', (identifier) => {
                requestOpenInventory(JSON.stringify({ type: "stash", owner: identifier, stashName: stashName }));
            });
        } else {
            requestOpenInventory(JSON.stringify({ type: "stash", owner: stash.job, stashName: stashName }));
        }
    }
});


function RoundCoordinates(coords) {
    let x = coords[0];
    let y = coords[1];
    let z = coords[2];
    return [ Math.round(x), Math.round(y), Math.round(z) ];
}