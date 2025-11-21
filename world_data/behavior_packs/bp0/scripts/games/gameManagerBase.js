// 各ゲーム進行の基底クラス

import { Player } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { PlayerManager } from "../player/playerManager";
import { ScenarioManager } from "../scenario/scenarioManager";

export class GameManagerBase {
    constructor({ roomManager, config = {} } = {}) {

        // デバッグ用コンソールのON/OFF
        this.debug = TEST_MODE.CONFIG;

        // RoomManager
        this.roomManager = roomManager;

        // 状態
        this.state = "INIT";                                    // INIT, LOADING, READY, TRANSITIONING, RUNNING, PAUSED, ENDED
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
                    await (payload);
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
         * @param {string} scenarioId game1/game2/game3
         */
        async init(scenarioId) {
            this.state = "LOADING";
            if(this.debug) console.log(`game state: ${this.state} for ${scenarioId}`);
            this.gameKey = scenarioId;

            // RoomManagerの初期化処理をあとから追記（非同期処理）
            // イベントハンドラに初期処理をadd

            // 部屋の初期化終了後
            this.state = "READY";
            if(this.debug) console.log(`game state: ${this.state} for ${scenarioId}`);
            this.emit("ready", { scenarioId }); // 登録した初期処理発火
        }
    


        /**
         * スタートルーム入室時の処理
         * startRoomLocation設定、PlayerData更新、ゲームレベル取得
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         * @param {import("@minecraft/server").DimensionLocation} spawnLocation 
         * @returns 
         */
        onEnterStartRoom(player, startRoomLocation) {
            if(!PlayerStorage.players.has(player.id)) {
                console.warn(`プレイヤーデータが見つかりません`);
                return;
            }
            
            // PlayerData更新→セーブ
            PlayerManager.setSpawnPointForAll(startRoomLocation);
            PlayerStorage.setDirtyPlayers();
            
            // ゲームレベルを取得
            this.currentLevel = PlayerManager.getGameLevel(player, this.gameKey);
        }



        /**
         * ゲーム開始の処理(ゲームルーム入室時)
         * 扉を通る演出⇒テレポート⇒ゲームルームへ
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         * @returns 
         */
        async startGame(player) {
            if(this.state !== "READY" || this.state === "PAUSED") {
                console.warn(`can't start game state = ${this.state}`);
                PlayerManager.teleportAllPlayersToLastLocation();
                return;
            }

            this.state = "TRANSITIONING";
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);

            // 暗転と扉のSE
            // テレポート処理
            // 部屋の内装生成処理 あとから
            // 暗転解除

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
            const lvKey = PlayerManager.convertLvKey(this.currentLevel);
            PlayerManager.setCurrentProgressForAll(this.gameKey, lvKey, this.currentProgress);

            // イベントの発火

            // 指定された部屋数を超えたらクリア処理
            if(this.currentProgress > this.requiredRoomCount) {
                await this._onGoalReached(player);
            }
            else {
                // 次の部屋へ
                // 部屋の生成
                // const roomLocation = ... あとから
                await this._proceedToNextRoom(roomLocation);
            }
        }

        /**
         * 間違えた扉を開けたらスタートルームに戻す
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomFailed(player) {
            this.currentProgress = 0;
            const lvKey = PlayerManager.convertLvKey(this.currentLevel);
            PlayerManager.setCurrentProgressForAll(this.gameKey, lvKey, this.currentProgress);
            const playerData = PlayerStorage.get(player).data;
            const startRoomLocation = playerData.lastLocation;
            this._proceedToNextRoom(startRoomLocation);
        }

        /**
         * ゲームルームを抜けて洋館へ戻る時
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async exitGameRoom(player) {
            // const robbyLocation = ... あとから
            this._setSpawnPointForAll(robbyLocation);
            await this._openDoorSequence();
            await this._teleportPlayers(robbyLocation);
            await this._onEnteredRoomSequence();
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
            await _setClearResultForAll();
            PlayerStorage.setDirtyPlayers();

            // ゴールルームへ
            await this._openDoorSequence();
            // const goalRoomLocation = ... あとから
            await this._teleportPlayers(goalRoomLocaton);
            await this._onEnteredRoomSequence();

            // ゴール時のイベント発火

            // シナリオ更新
            ScenarioManager.goToNextScenario(player);

            // ステート更新
            this.state = "ENDED"
        }

        /**
         * 次の部屋へ移動する処理
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async _proceedToNextRoom(roomLocation) {
            if(this.debug) console.log(`next room number: ${this.currentProgress}`);

            // 次の部屋へ移動処理
            await this._openDoorSequence();
            await this._teleportPlayers(roomLocation);
            await this._onEnteredRoomSequence();
        }


    /* -------------------------
    タイマー
     ------------------------- */
        _startTimer() {
            if(this.timer && this.timer.running) this._stopTimer();
            this.timer = { starAt: Date.now(), running: true };
            if(this.debug) console.log(`timer started at ${this.timer.starAt}`);
        }

        _stopTimer() {
            if(!this.timer || !this.timer.running) return 0;
            const elapsed = Date.now() - this.timer.starAt;
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