// PlayerDataのプロパティ操作、PlayerStorageの呼び出し
import { Player, system, world } from "@minecraft/server";
import { PlayerStorage } from "./playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { ScenarioManager } from "../scenario/scenarioManager";

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
}

export { PlayerManager };