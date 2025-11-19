// PlayerDataの操作(保存・ロード)
// カプセル化のためクラスにしているが、基本的にstaticのみ

import { PlayerData } from "./PlayerData";

export class PlayerStorage {
    static players = new Map(); // key: playerId, value: { Player, data: PlayerData } ゲーム中の参照用
    static DATA_KEY = "edu:player_data";

    /** Dynamic Propertyをロード プレイヤーがワールドに参加した時実行 */
    static loadPlayerData(player) {
        const playerDataJSON = player.getDynamicProperty(this.DATA_KEY);
        let playerData;
        if(playerDataJSON) {
            try {
                console.log('プレイヤーデータ発見 ロード中...');
                playerData = PlayerData.dataFromJson(player, playerDataJSON);
            } catch (error) {
                console.warn(`データ破損 プレイヤー名: ${player.name}`);
            }
        }
        else {
            console.log('プレイヤーデータ新規作成中...');
            playerData = new PlayerData(player);
        }
        playerData.save.needsSave = true;
        this.players.set(player.id, { player, data: playerData });
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

    /** プレイヤー退出時 */
    static onPlayerLeave(player) {
        this.savePlayerData(player);
        this.players.delete(player.id);
    }

    static get(player) {
        return this.players.get(player.id);
    }
}