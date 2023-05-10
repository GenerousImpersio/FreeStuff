import Config from "../config.json";

export function isEmpty(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function IsItAWeapon(itemName:string) {
    return itemName.includes(Config.weaponPrefix);
}