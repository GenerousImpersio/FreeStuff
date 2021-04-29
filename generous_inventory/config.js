Config = {};

Config.playerInventoryMaximumWeight = 60;

Config.playerInventorySlotCount = 60;
Config.licensePrefix = "LS";
Config.licenseNumberCount = 20;
Config.defaultWeaponDurability = 100;
Config.weaponPrefix = "WEAPON_" // DON'T CHANGE IF YOU DON'T KNOW WHAT YOU'RE DOING!

// List of item names that will close ui when used
Config.CloseUiItems = ["wallet", "fishingrod", "radio", "notepad", "licenseplate", "lockpick", "radio"];

Config.TrunkAndGloveboxOpenControl = 47 // G

Config.DeleteDrops = {
    Enabled: true,
    Time: 300
}

Config.VehicleGloveboxs= [ //if you set the value to 0, no inventory is opened in that class vehicle
    3, //Compact
    5, //Sedan
    5, //SUV
    3, //Coupes
    3, //Muscle
    3, //Sports Classics
    3, //Sports
    3, //Super
    0, //Motorcycles
    5, //Off-road
    5, //Industrial
    5, //Utility
    14, //Vans
    0, //Cycles
    0, //Boats
    0, //Helicopters
    0, //Planes
    5, //Service
    5, //Emergency
    5, //Military
    5, //Commercial
    0 //Trains
];

Config.VehicleTrunks = [ //if you set the value to 0, no inventory is opened in that class vehicle
    10, //Compact
    15, //Sedan
    20, //SUV
    13, //Coupes
    15, //Muscle
    13, //Sports Classics
    12, //Sports
    5, //Super
    3, //Motorcycles
    70, //Off-road
    13, //Industrial
    13, //Utility
    50, //Vans
    0, //Cycles
    5, //Boats
    0, //Helicopters
    0, //Planes
    20, //Service
    20, //Emergency
    10, //Military
    60, //Commercial
    0 //Trains
]

Config.MarketList = {
    "Nalbur": {
        coords: [ 
            [-1202.9, -2577.1, 13.9408] 
        ],
        items: [
            { name: "bread", price: 250},
            { name: "water", price: 2},
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Nalbur",
        blip: { id: 289, scale: 0.6, color: 46, title: "Nalbur" },
        job: ['all']
    },
    "Süper Market": {
        coords: [ 
            [25.95, -1347.27, 29.5],
            [373.875, 325.896, 103.566],
            [2557.458, 382.282, 106.622],
            [-3038.939, 585.954, 7.908],
            [-3241.927, 1001.462, 12.830],
            [547.431, 2671.710, 42.156],
            [1961.464, 3740.672, 32.343],
            [2678.916, 3280.671, 55.241],
            [1729.563, 6414.126, 36.037],
            [-48.519, -1757.514, 29.421],
            [1163.373, -323.801, 68.205],
            [-707.501, -914.260, 19.215],
            [-1820.523, 792.518, 138.118],
            [1698.388, 4924.404, 42.063],
            [1135.808, -982.281, 46.415],
            [-1222.915, -906.983, 12.326],
            [-1487.553, -379.107, 40.163],
            [-2968.243, 390.910, 15.043],
            [1166.024, 2708.930, 38.157],
            [1392.562, 3604.684, 34.980]
        ],
        items: [
            {name: 'water', price: 1},
            {name: 'bread', price: 2},
            {name: 'cupcake', price: 1},
            {name: 'donut', price: 4},
            {name: 'friedpotatoes', price: 8},
            {name: 'cola', price: 2},
            {name: 'beer', price: 7},
            {name: 'icetea', price: 4},
            {name: 'chips', price: 2},
            {name: 'chocolate', price: 2},
            {name: 'hamburger', price: 12},
            {name: 'sandwich', price: 8},
            {name: 'cigarett', price: 15},
            {name: 'lighter', price: 2},
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Market",
        blip: {id: 59, scale: 0.5, color: 2, title: 'Market'},
        job: ['all']
    },
    "Mega Mall": {
        coords: [ 
            [46.4983, -1749.6, 29.6348]
        ],
        items: [
            { name: "phone", price: 250 },
            { name: "radio", price: 50 },
            { name: "WEAPON_FLASHLIGHT", price: 15 },
            { name: "binoculars", price: 20 },
            { name: "tornavida", price: 30 },
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Mega Mall",
        blip: { id: 521, scale: 0.6, color: 2, title: 'Mega Mall' },
        job: ['all']
    },
    "Silahçı": {
        coords: [ 
            [22.0815, -1107.1, 29.7970]
        ],
        items: [
            { name: "WEAPON_BAT", price: 40 },
            { name: "WEAPON_KNUCKLE", price: 50 },
            { name: "WEAPON_SWITCHBLADE", price: 100 },
            { name: "WEAPON_SNSPISTOL", price: 400 },
            { name: "WEAPON_PISTOL", price: 800 },
            { name: "WEAPON_HEAVYPISTOL", price: 1700 },
            { name: "WEAPON_VINTAGEPISTOL", price: 1800 }
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Silahçı",
        blip: { id: 110, scale: 0.6, color: 2, title: 'Silahçı' },
        job: ['all']
    },
    "Tequila Bar": {
        coords: [ 
            [-560.17, 286.68, 82.18] 
        ],
        items: [
            { name: "beer", price: 17 },
            { name: "vodka", price: 65 },
            { name: "whisky", price: 76 },
            { name: "tequila", price: 87 },
            { name: "sarap_icki", price: 35 },
            { name: "shot_icki", price: 96 },
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Tekila Bar",
        blip: { id: 93, scale: 0.6, color: 2, title: 'Tequila Bar' },
        job: ['all']
    },
    "Eczane": {
        coords: [ 
            [114.54, -5.6, 67.82] 
        ],
        items: [
            { name: "bandage", price: 79},
            { name: "krem", price: 66},
            { name: "kesici", price: 55},
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Eczane",
        blip: { id: 51, scale: 0.6, color: 2, title: 'Eczane' },
        job: ['all']
    },
    "Black Market": {
        coords: [ 
            [1537.36, 6340.76, 24.12] 
        ],
        items: [
            { name: "advancedlockpick", price: 750},
            { name: "lockpick", price: 6000},
            { name: "MedArmor", price: 5000}, 
            { name: "thermal_charge", price: 30000},
            { name: "laptop_h", price: 50000}, 
            { name: "HeavyArmor", price: 10000},
            { name: "susturucu", price: 6000},
            { name: "methlab", price: 3300},
            { name: "WEAPON_BAT", price: 6800},
            { name: "lithium", price: 2300},
            { name: "uzatilmis", price: 6000},
            { name: "tutamac", price: 6000},
            { name: "kaplama", price: 1000000},
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: "[E] - Black Market",
        blip: false,
        job: ['all']
    },
    "EMS Market": {
        coords: [ 
            [323.17, -581.11, 43.32] 
        ],
        items: [
            { name: "bandage", price: 1},
            { name: "medkit", price: 1},
            { name: "gps", price: 1},
            { name: "krem", price: 1},
            { name: "kesici", price: 1},
            { name: "radio", price: 1},
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg:  '[E] - EMS Market',
        blip: false,
        job: ['ambulance']
    },
    "Silah Deposu": {
        coords: [ 
            [451.98, -980.2, 30.69] 
        ],
        items: [
            { name: "WEAPON_COMBATPISTOL", price: 0},
            { name: "WEAPON_HEAVYPISTOL", price: 0},
            { name: "WEAPON_COMBATPDW", price: 0},
            { name: "WEAPON_STUNGUN", price: 0},
            { name: "WEAPON_PUMPSHOTGUN", price: 0},
            { name: "WEAPON_NIGHTSTICK", price: 0},
            { name: "WEAPON_FLASHLIGHT", price: 0},
            { name: "WEAPON_CARBINERIFLE", price: 0},
            { name: "disc_ammo_shotgun_large", price: 0},
            { name: "disc_ammo_pistol", price: 0},
            { name: "disc_ammo_rifle", price: 0},
            { name: "disc_ammo_smg", price: 0},
            { name: "susturucu", price: 0},
            { name: "durbun", price: 0},
            { name: "uzatilmis", price: 0},
            { name: "fener", price: 0},
            { name: "tutamac", price: 0},
            { name: "MedArmor", price: 0},
            { name: "HeavyArmor", price: 0},
            { name: "radio", price: 0},
            { name: "bodycam", price: 0},
            { name: "gps", price: 0},
            { name: "mdt", price: 0},
            { name: "ifak", price: 0},
            { name: "kan", price: 0},
            { name: "sruhsat", price: 100000},
        ],
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColor: [255, 255, 255],
        use3DText: true,
        msg: 'Cephaneliğe erişmek için ~INPUT_CONTEXT~ tuşuna basınız.',
        blip: false,
        job: ['police']
    }
}

Config.Stashes = {
    "PD Deposu": {
        coords: [
            [461.08, -981.27, 30.69]
        ],
        useMarker: true,
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColour: [255, 255, 255 ],
        use3dtext: true,
        msg: '[E] - PD Deposu',
        job: 'police',
        maxweight: 1000 
    },
    "LSPD Kişisel Dolap": {
        coords: [
            [-99.9, -99.9, -99.9]
        ],
        useMarker: false,
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColour: [255, 255, 255 ],
        use3dtext: false,
        msg: '[E] - PD Deposu',
        job: 'all',
        maxweight: 1000 
    },
    "EMS Deposu": {
        coords: [
            [324.8, -575.35, 43.32]
        ],
        useMarker: true,
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColour: [255, 255, 255 ],
        use3dtext: true,
        msg: '[E] - EMS Deposu',
        job: 'ambulance',
        maxweight: 1000 
    },
    "Pinkcage Motel": {
        coords: [
            [-99.9, -99.9, -99.9]
        ],
        useMarker: false,
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColour: [255, 255, 255 ],
        use3dtext: true,
        msg: '[E] - Motel Deposu',
        jobs: 'all',
        maxweight: 200 
    },
    "Bayview Motel": {
        coords: [
            [151.26, -1003.15, -99.0]
        ],
        useMarker: false,
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColour: [255, 255, 255 ],
        use3dtext: true,
        msg: '[E] - Motel Deposu',
        job: 'all',
        maxweight: 400 
    },
    "Gang House Deposu": {
        coords: [
            [265.9, -999.34, -99.01]
        ],
        useMarker: true,
        markerType: 2,
        markerSize: [0.2, 0.2, 0.2],
        markerColour: [255, 255, 255 ],
        use3dtext: true,
        msg: '[E] - Depo',
        job: 'all',
        maxweight: 400 
    }
}

/*
    ['Gang House Deposu'] = { 
        coords = {vector3(265.9, -999.34, -99.01)}, 
        useMarker = true,
        markerType = 2,
        markerSize = vector3(0.2, 0.2, 0.2),
        markerColour = { r = 255, g = 255, b = 255 },
        use3dtext = true,
        msg = '[E] - Gang House Deposu',
        job = 'all',
        maxweight = 1000 -- if u use weight, uncomment this line
    },
*/