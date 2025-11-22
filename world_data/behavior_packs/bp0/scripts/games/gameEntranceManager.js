// ロビーの扉を開けた時だけゲームを生成する
import { ScenarioManager } from "../scenario/scenarioManager";
import { ExitGameManager } from "../games/exitGameManager";
import { MissionGameManager } from "../games/missionGameManager";

export class GameEntranceManager {

    /** プレイヤーが扉をインタラクトしたとき */
    static init() {
        world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
            const block = ev.block;
            const player = ev.player;

            //扉に紐づいたgameKeyを取得 "game1"|"game2"|"game3"
            const gameKey = this.getGameKeyFromDoor(block);
            if (!gameKey) return;

            ev.cancel = true;

            // GameManagerを生成して開始
            this.startGame(player, gameKey);
        });
    }

    /** blockのtagに紐づいたgameKeyを取得 */
    static getGameKeyFromDoor(block) {
        const tags = block.getTags();
        if (tags.includes("game1-door")) return "game1";
        if (tags.includes("game2-door")) return "game2";
        if (tags.includes("game3-door")) return "game3";
        if (tags.includes("ending-door")) return "ending";
        return null;
    }

    /** gameKeyに応じたGameManagerインスタンスを生成 */
    static async startGame(player, gameKey) {
        switch (gameKey) {
            case "game1":
                ScenarioManager.currentGameManager = new ExitGameManager({
                    gameKey,
                    roomManager: new RoomManager(game1Rooms),
                });
                break;
            case "game2":
                ScenarioManager.currentGameManager = new MissionGameManager({
                    gameKey,
                    roomManager: new RoomManager(game2Rooms),
                });
                break;
        }

        // 初期化してテレポート
        await ScenarioManager.currentGameManager.init(player);
    }
}
