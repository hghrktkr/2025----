// ロビーの扉を開けた時だけゲームを生成する
import { system, world } from "@minecraft/server";
import { ScenarioManager } from "../scenario/scenarioManager";
import { ExitGameManager } from "../games/exitGameManager";
import { MissionGameManager } from "../games/missionGameManager";
import LOCATION_UTILS from "../utils/locationUtils";
import { EntranceSpawner } from "../spawners/entranceSpawner";

export class GameEntranceManager {

    // 多重実行防止
    static isStarting = false;

    /** プレイヤーが扉に入った時、ゲームをトリガー */
    static enterPicture() {
        system.runInterval(() => {
            if(this.isStarting) return;

            const dim = world.getDimension("overworld");

            for(const player of world.getPlayers()) {

                const entrances = dim.getEntities({
                    tags:["entrance"]
                });

                for(const entrance of entrances) {
                    const dist = LOCATION_UTILS.distance(player.location, entrance.location);

                    if(dist < 1) {
                        this.isStarting = true;
                        let gameKey = entrance.getTags().find(t => t === "game1" || t === "game2");
                        entrance.remove();
                        this.startGame(player, gameKey);
                    }
                }
            }
        }, 20 * 0.5);
    }

    /** gameKeyに応じたGameManagerインスタンスを生成 */
    static async startGame(player, gameKey) {
        switch (gameKey) {
            case "game1":
                ScenarioManager.currentGameManager = new ExitGameManager({
                    gameKey: gameKey
                });
                break;
            case "game2":
                ScenarioManager.currentGameManager = new MissionGameManager({
                    gameKey: gameKey
                });
                break;
        }

        // 初期化してテレポート
        await ScenarioManager.currentGameManager.init(player);
    }

    /**
     * シナリオに応じて扉を出現させる
     * @param {string} currentScenarioId opening | game1 | game2 | ending
     */
    static spawnEntrance(currentScenarioId) {
        switch (currentScenarioId) {
            case "opening":
                
                break;
            
            case "game1":
                EntranceSpawner.spawnEntrance("game1");
                break;
            
            case "game2":
                EntranceSpawner.spawnEntrance("game1");
                EntranceSpawner.spawnEntrance("game2");
                break;
            
            case "ending":

                break;
            
            default:
                break;
        }
    }
}
