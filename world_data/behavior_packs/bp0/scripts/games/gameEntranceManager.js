// ロビーの扉を開けた時だけゲームを生成する
import { world } from "@minecraft/server";
import { ScenarioManager } from "../scenario/scenarioManager";
import { ExitGameManager } from "../games/exitGameManager";
import { MissionGameManager } from "../games/missionGameManager";

export class GameEntranceManager {

    /** プレイヤーが扉をインタラクトしたとき */
    static init() {
        world.afterEvents.dataDrivenEntityTrigger.subscribe((ev) => {
            const { entity, eventId } = ev;
            if(!eventId.startsWith("edu:enter_")) return;
            if(!entity.isPlayer) return;
            let gameKey;

            switch (eventId) {
                case "edu:enter_game1":
                    gameKey = "game1";
                    break;
            
                default:
                    break;
            }
            if(!gameKey) return;
            this.startGame(entity, gameKey);
        })
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
