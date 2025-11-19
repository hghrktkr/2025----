// PlayerDataのプロパティ操作、PlayerStorageの呼び出し
import { system, world } from "@minecraft/server";
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
}

export { PlayerManager };