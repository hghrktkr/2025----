import { system, world } from "@minecraft/server";
import { moveEntity, setCamera, setCameraPan, setPermission } from "../utils/transitionEffect";
import { broadcastTitle } from "../utils/helpers";
import { PlayerManager } from "../player/playerManager";

// シナリオ毎の演出シーケンス
export class ScenarioEventHandler {

    /** オープニング */
    static async openingSequence() {
        const dim = world.getDimension("overworld");

        for(const player of dim.getPlayers()) {

            // パーミッション変更、フェードアウト
            system.run(() => {
                setPermission(player, false);
                setCamera(player, "fade");
            });

            const startPos = {x: 846, y: 124, z: -41};
            const startRot = {x: -10, y: 90};
            const endPos = {x: 840, y: 126, z: -41};
            const endRot = {x: -25, y: 160};
            const totalSec = 4;

            const tpStartPos = {x: 837, y: 122, z: -44};
            const tpEndPos = {x: 835, y: 127, z: -54.5};

            let santa;

            // カメラをパンと同時にサンタを動かす
            system.runTimeout(() => {

                santa = dim.spawnEntity("edu:santa_claus_red", {x: 837, y: 122, z: -44}, {
                    initialRotation: 180
                });

                system.waitTicks(5);    // スポーンし終わってから実行するため遅延

                moveEntity(santa, tpStartPos, tpEndPos, totalSec - 0.5);
                setCameraPan(player, startPos, startRot, endPos, endRot, totalSec);
            }, 20 * 0.5);

            // サンタを消す、設定のクリア
            system.runTimeout(() => {
                PlayerManager.playSoundForAll("edu.tp1");
                santa.remove();
                setPermission(player, true);
                setCamera(player, "clear");
            }, 20 * 6);
        }

        system.runTimeout(() => {
            broadcastTitle("サンタをおいかけよう！", "絵のなかにとびこもう");
        }, 20 * 6);
    }
}