import { PlayerManager } from "../player/playerManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { system, world } from "@minecraft/server";

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
        }, 15); // フェード後にテレポートするよう遅延

        // ロードを待つ
        await this.waitUntilChunkLoaded(
            world.getDimension(nextLocationData.dimension),
            {
                x: nextLocationData.x,
                y: nextLocationData.y,
                z: nextLocationData.z
            }
        )

        // フェードイン
        PlayerManager.setPermissionForAll(true);
        PlayerManager.setCameraForAll("clear");
    }

    /**
     * チャンクのロードを待つ
     * @param {dimension} dimension 
     * @param {{x: number, y: number, z: number}} pos 
     * @param {number} maxTick 200
     * @returns 
     */
    static async waitUntilChunkLoaded(dimension, pos, maxTick = 200) {
    let tick = 0;
    return new Promise((resolve, reject) => {
        const handle = system.runInterval(() => {
            try {
                // block が取れればチャンクは読み込まれている
                const block = dimension.getBlock({ x: pos.x, y: pos.y, z: pos.z });
                if (block) {
                    system.clearRun(handle);
                    resolve(true);
                }
            } catch (e) {
                // 読み込まれていない場合はエラーが飛んでくる
            }

            tick++;
            if (tick > maxTick) {
                system.clearRun(handle);
                reject(new Error("Chunk load timeout"));
            }
        }, 1);
    });
}

}