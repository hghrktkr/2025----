// 各ゲーム進行の基底クラス

import { PlayerStorage } from "../player/playerStorage";

export class GameManagerBase {
    constructor({ roomManager, config = {} } = {}) {

        // 状態
        this.state = INIT;                                      // INIT, LOADING, READY, TRANSITIONING, RUNNING, PAUSE, ENDED
        this.currentScenarioId = null;                          // game1, game2, game3
        this.currentLevel = 1;                                  // 1 - 3
        this.currentProgress = 0;                               // 部屋の進行度
        this.requiredRoomCount = config.requiredRoomCount || 3; // ゴールまでの部屋数
        this.timer = null;                                      // { startAt: number, running: bool }
    }

    /* -------------------------
    ゲーム進行関係
     ------------------------- */
    
    onEnterStartRoom(player, spawnLocation) {
        if(!PlayerStorage.players.has(player.id)) {
            console.warn(`プレイヤーデータが見つかりません`);
            return;
        }
        const playerData = PlayerStorage.get(player).data;

        // PlayerData更新→セーブ
        playerData.lastLocation = spawnLocation;
        player.setSpawnPoint(spawnLocation);
        playerData.save.needsSave = true;

        this.currentLevel = this._setGameLevel(playerData);
    }


    /* -------------------------
    クラス内関数
     ------------------------- */

    /** このゲームの現在のレベルをPlayerDataをもとに返す */
    _setGameLevel(playerData) {
        const gameProgress = playerData[this._gameKey];
        if(!gameProgress.lv1.cleared) return 1;
        if(!gameProgress.lv2.cleared) return 2;
        if(!gameProgress.lv3.cleared) return 3;
        return 3;
    }


    /* -------------------------
    サブクラスでオーバーライド
     ------------------------- */
    
    /** 自身がどのゲームか指定する
     *  game1, game2, game3
     */
    _gameKey() {}
}