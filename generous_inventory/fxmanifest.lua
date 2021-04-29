fx_version 'bodacious'
games { 'gta5' }

ui_page 'nui/ui.html'

client_scripts {
	'client.js'
}

shared_scripts {
	'config.js',
	'utils.js'
}

server_scripts {
	'server.js'
}

files {
	"nui/*",
	"nui/img/items/*",
}

server_export "GetInventoryItemType"
server_export "CanPlayerCarryItem"
export "GetWeaponSlotID"