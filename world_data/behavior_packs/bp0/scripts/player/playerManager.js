// PlayerDataのプロパティ操作、PlayerStorageの呼び出し
import { Player, system, world } from "@minecraft/server";
import { PlayerStorage } from "./playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { ScenarioManager } from "../scenario/scenarioManager";
import { teleportToLastLocation } from "../utils/teleport";

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
     * すべてのプレイヤーの指定したレベルをクリアに
     * @param {string} scenarioId "game1", "game2", "game3"
     * @param {string} lvKey "lv1", "lv2", "lv3"
     */
    static setCleared(scenarioId, lvKey) {
        for(const entry of PlayerStorage.get(player)) {
            const { data } = entry;
            data[scenarioId][lvKey].cleared = true;
            data.save.needsSave = true;
        }
    }

    /**
     * プレイヤーのclearedTimeを取得
     * @param {Player} player 
     * @param {string} scenarioId "game1", "game2", "game3"
     * @param {string} lvKey "lv1", "lv2", "lv3"
     * @returns 
     */
    static getClearTime(player, scenarioId, lvKey) {
        const playerData =  PlayerStorage.get(player).data;
        return playerData[scenarioId][lvKey].clearTime;
    }

    /**
     * すべてのプレイヤーのclearedTimeを更新
     * @param {string} scenarioId "game1", "game2", "game3"
     * @param {string} lvKey "lv1", "lv2", "lv3"
     * @param {number} time 
     */
    static setClearTime(scenarioId, lvKey, time) {
        for(const entry of PlayerStorage.get(player)) {
            const { data } = entry;
            data[scenarioId][lvKey].clearTime = time;
            data.save.needsSave = true;
        }
    }

    /**
     * すべてのプレイヤーのscenarioIdを更新
     * @param {string} scenarioId "opening", "game1", "game2", "game3", "ending"
     * @returns 
     */
    static setScenarioId(scenarioId) {
        if(PlayerStorage.players.size === 0) return;
        for(const entry of PlayerStorage.get(player)) {
            const { data } = entry;
            data.scenario.currentScenarioId = scenarioId;
            data.save.needsSave = true;
        }
    }

    /**
     * PlayerDataのflagsに追加
     * @param {Player} player 
     * @param {string} flagName 
     * @param {boolean} bool 
     */
    static addFlags(player, flagName, bool) {
        const playerData = PlayerStorage.get(player).data;
        const flags = playerData.scenario.flags;
        if(!flags.hasOwnProperty(flagName) || flags[flagName] !== bool) {
            flags[flagName] = bool;
        }
    }

    /**
     * PlayerDataのflagを削除
     * @param {Player} player 
     * @param {string} flagName 
     */
    static removeFlags(player, flagName) {
        const playerData = PlayerStorage.get(player).data;
        const flags = playerData.scenario.flags;
        if(flags.hasOwnProperty(flagName)) {
            delete flags[flagName];
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

    /** このゲームの現在のレベルをPlayerDataをもとに返す */
    static getGameLevel(player, gameKey) {
        const playerData = PlayerStorage.get(player).data;
        const gameProgress = playerData[gameKey];
        if(!gameProgress.lv1.cleared) return 1;
        if(!gameProgress.lv2.cleared) return 2;
        if(!gameProgress.lv3.cleared) return 3;
        return 3;
    }

    /** 数値のレベルをPlayerDataのキーに変換 */
    static convertLvKey(currentLevel) {
        return `lv${currentLevel}`;
    }

    /**
     * すべてのプレイヤーの指定されたゲーム、レベルの進捗を更新
     * @param {string} gameKey "game1", "game2", "game3"
     * @param {string} lvKey "lv1", "lv2", "lv3"
     * @param {number} progressNum 
     */
    static setCurrentProgressForAll(gameKey, lvKey, progressNum) {
        for(const entry of PlayerStorage.players.values()) {
            const { player, data } = entry;
            if(!data) {
                console.warn(`can't find data of ${player.name}`);
                continue;
            }
            data[gameKey][lvKey].currentProgress = progressNum;
        }
    }

    /**
     * すべてのプレイヤーのクリア処理
     * clearedをtrueに、ベストタイムの場合は更新、progressを0にリセット
     * @param {string} gameKey "game1", "game2", "game3"
     * @param {number} lvKey "lv1", "lv2", "lv3"
     */
    static setClearResultForAll(gameKey, lvKey) {
        for(const entry of PlayerStorage.players.values()) {
            const { player, data: playerData } = entry;
            const gameProgress = playerData[gameKey][lvKey];

            gameProgress.cleared = true;
            gameProgress.currentProgress = 0;
            const currentTime = gameProgress.clearTime; // 現在のベストタイムを取得

            if(currentTime !== 0 && this.elapsedMs < currentTime) {
                gameProgress.clearTime = this.elapsedMs;
                PlayerManager.addFlags(player, "bestTime", true);
                if(TEST_MODE.CONFIG) console.log(`player ${player.name} time updated`);
            }
            else {
                PlayerManager.addFlags(player, "bestTime", false);
            }
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
        for(let entry of PlayerStorage.players.values()) {
            let { player, data: playerData } = entry;
            try {
                teleportToLastLocation(player, playerData);
            } catch (error) {
                console.warn(`teleport error occurred ${player.name}`, error);
            }
        }
    }
}

export { PlayerManager };