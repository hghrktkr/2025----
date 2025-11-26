// プレイヤーの保存用データ設計

import { world } from "@minecraft/server";
import { gameSpawnLocation, lobbySpawnLocation } from "../configs/playerConfig";


function createGameProgress() {
    return {
        lv1: { cleared: false, currentProgress: 0, clearTime: 0 },
        lv2: { cleared: false, currentProgress: 0, clearTime: 0 },
        lv3: { cleared: false, currentProgress: 0, clearTime: 0 },
        spawnLocation: gameSpawnLocation;
    };
}

export class PlayerData {
    constructor(player) {
        // 基本情報
        this.id = player.id;
        this.name = player.name;
        this.spawnLocation = lobbySpawnLocation;

        // シナリオ進行
        this.scenario = {
        currentScenarioId: "opening",   // opening ⇒ game1 ⇒ game2 ⇒ game3 ⇒ ending
        flags: {}  // 各シナリオ中のフラグ格納
        };

        // 各ゲームの進捗
        this.game1 = createGameProgress();
        this.game2 = createGameProgress();
        this.game3 = createGameProgress();

        // セーブデータ管理
        this.save = {
        needsSave: false,   // dirtyFlag
        dateTime: "",     // dateTime型 データメンテ用
        version: 1
        };
    }

    /** プレイヤーデータをjson化 */
    dataToJSON() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            lastLocation: this.lastLocation,
            scenario: this.scenario,
            game1: this.game1,
            game2: this.game2,
            game3: this.game3,
            save: this.save
        });
    }
    
    /** タイムスタンプ、バージョン、needsSave更新 */
    markSaved() {
        const now = new Date();
        this.save.dateTime = now;
        this.save.version += 1;
        this.save.needsSave = false;
    }
    
    /** jsonデータからインスタンス生成 インスタンス化前に実行する必要があるためstatic */
    static dataFromJson(player, jsonString) {
        const data = JSON.parse(jsonString);
        const playerData = new PlayerData(player);
        Object.assign(playerData, data);
        return playerData;
    }
    
}