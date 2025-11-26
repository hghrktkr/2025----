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

export class ExitGameManager extends GameManagerBase {
    constructor(options) {
        super(options);
        this.currentLevel = 1;
        this.currentProgress = 0;
        this.requiredRoomCount = options.config?.requiredRoomCount || 3;
        this.roomSizeInfo = roomSizeInfo.exitGameRoom;

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
            for (const key in blocks) {
                const blockTypes = blocks[key];
                const positions = blockPositions[key];
                if (!blockTypes || !positions) continue;
                const gen = new FurnitureGenerator(blockTypes, positions);
                gens.push(gen);
            }

            return gens;
        }

        /** normalRoomGeneratorsとanormalRoomGeneratorsからランダムに1つだけanormalRoomGeneratorsのものに差し替え */
        setRandomAnormal() {
            const gens = [...this.normalRoomGenerators];
            const keys = Object.keys(this.anormalBlocksByLevel);

            // ランダムに1つkeyを選択
            const randomKey = keys[Math.floor(Math.random() * keys.length)];

            // gens内のkeyと一致するindexを探す
            const randomIndex = gens.findIndex((gen) => {
                gen.key === randomKey;
            });

            // 一致するgeneratorをanormalRoomGeneratorsから取得
            const anormalGen = this.anormalRoomGenerators.find((gen) => {
                gen.key === randomKey;
            });

            if (randomIndex === -1 || !anormalGen) {
                console.warn(`can't find anormal generator for key: ${randomKey}`);
                return gens;
            }

            // ランダムに1つだけanormalRoomGeneratorsのものに差し替え
            gens[randomIndex] = anormalGen;
            return gens;
        }

        /** 50%の確率で通常部屋を返す */
        isNormalRoom() {
            let isNormal = true;
            // 50%の確率で通常部屋
            if (Math.random() < 0.5) {
                isNormal = true;
            } else {
                isNormal = false;
            }
            return isNormal;
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

            // レベルの取得・スポーン位置設定
            this.currentLevel = PlayerProgressManager.getGameLevel(player, this.gameKey);
            const startRoomLocation = gameSpawnLocation;
            PlayerManager.setSpawnPointForAll(startRoomLocation);

            // レベルに応じたgeneratorsのセット
            this.anormalBlocksByLevel = this.getAnormalBlocksByLevel();
            this.normalRoomGenerators = this.setRoomGenerators(normalRoomBlocks, exitGameBlockPos);
            this.anormalRoomGenerators = this.setRoomGenerators(this.anormalBlocksByLevel, exitGameBlockPos);
            
            this.state = "READY";
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);

            // roomManagerのセット 初めの部屋は全て通常部屋
            this.roomManager = new RoomManager({
                startPos: this.roomSizeInfo.startPos,
                size: this.roomSizeInfo.size,
                generators: this.normalRoomGenerators
            });

            // 部屋生成、移動シーケンス
            await TransitionManager.openDoorSequence( 
                startRoomLocation,
                () => this.roomManager.generateRoom()
            );
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

            // 1つ目のゲームルーム生成
            this.currentProgress = 1;

            // 通常部屋から怪異部屋からランダムに選択して生成
            if (this.isNormalRoom()) {
                this.roomManager = new RoomManager({
                    startPos: this.roomSizeInfo.startPos,
                    size: this.roomSizeInfo.size,
                    generators: this.normalRoomGenerators
                });
            } else {
                const gens = this.setRandomAnormal();
                this.roomManager = new RoomManager({
                    startPos: this.roomSizeInfo.startPos,
                    size: this.roomSizeInfo.size,
                    generators: gens
                });
            }
            
            await TransitionManager.openDoorSequence(
                this.roomSizeInfo.startPos,
                () => this.roomManager.generateRoom()
            );

            this._startTimer();

            this.state = "RUNNING";
        }

        /**
         * 各部屋のミッションをクリアした時(正しい扉を開けたとき)
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomCleared(player) {
            this.currentProgress += 1;
            PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentProgress);

            if(this.currentProgress > this.requiredRoomCount) {
                await this._onGoalReached(player);
            } else {

                // 通常部屋から怪異部屋からランダムに選択して生成
                if (this.isNormalRoom()) {
                    this.roomManager = new RoomManager({
                        startPos: this.roomSizeInfo.startPos,
                        size: this.roomSizeInfo.size,
                        generators: this.normalRoomGenerators
                    });
                } else {
                    const gens = this.setRandomAnormal();
                    this.roomManager = new RoomManager({
                        startPos: this.roomSizeInfo.startPos,
                        size: this.roomSizeInfo.size,
                        generators: gens
                    });
                }

                await TransitionManager.openDoorSequence(
                    this.roomSizeInfo.startPos,
                    () => this.roomManager.generateRoom()
                );
            }
        }

        /**
         * 間違えた扉を開けたらスタートルームに戻す
         * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
         */
        async onRoomFailed(player) {
            this.currentProgress = 0;
            PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);

            // roomManagerのセット 初めの部屋は全て通常部屋
            this.roomManager = new RoomManager({
                startPos: this.roomSizeInfo.startPos,
                size: this.roomSizeInfo.size,
                generators: this.normalRoomGenerators
            });

            await TransitionManager.openDoorSequence(
                gameSpawnLocation,
                () => this.roomManager.generateRoom()
            );
        }

        /**
         * ゴール処理
         */
        async _onGoalReached() {
            this.elapsedMs = this._stopTimer();
            PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel);

            // シナリオ進行などはここで発火
            this.state = "ENDED";
        }

        /** ロビーへ戻る処理 */
        static async quitGame(player) {
            
            const entry = PlayerStorage.get(player);
            if (!entry) return;
            const { data: playerData } = entry;

            // 進行度のリセット・セーブ
            PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel, 0);
            // spawnLocationをリセット
            PlayerManager.setSpawnPointForAll(lobbySpawnLocation);
            PlayerStorage.setDirtyPlayers();

            // ロビーへ移動シーケンス
            await TransitionManager.openDoorSequence(
                lobbySpawnLocation,
                () => {}
            );

        }


}
