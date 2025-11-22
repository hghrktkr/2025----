// 各ゲーム進行の基底クラス

import { Player } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { PlayerManager } from "../player/playerManager";
import { ScenarioManager } from "../scenario/scenarioManager";
import { TransitionManager } from "../transitions/transitionManager";
import { PlayerProgressManager } from "../player/playerProgressManager";

export class GameManagerBase {
    constructor({ roomManager, config = {} } = {}) {

        // デバッグ用コンソールのON/OFF
        this.debug = TEST_MODE.CONFIG;

        // RoomManager
        this.roomManager = roomManager;

        // 状態
        this.state = "INIT";                                    // INIT, LOADING, READY, TRANSITIONING, RUNNING, PAUSED, RESUME, ENDED
        this.gameKey = null;                                    // game1, game2, game3
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
        
        /**
         * 初期化
         * @param {Player} 扉を開けたプレイヤー
         * @param {string} scenarioId game1/game2/game3
         */
        async init(player, scenarioId) {
            if(this.state !== "INIT") {
                console.warn(`can't start game state = ${this.state}`);
                PlayerManager.teleportAllPlayersToLastLocation();
                return;
            }
            this.state = "LOADING";
            if(this.debug) console.log(`game state: ${this.state} for ${scenarioId}`);
            this.gameKey = scenarioId;
            this.currentLevel = PlayerProgressManager.getGameLevel(player, this.gameKey);
            PlayerManager.setSpawnPointForAll(startRoomLocation);

            // RoomManagerの初期化処理をあとから追記（非同期処理）
            // イベントハンドラに初期処理をadd

            // 部屋の初期化終了後
            this.state = "READY";
            if(this.debug) console.log(`game state: ${this.state} for ${scenarioId}`);
            this.emit("ready", { scenarioId }); // 登録した初期処理発火
        }

        /**
         * ゲーム開始の処理(ゲームルーム入室時)
         * 扉を通る演出⇒テレポート⇒ゲームルームへ
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         * @returns 
         */
        async startGame(player) {
            if(this.state !== "READY") {
                console.warn(`can't start game state = ${this.state}`);
                PlayerManager.teleportAllPlayersToLastLocation();
                return;
            }

            this.state = "TRANSITIONING";
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);

            // TransitionManager.openDoorSequence(roomLocation, );

            // タイマー開始
            this._startTimer();

            // ゲームスタート
            this.state = "RUNNING";

        }

        /**
         * 各部屋のミッションをクリアした時(正しい扉を開けたとき)
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomCleared(player) {
            this.currentProgress += 1;
            PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);

            // イベントの発火

            // 指定された部屋数を超えたらクリア処理
            if(this.currentProgress > this.requiredRoomCount) {
                await this._onGoalReached(player);
            }
            else {
                // 次の部屋へ
                // 部屋の生成
                // const roomLocation = ... あとから
                // await TransitionManager.openDoorSequence();
            }
        }

        /**
         * 間違えた扉を開けたらスタートルームに戻す
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomFailed(player) {
            this.currentProgress = 0;
            PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);
            const playerData = PlayerStorage.get(player).data;
            const startRoomLocation = playerData.lastLocation;
            // await TransitionManager.openDoorSequence();
        }

        /**
         * ゲームルームを抜けて洋館へ戻る時
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async exitGameRoom(player) {
            // const robbyLocation = ... あとから
            PlayerManager.setSpawnPointForAll(robbyLocation);
            // await TransitionManager.openDoorSequence();
        }

        


    /* -------------------------
    クラス内関数
     ------------------------- */

        

        /**
         * ゴール処理
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async _onGoalReached(player) {
            // タイム取得
            this.elapsedMs = this._stopTimer();

            // タイム保存
            PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel);

            // ゴールルームへ
            // await openDoorSequence();

            // ゴール時のイベント発火

            // シナリオ更新
            ScenarioManager.goToNextScenario(player);

            // ステート更新
            this.state = "ENDED"
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