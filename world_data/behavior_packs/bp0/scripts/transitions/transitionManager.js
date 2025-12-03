import { PlayerManager } from "../player/playerManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { system } from "@minecraft/server";

export class TransitionManager {
    /**
     * 次の部屋を生成して移動させる
     * @param {object} nextLocationData 次に進む部屋のデータ dimension, x, y, z, yaw, pitch
     * @param {string} doorType door | tp
     * @param {CallableFunction} generateRoomCallback コールバック関数
     */
    static async openDoorSequence(nextLocationData, doorType, generateRoomCallback) {

        // フェードアウト
        PlayerManager.setPermissionForAll(false);
        PlayerManager.setCameraForAll("fade");

        // 扉のSE選択
        let seList = [];
        if(doorType === "door") {
            seList = ["edu.door_open1", "edu.door_open2", "edu.door_open3"];
        }
        else if(doorType === "tp") {
            seList = ["edu.tp1", "edu.tp2", "edu.tp3"];
        }
        const seId = Math.floor(Math.random() * seList.length);

        if(TEST_MODE.CONFIG) console.log(`se id: ${seId}`);

        // SE再生
        PlayerManager.playSoundForAll(seList[seId]);

        // 部屋生成などの関数実行
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