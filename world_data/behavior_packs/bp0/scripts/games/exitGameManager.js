// 脱出型ゲーム

import { GameManagerBase } from "./gameManagerBase";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { PlayerManager } from "../player/playerManager";
import { TransitionManager } from "../transitions/transitionManager";
import { gameSpawnLocation, lobbySpawnLocation } from "../configs/playerConfig";
import FurnitureGenerator from "../rooms/exitGameRooms/furnitureGenerator";
import { anormalRoomBlocks, unlockableBlocks } from "../configs/rooms/exitGameRoomBlocks/anormalRoomBlocks";
import { normalRoomBlocks } from "../configs/rooms/exitGameRoomBlocks/normalRoomBlocks";
import { exitGameBlockPos } from "../configs/rooms/exitGameRoomBlocks/exitGameBlockPos";
import { roomSizeInfo } from "../configs/rooms/roomSizeInfo";
import { PlayerStorage } from "../player/playerStorage";
import { ScenarioManager } from "../scenario/scenarioManager";
import { RoomManager } from "../rooms/roomManager";
import { TEST_MODE } from "../configs/testModeFlag";
import { GameEntranceManager } from "./gameEntranceManager";

// 脱出型ゲーム管理クラス

export class ExitGameManager extends GameManagerBase {
    constructor(options) {
        super(options);
        this.currentLevel = options.config?.currentLevel || 1;
        this.currentProgress = 0;
        this.requiredRoomCount = options.config?.requiredRoomCount || 3;
        this.roomSizeInfo = roomSizeInfo.exitGameRoom;
        this.currentRoomType = "normal";                // "normal" | "anormal"
        this.correctDoorId = "front";                   // 正しい扉のId "front" | "back"
        this.normalRoomGenerators = [];
        this.anormalRoomGenerators = [];
        this.anormalBlocksByLevel = {};
        this.normalRate = 0.3;                          // 通常部屋が生成される確率
    }




    /* ------------------------- 
    データ操作関係 
    ------------------------- */

        /** anormalRoomBlocksから、レベルに応じた一覧を取得 */
        getAnormalBlocksByLevel() {
            const level = this.currentLevel;
            const unlockedBlocks = unlockableBlocks[level] ?? unlockableBlocks[Math.max(...Object.keys(unlockableBlocks))];

            const blocks = {};
            for (const key of unlockedBlocks) {
                blocks[key] = anormalRoomBlocks[key];
            }
            return blocks;
        }

        /**
         * blocks内のkeyのblockTypeとpositionsを探してroomManager用のgeneratorsをセット
        * @param {string|string[]} blocks - 設置するブロック（単数 or 複数）
        * @param {Object|Object[]} blockPositions - 相対座標（単数 or 複数）
        * @returns 
        */
        setRoomGenerators(blocks, blockPositions) {
            const gens = [];

            for (const key of Object.keys(blocks)) {
                const blockTypes = blocks[key];
                const positions = blockPositions[key];

                if (!positions) {
                    console.warn(`[Exit] Missing positions for key: ${key}`);
                    continue;
                }

                gens.push(new FurnitureGenerator(key, blockTypes, positions));
            }

            return gens;
        }

        /** normalRoomGeneratorsの家具について、ランダムに1つだけanormalRoomGeneratorsのものに差し替え */
        setRandomAnormal() {
            const gens = [...this.normalRoomGenerators];

            const availableKeys = gens.map((gen) => gen.key);               // 通常部屋の鍵一覧
            const anormalKeys = Object.keys(this.anormalBlocksByLevel);     // レベルに応じた異常部屋の鍵一覧

            // anormalKeysのうち、通常部屋にも存在する鍵だけを抽出
            const keys = anormalKeys.filter((key) => availableKeys.includes(key));
            
            if (keys.length === 0) {
                console.warn("no available anormal keys to replace");
                return gens;
            }

            // ランダムに1つkeyを選択
            const randomKey = keys[Math.floor(Math.random() * keys.length)];

            // gens内のkeyと一致するindexを探す
            const randomIndex = gens.findIndex((gen) => gen.key === randomKey);

            // 一致するgeneratorをanormalRoomGeneratorsから取得
            const anormalGen = this.anormalRoomGenerators.find((gen) => gen.key === randomKey);

            if (randomIndex === -1 || !anormalGen) {
                console.warn(`can't find anormal generator for key: ${randomKey}`);
                return gens;
            }

            // ランダムに1つだけanormalRoomGeneratorsのものに差し替え
            gens[randomIndex] = anormalGen;
            return gens;
        }

        /** 設定した確率で通常部屋を返す */
        isNormalRoom() {
            return Math.random() < this.normalRate;
        }

        /** roomManagerをランダムにセット */
        setRandomRoomType() {
            // 50%の確率で通常部屋
            const isNormal = this.isNormalRoom();

            // this.currentRoomTypeをセット
            this.currentRoomType = isNormal ? "normal" : "anormal";
            this.correctDoorId = isNormal ? "front" : "back";

            // 判定に基づいてgensをセット
            const gens = isNormal ? this.normalRoomGenerators : this.setRandomAnormal();

            // roomManagerのセット
            this.roomManager = new RoomManager({
                    startPos: this.roomSizeInfo.startPos,
                    size: this.roomSizeInfo.size,
                    generators: gens,
                    roomType: this.currentRoomType,
                    correctDoorId: this.correctDoorId
            });
        }
            







    /* ------------------------- 
    ゲーム進行関係 
    ------------------------- */

        /** * 初期化 normalRoomGenerators, anormalRoomGeneratorsのセット
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
            if(this.debug) console.log(`game level: ${this.currentLevel}`);
            if(this.debug) console.log(`rooms to clear: ${this.requiredRoomCount}`);

            // レベルの取得・スポーン位置設定
            this.currentProgress = 0;
            PlayerManager.setSpawnPointForAll(gameSpawnLocation);

            // レベルに応じたgeneratorsのセット
            this.anormalBlocksByLevel = this.getAnormalBlocksByLevel();
            this.normalRoomGenerators = this.setRoomGenerators(normalRoomBlocks, exitGameBlockPos);
            this.anormalRoomGenerators = this.setRoomGenerators(this.anormalBlocksByLevel, exitGameBlockPos);

            // roomManagerのセット 初めの部屋は全て通常部屋
            this.currentRoomType = "normal";
            this.correctDoorId = "front";

            this.roomManager = new RoomManager({
                startPos: this.roomSizeInfo.startPos,
                size: this.roomSizeInfo.size,
                generators: this.normalRoomGenerators,
                roomType: this.currentRoomType,
                correctDoorId: this.correctDoorId
            });

            // 部屋生成、移動シーケンス
            await TransitionManager.openDoorSequence( 
                gameSpawnLocation,
                "tp",
                () => this.roomManager.generateRoom()
            );

            if(this.debug) console.log(`current room: ${this.currentProgress}`);
            if(this.debug) console.log(`current room: ${this.currentLevel}`);
            if(this.debug) console.log(`current roomType: ${this.currentRoomType}`);

            // ロビー扉を再度有効に
            GameEntranceManager.isStarting = false;

            // ドアの開閉イベント購読開始
            this.roomManager.startListeningDoorEvents(({player, isCorrect}) => {
                if(TEST_MODE.CONFIG) console.log(`player name: ${player.name}; isCorrect: ${isCorrect}`);

                if(isCorrect) {
                    this.state = "READY";
                    this.startGame(player);
                } else {
                    this.quitGame();
                }
            });

            // 準備ができたらイベント発火（タイトル・演出・BGM・ドアイベント）
            
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);
            this.emit("gameReady", {
                gameKey: this.gameKey,
                currentLevel: this.currentLevel
            });
        }

        /**
         * ゲーム開始の処理(ゲームルーム入室時)
         * 扉を通る演出⇒テレポート⇒ゲームルームへ
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         * @returns 
         */
        async startGame() {
            if(this.state !== "READY") {
                console.warn(`can't start game state = ${this.state}`);
                PlayerManager.teleportAllPlayersToLastLocation();
                return;
            }
            this.state = "TRANSITIONING";

            // 扉の購読停止
            this.roomManager.stopListeningDoorEvents();

            // 1つ目のゲームルーム生成
            this.currentProgress = 1;

            // roomManagerをランダムにセット
            this.setRandomRoomType();
            
            await TransitionManager.openDoorSequence(
                gameSpawnLocation,
                "door",
                () => this.roomManager.generateRoom()
            );

            // タイマースタート
            this._startTimer();

            if(this.debug) console.log(`current room: ${this.currentProgress}`);
            if(this.debug) console.log(`current roomType: ${this.currentRoomType}`);

            // ドアの開閉イベント購読開始
            this.roomManager.startListeningDoorEvents(({player, isCorrect}) => {
                if(isCorrect) {
                    this.state = "RUNNING";
                    this.onRoomCleared(player);
                } else {
                    this.onRoomFailed(player);
                }
            });

            this.emit("gameStarted", {
                gameKey: this.gameKey,
                currentLevel: this.currentLevel
            });
        }

        /**
         * 各部屋のミッションをクリアした時(正しい扉を開けたとき)
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomCleared(player) {
            this.currentProgress += 1;

            // ドアの開閉イベント購読停止
            this.roomManager.stopListeningDoorEvents();

            // 部屋数がクリア数に達したか判定
            if(this.currentProgress > this.requiredRoomCount) {
                await this._onGoalReached(player);
            } else {

                // roomManagerをランダムにセット
                this.setRandomRoomType();

                await TransitionManager.openDoorSequence(
                    gameSpawnLocation,
                    "door",
                    () => this.roomManager.generateRoom()
                );

                if(this.debug) console.log(`current room: ${this.currentProgress}`);
                if(this.debug) console.log(`current roomType: ${this.currentRoomType}`);

                // ドアの開閉イベント購読開始
                this.roomManager.startListeningDoorEvents(({player, isCorrect}) => {
                    if(isCorrect) {
                        this.state = "RUNNING";
                        this.onRoomCleared(player);
                    } else {
                        this.onRoomFailed(player);
                    }
                });

                this.emit("roomCleared", {
                    gameKey: this.gameKey,
                    currentLevel: this.currentLevel
                });
            }
        }

        /**
         * 間違えた扉を開けたらスタートルームに戻す
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomFailed(player) {
            this.currentProgress = 0;

            // ドアの開閉イベント購読停止
            this.roomManager.stopListeningDoorEvents();

            // roomManagerのセット 初めの部屋は全て通常部屋
            this.currentRoomType = "normal";
            this.correctDoorId = "front";

            this.roomManager = new RoomManager({
                startPos: this.roomSizeInfo.startPos,
                size: this.roomSizeInfo.size,
                generators: this.normalRoomGenerators,
                roomType: this.currentRoomType,
                correctDoorId: this.correctDoorId
            });

            await TransitionManager.openDoorSequence(
                gameSpawnLocation,
                "door",
                () => this.roomManager.generateRoom()
            );

            if(this.debug) console.log(`current room: ${this.currentProgress}`);
            if(this.debug) console.log(`current roomType: ${this.currentRoomType}`);

            // ドアの開閉イベント購読開始
            this.roomManager.startListeningDoorEvents(({player, isCorrect}) => {
                if(isCorrect) {
                    this.state = "RUNNING";
                    this.onRoomCleared(player);
                } else {
                    this.quitGame();
                }
            });

            this.emit("gameReady", {
                gameKey: this.gameKey,
                currentLevel: this.currentLevel
            });
        }

        /**
         * ゴール処理
         */
        async _onGoalReached() {
            this.elapsedMs = this._stopTimer();
            PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel, this.elapsedMs);

            // シナリオ進行などはここで発火
            this.state = "ENDED";
            this.emit("gameEnded", {
                gameKey: this.gameKey,
                currentLevel: this.currentLevel,
                elapsedMs: this.elapsedMs
            });

            if(this.debug) console.log(`game cleared`);

            // ロビーへ戻る処理
            await this.quitGame({isClear: true});
        }


        /** ロビーへ戻る処理 */
        async quitGame({isClear = false} = {}) {

            // タイマーが起動していた場合はストップ
            this._stopTimer();

            // spawnLocationをリセット
            PlayerManager.setSpawnPointForAll(lobbySpawnLocation);

            // PlayerDataのSpawnLocationを更新
            PlayerStorage.setDirtyPlayers();

            // 現在のGameManagerインスタンスをクリア
            ScenarioManager.currentGameManager = null;

            // クリアの場合はコールバック関数を渡す
            let callback = () => {};
            if(isClear) {

            }
            callback = () => {
                GameEntranceManager.spawnEntrance(this.gameKey);
            }

            // ロビーへ移動シーケンス
            await TransitionManager.openDoorSequence(
                lobbySpawnLocation,
                "tp",
                callback
            );

        }




}
