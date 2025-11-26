// ゲーム中の進行管理クラス
import { PlayerStorage } from "./playerStorage";

export class PlayerProgressManager {

    /**
     * すべてのプレイヤーの指定したレベルをクリアに
     * @param {string} scenarioId "game1", "game2", "game3"
     * @param {number} currentLevel レベル番号(1,2,3)
     */
    static setCleared(scenarioId, currentLevel) {
        for(const entry of PlayerStorage.players.values()) {
            const { data } = entry;
            const lvKey = this.convertLvKey(currentLevel);
            data[scenarioId][lvKey].cleared = true;
            data.save.needsSave = true;
        }
    }

    /**
     * プレイヤーのclearedTimeを取得
     * @param {Player} player 
     * @param {string} scenarioId "game1", "game2", "game3"
     * @param {number} currentLevel レベル番号(1,2,3)
     * @returns 
     */
    static getClearTime(player, scenarioId, currentLevel) {
        const playerData =  PlayerStorage.get(player).data;
        const lvKey = this.convertLvKey(currentLevel);
        return playerData[scenarioId][lvKey].clearTime;
    }

    /**
     * すべてのプレイヤーのclearedTimeを更新
     * @param {string} scenarioId "game1", "game2", "game3"
     * @param {number} currentLevel レベル番号(1,2,3)
     * @param {number} time 
     */
    static setClearTime(scenarioId, currentLevel, time) {
        for(const entry of PlayerStorage.players.values()) {
            const { data } = entry;
            const lvKey = this.convertLvKey(currentLevel);
            data[scenarioId][lvKey].clearTime = time;
        }
        PlayerStorage.setDirtyPlayers();
    }

    /**
     * すべてのプレイヤーのscenarioIdを更新
     * @param {string} scenarioId "opening", "game1", "game2", "game3", "ending"
     * @returns 
     */
    static setScenarioId(scenarioId) {
        if(PlayerStorage.players.size === 0) return;
        for(const entry of PlayerStorage.players.values()) {
            const { data } = entry;
            data.scenario.currentScenarioId = scenarioId;
        }
        PlayerStorage.setDirtyPlayers();
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
     * すべてのプレイヤーのクリア処理
     * clearedをtrueに、ベストタイムの場合は更新、progressを0にリセット
     * @param {string} gameKey "game1", "game2", "game3"
     * @param {number} currentLevel レベル番号(1,2,3)
     */
    static setClearResultForAll(gameKey, currentLevel) {
        for(const entry of PlayerStorage.players.values()) {
            const { player, data: playerData } = entry;
            const lvKey = this.convertLvKey(currentLevel);
            const gameProgress = playerData[gameKey][lvKey];

            gameProgress.cleared = true;
            const currentTime = gameProgress.clearTime; // 現在のベストタイムを取得

            if(currentTime !== 0 && this.elapsedMs < currentTime) {
                gameProgress.clearTime = this.elapsedMs;
                this.addFlags(player, "bestTime", true);
                if(TEST_MODE.CONFIG) console.log(`player ${player.name} time updated`);
            }
            else {
                this.addFlags(player, "bestTime", false);
            }
            PlayerStorage.setDirtyPlayers();
        }
    }
}