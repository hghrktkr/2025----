
/**
 * プレイヤーをPlayerData内のlastLocationプロパティへテレポート
 * @param {Player} player
 * @param {Object} playerData
 * @returns 
 */
function teleportToLastLocation(player, playerData) {
    const lastLocation = playerData.lastLocation;   // dimensionLocation型
    if(!lastLocation) {
        console.warn(`can't find lastLocation`);
        return;
    }
    player.teleport(lastLocation);
}

export { teleportToLastLocation };