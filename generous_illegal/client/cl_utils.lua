function RandomNumberTableGenerator(endIndex, estimatedTableLength)
    local _finalTable = {}
    local _tempNumberTable = {}
    for i = 1, endIndex, 1 do
        table.insert(_tempNumberTable, i)
    end

    while estimatedTableLength ~= tablelength(_finalTable) do
        local _randomNum = math.random(tablelength(_tempNumberTable))
        table.insert(_finalTable, _tempNumberTable[_randomNum])
        for key, value in pairs(_tempNumberTable) do
            if (value == _tempNumberTable[_randomNum]) then
                table.remove(_tempNumberTable, key)
            end
        end
    end

    return _finalTable
end

function IsNearToCity(position)
    if position.y >= 3550 then
        return false
    else
        return true
    end
end

function AlertThePolice(_playerCoords, _msg)
	local PlayerCoords = { x = _playerCoords.x, y = _playerCoords.y, z = _playerCoords.z }
    TriggerServerEvent('esx_addons_gcphone:startCall', 'police', _msg, PlayerCoords, {

		PlayerCoords = { x = _playerCoords.x, y = _playerCoords.y, z = _playerCoords.z },
	})
end



function DoScreenFadeInFadeOut()
    DoScreenFadeOut(400)
    
    while not IsScreenFadedOut() do
        Citizen.Wait(100)
    end
    
    DoScreenFadeIn(400)
end

function tablelength(T)
    local count = 0
    for _ in pairs(T) do count = count + 1 end
    return count
end

function DestroyCar()
    TriggerEvent('generous_illegal:jobDone')
    TriggerEvent('generous_illegal:carDestroyStarted')
    SmokeManager()
    local _playerCoords = GetEntityCoords(PlayerPedId()) -- Player coords
    local _currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false) -- Vehicle Entity
    exports['mythic_notify']:SendAlert('error', _U('too_hot_message'))
    AddExplosion(_playerCoords.x, _playerCoords.y, _playerCoords.z + 2, 3, 100, true, false, 1)
    Citizen.SetTimeout(3000, function()
        NetworkExplodeVehicle(_currentVehicle, true, false, false)
        AlertThePolice(_playerCoords, _U('explosion_notice'))
    end)
    TriggerEvent('generous_illegal:carDestroyEnded')
end