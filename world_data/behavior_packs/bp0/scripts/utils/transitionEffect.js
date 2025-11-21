import { InputPermissionCategory } from "@minecraft/server";
import { TEST_MODE } from "../configs/testModeFlag";

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

export { setPermission, setCamera };