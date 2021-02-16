ESX = nil

Citizen.CreateThread(function()
	while ESX == nil do
		TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
		Citizen.Wait(0)
	end

	ESX.RegisterServerCallback('generous:getItemLabel', function(source, cb, item)
		local name = ESX.GetItemLabel(item)
		cb(name)
	end)
end)

RegisterServerEvent('generous:pay')
AddEventHandler('generous:pay', function(data)

	local xPlayer = ESX.GetPlayerFromId(source)

	for key,value in pairs(data.payment) do 
		local item = value.item
		local count = value.count
	
		if xPlayer.getInventoryItem(item).count < count then
			if (data.payment == 'cash') then
				TriggerClientEvent('mythic_notify:client:SendAlert', source, { type = 'error', text = count .. "$'ın yok.", length = 2500 })
			else
				TriggerClientEvent('mythic_notify:client:SendAlert', source, { type = 'error', text = 'Üzerinde ' .. count .. ' adet ' .. ESX.GetItemLabel(item) .. ' yok.', length = 2500 })
			end

			return
		end
	end

	for k, v in pairs(data.payment) do 
		xPlayer.removeInventoryItem(v.item, v.count)
	end


	for k, v in pairs(data.items) do 
		xPlayer.addInventoryItem(v.item, v.count)
	end

	TriggerClientEvent('mythic_notify:client:SendAlert', source, { type = 'success', text = 'İşlem başarıyla gerçekleşti!', length = 2500 })

end)


