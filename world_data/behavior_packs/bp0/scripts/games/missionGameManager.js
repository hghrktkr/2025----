// ミッション型ゲーム
import { GameManagerBase } from "./gameManagerBase";
import { TEST_MODE } from "../configs/testModeFlag";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { PlayerManager } from "../player/playerManager";
import { TransitionManager } from "../transitions/transitionManager";
import { gameLevel } from "../configs/gameLevel";
import { missionSpawnLocation } from "../configs/playerConfig";
import { roomSizeInfo } from "../configs/rooms/roomSizeInfo";
import FurnitureGenerator from "../rooms/exitGameRooms/furnitureGenerator";
import { missionGameConfig } from "../configs/missonGameConfig";
import { system, world } from "@minecraft/server";
import { broadcastTitle } from "../utils/helpers";
import LOCATION_UTILS from "../utils/locationUtils";

export class MissionGameManager extends GameManagerBase {
    constructor(options) {
        super(options);

        this.currentLevel = options.config?.currentLevel || 1;
        this.requiredRoomCount = 1;                             // ステージは1つだけ

        // ======= ミッションゲーム固有データ =======
        this.roomSizeInfo = roomSizeInfo.missionGameRoom;       // startPos: {x: number, y: number, z: number}, size: {width: number, height: number, depth: number}
        this.score = 0;
        
        this.dim = world.getDimension("overworld");
        this.cannon = null;                                      // 大砲エンティティ
        
        // ゲーム難易度設定
        this.infoByLevel = gameLevel.game2[this.currentLevel];
        this.enemyLifetime = this.infoByLevel.enemyLifetime;    // 1体の生存時間（s）
        this.spawnInterval = this.infoByLevel.spawnInterval;    // 何秒ごとに敵を出すか（s）
        this.limitTime = this.infoByLevel.limitTime;            // 全体の制限時間（s）
        this.clearScoreByLevel = this.infoByLevel.clearScore;   // クリアに必要な撃破数

        // 敵管理
        this.enemySpawnHandle = null;                           // runTimeout管理

        // ブロックスポナー
        this.blockSpawner = new FurnitureGenerator(
            {
                key: "mission_blocks",
                blocktypes: Object.values(missionGameConfig.blockTypes),
                area: roomSizeInfo.missionGameRoom
            }
        );
    }

    /* -------------------------
       データ操作関係・クラス内メソッド
    ------------------------- */

    /** エネミーブロックの生成・消失 */
    _spawnEnemy() {

        // ランダムなブロックをランダムな位置に生成
        const {chosenType, pos} = this.blockSpawner.generateRandomOne();

        // 時間で消える
        system.runTimeout(() => {
            const block = this.dim.getBlock(pos);

            if(block.typeId === chosenType) {
                block.setType("minecraft:air");
            }

        }, 20 * this.enemyLifetime);
    }

    _spawnCannon() {
        const {type, pos, rot} = missionGameConfig.cannon;

        // 既に大砲がある場合は念のため消去
        const entities = this.dim.getEntities({
            type: type
        });
        system.run(() => {
            for(const entity of entities) {
                entity.remove();
            }
        });

        // ブロック座標をエンティティ用に変換
        const entityPos = LOCATION_UTILS.toWorldPos(pos);
        
        // 大砲をスポーン
        system.run(() => {
            this.cannon = this.dim.spawnEntity(type, entityPos);
            this.cannon.setRotation({x: 0, y: rot});
        });
    }

    /**
     * 砲身を向ける
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {vector3} 砲身のheadの向きを表す単位ベクトル
     */
    _aimCannon(x, y, z) {
        if(!this.cannon) {
            console.warn(`can't find cannon`);
            return;
        }

        // x, y, zを座標に
        const targetPos = {x: x, y: y, z: z};

        // targetPosを向かせる
        this.cannon.lookAt(targetPos);

        // 動かしてる音を出す？

        return this.cannon.getHeadLocation();
    }

    _shoot() {
        if(!this.cannon) {
            console.warn(`can't find cannon`);
            return;
        }

        // 発射アニメーション
        this.cannon.playAnimation("shoot");
    }
    



    /* -------------------------
       ゲーム進行関係
    ------------------------- */
        /** * 初期化
         * @param {Player} 扉を開けたプレイヤー 
         * */
        async init() { 
            // INIT状態以外の場合、ロビーへテレポート
            if(this.state !== "INIT") { 
                console.warn(`can't start game state = ${this.state}`);
                PlayerManager.teleportAllPlayersToLastLocation();
                return;
            }
            
            this.state = "LOADING";
            if(this.debug) console.log(`game state: ${this.state} for ${this.gameKey}`);
            if(this.debug) console.log(`game level: ${this.currentLevel}`);

            // スコア初期化・スポーン位置設定
            this.score = 0;
            PlayerManager.setSpawnPointForAll(missionSpawnLocation);

            // 部屋の初期化、移動シーケンス
            await TransitionManager.openDoorSequence( 
                gameSpawnLocation,
                "tp",
                () => {this.blockSpawner.clearFurniture()}
            );

            // ロビー扉を再度有効に
            GameEntranceManager.isStarting = false;

            // ゲームスタートイベントの購読開始
            this.state = "READY";
            if(this.debug) console.log("[Mission] READY");
        }

        /** 開始処理 */
        startGame() {
            if (this.state !== "READY") {
                console.warn("MissionGame cannot start; state = " + this.state);
                return;
            }

            this.state = "RUNNING";
            this._startTimer();

            // タイトル表示
            broadcastTitle(`§c§lゲームスタート！`, `${this.limitTime}いないに${this.clearScoreByLevel}たいたおせ！`);

            // 敵スポーン
            this.enemySpawnHandle = system.runInterval(() => this._spawnEnemy(), 20 * this.spawnInterval);

            // 制限時間終了
            system.runTimeout(() => this.endGame(), 20 * this.limitTime);

            if(this.debug) console.log("[Mission] START");
        }

}
