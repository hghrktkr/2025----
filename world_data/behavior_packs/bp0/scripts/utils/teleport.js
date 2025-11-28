import { world } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";

/**
 * プレイヤーをPlayerData内のlastLocationプロパティへテレポート
 * @param {Player} player
 * @param {Object} playerData
 * @returns 
 */
function teleportToLastLocation(player, playerData) {
    const lastLocation = playerData.spawnLocation;
    const dim = world.getDimension(lastLocation.dimension);
    
    if(!lastLocation) {
        console.warn(`can't find lastLocation`);
        return;
    }
    player.teleport(
        {x: lastLoc.x, y: lastLoc.y, z: lastLoc.z},
        {
            dimension: dim ?? world.getDimension("overworld"),
            rotation: {
                yaw: lastLocation.yaw ?? 0,
                pitch: lastLocation.pitch ?? 0
            }
        }
    );
}

export { teleportToLastLocation };