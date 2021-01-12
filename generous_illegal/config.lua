Config = {}
Config.Locale = 'tr'

Config.VehicleModelName = 'JOURNEY'
Config.RandomEventCount = 3

Config.CanCookNearCity = false

Config.NPCSettings = {
    NPCHash = 349680864,
    pedPosition = vector3(481.862, -3382.6, 6.06990),
    vehicleSpawnLocation = vector3(478.302, -3370.0, 6.06991),
    vehicleHeading = 0,
    carPrice = 200
}


Config.Formulas = 
{
    ["phenylacetone"] = { 
        text = 'Fenilaseton',
        count = 2,
        temperatureRange = { 85, 90 },
        ingredients = { 
            { text = 'Asetik Asit', itemCode = 'aceticAcid', count = 3, sliderSettings = { minValue = 0, maxValue = 10 } },
            { text = 'Fenilasetik Asit', itemCode = 'phenylaceticAcid', count = 8, sliderSettings = { minValue = 0, maxValue = 10 } }

        }
    }
}

Config.RandomEvents = {
    ["gasleak"] = {
        textLabel = "Garip bir koku gelmeye başladı ne yapacaksın?",
        options = {
            { text = "Bir şey olmamış gibi davran.", consequence = function() ApplyTempDrunkEffect(30000) exports['mythic_notify']:SendAlert('error', 'İşi batırdın bu baş ağrısı sana uzun bir süre yetecek gibi...', 2500) end },
            { text = "Gaz maskesi tak.", consequence = function() SetPedPropIndex(PlayerPedId(), 1, 26, 7, true) exports['mythic_notify']:SendAlert('success', 'Basit çözümler her zaman çalışır. Yani sanırım...', 2500) end },
            { text = "Bant ile boruları sağlamlaştır.", consequence = function() exports['mythic_notify']:SendAlert('success', 'Tamamdır her şey düzgün görünüyor koku da hafifledi sanki.', 2500) end },
        }
    },
    ["toohot"] = {
        textLabel = "Beher aşırı ısınmaya başladı ne yapacaksın?",
        options = {
            { text = "Altındaki ısıtıcıyı kapat.", consequence = function() exports['mythic_notify']:SendAlert('success', 'Beher normal sıcaklığına dönüyor gibi, şimdilik...', 2500) end },
            { text = "Altındaki ısıtıcıyı daha yüksek bir sıcaklığa ayarla.", consequence = function() DestroyCar() end },
            { text = "Bir şey olmamış gibi davran.", consequence = function() DestroyCar() end },
        }
    },
    ["toomuchpressure"] = {
        textLabel = "Sıvıda olmaması gereken bir katılaşma gördün ne yapacaksın?",
        options = {
            { text = "Basıncı düşür ve bekle.", consequence = function() exports['mythic_notify']:SendAlert('success', 'İşte bu tam olması gerektiği gibi. Yani en azından şimdilik...', 2500) end },
            { text = "Basıncı arttır ve bekle.", consequence = function() exports['mythic_notify']:SendAlert('error', 'Madde tamamen katılaştı artık hiçbir işe yaramaz', 2500) setMissionFailed() end },
            { text = "Sıcaklığı arttır.", consequence = function() exports['mythic_notify']:SendAlert('error', 'Yaptığın şey işi daha da kötü hale getirdi artık bu garip şey hiçbir şeye yaramaz, aferin...', 2500) setMissionFailed() end },
        }
    }
}