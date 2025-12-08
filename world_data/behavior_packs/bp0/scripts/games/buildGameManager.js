import { GameManagerBase } from "./gameManagerBase";
import { buildGameConfig } from "../configs/buildGameConfig";
import { returnGateConfig } from "../configs/entrancePictureConfig";
import { world } from "@minecraft/server";
import { EntranceSpawner } from "../spawners/entranceSpawner";
import { ChestManager } from "../utils/chestManager";
import { GameRuleManager } from "../utils/gameRuleManager";
import { lobbySpawnLocation } from "../configs/playerConfig";

// 建築ゲーム管理クラス

export class BuildGameManager extends GameManagerBase {
    constructor(options) {
        super(options);

        this.config = buildGameConfig;  // 座標、アイテムリスト関係
        this.frameConfig = returnGateConfig.frame;  // ゲート作成用（枠）
        this.gateConfig = returnGateConfig.gate;    // ゲート作成用（fake_portal）
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
            this.config.playerSpawnPos,
            "tp",
            () => {}
        );

        // 初回設定が実行されているかDynamic Propertyを参照
        const initialized = world.getDynamicProperty("buildGameInitialized");

        // 初回のみ実行
        if(!initialized) {
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
    

    
            // チェスト生成・監視スタート
            dim.setBlockType(this.config.chest.pos, "minecraft:chest");
            const chest = dim.getBlock(this.config.chest.pos);
            const chestConfig = this.config.chest;
            const chestManager = new ChestManager(dim, chest, chestConfig);
            chestManager.setUp();
            chestManager.start();
    
            // ダイアログ開始

            // 初回実行済み判定
            world.setDynamicProperties("buildGameInitialized", true);
        }

        // markerは毎回スポーンさせる
        EntranceSpawner.spawnEntrance("game3Return");
    }

    async quitGame() {
        GameRuleManager.startLobbySettings();

        // 移動シーケンス
        await TransitionManager.openDoorSequence( 
            lobbySpawnLocation,
            "tp",
            () => {}
        );

    }

    spawnSanta(dim) {
        const santa = this.config.santa;
        system.run(() => {
            const npc = dim.spawnEntity(santa.id, santa.pos);
            npc.rotation = santa.rotation;

            // 会話スタートの便宜のためタグ付与
            npc.addTag("npc");
        })
    }

}