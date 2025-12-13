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
import { system, world } from "@minecraft/server";
import { broadcastChat, broadcastTitle } from "../utils/helpers";
import LOCATION_UTILS from "../utils/locationUtils";
import { GameEntranceManager } from "./gameEntranceManager";

export class MissionGameManager extends GameManagerBase {
    constructor(options) {
        super(options);

        this.currentLevel = options.config?.currentLevel || 1;
        this.requiredRoomCount = 1;                             // ステージは1つだけ

        // ======= ミッションゲーム固有データ =======
        this.roomSizeInfo = roomSizeInfo.missionGameRoom;       // startPos: {x: number, y: number, z: number}, size: {width: number, height: number}
        this.score = 0;
        
        this.dim = world.getDimension("overworld");

        this.gamePlayer = null;                                 // startGameで保存、チャットコマンドを入力したプレイヤー

        // 大砲関係
        this.cannon = null;                                     // 大砲エンティティ
        this.hitEventListener = null;                           // 着弾管理
        this.bullets = new Map();                               // id: entity.id, value: {entity, targetPos, fireTime}
        
        // ゲーム難易度設定
        this.infoByLevel = gameLevel.game2[this.currentLevel];
        this.enemyLifeTime = this.infoByLevel.enemyLifeTime;    // 1体の生存時間（s）
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

        // パーティクル保存
        this.particleIntervals =  [];

        
        
    }

    /* -------------------------
       データ操作関係・クラス内メソッド
    ------------------------- */

    /** エネミーブロックの生成・消失 */
    _spawnEnemy() {

        // ランダムなブロックをランダムな位置に生成
        const {chosenType, pos} = this.blockSpawner.generateRandomOne();
        if(!chosenType || !pos) {
            console.warn(`[spawnEnemy] chosenType, posが存在しません`);
        }

        // 座標を保存（当たり判定用）
        if (!this.enemyPositions.some(p => p.x === pos.x && p.y === pos.y && p.z === pos.z)) {
            this.enemyPositions.push(pos);
            if(this.debug) console.log(`[spawnEnemy] (${pos.x}, ${pos.y}, ${pos.z})をpushしました`);
        }

        // 時間で消える
        system.runTimeout(() => {
            const block = this.dim.getBlock(pos);
            if(!block) {
                if(this.debug) console.log(`[spawnEnemy] block が存在しません`);
            }

            // ブロックがまだ存在した場合は消す
            if(block && block.typeId === chosenType) {
                block.setType("minecraft:air");
            }

            this.enemyPositions = this.enemyPositions.filter(p => p !== pos);

        }, 20 * this.enemyLifeTime);
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
            this.cannon = this.dim.spawnEntity(type, entityPos,{
                initialRotation: rot
            });
            this.cannon.setRotation({x: 0, y: rot});
            if(this.debug) console.log(`[_spawnCannon] spawned`);
        });
    }

    /**
     * 砲身を向ける
     * @param {number} x 
     * @param {number} y 
     * @returns 砲身のheadの位置と向き
     */
    _aimCannon(x, y) {
        if(!this.cannon) {
            console.warn(`can't find cannon`);
            return;
        }

        // x, y, zを座標に
        const startPos = roomSizeInfo.missionGameRoom.startPos;
        const targetPos = {
            x: startPos.x + x,
            y: startPos.y + y,
            z: startPos.z
        };

        if(this.debug) console.log(`[_aimCannon] targetPos: (${targetPos.x}, ${targetPos.y}, ${targetPos.z})`);

        // targetPosを向かせる
        system.run(() => {
            this.cannon.lookAt(targetPos);
            if(this.debug) console.log(`[_aimCannon] cannon pitch: ${this.cannon.getRotation().x}, yaw: ${this.cannon.getRotation().y}`);
        });

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
        }, 1);
    }

    /**
     * 砲身の位置を基準にサンタをスポーン
     * @param {{x: number, y: number, z: number}} headLoc 砲身の頭の座標
     * @param {vector3} headVec 砲身の向きを表す位置ベクトル
     * @param {{x: number, y: number, z: number}} targetPos 着弾位置
     * @returns {bulletSanta: entity, spawnPos: {x: number, y: number, z: number}} サンタのエンティティとスポーン位置
     */
    _spawnBulletSanta(headLoc, headVec, targetPos) {

        // 砲身の先から出ているように見えるようにするためのオフセット
        const muzzleOffset = 0.8;

        const spawnPos = {
            x: headLoc.x + headVec.x * muzzleOffset,
            y: headLoc.y + headVec.y * muzzleOffset + 0.5,      // 高さだけ微調整
            z: headLoc.z + headVec.z * muzzleOffset
        };

        // 砲身の角度とサンタの向きを揃える
        const rot = Math.atan2(-1 * headVec.x, headVec.z) * 180 / Math.PI;

        // 作った角度の向きにサンタをスポーン
        let bulletSanta = null;

        // 一意なidを割り当て
        const santaId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        if(this.debug) console.log(`[_spawnBulletSanta] set id: ${santaId}`);

        system.run(() => {
            bulletSanta = this.dim.spawnEntity("edu:santa_claus_red", spawnPos, {
                initialRotation: rot
            });

            // 念のためsetRotationでも体の向きを設定
            bulletSanta.setRotation({x: 0, y: rot});

            // マップにサンタをセット
            this.bullets.set(santaId, {
                entity: bulletSanta,
                targetPos,
                fireTime: Date.now()
            });

            if(this.debug) console.log(`[_spawnBulletSanta] santa id: ${santaId}`);
            if(this.debug) console.log(`[_spawnBulletSanta] santa pitch: ${bulletSanta.getRotation().x}, yaw: ${bulletSanta.getRotation().y}`);

            // イベントをトリガーにサンタの体制を変更
            bulletSanta.triggerEvent("start_shoot");

            // 発射
            this._fireBulletSanta(santaId);
        });

        return santaId;
    }

    /**
     * サンタを飛ばす
     * @param {string} santaId サンタのentity id
     */
    _fireBulletSanta(santaId) {

        if(this.debug) console.log(`[_fireBulletSanta] received santa id: ${santaId}`);

        const {entity: bulletSanta, targetPos} = this.bullets.get(santaId);

        if(!bulletSanta) {
            console.warn(`[_fireBulletSanta] can't find santa ${santaId}`);
            return;
        }

        system.run(() => {
            try {
                bulletSanta.teleport(targetPos);
            } catch (error) {
                console.warn(`[_fireBulletSanta] failed to teleport ${santaId}`, error);
            }
        });
    }

    /** bulletsマップ内のサンタについて着弾チェック */
    _startCheckHit() {
        if(this.hitEventListener) return;

        this.hitEventListener = system.runInterval(() => {
            for(const [santaId, data] of this.bullets) {
                const {entity, targetPos, fireTime} = data;

                // 消えている場合はマップから削除
                if(!entity || !entity.isValid) {
                    this.bullets.delete(santaId);
                }

                const dist = LOCATION_UTILS.distance(entity.location, targetPos);

                // サンタが着弾位置に近づいたとき
                if(dist < 1) {
                    if(this._checkPosIncluded(targetPos)) {
                        this._hitEnemy(santaId, targetPos);
                    } else {
                        this._miss(santaId);
                    }

                    // いずれの場合もマップから削除
                    this.bullets.delete(santaId);
                    continue;   // ほかのサンタのチェックへ
                }

                // 時間経過で削除
                if(Date.now() - fireTime > 3000) {
                    this._miss(santaId);
                    this.bullets.delete(santaId);
                }
            }

            // サンタが0になったら停止
            if(this.bullets.size === 0) {
                system.clearRun(this.hitEventListener);
                this.hitEventListener = null;
            }
        }, 10);
    }

    /**
     * 砲弾の着弾位置がエネミーの座標リストに含まれているか
     * @param {{x: number, y: number, z: number}} targetPos 着弾位置
     * @returns {boolean}
     */
    _checkPosIncluded(targetPos) {
        const {x, y, z} = targetPos;
        return this.enemyPositions.find(p => 
            p.x === x && p.y === y && p.z === z
        ) ?? null;
    }

    /** 入力した座標が0-9か確認する */
    _checkPosInRange(x, y) {
        return 0 <= x && x <= 9 &&
               0 <= y && y <= 9;
    }

    /** 爆発演出 */
    _hitEnemy(santaId) {
        const {entity: bulletSanta, targetPos: hitPos} = this.bullets.get(santaId);
        const hitBlock = this.dim.getBlock(hitPos);

        if(!bulletSanta) {
            console.log(`[_hitEnemy] santa ${santaId} disappeared`);
            this.bullets.delete(santaId);
            return;
        }

        // 爆発
        this.dim.spawnParticle("minecraft:wind_explosion_emitter", hitPos);
        this.dim.playSound("edu.correct", this.cannon.location);

        // スコア加算
        this.score++;

        system.run(() => {
            hitBlock.setType("minecraft:air");
            bulletSanta.remove();
            broadcastChat(`§cヒット！`);
        });

        // 規定スコア達成でクリア処理
        if(this.score >= this.clearScoreByLevel) {
            this._onGoalReached();
        }
    }

    /** 外れ演出 */
    _miss(santaId) {
        const {entity: bulletSanta} = this.bullets.get(santaId);

        if(!bulletSanta) {
            console.log(`[_miss] santa ${santaId} disappeared`);
            this.bullets.delete(santaId);
            return;
        }

        // スコアを減らす
        this.score = Math.max(0, this.score - 1);

        system.run(() => {
            this.dim.playSound("edu.incorrect", this.cannon.location);
            bulletSanta.remove();
            broadcastChat(`§bはずした・・・`);
        });
    }

    /**
     * チャットコマンドで入力した値をもとに大砲発射
     * @param {player} player チャットを入力したプレイヤー
     * @param {number} width 入力したx方向の値
     * @param {number} height 入力したy方向の値
     * @returns 
     */
    _shootSequence(player, width, height) {
        if(!this.cannon) {
            console.warn(`[_shootSequence] can't find cannon`);
            return;
        };

        if(!this._checkPosInRange(width, height)) {
            this._errorCannon();
            return;
        };

        const startPos = roomSizeInfo.missionGameRoom.startPos;

        // startPosをもとに着弾位置の座標作成
        const inputPos = {
            x: startPos.x + width,
            y: startPos.y + height,
            z: startPos.z
        };

        // 砲身を向ける
        const {headLoc, headVec} = this._aimCannon(width, height);

        // 発射
        system.runTimeout(() => {
            this.cannon.playAnimation("shoot");
            const santaId = this._spawnBulletSanta(headLoc, headVec, inputPos);
    
            // 着弾確認開始
            this._startCheckHit();
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

            // cannonスポーン
            this._spawnCannon();

            // ゲームスタートイベントの購読開始
            this.state = "READY";
            if(this.debug) console.log("[Mission] READY");

            broadcastTitle(`コマンドでゲームスタート`, `/edu:goとにゅうりょくしよう`);
        }

        /** 開始処理 */
        startGame(player) {
            if (this.state !== "READY") {
                console.warn("MissionGame cannot start; state = " + this.state);
                return;
            }

            this.gamePlayer = player;

            // 念のためcannonがあるか確認、なければスポーン
            if(!this.cannon) this._spawnCannon();

            this.state = "RUNNING";
            this._startTimer();

            // タイトル表示
            let count = 3;
            let countInterval = system.runInterval(() => {
                if(count > 0) {
                    broadcastTitle(`§c§1${count}`);
                    PlayerManager.playSoundForAll("edu.beep");
                }
                else if(count === 0) {
                    broadcastTitle(`§c§lゲームスタート！`, `${this.limitTime}びょういないに${this.clearScoreByLevel}たいたおせ！`);
                    PlayerManager.playMusicForAll("edu.happy_christmas");
                    system.clearRun(countInterval);
                    countInterval = null;
                }
                else {
                    // 念のため消えてなければ確実に消す
                    if(countInterval) {
                        system.clearRun(countInterval);
                        countInterval = null;
                    }
                }
                count--;
            }, 20 * 1.3);

            // 敵スポーン
            this.enemySpawnHandle = system.runInterval(() => this._spawnEnemy(), 20 * this.spawnInterval);

            // 制限時間以内にステートがENDEDになっていなければ終了処理
            system.runTimeout(() => {
                if(this.state === "RUNNING") {
                    this.endGame();
                    this.state = "ENDED";
                }
            }, 20 * this.limitTime);

            if(this.debug) console.log("[Mission] START");
        }

        /** 必要数を撃破した時 */
        async _onGoalReached() {
            this.elapsedMs = this._stopTimer();

            // シナリオ進行などはここで発火
            this.state = "ENDED";
            this.emit("gameEnded", {
                gameKey: this.gameKey,
                currentLevel: this.currentLevel,
                elapsedMs: this.elapsedMs
            });

            if(this.debug) console.log(`[_onGoalReached] game cleared`);

            broadcastTitle(`§cクリア！！`, `ひつようすうをげきはした！`);

            system.run(() => {
                // ロビーへ戻る処理
                this.endGame({isClear: true});
            });
        }

        /** ゲーム終了時の共通処理 */
        async endGame({isClear = false} = {}) {
            // タイマーが起動していた場合はストップ
            this._stopTimer();
            PlayerManager.stopMusicForAll("edu.happy_christmas");
            PlayerManager.playSoundForAll("edu.gong");
            if(this.debug) console.log(`[endGame] isClear: ${isClear}`);

            // enemySpawnHandleを止める
            if(this.enemySpawnHandle) {
                system.clearRun(this.enemySpawnHandle);
            }
            this.enemySpawnHandle = null;

            // spawnLocationをリセット
            PlayerManager.setSpawnPointForAll(lobbySpawnLocation);

            // PlayerDataのSpawnLocationを更新
            PlayerStorage.setDirtyPlayers();

            // 現在のGameManagerインスタンスをクリア
            ScenarioManager.currentGameManager = null;

            // 現在のシナリオに合わせて扉を再生成
            const playerData = PlayerStorage.get(this.gamePlayer).data;
            

            // クリアの場合はコールバック関数を渡す
            let callback = () => {};
            let isFirstClear = false;

            if(isClear) {
                // 初回クリアならコールバックにクリア時ムービー追加
                callback = () => {
                    isFirstClear = PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel, this.elapsedMs);
                    PlayerManager.playMusicForAll("edu.jingle_bell");
                    if(this.debug) console.log(`[ednGame] is first clear: ${isFirstClear}`);
                    if(isFirstClear) {
                        ScenarioManager.triggerScenarioEvent("game3", this.gamePlayer);
                    }

                }
            }else {
                callback = () => {GameEntranceManager.spawnEntrance(playerData.scenario.currentScenarioId)};
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
