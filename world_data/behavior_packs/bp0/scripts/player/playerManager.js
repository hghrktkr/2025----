// PlayerDataのプロパティ操作、PlayerStorageの呼び出し
import { Player, system, world } from "@minecraft/server";
import { PlayerStorage } from "./playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { ScenarioManager } from "../scenario/scenarioManager";
import { teleportToLastLocation } from "../utils/teleport";
import { setCamera, setPermission } from "../utils/transitionEffect";
import { PlayerData } from "./PlayerData";

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
     * @param {object} locationData 
     */
    static teleportAllPlayers(locationData) {
        for(const entry of PlayerStorage.players.values()) {
            const { player } = entry;
            const dim = world.getDimension(locationData.dimension); 

            if(TEST_MODE.CONFIG) console.log(`teleporting to ( ${locationData.x}, ${locationData.y}, ${locationData.z} ); dimension: ${locationData.dimension}`);
            if(TEST_MODE.CONFIG && (locationData.yaw || locationData.pitch)) console.log(`yaw: ${locationData.yaw}; pitch: ${locationData.pitch}`);

            try {
                system.run(() => {
                    player.teleport(
                        {x: locationData.x, y: locationData.y, z: locationData.z},
                        {
                            dimension: dim ?? world.getDimension("overworld"),
                            rotation: {
                                x: locationData.pitch ?? 0,
                                y: locationData.yaw ?? 0
                            }
                        }
                    );
                });
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

    /** すべてのプレイヤーのスポーン位置を更新 */
    static setSpawnPointForAll(dLocation) {
        if(TEST_MODE.CONFIG) console.log(`spawn point ( ${dLocation.x}, ${dLocation.y}, ${dLocation.z} ) dimension: ${dLocation.dimension}`);

        // dimensionLocation作成
        const dLoc = {
            dimension: world.getDimension(dLocation.dimension),
            x: dLocation.x,
            y: dLocation.y,
            z: dLocation.z
        }

        if(PlayerStorage.players.size === 0) return;

        for(const entry of PlayerStorage.players.values()) {
            const { player } = entry;

            try {
                system.run(() => {
                    player.setSpawnPoint(dLoc);
                });
            } catch (error) {
                console.warn(`can't set spawnPoint: ( ${dLoc.x}, ${dLoc.y}, ${dLoc.z}); dimension: ${dLoc.dimension}`, error);
            }

            if(this.debug) console.log(`set spawn point of player ${player.name}`);
        }
    }

    /** すべてのプレイヤーのscenarioId更新 */
    static setScenarioId(scenarioId) {
        for(const entry of PlayerStorage.players.values()) {
            const { data } = entry;
            data.scenario.currentScenarioId = scenarioId;
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
                system.run(() => {
                    setPermission(player, enabled);
                });
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
                system.run(() => {
                    setCamera(player, cameraOption);
                });
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
            system.run(() => {
                player.playSound(soundId);
            });
        }
    }
}

export { PlayerManager };