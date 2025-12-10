import { GameManagerBase } from "./gameManagerBase";
import { buildGameConfig } from "../configs/buildGameConfig";
import { returnGateConfig } from "../configs/entrancePictureConfig";
import { world, system } from "@minecraft/server";
import { EntranceSpawner } from "../spawners/entranceSpawner";
import { ChestManager } from "../utils/chestManager";
import { GameRuleManager } from "../utils/gameRuleManager";
import { buildSpawnLocation, lobbySpawnLocation } from "../configs/playerConfig";
import { PlayerManager } from "../player/playerManager";
import { moveEntity, setPermission } from "../utils/transitionEffect";
import { broadcastTitle } from "../utils/helpers";
import { TransitionManager } from "../transitions/transitionManager";
import { GameEntranceManager } from "./gameEntranceManager";
import { TEST_MODE } from "../configs/testModeFlag";

// 建築ゲーム管理クラス

class BuildGameManager extends GameManagerBase {
    constructor(options) {
        super(options);

        this.config = buildGameConfig;  // 座標、アイテムリスト関係
        this.frameConfig = returnGateConfig.frame;  // ゲート作成用（枠）
        this.gateConfig = returnGateConfig.gate;    // ゲート作成用（fake_portal）
        this.chestManager = null;                   // チェスト監視用
        this.santa = null;                          // スポーンしたサンタ
        this.isSantaDespawned = false;              // サンタがジェットで飛んでいったか
        this.isAreaGuard = false;                   // 禁止エリアを監視しているか
        this.guard = null;                          // 監視インターバル
    }

    /**
     * 初期化
     * @param {player} player ゲートをくぐったプレイヤー
     */
    async init(player) {
        const dim = world.getDimension(this.config.dimension);

        // プレイヤーのルールを変更
        GameRuleManager.startBuildSettings();


        // 移動シーケンス
        await TransitionManager.openDoorSequence( 
            buildSpawnLocation,
            "tp",
            () => {}
        );

        // スポーン地点更新
        PlayerManager.setSpawnPointForAll(buildSpawnLocation);

        // 初回設定が実行されているかDynamic Propertyを参照
        const initialized = world.getDynamicProperty("buildGameInitialized");

        // 初回のみ実行
        if(!initialized) {
            if(TEST_MODE.CONFIG) console.log(`initializing...`);

            // すでにサンタがいる場合は消しておく
            const spawnedNpcs = dim.getEntities({
                type: "edu:santa_claus_red"
            });

            for(const spawnedNpc of spawnedNpcs) {
                spawnedNpc.remove();
            }

            // サンタのスポーン
            this.spawnSanta(dim);
    
            // 帰りのゲートの作成
    
            //枠
            EntranceSpawner.spawnGate(
                this.frameConfig.startPos,
                this.frameConfig.endPos,
                this.frameConfig.dimension,
                this.frameConfig.blockType
            );
    
            // fake_portal
            EntranceSpawner.spawnGate(
                this.gateConfig.startPos,
                this.gateConfig.endPos,
                this.gateConfig.dimension,
                this.gateConfig.blockType
            );
    
            // チェスト生成
            dim.setBlockType(this.config.chest.pos, "minecraft:chest");
            const chest = dim.getBlock(this.config.chest.pos);
            const chestConfig = this.config.chest;
            this.chestManager = new ChestManager(dim, chest, chestConfig);
            this.chestManager.setUp();
            
            // ダイアログ変更
            system.run(() => {
                dim.runCommand(`dialogue change @e[tag=npc] talk1`);
            });
            
            // イベントのリッスン開始
            this.jetSequence();

            broadcastTitle("サンタクロースにはなしかけよう！");
            
            // 初回実行済み判定
            world.setDynamicProperty("buildGameInitialized", true);
        }

        // 帰還用マーカースポーン
        GameEntranceManager.spawnEntrance("game3Return");

        // ゲームの再開時など、chestManagerが消えた場合は再生成
        if(!this.chestManager) {
            dim.setBlockType(this.config.chest.pos, "minecraft:chest");
            const chest = dim.getBlock(this.config.chest.pos);
            const chestConfig = this.config.chest;
            this.chestManager = new ChestManager(dim, chest, chestConfig);
            this.chestManager.setUp();
        }
        // チェスト監視
        this.chestManager.start();

        // ロビー扉を再度有効に
        GameEntranceManager.isStarting = false;

        // 禁止エリアの監視
        this.startAreaGuard();
    }

    /** 退室処理 */
    async quitGame() {
        if(TEST_MODE.CONFIG) console.log(`quitting game3`);

        // 禁止エリアの監視ストップ
        this.stopAreaGuard();

        GameRuleManager.startLobbySettings();

        await system.waitTicks(10);
        

        // チェスト監視停止
        if (this.chestManager) {
            this.chestManager.stop();
        }

        // 移動シーケンス
        await TransitionManager.openDoorSequence( 
            lobbySpawnLocation,
            "tp",
            () => {
                PlayerManager.setSpawnPointForAll(lobbySpawnLocation);
                GameEntranceManager.spawnEntrance("game3");
                GameEntranceManager.isStarting = false;
            }
        );

    }

    /** サンタのスポーン */
    spawnSanta(dim) {
        const santaInfo = this.config.santa;
        system.run(() => {
            this.santa = dim.spawnEntity(santaInfo.id, santaInfo.pos);
            this.santa.rotation = santaInfo.rotation;

            // 会話スタートの便宜のためタグ付与
            this.santa.addTag("npc");
        })
    }

    /** start_jetイベントをリッスンしてサンタをジェットで飛ばす */
    jetSequence() {
        world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
            if(this.isSantaDespawned) return;

            const eventId = ev.eventId;
            const players = world.getPlayers();

            if(!this.santa || eventId !== "start_jump") return;

            const startPos1 = this.config.santa.pos;
            const endPos1 = {
                x: startPos1.x,
                y: startPos1.y + 1,
                z: startPos1.z
            };

            // 1.ちょっと飛ばす
            system.run(() => {
                // 権限変更
                for(const player of players) {
                    setPermission(player, false);
                }

                PlayerManager.playSoundForAll("edu.hohoho");
                moveEntity(this.santa, startPos1, endPos1, 2);
            });

            const startPos2 = {...endPos1};
            const endPos2 = {
                x: startPos2.x,
                y: startPos2.y + 30,
                z: startPos2.z
            };

            // 2.上空まで飛ばす
            system.runTimeout(() => {
                PlayerManager.playSoundForAll("edu.launch");
                moveEntity(this.santa, startPos2, endPos2, 3);
            }, 20 * 4);

            // 3.サンタをデスポーン
            system.runTimeout(() => {
                this.santa.triggerEvent("despawn");
            }, 20 * 8);

            // 4.タイトル表示
            system.runTimeout(() => {
                // 権限変更
                for(const player of players) {
                    setPermission(player, true);
                }

                broadcastTitle("けんちくしよう！", "えんとつのあるいえをたてよう");
                this.isSantaDespawned = true;
                GameEntranceManager.spawnEntrance("game3Return");
            }, 20 * 10)
        });
    }

    /** 禁止エリアの監視スタート */
    startAreaGuard() {
        if(this.isAreaGuard) return;
        this.isAreaGuard = true;
        if(TEST_MODE.CONFIG) console.log(`guard starting...`);
        if(TEST_MODE.CONFIG) console.log("startAreaGuard this:", this);

        this.guard = system.runInterval(() => {
            for(const player of world.getAllPlayers()) {
                const {x, z} = player.location;

                const inArea =
                    this.config.forbiddenArea.xStart <= x && x <= this.config.forbiddenArea.xEnd &&
                    this.config.forbiddenArea.zStart <= z && z <= this.config.forbiddenArea.zEnd;
                
                if(inArea) {
                    // テレポート
                    TransitionManager.openDoorSequence(
                        buildSpawnLocation,
                        "tp",
                        () => {
                            broadcastTitle("ふしぎなちからでもどされてしまった！", "ちかづけないようだ・・・");
                        }
                    );
                }
            }
        }, 20);
        if(TEST_MODE.CONFIG) console.log(`guard: ${this.guard}`);
    }

    /** 禁止エリアの監視ストップ */
    stopAreaGuard() {
        if(TEST_MODE.CONFIG) console.log("stopAreaGuard this:", this);
        if (this.guard !== null) {
            try {
                if (TEST_MODE.CONFIG) console.log(`guard: ${this.guard} clearing...`);
                system.clearRun(this.guard);
            } catch (e) {
                console.warn("Failed to clear guard:", e);
            }
        } else {
            if (TEST_MODE.CONFIG) console.log("guard was already null (no interval running)");
        }

        this.guard = null;
        this.isAreaGuard = false;
    }

}

export const buildGameManager = new BuildGameManager();