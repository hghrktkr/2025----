import { system, world } from "@minecraft/server";
import { moveEntity, setCamera, setCameraPan, setPermission } from "../utils/transitionEffect";
import { broadcastTitle } from "../utils/helpers";
import { PlayerManager } from "../player/playerManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { GameEntranceManager } from "../games/gameEntranceManager";
import { gateConfig } from "../configs/entrancePictureConfig";
import { EntranceSpawner } from "../spawners/entranceSpawner";

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
        }

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

            moveEntity(santa, tpStartPos, tpEndPos, totalSec - 0.5);

            for(const player of dim.getPlayers()) {
                setCameraPan(player, startPos, startRot, endPos, endRot, totalSec);
            }
        }, 20 * 0.5);

        // サンタを消す、設定のクリア
        system.runTimeout(() => {
            PlayerManager.playSoundForAll("edu.tp1");
            santa.remove();

            for(const player of dim.getPlayers()) {
                setPermission(player, true);
                setCamera(player, "clear");
            }
        }, 20 * 6);
        

        system.runTimeout(() => {
            broadcastTitle("サンタをおいかけよう！", "絵のなかにとびこもう");
        }, 20 * 6);
    }


    /** ゲーム1クリア後 */
    static async afterClearGame1Sequence() {
        const dim = world.getDimension("overworld");

        for(const player of dim.getPlayers()) {

            // パーミッション変更、フェードアウト
            system.run(() => {
                setPermission(player, false);
                setCamera(player, "fade");
            });
        }

        const startPos = {x: 844, y: 124, z: -41};
        const startRot = {x: -10, y: 270};
        const endPos = {x: 855, y: 126, z: -41};
        const endRot = {x: -25, y: 180};
        const totalSec = 4;

        const tpStartPos = {x: 855, y: 122, z: -44};
        const tpEndPos = {x: 857, y: 127, z: -54.5};

        let santa;

        // カメラをパンと同時にサンタを動かす
        system.runTimeout(() => {

            santa = dim.spawnEntity("edu:santa_claus_red", {x: 855, y: 122, z: -44}, {
                initialRotation: 180
            });
            moveEntity(santa, tpStartPos, tpEndPos, totalSec - 0.5);

            for(const player of dim.getPlayers()) {
                setCameraPan(player, startPos, startRot, endPos, endRot, totalSec);
            }
        }, 20 * 0.5);

        // サンタを消す、設定のクリア
        system.runTimeout(() => {
            PlayerManager.playSoundForAll("edu.tp2");
            santa.remove();

            for(const player of dim.getPlayers()) {
                setPermission(player, true);
                setCamera(player, "clear");
            }
        }, 20 * 6);

        system.runTimeout(() => {
            broadcastTitle("サンタをおいかけよう！", "絵のなかにとびこもう");
        }, 20 * 6);
    }

    /** ゲーム2クリア後 */
    static async afterClearGame2Sequence() {
        const dim = world.getDimension("overworld");

        for(const player of dim.getPlayers()) {

            // パーミッション変更、フェードアウト
            system.run(() => {
                setPermission(player, false);
                setCamera(player, "fade");
            });
        }

        const startPos = {x: 846, y: 127, z: -41};
        const startRot = {x: 20, y: 180};
        const endPos = {x: 846, y: 127, z: -44};
        const endRot = {x: 20, y: 180};
        const totalSec = 4;

        const tpStartPos = {x: 846, y: 120, z: -47};
        const tpEndPos = {x: 846, y: 120, z: -50};

        let santa;
        

        // カメラをパンと同時にサンタを動かす
        system.runTimeout(() => {
            santa = dim.spawnEntity("edu:santa_claus_red", {x: 846, y: 121, z: -47}, {
                initialRotation: 180
            });
            moveEntity(santa, tpStartPos, tpEndPos, totalSec - 0.5);

            for(const player of dim.getPlayers()) {
                setCameraPan(player, startPos, startRot, endPos, endRot, totalSec);
            }

        }, 20 * 1.5);

        // 階段を上る
        const tpStartPos2 = {x: 846, y: 121, z: -50};
        const tpEndPos2 = {x: 846, y: 123, z: -52};
        const totalSec2 = 2;

        // ゲートの情報を取得
        const {startPos: gateStartPos, endPos: gateEndPos, dimension, blockType} = gateConfig;

        system.runTimeout(() => {
            moveEntity(santa, tpStartPos2, tpEndPos2, totalSec2);
        }, 20 * 5);
        
        // 火をつけるモーション
        system.runTimeout(() => {
            santa.playAnimation("attack");

            // fake_portal設置
            EntranceSpawner.spawnGate(gateStartPos, gateEndPos, dimension, blockType);
            system.waitTicks(10);
        }, 20 * 8);

        // サンタを消す、設定のクリア
        system.runTimeout(() => {
            PlayerManager.playSoundForAll("edu.tp3");
            santa.remove();

            for(const player of dim.getPlayers()) {
                setPermission(player, true);
                setCamera(player, "clear");
            }
        }, 20 * 11);

        system.runTimeout(() => {
            broadcastTitle("サンタをおいかけよう！", "ワープしよう");
        }, 20 * 12);
    }
}