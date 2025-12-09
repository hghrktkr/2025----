// ロビーの扉を開けた時だけゲームを生成する
import { system, world } from "@minecraft/server";
import { ScenarioManager } from "../scenario/scenarioManager";
import { ExitGameManager } from "../games/exitGameManager";
import { MissionGameManager } from "../games/missionGameManager";
import LOCATION_UTILS from "../utils/locationUtils";
import { EntranceSpawner } from "../spawners/entranceSpawner";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { gameLevel } from "../configs/gameLevel";
import { TEST_MODE } from "../configs/testModeFlag";
import { gateConfig } from "../configs/entrancePictureConfig";
import { BuildGameManager } from "./buildGameManager";

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
                        let gameKey = entrance.getTags().find(t => t === "game1" || t === "game2" || t === "game3" || t === "game3Return");
                        entrance.remove();  // 多重実行防止
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

                // 現在のレベルと、それに伴うクリア部屋数を取得
                const lv = PlayerProgressManager.getGameLevel(player, gameKey);
                const roomCount = gameLevel[gameKey][lv];

                if(TEST_MODE.CONFIG) console.log(`set Level: ${lv}`);
                if(TEST_MODE.CONFIG) console.log(`required room: ${roomCount}`);
                
                ScenarioManager.currentGameManager = new ExitGameManager({
                    gameKey: gameKey,
                    config: {
                        currentLevel: lv,
                        requiredRoomCount: roomCount
                    }
                });

                // 初期化してテレポート
                await ScenarioManager.currentGameManager.init(player);

                break;
            
            case "game2":
                ScenarioManager.currentGameManager = new MissionGameManager({
                    gameKey: gameKey
                });

                // 初期化してテレポート
                await ScenarioManager.currentGameManager.init(player);

                break;

            case "game3":
                ScenarioManager.currentGameManager = new BuildGameManager({
                    gameKey: gameKey
                });

                // 初期化してテレポート
                await ScenarioManager.currentGameManager.init(player);

                break;
            
            case "game3Return":
                ScenarioManager.currentGameManager = new BuildGameManager({
                    gameKey: gameKey
                });

                // 初期化して帰還
                await ScenarioManager.currentGameManager.quitGame();
                
                break;
            
        }
    }

    /**
     * シナリオに応じて扉を出現させる(ロビー移動時)
     * @param {string} currentScenarioId opening | game1 | game2 | ending
     */
    static spawnEntrance(currentScenarioId) {
        switch (currentScenarioId) {
            case "opening":
                
                break;
            
            case "game1":
                EntranceSpawner.spawnGate(gateConfig.startPos, gateConfig.endPos, gateConfig.dimension, "minecraft:air");
                EntranceSpawner.clearEntrance();
                EntranceSpawner.spawnEntrance("game1");
                break;
            
            case "game2":
                EntranceSpawner.spawnGate(gateConfig.startPos, gateConfig.endPos, gateConfig.dimension, "minecraft:air");
                EntranceSpawner.clearEntrance();
                EntranceSpawner.spawnEntrance("game1");
                EntranceSpawner.spawnEntrance("game2");
                break;
            
            case "game3":
                EntranceSpawner.spawnGate(gateConfig.startPos, gateConfig.endPos, gateConfig.dimension, gateConfig.blockType);
                EntranceSpawner.clearEntrance();
                EntranceSpawner.spawnEntrance("game1");
                EntranceSpawner.spawnEntrance("game2");
                EntranceSpawner.spawnEntrance("game3");
                break;

            
            case "ending":

                break;
            
            default:
                break;
        }
    }
}
