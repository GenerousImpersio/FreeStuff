import Config from "../config.json";

function LogInfo(msg : string) {
    if (Config.DebugMode)
        console.log("INFO: " + msg);
}
function LogError(msg : string) {
    if (Config.DebugMode)
        console.log("ERROR: " + msg);
}

function LogWarning(msg : string) {
    if (Config.DebugMode)
        console.log("WARN: " + msg);
}

export default {LogInfo, LogError, LogWarning}
