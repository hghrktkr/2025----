// シナリオの遷移、各シナリオ毎のイベントのフック

import { PlayerStorage } from "../player/playerStorage";

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
        const playerData = PlayerStorage.get(player).data;
        const currentScenarioId= this.getCurrentScenarioId(player);
        const nextScenarioId = this.getNextScenarioId(currentScenarioId);

        if(!nextScenarioId) return false;

        // プレイヤーデータのシナリオ更新
        playerData.scenario.currentScenarioId = nextScenarioId;
        playerData.save.needsSave = true;

        // シナリオイベントの実行
        this.onEnterScenario(player, nextScenarioId);
        
        return true;
    }

    /** 各シナリオ開始時の処理呼び出し */
    static onEnterScenario(player, scenarioId) {
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
}