import { PlayerManager } from "../player/playerManager";

export class TransitionManager {
    /**
     * 次の部屋を生成して移動させる
     * @param {import("@minecraft/server").DimensionLocation} nextLocation 次に進む部屋
     * @param {CallableFunction} generateRoomCallback コールバック関数
     */
    static async openDoorSequence(nextLocation, generateRoomCallback) {
        // フェードアウト
        PlayerManager.setPermissionForAll(false);
        PlayerManager.setCameraForAll("fade");
        PlayerManager.playSoundForAll("edu:door_open");

        // 部屋生成
        await generateRoomCallback();

        // テレポート
        PlayerManager.teleportAllPlayers(nextLocation);

        // フェードイン
        PlayerManager.setPermissionAndCameraForAll(true, "clear");
    }
}