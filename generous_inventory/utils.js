function Wait(ms) {
    return new Promise((res) => {
        setTimeout(res, ms)
    })
}

function isEmpty(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

function IsItAWeapon(itemName) {
    if (itemName.includes(Config.weaponPrefix)) {
        return true;
    } else {
        return false;
    }
}