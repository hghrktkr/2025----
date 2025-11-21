// シナリオの遷移、各シナリオ毎のイベントのフック

import { world } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { PlayerManager } from "../player/playerManager";

export class ScenarioManager {
    static SCENARIOS = [ 'opening', 'game1', 'game2', 'game3', 'ending' ];

    static getCurrentScenarioId(player) {
        const playerData = PlayerStorage.get(player).data;
        return playerData.scenario.currentScenarioId;
    }

    static getNextScenarioId(currentScenarioId) {
        const currentIndex = this.SCENARIOS.findIndex(id => id === currentScenarioId);
        if(currentIndex < 0 || currentIndex >= this.SCENARIOS.length - 1) return null;
        return this.SCENARIOS[currentIndex + 1];
    }

    /** プレイヤーのシナリオを進めてイベントをフック */
    static goToNextScenario(player) {
        const currentScenarioId= this.getCurrentScenarioId(player);
        const nextScenarioId = this.getNextScenarioId(currentScenarioId);

        if(!nextScenarioId) return false;

        // プレイヤーデータのシナリオ更新
        PlayerManager.setScenarioId(nextScenarioId);
        PlayerStorage.setDirtyPlayers();

        // シナリオイベントの実行
        this.onEnterScenario(nextScenarioId);
        
        return true;
    }

    /** 各シナリオ開始時の処理呼び出し */
    static onEnterScenario(scenarioId) {
        switch (scenarioId) {
            case "opening":
                
                break;
            
            case "game1":

                break;
            
            case "game2":

                break;
            
            case "game3":

                break;
            
            case "ending":

                break;

            default:
                console.warn(`無効なシナリオが参照されました ${scenarioId}`);
                break;
        }
    }

    /** 棒を使うとシナリオを次へ進める */
    static manualScenarioControl() {
        world.beforeEvents.itemUse.subscribe((ev) => {
            if(ev.itemStack.typeId !== "minecraft:stick" && ev.itemStack.typeId !== "minecraft:blaze_rod") return;
            const player = ev.source;
            ev.cancel;
            
            if(ev.itemStack.typeId === "minecraft:stick") {
                let currentScenarioId = this.getCurrentScenarioId(player);
                console.log(`元のシナリオ: ${currentScenarioId}`);
                
                const canMoveToNextScenario = this.goToNextScenario(player);
                if(canMoveToNextScenario) {
                    let currentScenarioId = this.getCurrentScenarioId(player);
                    console.log(`新しいシナリオ: ${currentScenarioId}`);
                }
                else {
                    console.log(`最後のシナリオです ${currentScenarioId}`);
                }
            }
            else if(ev.itemStack.typeId === "minecraft:blaze_rod") {
                PlayerStorage.resetPlayerData(player);
            }
        });
    }
}