local Keys = {
	["ESC"] = 322, ["F1"] = 288, ["F2"] = 289, ["F3"] = 170, ["F5"] = 166, ["F6"] = 167, ["F7"] = 168, ["F8"] = 169, ["F9"] = 56, ["F10"] = 57,
	["~"] = 243, ["1"] = 157, ["2"] = 158, ["3"] = 160, ["4"] = 164, ["5"] = 165, ["6"] = 159, ["7"] = 161, ["8"] = 162, ["9"] = 163, ["-"] = 84, ["="] = 83, ["BACKSPACE"] = 177,
	["TAB"] = 37, ["Q"] = 44, ["W"] = 32, ["E"] = 38, ["R"] = 45, ["T"] = 245, ["Y"] = 246, ["U"] = 303, ["P"] = 199, ["["] = 39, ["]"] = 40, ["ENTER"] = 18,
	["CAPS"] = 137, ["A"] = 34, ["S"] = 8, ["D"] = 9, ["F"] = 23, ["G"] = 47, ["H"] = 74, ["K"] = 311, ["L"] = 182,
	["LEFTSHIFT"] = 21, ["Z"] = 20, ["X"] = 73, ["C"] = 26, ["V"] = 0, ["B"] = 29, ["N"] = 249, ["M"] = 244, [","] = 82, ["."] = 81,
	["LEFTCTRL"] = 36, ["LEFTALT"] = 19, ["SPACE"] = 22, ["RIGHTCTRL"] = 70,
	["HOME"] = 213, ["PAGEUP"] = 10, ["PAGEDOWN"] = 11, ["DELETE"] = 178,
	["LEFT"] = 174, ["RIGHT"] = 175, ["TOP"] = 27, ["DOWN"] = 173,
	["NENTER"] = 201, ["N4"] = 108, ["N5"] = 60, ["N6"] = 107, ["N+"] = 96, ["N-"] = 97, ["N7"] = 117, ["N8"] = 61, ["N9"] = 118
}

local ped
local vehicleModelHash
local canCook = false
local canInteractWithNPC = false
local smoke = nil
local ESX = nil
local eventKeyList = {}
local isStarted = false
local timeToClearDrunkEffect = 0
local isMissionFailed = false
local randomEventRunnig = false
local carDestroyStarted = false
local choosenKey

Citizen.CreateThread(function()
    TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
    while ESX == nil do Citizen.Wait(0) end
    
    vehicleModelHash = GetHashKey(Config.VehicleModelName)

    ped = Config.NPCSettings.NPCHash

    RequestModel(ped)

    while not HasModelLoaded(ped) do 
        Citizen.Wait(1)
    end

    ped = CreatePed(4, ped, Config.NPCSettings.pedPosition, false, true)
    Citizen.Wait(1000)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    FreezeEntityPosition(ped, true)


    for key, value in pairs(Config.RandomEvents) do
        table.insert(eventKeyList, key)
    end

    if (IsPedDeadOrDying(PlayerPedId(), 1)) then
        randomEventRunnig = false
        isStarted = false
    end

    while true do
        if timeToClearDrunkEffect <= GetGameTimer() and timeToClearDrunkEffect ~= 0 then
            timeToClearDrunkEffect = 0
            ClearTimecycleModifier()
        end
        if IsPedInAnyVehicle(PlayerPedId()) then
            canInteractWithNPC = false
            local _currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false) -- Vehicle Entity
            local _currentVehicleModel = GetEntityModel(_currentVehicle) -- Vehicle Model Hash
            local _playerCoords = GetEntityCoords(PlayerPedId()) -- Player coords

            if GetEntitySpeed(_currentVehicle) < 1 and 
            _currentVehicle ~= nil and 
            _currentVehicleModel == vehicleModelHash and 
            not carDestroyStarted and
            not isMissionFailed and
            not isStarted then
                canCook = true
            else
                canCook = false
            end
        else
            local _playerCoords = GetEntityCoords(PlayerPedId()) -- Player coords
            local _npcCoords = GetEntityCoords(ped)
            local _floatDistance = GetDistanceBetweenCoords(_playerCoords.x, _playerCoords.y, _playerCoords.z, _npcCoords.x, _npcCoords.y, _npcCoords.z, false)
            if (_floatDistance <= 5) then
                canInteractWithNPC = true
            else
                canInteractWithNPC = false
            end
            canCook = false
        end

        Citizen.Wait(1000)
    end
end)

Citizen.CreateThread(function()

    while true do
        if (canCook) then
            
            ESX.ShowHelpNotification(_U('script_button_check'), true, false)

            if (IsControlJustPressed(0, Keys['E'])) then -- Keyboard button check
                local _playerCoords = GetEntityCoords(PlayerPedId()) -- Player coords

                if (IsNearToCity(_playerCoords) and not Config.CanCookNearCity) then
                    exports['mythic_notify']:SendAlert('error', _U('script_cant_cook_in_city'), 2500)
                else
                    isStarted = true
                    FreezeVehicle()
                    SmokeManager(_playerCoords.x, _playerCoords.y, _playerCoords.z)
                    Citizen.SetTimeout(3000, function()
                        if IsNearToCity(_playerCoords) then
                            AlertThePolice(_playerCoords, _U('truck_close_to_city_notice'))
                        end
                    end)
    
                    OpenRecipeUI()
                end
            end
        end

        if (canInteractWithNPC) then
            ESX.ShowHelpNotification(_U('script_button_check_vehicle'), true, false)

            if (IsControlJustPressed(0, Keys['E'])) then -- Keyboard button check
                OpenVehicleUI()
            end
        end

        Citizen.Wait(10)
    end
end)



function FreezeVehicle()
    local _currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    FreezeEntityPosition(_currentVehicle,true)
    SetPedIntoVehicle(GetPlayerPed(-1), _currentVehicle, 3)
    SetVehicleDoorOpen(_currentVehicle, 2)
end

function UnFreezeVehicle()
    local _currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    FreezeEntityPosition(_currentVehicle, false)
    SetPedIntoVehicle(GetPlayerPed(-1), _currentVehicle, -1)
    SetVehicleDoorShut(_currentVehicle, 2, false)
end

function SmokeManager(posX, posY, posZ)

    if smoke == nil and (posX == nil or posY == nil or posZ == nil) then return end

    if smoke == nil then
        if not HasNamedPtfxAssetLoaded("core") then
            RequestNamedPtfxAsset("core")
            while not HasNamedPtfxAssetLoaded("core") do
                Citizen.Wait(1)
            end
        end
        SetPtfxAssetNextCall("core")
        smoke = StartParticleFxLoopedAtCoord("exp_grd_flare", posX, posY, posZ + 1.7, 0.0, 0.0, 0.0, 2.0, false, false, false, false)
        SetParticleFxLoopedAlpha(smoke, 0.8)
        SetParticleFxLoopedColour(smoke, 0.0, 0.0, 0.0, 0)
    else
        StopParticleFxLooped(smoke, 0)
        smoke = nil
    end
end




function OpenRecipeUI()

    ESX.UI.Menu.CloseAll()

    local elementsUI = { }

    for k, v in pairs(Config.Formulas) do
        table.insert(elementsUI, {label = v.text, value = k})
    end
    
    

    ESX.UI.Menu.Open( 'default', GetCurrentResourceName(), 'generousmenu', -- Replace the menu name
    {
        title    = ('Hadi pişirelim!'),
        align = 'top-left', -- Menu position
        elements = elementsUI
    },
    function(data, menu) -- This part contains the code that executes when you press enter

        if data.current.value ~= nil then
            OpenCraftingUI(data.current.value)
        end   
    end,
    function(data, menu) -- This part contains the code  that executes when the return key is pressed.
        menu.close() -- Close the menu
        SmokeManager()
        UnFreezeVehicle()
        isStarted = false
    end)
end

function OpenVehicleUI()

    ESX.UI.Menu.CloseAll()

    local elementsUI = { }

    table.insert(elementsUI, {label = 'Pişirme Aracı', value = 'buy'})
    
    

    ESX.UI.Menu.Open( 'default', GetCurrentResourceName(), 'generousmenu', -- Replace the menu name
    {
        title    = ('Araç Menüsü'),
        align = 'top-left', -- Menu position
        elements = elementsUI
    },
    function(data, menu) -- This part contains the code that executes when you press enter

        if data.current.value == 'buy' then

            ESX.TriggerServerCallback('generous_illegal:checkMoneyVeh', function(result) 
                if result then
                    RequestModel(vehicleModelHash)

                    while not HasModelLoaded(vehicleModelHash) do 
                        Citizen.Wait(1)
                    end
                    
                    local vehCreated = CreateVehicle(vehicleModelHash, Config.NPCSettings.vehicleSpawnLocation.x, Config.NPCSettings.vehicleSpawnLocation.y, Config.NPCSettings.vehicleSpawnLocation.z, Config.NPCSettings.vehicleHeading, true, false)
                    SetVehicleOnGroundProperly(vehCreated)
                    SetPedIntoVehicle(PlayerPedId(), vehCreated, -1)
                    menu.close()
                    exports['mythic_notify']:SendAlert('success', _U('bought_car'), 2500)
                else
                    exports['mythic_notify']:SendAlert('error', _U('not_enough_money'), 2500)
                end

            end, Config.NPCSettings.carPrice)


        end   
    end,
    function(data, menu) -- This part contains the code  that executes when the return key is pressed.
        menu.close() -- Close the menu
    end)
end

function OpenCraftingUI(key)

    ESX.UI.Menu.CloseAll()

    local elementsUI = { }

    table.insert(elementsUI,     
    {
        data = 'temperature',
        label = 'Sıcaklık °C',
        type = 'slider',
        value = 50,
        min = 50,
        max = 100 
    })

    for key, value in pairs(Config.Formulas[key].ingredients) do
        table.insert(elementsUI,     
        {
            data = value.itemCode,
            label = value.text,
            type = 'slider',
            value = value.sliderSettings.minValue,
            min = value.sliderSettings.minValue,
            max = value.sliderSettings.maxValue 
        })
    end

    table.insert(elementsUI, {label = '<span style="color:green">Tepkimeye Sok</span>', value = 'submit'})
    
    

    ESX.UI.Menu.Open( 'default', GetCurrentResourceName(), 'generousmenu',
    {
        title    = ('Hadi pişirelim!'),
        align = 'top-left',
        elements = elementsUI
    },
    function(data, menu)

        if data.current.value == 'submit' then
            ESX.UI.Menu.CloseAll()
            ESX.TriggerServerCallback('generous_illegal:checkItems', function(result) 
                if result then
                    if CheckIngredients(key, data.elements) then
                        choosenKey = key
                        RandomEventSequence()
                        while randomEventRunnig do Citizen.Wait(100) end
                        if carDestroyStarted or isMissionFailed then isStarted = false randomEventRunnig = false return end
                        TriggerEvent('pogressBar:drawBar', 16000, _U('cook_finishing'), function()
                            TriggerServerEvent('generous:submitDeal', choosenKey)
                            UnFreezeVehicle()
                        end)
                        SmokeManager()
                    else
                        DestroyCar()
                    end
                else
                    isStarted = false
                end
            end, key)
        end   
    end,
    function(data, menu)
        menu.close()
        isStarted = false
        SmokeManager()
        UnFreezeVehicle()
    end)
end

function CheckIngredients(_key, _elements)
    for key, value in pairs(Config.Formulas[_key].ingredients) do
        for k, v in pairs(_elements) do
            if (v.data == 'temperature') then
                if not (Config.Formulas[_key].temperatureRange[1] <= v.value and Config.Formulas[_key].temperatureRange[2] >= v.value) then
                    return false
                end
            end
            if (v.data == value.itemCode and v.value ~= value.count) then
                return false
            end
        end
    end

    return true
end

function SpawnRandomEvent(eventIndex) 
    ESX.UI.Menu.CloseAll()

    local _choosenKey = eventKeyList[eventIndex]
    local _targetTable = Config.RandomEvents[_choosenKey]

    local _elements = {}

    for key, value in pairs(_targetTable.options) do
        table.insert(_elements, { label = value.text, value = key})
    end

    ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'generousmenu',
    {
        title    = (_targetTable.textLabel),
        align = 'top-left',
        elements = _elements
    },
    function(data, menu)

        local _choosenItem = data.current.value

        if _choosenItem ~= nil then
            if   _targetTable.options[_choosenItem].consequence ~= nil then
                _targetTable.options[_choosenItem].consequence()
            end   
            randomEventRunnig = false
        end
        menu.close()
    end,
    function(data, menu) -- If menu is closed destroy the car
        menu.close()
        randomEventRunnig = false
        DestroyCar()
    end)
end



function RandomEventSequence()

    for key, value in pairs(RandomNumberTableGenerator(tablelength(Config.RandomEvents), Config.RandomEventCount)) do
        while randomEventRunnig do Citizen.Wait(4000) end

        if(carDestroyStarted or isMissionFailed) then isStarted = false randomEventRunnig = false break end

        randomEventRunnig = true

        TriggerEvent('pogressBar:drawBar', 8000, _U('cook_in_progresss'), function()
            SpawnRandomEvent(value)
        end)
    end
end

RegisterNetEvent('generous_illegal:jobDone')
AddEventHandler('generous_illegal:jobDone', function()
    randomEventRunnig = false
    isStarted = false
end)

RegisterNetEvent('generous_illegal:carDestroyStarted')
AddEventHandler('generous_illegal:carDestroyStarted', function()
    carDestroyStarted = true
end)

RegisterNetEvent('generous_illegal:carDestroyEnded')
AddEventHandler('generous_illegal:carDestroyEnded', function()
    carDestroyStarted = false
end)

function ApplyTempDrunkEffect(duration)
    DoScreenFadeInFadeOut()
	SetTimecycleModifier("drug_drive_blend01")
	SetPedMotionBlur(GetPlayerPed(-1), true)
	SetPedMovementClipset(GetPlayerPed(-1), "MOVE_M@DRUNK@SLIGHTLYDRUNK", true)
    SetPedIsDrunk(GetPlayerPed(-1), true)
    timeToClearDrunkEffect = GetGameTimer() + duration
end

function setMissionFailed()
    isMissionFailed = true
    Citizen.SetTimeout(3000, function()
        isMissionFailed = false
    end)
end