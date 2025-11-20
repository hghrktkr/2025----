// 各ゲーム進行の基底クラス

import { Dimension, InputPermissionCategory, Player } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { TEST_MODE } from "../configs/testModeFlag";
import { PlayerManager } from "../player/playerManager";

export class GameManagerBase {
    constructor({ roomManager, config = {} } = {}) {

        // デバッグ用コンソールのON/OFF
        this.debug = TEST_MODE.CONFIG;

        // RoomManager
        this.roomManager = roomManager;

        // 状態
        this.state = INIT;                                      // INIT, LOADING, READY, TRANSITIONING, RUNNING, PAUSED, ENDED
        this.currentScenarioId = null;                          // game1, game2, game3
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

        emit(eventName, payload) {
            const handlers = this.eventHandlers[eventName] || [];
            for (const h of handlers) {
                try {
                    h(payload);
                } catch(e) {
                    console.warn(`error: ${e}`);
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
            this.currentScenarioId = scenarioId;

            // RoomManagerの初期化処理をあとから追記（非同期処理）
            // イベントハンドラに初期処理をadd

            // 部屋の初期化終了後
            this.state = "READY";
            if(this.debug) console.log(`game state: ${this.state} for ${scenarioId}`);
            this.emit("ready", { scenarioId }); // 登録した初期処理発火
        }
    
        /**
         * スタートルーム入室時の処理
         * spawnLocation設定、PlayerData更新、ゲームレベル取得
         * @param {Player} player 
         * @param {import("@minecraft/server").DimensionLocation} spawnLocation 
         * @returns 
         */
        onEnterStartRoom(player, spawnLocation) {
            if(!PlayerStorage.players.has(player.id)) {
                console.warn(`プレイヤーデータが見つかりません`);
                return;
            }
            const playerData = PlayerStorage.get(player).data;

            // PlayerData更新→セーブ
            playerData.lastLocation = spawnLocation;
            player.setSpawnPoint(spawnLocation);
            playerData.save.needsSave = true;

            // ゲームレベルを取得
            this.currentLevel = this._setGameLevel(playerData);
        }

        /**
         * ゲーム開始の処理(ゲームルーム入室時)
         * 扉を通る演出⇒テレポート⇒ゲームルームへ
         * @param {Player} player 
         * @returns 
         */
        async startGame(player) {
            if(this.state !== "READY" || this.state === "PAUSED") {
                console.warn(`can't start game state = ${this.state}`);
                this._teleportPlayersToLastLocation(player);
                return;
            }

            this.state = "TRANSITIONING";
            if(this.debug) console.log(`game state: ${this.state} for ${this.currentScenarioId}`);

            // 暗転と扉のSE
            await this._openDoorSequence();

            // テレポート処理
            // const roomLocation = ...
            await this._teleportPlayers(roomLocation);

            // 部屋の内装生成処理 あとから

            // 暗転解除
            await this._onEnteredRoomSequence();

            // タイマー開始
            this._startTimer();

            // ゲームスタート
            this.state = "RUNNING";

        }

        async onRoomCleared(player) {
            this.currentProgress += 1;
            this._setCurrentProgressForAll(this.currentProgress);

            // イベントの着火

            // 部屋数を超えたらクリア処理へ
            if(this.currentProgress > this.requiredRoomCount) {
                this._onGoalReached(player);
            }
            else {
                // 次の部屋へ
            }
        }


    /* -------------------------
    クラス内関数
     ------------------------- */

        /** このゲームの現在のレベルをPlayerDataをもとに返す */
        _setGameLevel(playerData) {
            const gameProgress = playerData[this._gameKey];
            if(!gameProgress.lv1.cleared) return 1;
            if(!gameProgress.lv2.cleared) return 2;
            if(!gameProgress.lv3.cleared) return 3;
            return 3;
        }

        /** 数値のレベルをPlayerDataのキーに変換 */
        _convertLvKey(currentLevel) {
            return `lv${currentLevel}`;
        }

        /**
         * 参加中のすべてのプレイヤーを指定位置へテレポート
         * @param {import("@minecraft/server").DimensionLocation} dLocation 
         */
        async _teleportPlayers(dLocation) {
            for(const entry of PlayerStorage.players.values()) {
                const { player } = entry;
                await this._teleportPlayer(player, dLocation);
            }
        }

        /**
         * 参加中のすべてのプレイヤーをゲームのスタートルームへテレポート
         * @param {Player} player 
         * @returns 
         */
        async _teleportPlayersToLastLocation(player) {
            const playerData = PlayerStorage.get(player).data;
            const lastLocation = playerData.lastLocation;
            if(!lastLocation) {
                console.warn(`can't find lastLocation`);
                return;
            }
            await this._teleportPlayers(lastLocation);
        }

        /**
         * 指定したプレイヤーをテレポート
         * @param {Player} player 
         * @param {import("@minecraft/server").DimensionLocation} dLocation 
         * @returns 
         */
        async _teleportPlayer(player, dLocation) {
            if(!player || !dLocation) return;
            const tpLoc = {
                x: dLocation.x,
                y: dLocation.y,
                z: dLocation.z
            }
            try {
                await player.teleport(tpLoc);
            } catch (error) {
                console.warn(`failed to teleport ${player.name}`);
            }
        }

        _setCurrentProgressForAll(progressNum) {
            for(const entry of PlayerStorage.players.values()) {
                const { player, data } = entry;
                if(!data) {
                    console.warn(`can't find data of ${player.name}`);
                    continue;
                }
                data[this.currentScenarioId].currentProgress = progressNum;
            }
        }

        _onGoalReached(player) {
            this.elapsedMs = this._stopTimer();

            // クリア処理
            PlayerManager.setCleared(this.currentScenarioId, this._convertLvKey(this.currentLevel));

            // ベストタイム更新のとき
            const previousClearTime = PlayerManager.getClearTime(player, this.currentScenarioId, this._convertLvKey(this.currentLevel));
            if(this.elapsedMs < previousClearTime) {
                PlayerManager.setClearTime(this.currentScenarioId, this._convertLvKey(this.currentLevel),this.elapsedMs);
            }

            // ゴールルームへテレポート(入室演出)

            // タイム表示 ベストタイム表示

            // シナリオ進行

            this.state = "ENDED";
        }

    /* -------------------------
    演出関連
     ------------------------- */
        
        /**操作不可、扉SE、カメラフェードアウト */
        async _openDoorSequence() {
            await this._setPermissionForAll(false);
            await this._setCameraForAll("fade");
            await this._playSoundForAll("edu:door_open");
        }

        async _onEnteredRoomSequence() {
            await this._setPermissionForAll(true);
            await this._setCameraForAll("clear");
        }

        /**
         * すべてのプレイヤーの操作許可/禁止
         * @param {boolean} enabled 
         */
        async _setPermissionForAll(enabled) {
            for(const entry of PlayerStorage.players.values()) {
                const { player } = entry.player;
                try {
                    await player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, enabled);
                } catch (error) {
                    console.warn(`can't set permissions of ${player.name}`);
                }
            }
        }

        /**
         * すべてのプレイヤーにSE再生
         * @param {string} soundId 
         * @param {Dimension} dimension 
         */
        async _playSoundForAll(soundId) {
            if(this.debug) console.log(`soundId: ${soundId}`);
            for(const entry of PlayerStorage.players.values()) {
                const { player } = entry.player;
                try {
                    await player.playSound(soundId);
                } catch (error) {
                    console.warn(`can't play sound ${soundId} for ${player.name}`);
                }
            }
        }

        /**
         * すべてのプレイヤーのカメラ操作
         * @param {string} cameraOption "fade", "clear"
         */
        async _setCameraForAll(cameraOption) {
            if(this.debug) console.log(`cameraOption: ${cameraOption}`);
            for(const entry of PlayerStorage.players.values()) {
                const { player } = entry.player;
                switch (cameraOption) {
                    case "fade":
                        await player.camera.fade();
                        break;
                    case "clear":
                        await player.camera.clear();
                        break;
                    default:
                        console.warn(`can't set camera ${cameraOption} to ${player.name}`);
                        break;
                }
            }
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

    /* -------------------------
    サブクラスでオーバーライド
     ------------------------- */
    
        /** 自身がどのゲームか指定する
         *  game1, game2, game3
         */
        _gameKey() {}
}