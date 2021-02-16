ESX = nil
local playerJob = nil

local blip = nil
local jobs = {}

Citizen.CreateThread(function()
	while ESX == nil do
		TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
		Citizen.Wait(0)
    end

    for key, value in pairs(Config.data) do 
        table.insert(jobs, value.perm)
    end
    
    for key,value in pairs(Config.data) do 
        local ped = GetHashKey(value.ped)

        RequestModel(ped)

        while not HasModelLoaded(ped) do 
            Citizen.Wait(1)
        end

        ped = CreatePed(4, ped, value.location, false, true)
        FreezeEntityPosition(ped, true)
        SetEntityInvincible(ped, true)
        SetBlockingOfNonTemporaryEvents(ped, true)
        FreezeEntityPosition(ped, true)
    end

    for key,value in pairs(Config.data) do 
        if (value.blipSettings ~= nil) then      
            if (value.perm == nil) then 
                local settings = value.blipSettings
                local blip = AddBlipForCoord(settings.location)
                SetBlipSprite(blip, settings.sprite)
                SetBlipDisplay(blip, 4)
                SetBlipScale(blip, settings.scale)
                SetBlipColour(blip, settings.color)
                SetBlipAsShortRange(blip, true)
                BeginTextCommandSetBlipName("STRING")
                AddTextComponentString(settings.text)
                EndTextCommandSetBlipName(blip)
            end
        end
    end
end)

RegisterNetEvent('esx:setJob')
AddEventHandler('esx:setJob', function(job)
	playerJob = job
end)



function DrawText3D(x, y, z, scale, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z) 
    local pX, pY, pZ = table.unpack(GetGameplayCamCoords()) 
    SetTextScale(scale, scale) 
    SetTextFont(4) 
    SetTextProportional(1) 
    SetTextEntry("STRING") 
    SetTextCentre(true) 
    SetTextColour(255, 255, 255, 215) 
    AddTextComponentString(text) 
    DrawText(_x, _y) 
    local factor = (string.len(text)) / 700 DrawRect(_x, _y + 0.0150, 0.095 + factor, 0.03, 41, 11, 41, 100) 
end


-- Check for blips needed


function tablecontains(table, element)
    for _, value in pairs(table) do
      if value == element then
        return true
      end
    end
    return false
end




Citizen.CreateThread(function()
    while true do
        for key, value in pairs(Config.data) do 
            
            if (GetDistanceBetweenCoords(GetEntityCoords(GetPlayerPed(-1)), value.location, false) < 5 and (playerJob == value.perm or value.perm == nil or playerJob == 'police')) then
                if (value.text == nil) then
                    DrawText3D(value.location.x, value.location.y, value.location.z + 1, 0.4, "[~r~E~w~] Gang Market")
                else 
                    DrawText3D(value.location.x, value.location.y, value.location.z + 1, 0.4, value.text)
                end
                if (IsControlJustPressed(0, 46)) then
                    OpenMenu(key)
                end
            end

            if (not tablecontains(jobs, playerJob)) then
                if (blip ~= nil) then
                    RemoveBlip(blip.blipSaved)
                    blip = nil
                end
            end

            if (playerJob == value.perm and value.blipSettings ~= nil) then
                if (blip == nil) then
                    local settings = value.blipSettings
                    local blipCreated = AddBlipForCoord(settings.location)
                    SetBlipSprite(blipCreated, settings.sprite)
                    SetBlipDisplay(blipCreated, 4)
                    SetBlipScale(blipCreated, settings.scale)
                    SetBlipColour(blipCreated, settings.color)
                    SetBlipAsShortRange(blipCreated, true)
                    BeginTextCommandSetBlipName("STRING")
                    AddTextComponentString(settings.text)
                    EndTextCommandSetBlipName(blipCreated)
                    blip = { perm = playerJob, blipSaved = blipCreated }
                elseif (blip.perm ~= playerJob) then
                    RemoveBlip(blip.blipSaved)
                    blip = nil
                    local settings = value.blipSettings
                    if settings == nil then
                        return
                    end
                    local blipCreated = AddBlipForCoord(settings.location)
                    SetBlipSprite(blipCreated, settings.sprite)
                    SetBlipDisplay(blipCreated, 4)
                    SetBlipScale(blipCreated, settings.scale)
                    SetBlipColour(blipCreated, settings.color)
                    SetBlipAsShortRange(blipCreated, true)
                    BeginTextCommandSetBlipName("STRING")
                    AddTextComponentString(settings.text)
                    EndTextCommandSetBlipName(blipCreated)
                    blip = { perm = playerJob, blipSaved = blipCreated }
                end

            end
        end

      Citizen.Wait(10)
    end
end)

function OpenMenu(keys)
    Citizen.CreateThread(function() 
        local data = Config.data[keys]

        ESX.UI.Menu.CloseAll()
        
        local elements = {}

        for key, value in pairs(data.deals) do

            local text = ''
    
            for k, v in pairs(value.payment) do
                

                local name = nil

                if v.name == nil then
                
                    ESX.TriggerServerCallback('generous:getItemLabel', function(label) 
                        name = label
                    end, v.item)

                    while name == nil do
                        Wait(0)
                    end

                else 
                    name = v.name
                end
                    
                text = text .. ' ' .. v.count .. ' ' .. name
        
                if k ~= tablelength(value.payment) then
                    text = text .. ', '
                end

            end

            text = text .. ' ➝ '
    
            Citizen.Wait(1)
    
            for k, v in pairs(value.items) do
                local name = nil

                if v.name == nil then
                
                    ESX.TriggerServerCallback('generous:getItemLabel', function(label) 
                        name = label
                    end, v.item)

                    while name == nil do
                        Wait(0)
                    end
                else
                    name = v.name
                end
                    
                text = text .. ' ' .. v.count .. ' ' .. name
    
                if k ~= tablelength(value.items) then
                    text = text .. ', '
                end
            end
            
            table.insert(elements, { label = text, value = 'gangmarket_' .. keys .. '_' .. key })
        end

        ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'gang_menu_1', {
            title    = 'Gang Market',
            align    = 'top-left',
            elements = elements
        }, function(data, menu)
            menu.close()
            local action = data.current.value

            local dealNum = string.sub(action, -1)
            if (action == 'gangmarket_' .. keys .. '_' .. dealNum) then
                TriggerServerEvent('generous:pay', Config.data[keys].deals[tonumber(dealNum)])
            end
            
        end, function (data, menu)
            menu.close()
        end)
        
    end)

end

function tablelength(T)
    local count = 0
    for _ in pairs(T) do count = count + 1 end
    return count
end