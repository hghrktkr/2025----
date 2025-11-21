// PlayerDataのプロパティ操作、PlayerStorageの呼び出し
import { Player, system, world } from "@minecraft/server";
import { PlayerStorage } from "./playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { ScenarioManager } from "../scenario/scenarioManager";
import { teleportToLastLocation } from "../utils/teleport";
import { setCamera, setPermission } from "../utils/transitionEffect";

class PlayerManager {
    static TICK_SAVE_INTERVAL = 40; // セーブ処理を2秒ごとに実施

    /** ゲームロード・セーブ */
    static initialize() {
        world.afterEvents.playerSpawn.subscribe((ev) => {
            const player = ev.player;
            PlayerStorage.loadPlayerData(player);
        });

        system.runInterval(() => {
            PlayerStorage.saveDirtyPlayers();
        }, this.TICK_SAVE_INTERVAL);

        // テストモードのときのみ
        if(TEST_MODE.CONFIG) {
            ScenarioManager.manualScenarioControl();
        }
    }

    /**
     * すべてのプレイヤーを指定の場所にテレポート
     * @param {import("@minecraft/server").DimensionLocation} dLocation 
     */
    static teleportAllPlayers(dLocation) {
        for(const entry of PlayerStorage.players.values()) {
            const { player } = entry;
            try {
                player.teleport(dLocation);
            } catch (error) {
                console.warn(`teleport error occurred ${player.name}`, error);
            }
        }
    }

    /**
     * すべてのプレイヤーをPlayerData内のLastLocationへテレポート
     */
    static teleportAllPlayersToLastLocation() {
        for(const entry of PlayerStorage.players.values()) {
            const { player, data: playerData } = entry;
            try {
                teleportToLastLocation(player, playerData);
            } catch (error) {
                console.warn(`teleport error occurred ${player.name}`, error);
            }
        }
    }

    /** すべてのプレイヤーのlastLocationとスポーン位置を更新 */
    static setSpawnPointForAll(dLocation) {
        if(TEST_MODE.CONFIG) console.log(`spawn point ( ${dLocation.x}, ${dLocation.y}, ${dLocation.z} ) dimension: ${dLocation.dimension}`);
        if(PlayerStorage.players.size === 0) return;
        for(const entry of PlayerStorage.players.values()) {
            const { player, data } = entry;
            data.lastLocation = dLocation;
            player.setSpawnPoint(dLocation);
            if(this.debug) console.log(`set spawn point of player ${player.name}`);
        }
    }

    /**
     * すべてのプレイヤーのパーミッションを更新
     * @param {boolean} enabled 
     */
    static setPermissionForAll(enabled) {
        for(const entry of PlayerStorage.players.values()) {
            const { player } = entry;
            try {
                setPermission(player, enabled);
            } catch (error) {
                console.warn(`permission denied`, error);
            }
        }

    }

    /**
     * すべてのプレイヤーのカメラを更新
     * @param {string} cameraOption // "fade", "clear"
     */
    static setCameraForAll(cameraOption) {
        for(const entry of PlayerStorage.players.values()) {
            const { player } = entry;
            try {
                setCamera(player, cameraOption);
            } catch (error) {
                console.warn(`fade denied`, error);
            }
        }

    }

    /**
     * すべてのプレイヤーへSE再生
     * @param {string} soundId 
     */
    static playSoundForAll(soundId) {
        for(const entry of PlayerStorage.players.values()) {
            const { player } = entry;
            player.playSound(soundId);
        }
    }
}

export { PlayerManager };