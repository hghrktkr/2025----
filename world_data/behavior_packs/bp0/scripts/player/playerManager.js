// PlayerDataのプロパティ操作、PlayerStorageの呼び出し
import { system, world } from "@minecraft/server";
import { PlayerStorage } from "./playerStorage";

class PlayerManager {
    static TICK_SAVE_INTERVAL = 40; // セーブ処理を2秒ごとに実施

    /** ゲームロード・セーブ */
    static initialize() {
        world.afterEvents.playerSpawn.subscribe((ev) => {
            const player = ev.player;
            PlayerStorage.loadPlayerData(player);
        });

        world.afterEvents.playerLeave.subscribe((ev) => {
            if(!PlayerStorage.players.has(ev.playerId)) return;
            const player = PlayerStorage.players.get(ev.playerId).player;
            PlayerStorage.onPlayerLeave(player);
        });

        system.runInterval(() => {
            PlayerStorage.saveDirtyPlayers();
        }, this.TICK_SAVE_INTERVAL);

    }
}

export { PlayerManager };