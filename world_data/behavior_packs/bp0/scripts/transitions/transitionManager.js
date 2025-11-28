import { PlayerManager } from "../player/playerManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { system } from "@minecraft/server";

export class TransitionManager {
    /**
     * 次の部屋を生成して移動させる
     * @param {object} nextLocationData 次に進む部屋のデータ dimension, x, y, z, yaw, pitch
     * @param {CallableFunction} generateRoomCallback コールバック関数
     */
    static async openDoorSequence(nextLocationData, generateRoomCallback) {

        // フェードアウト
        PlayerManager.setPermissionForAll(false);
        PlayerManager.setCameraForAll("fade");

        // 扉のSE選択
        const seList = ["edu.door_open1", "edu.door_open2", "edu.door_open3"];
        const seId = Math.floor(Math.random() * seList.length);

        if(TEST_MODE.CONFIG) console.log(`se id: ${seId}`);

        // SE再生
        PlayerManager.playSoundForAll(seList[seId]);

        // 部屋生成
        await generateRoomCallback();

        // テレポート
        system.runTimeout(() => {
            PlayerManager.teleportAllPlayers(nextLocationData);
        }, 10); // フェード後にテレポートするよう遅延

        // フェードイン
        PlayerManager.setPermissionForAll(true);
        PlayerManager.setCameraForAll("clear");
    }
}