// ミッション型ゲーム
import { GameManagerBase } from "./gameManagerBase";
import { ScenarioManager } from "../scenario/scenarioManager";
import { PlayerStorage } from "../player/playerStorage";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { PlayerManager } from "../player/playerManager";
import { TransitionManager } from "../transitions/transitionManager";
import { gameLevel } from "../configs/gameLevel";
import { lobbySpawnLocation, missionSpawnLocation } from "../configs/playerConfig";
import { roomSizeInfo } from "../configs/rooms/roomSizeInfo";
import FurnitureGenerator from "../rooms/exitGameRooms/furnitureGenerator";
import { missionGameConfig } from "../configs/missonGameConfig";
import { EntityComponentTypes, system, world } from "@minecraft/server";
import { broadcastChat, broadcastTitle } from "../utils/helpers";
import LOCATION_UTILS from "../utils/locationUtils";
import { moveEntity } from "../utils/transitionEffect";
import { GameEntranceManager } from "./gameEntranceManager";

export class MissionGameManager extends GameManagerBase {
    constructor(options) {
        super(options);

        this.currentLevel = options.config?.currentLevel || 1;
        this.requiredRoomCount = 1;                             // ステージは1つだけ

        // ======= ミッションゲーム固有データ =======
        this.roomSizeInfo = roomSizeInfo.missionGameRoom;       // startPos: {x: number, y: number, z: number}, size: {width: number, height: number, depth: number}
        this.score = 0;
        
        this.dim = world.getDimension("overworld");

        // 大砲関係
        this.cannon = null;                                     // 大砲エンティティ
        this.hitEventListener = null;                           // 着弾管理
        
        // ゲーム難易度設定
        this.infoByLevel = gameLevel.game2[this.currentLevel];
        this.enemyLifetime = this.infoByLevel.enemyLifetime;    // 1体の生存時間（s）
        this.spawnInterval = this.infoByLevel.spawnInterval;    // 何秒ごとに敵を出すか（s）
        this.limitTime = this.infoByLevel.limitTime;            // 全体の制限時間（s）
        this.clearScoreByLevel = this.infoByLevel.clearScore;   // クリアに必要な撃破数

        // 敵管理
        this.enemySpawnHandle = null;                           // runTimeout管理
        this.enemyPositions = [];                               // 敵がいる座標の配列

        // ブロックスポナー
        this.blockSpawner = new FurnitureGenerator(
            {
                key: "mission_blocks",
                blockTypes: Object.values(missionGameConfig.blockTypes),
                area: roomSizeInfo.missionGameRoom
            }
        );

        // チャットの読み込み
        
        
    }

    /* -------------------------
       データ操作関係・クラス内メソッド
    ------------------------- */

    /** エネミーブロックの生成・消失 */
    _spawnEnemy() {

        // ランダムなブロックをランダムな位置に生成
        const {chosenType, pos} = this.blockSpawner.generateRandomOne();

        // 座標を保存（当たり判定用）
        if (!this.enemyPositions.some(p => p.x === pos.x && p.y === pos.y && p.z === pos.z)) {
            this.enemyPositions.push(pos);
        }

        // 時間で消える
        system.runTimeout(() => {
            const block = this.dim.getBlock(pos);

            if(block.typeId === chosenType) {
                block.setType("minecraft:air");
                this.enemyPositions = this.enemyPositions.filter(p => p !== pos);
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
     * @returns 砲身のheadの位置と向き
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

        // 頭の位置と向きを返す
        return {headLoc: this.cannon.getHeadLocation(), headVec: this.cannon.getViewDirection()};
    }

    /** エラー時に砲身を一回転させる */
    _errorCannon() {
        if(!this.cannon) {
            console.warn(`can't find cannon`);
            return;
        }

        let yaw = 0;
        const cannonRotationInterval = system.runInterval(() => {
            if(yaw > 360) {
                system.clearRun(cannonRotationInterval);
                return;
            }
            this.cannon.setRotation({x: 0, y: yaw});
            yaw += 10;
        }, 10);
    }

    /** サンタのスポーン */
    _spawnBulletSanta(headLoc, headVec) {

        // headVecに対し、進行方向へ90°傾いた角度を作成する
        const yaw = Math.atan2(-1 * headVec.x, headVec.z) * 180 / Math.PI;
        const pitch = -90;

        // 砲身の先から出ているように見えるようにするためのオフセット
        const muzzleOffset = 0.8;

        const spawnPos = {
            x: headLoc.x + headVec.x * muzzleOffset,
            y: headLoc.y + headVec.y * muzzleOffset,
            z: headLoc.z + headVec.z * muzzleOffset
        };

        // 作った角度の向きにサンタをスポーン
        const bulletSanta = this.dim.spawnEntity("edu:santa_claus_red", spawnPos);
        bulletSanta.setRotation({x: pitch, y: yaw});

        // サンタの頭の向きを変更
        bulletSanta.triggerEvent("start_shoot");
        
        return {bulletSanta, spawnPos};
    }

    /** サンタを飛ばす */
    _fireBulletSanta(bulletSanta, spawnPos, targetPos) {
        moveEntity(bulletSanta, spawnPos, targetPos, 1);
    }

    /**
     * 着弾チェック
     * @param {entity} bulletSanta 
     * @param {{x: number, y: number, z: number}} targetPos 
     * @param {boolean} isHit 
     */
    _startCheckHit(bulletSanta, inputPos) {
        const fireTime = Date.now();

        this.hitEventListener = system.runInterval(() => {
            const dist = LOCATION_UTILS.distance(bulletSanta.location, inputPos);

            if(dist < 1) {
                const hitPos = this._checkPosIncluded(inputPos.x, inputPos.y, inputPos.z);
                if(hitPos) {
                    this._hitEnemy(bulletSanta, inputPos);
                    this._stopCheckHit();
                }
            }

            if(Date.now() - fireTime > 3000) {
                this._miss(bulletSanta);
                this._stopCheckHit();
            }
        }, 10);
    }

    _stopCheckHit() {
        try {
            system.clearRun(this.hitEventListener);
            this.hitEventListener = null;
        } catch (error) {
            console.warn(`can't clear hitEvent`, error);
        }
    }

    /** チャットで入力した値が配列に含まれるかを返す */
    _checkPosIncluded(x, y, z) {
        return this.enemyPositions.find(p => 
            p.x === x && p.y === y && p.z === z
        ) ?? null;
    }

    /** 入力した座標が0-9か確認する */
    _checkPosInRange(x, y, z) {
        return 0 <= x && x <= 9 &&
               0 <= y && y <= 9 &&
               0 <= z && z <= 9;
    }

    /** 爆発演出 */
    _hitEnemy(bulletSanta, hitPos) {
        const hitBlock = this.dim.getBlock(hitPos);

        // 爆発
        bulletSanta.playAnimation("minecraft:wind_explosion_emitter");
        this.dim.playSound("random.explode", bulletSanta.location);

        // スコア加算
        this.score++;

        system.run(() => {
            hitBlock.setType("minecraft:air");
            bulletSanta.remove();
            broadcastChat(`§cヒット！`);
        });
    }

    /** 外れ演出 */
    _miss(bulletSanta) {

        // スコアを減らす
        this.score = Math.max(0, this.score--);

        system.run(() => {
            bulletSanta.remove();
            broadcastChat(`§bはずした・・・`);
        });
    }

    /** チャット入力時に実行 */
    _shootSequence(x, y, z) {
        if(!this.cannon) return;

        if(!this._checkPosInRange(x, y, z)) {
            this._errorCannon();
            return;
        };

        const inputPos = {x: x, y: y, z: z};

        // 砲身を向ける
        const {headLoc, headVec} = this._aimCannon(x, y, z);

        // 発射
        system.runTimeout(() => {
            this.cannon.playAnimation("shoot");
            const {bulletSanta, spawnPos} = this._spawnBulletSanta(headLoc, headVec);
            this._fireBulletSanta(bulletSanta, spawnPos, inputPos);
    
            // 着弾確認開始
            this._startCheckHit(bulletSanta, inputPos);
        }, 20 * 1);

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

            const blockSpawner = this.blockSpawner;

            // 部屋の初期化、移動シーケンス
            await TransitionManager.openDoorSequence( 
                missionSpawnLocation,
                "tp",
                () => {blockSpawner.clearFurniture()}
            );

            // ロビー扉を再度有効に
            GameEntranceManager.isStarting = false;

            // ゲームスタートイベントの購読開始
            this.state = "READY";
            if(this.debug) console.log("[Mission] READY");

            broadcastTitle(`コマンドでゲームスタート`, `edu:goとにゅうりょくしよう`);
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
            system.run(() => {
                broadcastTitle(`§c§lゲームスタート！`, `${this.limitTime}いないに${this.clearScoreByLevel}たいたおせ！`);
            });

            // 敵スポーン
            this.enemySpawnHandle = system.runInterval(() => this._spawnEnemy(), 20 * this.spawnInterval);

            // 制限時間終了
            system.runTimeout(() => this.endGame(), 20 * this.limitTime);

            if(this.debug) console.log("[Mission] START");
        }

        /** 必要数を撃破した時 */
        async _onGoalReached(player) {
            this.elapsedMs = this._stopTimer();

            // シナリオ進行などはここで発火
            this.state = "ENDED";
            this.emit("gameEnded", {
                gameKey: this.gameKey,
                currentLevel: this.currentLevel,
                elapsedMs: this.elapsedMs
            });

            if(this.debug) console.log(`game cleared`);

            broadcastTitle(`§cクリア！！`, `ひつようすうをげきはした！`);

            system.runTimeout(() => {
                // ロビーへ戻る処理
                this.endGame(player, {isClear: true});
            }, 20 * 3);
        }

        /** ゲーム終了時の共通処理 */
        async endGame({isClear = false} = {}) {
            // タイマーが起動していた場合はストップ
            this._stopTimer();

            // spawnLocationをリセット
            PlayerManager.setSpawnPointForAll(lobbySpawnLocation);

            // PlayerDataのSpawnLocationを更新
            PlayerStorage.setDirtyPlayers();

            // 現在のGameManagerインスタンスをクリア
            ScenarioManager.currentGameManager = null;

            // 扉を再生成
            GameEntranceManager.spawnEntrance("game2");

            // クリアの場合はコールバック関数を渡す
            let callback = () => {};
            let isFirstClear = false;
            if(isClear) {

                // コールバックにクリア時ムービー追加
                callback = () => {
                    isFirstClear = PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel, this.elapsedMs);
                    if(this.debug) console.log(`is first clear: ${isFirstClear}`);
                    if(isFirstClear) ScenarioManager.triggerScenarioEvent("game3", player);
                }
            }else {
                broadcastTitle(`§bタイムオーバー・・・`, `ふしぎなちからでロビーへもどされる！！`);
            }

            // ロビーへ移動シーケンス
            await TransitionManager.openDoorSequence(
                lobbySpawnLocation,
                "tp",
                callback
            );
        }

}
