import { system, world } from "@minecraft/server";
import { moveEntity, setCamera, setCameraPan, setPermission } from "../utils/transitionEffect";

// シナリオ毎の演出シーケンス
export class ScenarioEventHandler {

    /** オープニング */
    static async openingSequence() {
        const dim = world.getDimension("overworld");

        for(const player of dim.getPlayers()) {

            system.run(() => {
                setPermission(player, false);
                setCamera(player, "fade");
            });

            // fadeを待つ
            system.waitTicks(10);

            const startPos = {x: 846, y: 124, z: -41};
            const startRot = {x: -10, y: 180};
            const endPos = {x: 840, y: 126, z: -41};
            const endRot = {x: 15, y: 90};
            const totalSec = 4;

            // カメラをパンと同時にサンタを動かす
            system.run(() => {
                const santa = dim.spawnEntity("edu:santa_claus_red",{x: 839, y: 121, z: -41}, {
                    initialRotation: 180
                });
                moveEntity(santa, startPos, endPos, totalSec);
                setCameraPan(player, startPos, startRot, endPos, endRot, totalSec);
            });

            system.waitTicks(20 * 4);

            // サンタを消す
            system.run(() => {
                santa.remove();
            });

        }
    }
}