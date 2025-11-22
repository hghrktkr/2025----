// 脱出型ゲーム

import { GameManagerBase } from "./gameManagerBase";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { PlayerManager } from "../player/playerManager";
import { TransitionManager } from "../transitions/transitionManager";

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
    async startGame(player) {
        if(this.state !== "READY") {
            console.warn(`can't start game state = ${this.state}`);
            PlayerManager.teleportAllPlayersToLastLocation();
            return;
        }
        this.state = "TRANSITIONING";

        const isNormal = Math.random() < 0.5;
        await TransitionManager.openDoorSequence(
            this.roomManager.getSpawnLocation("gameRoom", this.currentLevel, isNormal),
            () => this.roomManager.generateRoom("gameRoom", this.currentLevel, isNormal)
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
            const isNormal = Math.random() < 0.5;
            await TransitionManager.openDoorSequence(
                this.roomManager.getSpawnLocation("gameRoom", this.currentLevel, isNormal),
                () => this.roomManager.generateRoom("gameRoom", this.currentLevel, isNormal)
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
            this.roomManager.getSpawnLocation("startRoom"),
            () => this.roomManager.generateRoom("startRoom")
        );
    }

    /**
     * ゴール処理
     * @param {Player} player 扉を開けたプレイヤー(PlayerData取得用)
     */
    async _onGoalReached(player) {
        this.elapsedMs = this._stopTimer();
        PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel);

        await TransitionManager.openDoorSequence(
            this.roomManager.getSpawnLocation("goalRoom"),
            () => this.roomManager.generateRoom("goalRoom")
        );

        // シナリオ進行などはここで発火
        this.state = "ENDED";
    }
}
