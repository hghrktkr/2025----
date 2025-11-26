// 各ゲーム進行の基底クラス

import { Player } from "@minecraft/server";
import { TEST_MODE } from "../configs/testModeFlag";
import { PlayerManager } from "../player/playerManager";
import { ScenarioManager } from "../scenario/scenarioManager";
import { TransitionManager } from "../transitions/transitionManager";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { gameSpawnLocation } from "../configs/playerConfig";

export class GameManagerBase {
    constructor({ gameKey, roomManager, roomInfo, config = {} } = {}) {

        // デバッグ用コンソールのON/OFF
        this.debug = TEST_MODE.CONFIG;

        // RoomManager
        this.roomManager = roomManager;
        this.roomInfo = roomInfo;

        // 状態
        this.state = "INIT";                                    // INIT, LOADING, READY, TRANSITIONING, RUNNING, PAUSED, RESUME, ENDED
        this.gameKey = gameKey;                                 // game1, game2, game3
        this.currentLevel = 1;                                  // 1 - 3
        this.currentProgress = 0;                               // 部屋の進行度 スタートルーム:0 ゲームルーム:1～
        this.requiredRoomCount = config.requiredRoomCount || 3; // ゴールまでの部屋数(ゲームルームの数)
        this.timer = null;                                      // { startAt: number, running: bool }
        this.elapsedMs = 0;                                     // かかった時間

        // イベントハンドラ
        this.eventHandlers = {};
    }

    /* -------------------------
    イベントハンドラ関係
     ------------------------- */

        addListener(eventName, handler) {
            if(!this.eventHandlers[eventName]) this.eventHandlers[eventName] = [];  // valueに配列を追加
            this.eventHandlers[eventName].push(handler);
        }

        removeListener(eventName, handler) {
            if(!this.eventHandlers[eventName]) return;
            this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
                (h) => h !== handler
            );
        }

        async emit(eventName, payload) {
            const handlers = this.eventHandlers[eventName] || [];
            for (const h of handlers) {
                try {
                    await h(payload);
                } catch(e) {
                    console.warn(`${eventName} handler error`, e);
                }
            }
        }
    
    /* ------------------------- 
    ゲーム進行関係 
    ------------------------- */
        /** * 初期化 
         * @param {Player} 扉を開けたプレイヤー 
         * */
        async init(player) { 
            // INIT状態以外の場合、ロビーへテレポート
            if(this.state !== "INIT") { 
                console.warn(`can't start game state = ${this.state}`);
                PlayerManager.teleportAllPlayersToLastLocation();
                return;
            }
            
            this.state = "LOADING";
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);

            // レベルの取得・スポーン位置設定
            this.currentLevel = PlayerProgressManager.getGameLevel(player, this.gameKey);
            const startRoomLocation = gameSpawnLocation;
            PlayerManager.setSpawnPointForAll(startRoomLocation);
            
            this.state = "READY";
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);
            // 部屋生成、移動シーケンス
            await TransitionManager.openDoorSequence( 
                startRoomLocation,
                () => this.roomManager.generateRoom("startRoom")
            );
        }

    /* -------------------------
    タイマー
     ------------------------- */
        _startTimer() {
            if(this.timer && this.timer.running) this._stopTimer();
            this.timer = { startAt: Date.now(), running: true };
            if(this.debug) console.log(`timer started at ${this.timer.startAt}`);
        }

        _stopTimer() {
            if(!this.timer || !this.timer.running) return 0;
            const elapsed = Date.now() - this.timer.startAt;
            this.timer.running = false;
            if(this.debug) console.log(`timer stopped; time = ${elapsed}ms`);
            return elapsed;
        }

        _convertMsToTime(elapsed) {
            const min = Math.floor(elapsed / 1000 / 60) % 60;
            const sec = Math.floor(elapsed / 1000) % 60;
            const pad = (num) => String(num).padStart(2,"0");   // 1桁の場合0挿入
            return `${pad(min)}:${pad(sec)}`;
        }
}