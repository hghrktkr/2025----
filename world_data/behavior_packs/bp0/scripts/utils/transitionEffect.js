// 演出に関する関数群⇒TransitionManagerで使用

import { EasingType, Entity, InputPermissionCategory } from "@minecraft/server";
import { TEST_MODE } from "../configs/testModeFlag";
import { system } from "@minecraft/server";
import LOCATION_UTILS from "./locationUtils";

/**
 * プレイヤーの操作許可/禁止
 * @param {Player} player
 * @param {boolean} enabled 
 */
function setPermission(player, enabled) {
    try {
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, enabled);
    } catch (error) {
        console.warn(`can't set permissions of ${player.name}`);
    }
};

/**
 * プレイヤーのカメラ操作
 * @param {Player} player
 * @param {string} cameraOption "fade", "clear"
 */
function setCamera(player, cameraOption) {
    if(TEST_MODE.CONFIG) console.log(`cameraOption: ${cameraOption}`);
    switch (cameraOption) {
        case "fade":
            player.camera.fade()
            break;
        case "clear":
            player.camera.clear();
            break;
        default:
            console.warn(`can't set camera ${cameraOption} to ${player.name}`);
            break;
    }
};

/**
 * プレイヤーのカメラを動かす
 * @param {player} プレイヤー
 * @param {{x: number, y: number, z: number}} startPos 始点
 * @param {{x: number, y: number}} startRot 始点時のカメラの角度
 * @param {{x: number, y: number, z: number}} endPos 終点
 * @param {{x: number, y: number}} endRot 終点でのカメラの角度
 * @param {number} totalSec カメラを動かすトータルの時間
 */
async function setCameraPan(player, startPos, startRot, endPos, endRot, totalSec) {
    // カメラを始点にセット 権限回避のためsystem.run
    system.run(() => {
        player.camera.setCamera("minecraft:free", {
            location: startPos,
            rotation: startRot
        });
    });

    // カメラをトータル秒かけて動かす
    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: endPos,
            rotation: endRot,
            easeOptions: {
                easeTime: totalSec,
                easeType: EasingType.InOutSine
            }
        });
    }, 5);  // 同時にならないよう少しだけ遅延
}

/**
 * エンティティを動かす
 * @param {Entity} entity 動かすエンティティ
 * @param {{x: number, y: number, z: number}} startPos スタート地点
 * @param {{x: number, y: number, z: number}} endPos ゴール地点
 * @param {number} totalSec 移動時間
 */
async function moveEntity(entity, startPos, endPos, totalSec) {
    // 移動距離
    const distance = LOCATION_UTILS.distance(startPos, endPos);

    // 単位ベクトル
    const direction = {
        x: (endPos.x - startPos.x) / distance,
        y: (endPos.y - startPos.y) / distance,
        z: (endPos.z - startPos.z) / distance
    }

    // トータルの移動回数
    const totalSteps = totalSec / 0.5;

    // 0.5秒あたりの移動成分
    const dx = direction.x * (distance / totalSteps);
    const dy = direction.y * (distance / totalSteps);
    const dz = direction.z * (distance / totalSteps);

    let tpPos = {...startPos};
    let currentStep = 0;
    let nextPos;

    // 0.5秒ごとにテレポート
    const interval = system.runInterval(() => {
        if(currentStep >= totalSteps) system.clearRun(interval);
        try {
            entity.teleport(tpPos);
            nextPos = {
                x: tpPos.x + dx,
                y: tpPos.y + dy,
                z: tpPos.z + dz
            };
        } catch (error) {
            console.warn(error);
        }
        tpPos = nextPos;
        currentStep += 1;
    }, 20 * 0.5);

}

export { setPermission, setCamera, setCameraPan, moveEntity };