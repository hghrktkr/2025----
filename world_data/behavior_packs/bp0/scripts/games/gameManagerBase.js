// 各ゲーム進行の基底クラス

import { TEST_MODE } from "../configs/testModeFlag";
import { world } from "@minecraft/server";
import { lobbySpawnLocation, gameSpawnLocation, buildSpawnLocation } from "../configs/playerConfig";

export class GameManagerBase {
    constructor({ gameKey, roomSizeInfo, config = {} } = {}) {

        // デバッグ用コンソールのON/OFF
        this.debug = TEST_MODE.CONFIG;

        // RoomManager
        this.roomManager = null;                                // 子クラスでセット
        this.roomSizeInfo = roomSizeInfo;

        // 状態
        this.state = "INIT";                                    // INIT, LOADING, READY, TRANSITIONING, RUNNING, PAUSED, RESUME, ENDED
        this.gameKey = gameKey;                                 // game1, game2, game3
        this.currentLevel = 1;                                  // 1 - 3
        this.currentProgress = 0;                               // 部屋の進行度 スタートルーム:0 ゲームルーム:1～
        this.currentRoomType = null;                            // 部屋のタイプは子クラスでセット
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

    /* -------------------------
    ゲームステージの事前読み込み
     ------------------------- */
        static _setupSpawnTickingAreas() {
            const dim = world.getDimension("overworld");

            const areas = [
                { name: "lobby", pos: lobbySpawnLocation },
                { name: "game", pos: gameSpawnLocation },
                { name: "build", pos: buildSpawnLocation }
            ];

            for (const area of areas) {
                const { x, y, z } = area.pos;

                // 半径 4〜6 で十分（1チャンク = 16×16）
                dim.runCommand(
                    `tickingarea add circle ${x} ${y} ${z} 10 spawn_${area.name} true`
                );
            }
        }

}