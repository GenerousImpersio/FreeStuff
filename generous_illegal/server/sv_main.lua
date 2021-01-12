ESX = nil

TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

ESX.RegisterServerCallback('generous_illegal:checkItems', function(source, cb, keyCode)
    local boolItemResult = CheckItems(source, keyCode)
    cb(boolItemResult)
end)

ESX.RegisterServerCallback('generous_illegal:checkMoneyVeh', function(source, cb, amount)
    local xPlayer = ESX.GetPlayerFromId(source)
    if (xPlayer.getInventoryItem('cash').count >= amount) then
        xPlayer.removeInventoryItem('cash', amount)
        cb(true)
    else
        cb(false)
    end
end)

function CheckItems(source, keyCode)
    local xPlayer = ESX.GetPlayerFromId(source)
    local targetTable = Config.Formulas[keyCode]
    
    local checkedIngredientCount = 0

    for key, value in pairs(targetTable.ingredients) do

        local itemName = value.itemCode
        local itemCount = value.count
        
        if (xPlayer.getInventoryItem(itemName).count >= itemCount) then
            checkedIngredientCount = checkedIngredientCount + 1
        else
            TriggerClientEvent('mythic_notify:client:SendAlert', source, { type = 'error', text = 'Üzerinde ' .. value.count .. ' adet ' .. value.text .. ' yok.', length = 2500 })
            return false
        end
    end

    if (checkedIngredientCount == tablelength(targetTable.ingredients)) then
        return true
    end

    return false
end

RegisterServerEvent('generous:submitDeal')
AddEventHandler('generous:submitDeal', function(keyCode)

    local xPlayer = ESX.GetPlayerFromId(source)

    local targetTable = Config.Formulas[keyCode]

    if (CheckItems(source, keyCode)) then
        for key, value in pairs(targetTable.ingredients) do
            xPlayer.removeInventoryItem(value.itemCode, value.count)
        end
    end

    xPlayer.addInventoryItem(keyCode, targetTable.count)
    TriggerClientEvent('generous_illegal:jobDone', source)
    TriggerClientEvent('mythic_notify:client:SendAlert', source, { type = 'success', text = 'Başardık! ' .. Config.Formulas[keyCode].count .. ' adet ' .. Config.Formulas[keyCode].text .. ' ürettik!', length = 2500 })
end)

function tablelength(T)
    local count = 0
    for _ in pairs(T) do count = count + 1 end
    return count
end