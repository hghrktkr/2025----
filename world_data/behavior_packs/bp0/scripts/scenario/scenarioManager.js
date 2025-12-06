// シナリオの遷移、各シナリオ毎のイベントのフック、現在のシナリオをゲーム中保存

import { world, system } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { PlayerManager } from "../player/playerManager";
import { GameEntranceManager } from "../games/gameEntranceManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { ScenarioEventHandler } from "./scenarioEventHandler";
import { EntranceSpawner } from "../spawners/entranceSpawner";
import { gateConfig } from "../configs/entrancePictureConfig";

export class ScenarioManager {
    // GameEntranceManagerから注入
    static currentGameManager = null;

    static SCENARIOS = [ 'opening', 'game1', 'game2', 'game3', 'ending' ];    // 一旦ゲーム1つに

    /** PlayerDataの現在のシナリオを取得 */
    static getCurrentScenarioId(player) {
        if(TEST_MODE.console) console.log(`search ${player.name} / ${player.id} of scenario id`);
        const playerData = PlayerStorage.get(player).data;
        return playerData.scenario.currentScenarioId;
    }

    /** PlayerDataをもとに次のシナリオを取得 */
    static getNextScenarioId(currentScenarioId) {
        const currentIndex = this.SCENARIOS.findIndex(id => id === currentScenarioId);
        if(currentIndex < 0 || currentIndex >= this.SCENARIOS.length - 1) return null;
        return this.SCENARIOS[currentIndex + 1];
    }

    /** プレイヤーのシナリオを進める */
    static goToNextScenario(player) {
        const currentScenarioId= this.getCurrentScenarioId(player);
        const nextScenarioId = this.getNextScenarioId(currentScenarioId);

        if(!nextScenarioId) return false;

        // プレイヤーデータのシナリオ更新
        PlayerManager.setScenarioId(nextScenarioId);
        PlayerStorage.setDirtyPlayers();
        return true;
    }

    /** scenarioIdに応じて演出イベントをトリガー */
    static async triggerScenarioEvent(scenarioId, player) {
        switch (scenarioId) {
            case "opening":

                // オープニングを流してgame1へ
                await ScenarioEventHandler.openingSequence();

                // シナリオを進行
                // ロードを待つため遅延
                system.runTimeout(() => {
                    this.goToNextScenario(player);
                    let newScenario = this.getCurrentScenarioId(player);
                    this.triggerScenarioEvent(newScenario, player);
                }, 40);
                break;

            case "ending":
                
                break;

            case "game1":
                // 扉を出現させる
                GameEntranceManager.spawnEntrance(scenarioId);
                
                break;

            case "game2":
                // 扉を出現させる
                GameEntranceManager.spawnEntrance(scenarioId);
                // ムービー
                await ScenarioEventHandler.afterClearGame1Sequence();
                
                break;
            case "game3":

                // ムービー
                await ScenarioEventHandler.afterClearGame2Sequence();
                // 扉を出現させる（ムービー内で出しているがマーカーを出すため）
                GameEntranceManager.spawnEntrance(scenarioId);
                
                break;
        
            default:
                break;
        }

    }

    /** 棒を使うとシナリオを次へ進める */
    static manualScenarioControl() {
        world.beforeEvents.itemUse.subscribe((ev) => {
            if(!TEST_MODE.CONFIG) return;

            if(ev.itemStack.typeId !== "minecraft:stick" && ev.itemStack.typeId !== "minecraft:blaze_rod" && ev.itemStack.typeId !== "minecraft:end_rod") return;
            const player = ev.source;
            ev.cancel = true;
            
            if(ev.itemStack.typeId === "minecraft:stick") {
                let currentScenarioId = this.getCurrentScenarioId(player);
                console.log(`元のシナリオ: ${currentScenarioId}`);
                
                const canMoveToNextScenario = this.goToNextScenario(player);
                if(canMoveToNextScenario) {
                    let currentScenarioId = this.getCurrentScenarioId(player);
                    console.log(`新しいシナリオ: ${currentScenarioId}`);
                    this.triggerScenarioEvent(currentScenarioId, player);
                }
                else {
                    console.log(`最後のシナリオです ${currentScenarioId}`);
                }
            }
            else if(ev.itemStack.typeId === "minecraft:blaze_rod") {
                EntranceSpawner.spawnGate(gateConfig.startPos, gateConfig.endPos, gateConfig.dimension, "minecraft:air");
                PlayerStorage.resetPlayerData(player);
                GameEntranceManager.isStarting = false;
            }
            else if(ev.itemStack.typeId === "minecraft:end_rod") {
                this.triggerScenarioEvent("game3");
                GameEntranceManager.isStarting = false;
            }
        });
    }
}