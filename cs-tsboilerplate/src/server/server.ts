import Config from "../config.json"
import Locale from "../locale.json"

const SCRIPT_CONSOLE_PREFIX = Config.scriptPrefix;

function Main() {
    console.log(`${SCRIPT_CONSOLE_PREFIX} ${Locale.scriptStarted}`)
}

on("onResourceStart", (resourceName: string) => {
    if(GetCurrentResourceName() != resourceName) { return; }
    Main();
});