// 脱出型ゲーム

import { GameManagerBase } from "./gameManagerBase";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { PlayerManager } from "../player/playerManager";
import { TransitionManager } from "../transitions/transitionManager";
import { gameSpawnLocation, lobbySpawnLocation } from "../configs/playerConfig";

export class ExitGameManager extends GameManagerBase {
    constructor(options) {
        super(options);
        this.currentLevel = 1;
        this.currentProgress = 0;
        this.requiredRoomCount = options.config?.requiredRoomCount || 3;
    }

    /**
     * ゲーム開始の処理(ゲームルーム入室時)
     * 扉を通る演出⇒テレポート⇒ゲームルームへ
     * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
     * @returns 
     */
    async startGame() {
        if(this.state !== "READY") {
            console.warn(`can't start game state = ${this.state}`);
            PlayerManager.teleportAllPlayersToLastLocation();
            return;
        }
        this.state = "TRANSITIONING";

        await TransitionManager.openDoorSequence(
            gameSpawnLocation,
            () => this.roomManager.generateRoom("gameRoom", this.currentLevel)
        );

        this._startTimer();

        this.state = "RUNNING";
    }

    /**
     * 各部屋のミッションをクリアした時(正しい扉を開けたとき)
     * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
     */
    async onRoomCleared(player) {
        this.currentProgress += 1;
        PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);

        if(this.currentProgress > this.requiredRoomCount) {
            await this._onGoalReached(player);
        } else {
            await TransitionManager.openDoorSequence(
                gameSpawnLocation,
                () => this.roomManager.generateRoom("gameRoom", this.currentLevel)
            );
        }
    }

    /**
     * 間違えた扉を開けたらスタートルームに戻す
     * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
     */
    async onRoomFailed(player) {
        this.currentProgress = 0;
        PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);
        await TransitionManager.openDoorSequence(
            gameSpawnLocation,
            () => this.roomManager.generateRoom("startRoom")
        );
    }

    /**
     * ゴール処理
     */
    async _onGoalReached() {
        this.elapsedMs = this._stopTimer();
        PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel);

        await TransitionManager.openDoorSequence(
            lobbySpawnLocation,
            () => this.roomManager.generateRoom("goalRoom")
        );

        // シナリオ進行などはここで発火
        this.state = "ENDED";
    }
}
