// シナリオの遷移、各シナリオ毎のイベントのフック

import { world } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { PlayerManager } from "../player/playerManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { RoomManager } from "../rooms/roomManager";
import { game1Rooms } from "../configs/rooms/game1Rooms";
import { ExitGameManager } from "../games/exitGameManager";

export class ScenarioManager {
    static SCENARIOS = [ 'opening', 'game1', 'ending' ];    // 一旦ゲーム1つに
    static currentGameManager = null;   // 進行中のゲーム

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

    /**
     * 各シナリオ開始時の処理呼び出し
     * @param {"opening"|"game1"|"game2"|"game3"|"ending"} scenarioId 
     * @param {player} player 扉を開けたプレイヤー
     */
    static onEnterScenario(scenarioId) {
        switch (scenarioId, player) {
            case "opening":
                if(TEST_MODE.CONFIG) console.log(`entered opening`);
                
                break;
            
            case "game1":
                if(TEST_MODE.CONFIG) console.log(`entered game1`);

                const roomManager = new RoomManager(game1Rooms);
                this.currentGameManager = new ExitGameManager({gameKey: scenarioId, roomManager});

                // 初期化・スタートルームへ
                gameManager.init(player);
                break;
            
            case "game2":

                break;
            
            case "game3":

                break;
            
            case "ending":
                if(TEST_MODE.CONFIG) console.log(`entered ending`);

                break;

            default:
                console.warn(`無効なシナリオが参照されました ${scenarioId}`);
                break;
        }
    }

    /** 扉を開けたときに呼び出す */
    static onDoorOpened(player) {
        const gameManager = this.gameManagers.get(player.id);
        if(!gameManager) return;

        // ExitGameManager が正しい部屋か判定して処理
        gameManager.onRoomCleared(player);
    }

    /** 扉イベントの購読 */
    static subscribeDoorTrigger() {
        world.beforeEvents.blockActivate.subscribe(ev => {
            const player = ev.source;
            // 扉判定: 任意の条件で扉ブロックか確認
            if(ev.block.typeId.includes("door")) {
                ev.cancel = true; // デフォルトの扉開閉をキャンセル
                this.onDoorOpened(player);
            }
        });
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