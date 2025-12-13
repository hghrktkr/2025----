// PlayerDataの永続化処理
// カプセル化のためクラスにしているが、基本的にstaticのみ

import { world } from "@minecraft/server";
import { PlayerData } from "./PlayerData";
import { TEST_MODE } from "../configs/testModeFlag";
import { system } from "@minecraft/server";
import { GameEntranceManager } from "../games/gameEntranceManager";
import { ScenarioManager } from "../scenario/scenarioManager";
import { TransitionManager } from "../transitions/transitionManager";
import { PlayerManager } from "./playerManager";

export class PlayerStorage {
    static players = new Map(); // key: playerId, value: { Player, data: PlayerData } ゲーム中の参照用
    static DATA_KEY = "edu:player_data";

    /** Dynamic Propertyをロード プレイヤーがワールドに参加した時実行 */
    static async loadPlayerData(player) {
        const playerDataJSON = player.getDynamicProperty(this.DATA_KEY);

        let playerData;
        if(playerDataJSON) {
            try {
                console.log('プレイヤーデータ発見 ロード中...');
                if(TEST_MODE.CONFIG) {
                    console.log(`===== load data =====`);
                    console.log(playerDataJSON);
                    console.log(`===============`);
                }
                playerData = PlayerData.dataFromJson(player, playerDataJSON);
            } catch (error) {
                console.warn(`データ破損 プレイヤー名: ${player.name}`);
            }
        }
        else {
            console.log('プレイヤーデータ新規作成中...');
            playerData = new PlayerData(player);
        }

        playerData.save.needsSave = true;   // セーブして更新

        // dimensionLocation作成
        const spawnData = playerData.spawnLocation;

        const dLoc = {
            dimension: world.getDimension(spawnData.dimension),
            x: spawnData.x,
            y: spawnData.y,
            z: spawnData.z
        };

        // Mapに登録
        if(TEST_MODE.CONFIG) console.log(`setting player id: ${player.id}`);
        this.players.set(player.id, { player, data: playerData });
        
        // ロビーへテレポート
        system.runTimeout(() => {
            if(TEST_MODE.CONFIG) console.log(`teleport to ( ${dLoc.x}, ${dLoc.y}, ${dLoc.z} )`);
            player.teleport({x: dLoc.x, y: dLoc.y, z: dLoc.z});    // ロビーにテレポート
            player.setSpawnPoint(dLoc);   // スポーンポイントをロビーに
        }, 10); // 権限問題回避のため遅延

        await TransitionManager.waitUntilChunkLoaded(dLoc.dimension, {x: dLoc.x, y: dLoc.y, z: dLoc.z});

        // シナリオに合わせて扉を出す
        const resumeScenario = playerData.scenario.currentScenarioId;
        GameEntranceManager.spawnEntrance(resumeScenario);

        // 音楽再生
        PlayerManager.playMusicForAll("edu.jingle_bell");

        // 新規ログインの場合、オープニングを流す
        if(resumeScenario === "opening") {
            system.runTimeout(() => {
                ScenarioManager.triggerScenarioEvent(resumeScenario, player);
            }, 40);
        }
    }

    /** プレイヤーデータをjson化してDynamic Propertyにセーブ */
    static savePlayerData(player) {
        let playerData = this.players.get(player.id).data;
        console.log(`player data: ${playerData.save.needsSave}, ${playerData.save.version}, ${playerData.save.dateTime}`);
        if(!playerData) {
            console.warn(`プレイヤー${player.name}のデータ未検出 再生成中...`);
            return;
        }
        playerData.markSaved();
        const playerDataJSON = playerData.dataToJSON();
        player.setDynamicProperty(this.DATA_KEY, playerDataJSON);
    }

    /** すべてのプレイヤーのsaveフラグをたてる */
    static setDirtyPlayers() {
        if(this.players.size === 0) return;
        for(const entry of this.players.values()) {
            const { player, data } = entry;
            if(data.save.needsSave) continue;
            data.save.needsSave = true;
            console.log(`player ${player.name} save flag turned true`);
        }
    }

    /** needsSaveがtrueのときにセーブ実行 シングルプレイヤー想定だが念のため全プレイヤー処理 */
    static saveDirtyPlayers() {
        if(this.players.size === 0) return;
        for(const entry of this.players.values()) {
            const { player, data } = entry;
            if(data.save.needsSave) {
                console.log(`player: ${player.name}`);
                console.log(`player data: ${data.save.needsSave}, ${data.save.version}, ${data.save.dateTime}`);
                PlayerStorage.savePlayerData(player);
                console.log(`player ${player.name} saved.`);
            }
        }
    }

    /** プレイヤーのDynamic Property削除　テストモードのみ可 */
    static resetPlayerData(player) {
        console.warn(`プレイヤー ${player.name}のデータをリセットします...`);

        player.setDynamicProperty(this.DATA_KEY, undefined);

        // テストモードでplayersのid一覧と削除プレイヤーのidをチェック
        if(TEST_MODE.CONFIG) {
            for(const entries of this.players) {
                const { player: mapPlayer } = entries;
                console.log(`map id: ${mapPlayer} / ${mapPlayer}`);
            }
        }

        // 渡したプレイヤーのidがあれば削除
        if(this.players.has(player.id)) {
            this.players.delete(player.id);
        }

        // 再度ロード(データ新規作成)
        this.loadPlayerData(player);
    }

    static get(player) {
        if(TEST_MODE.CONFIG) console.log(`search id: ${player.id}`);
        return this.players.get(player.id);
    }

    static makeDimensionLocation(data) {
        if(typeof data.dimension !== String) return;
        return {
            dimension: world.getDimension(data.dimension),
            x: data.x,
            y: data.y,
            z: data.z
        };
    }
}