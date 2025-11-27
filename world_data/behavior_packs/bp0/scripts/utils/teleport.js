import { PlayerStorage } from "../player/playerStorage";

/**
 * プレイヤーをPlayerData内のlastLocationプロパティへテレポート
 * @param {Player} player
 * @param {Object} playerData
 * @returns 
 */
function teleportToLastLocation(player, playerData) {
    const lastLocation = playerData.spawnLocation;
    
    // dimensionLocation型へ
    const lastLoc = PlayerStorage.makeDimensionLocation(lastLocation);
    if(!lastLocation) {
        console.warn(`can't find lastLocation`);
        return;
    }
    player.teleport({x: lastLoc.x, y: lastLoc.y, z: lastLoc.z});
}

export { teleportToLastLocation };