// PlayerDataの操作(保存・ロード)
// カプセル化のためクラスにしているが、基本的にstaticのみ

import { PlayerData } from "./PlayerData";

class PlayerStorage {
    static players = new Map(); // key: playerId, value: PlayerData ゲーム中の保存用
    static DATA_KEY = "edu:player_data";

    /** Dynamic Propertyをロード プレイヤーがワールドに参加した時実行 */
    static loadPlayerData(player) {
        const playerDataJSON = player.getDynamicProperty(this.DATA_KEY);
        let playerData;

        if(playerDataJSON) {
            try {
                playerData = PlayerData.dataFromJson(player, playerDataJSON);
            } catch (error) {
                console.warn(`プレイヤー${player.name}のデータ破損 再生成中...`);
                playerData = new PlayerData(player);
                playerData.save.needsSave = true;
            }
        }
        else {
            playerData = new PlayerData(player);
            playerData.save.needsSave = true;
        }

        this.players.set(player.id, playerData);
    }

    /** プレイヤーデータをjson化してDynamic Propertyにセーブ */
    static savePlayerData(player) {
        let playerData = this.players.get(player.id);

        if(!playerData) {
            console.warn(`プレイヤー${player.name}のデータ未検出 再生成中...`);
            this.loadPlayerData();
            playerData = this.players.get(player.id);
        }

        const playerDataJSON = playerData.dataToJson();
        player.setDynamicProperty(this.DATA_KEY, playerDataJSON);
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