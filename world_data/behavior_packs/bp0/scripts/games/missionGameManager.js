// ミッション型ゲーム
import { GameManagerBase } from "./gameManagerBase";
import { PlayerProgressManager } from "../player/playerProgressManager";
import { PlayerManager } from "../player/playerManager";
import { TransitionManager } from "../transitions/transitionManager";

export class MissionGameManager extends GameManagerBase {
    constructor(options) {
        super(options);
        this.currentLevel = 1;
        this.currentProgress = 0;
        this.missionCount = options.config?.missionCount || 3; // レベルごとのミッション数
    }

    /* -------------------------
       ゲーム開始
    ------------------------- */
    async startGame(player) {
        if(this.state !== "READY") {
            console.warn(`can't start game state = ${this.state}`);
            PlayerManager.teleportAllPlayersToLastLocation();
            return;
        }

        this.state = "TRANSITIONING";

        // 最初のゲームルーム（ミッション1）を生成
        await TransitionManager.openDoorSequence(
            this.roomManager.getSpawnLocation("gameRoom", this.currentLevel, true), // ミッション型は常にノーマル部屋
            () => this.roomManager.generateRoom("gameRoom", this.currentLevel, true)
        );

        this._startTimer();
        this.state = "RUNNING";
    }

    /* -------------------------
       ミッションクリア時
    ------------------------- */
    async onMissionCleared(player) {
        this.currentProgress += 1;
        PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);

        if(this.currentProgress >= this.missionCount) {
            await this._onGoalReached(player);
        } else {
            // 次のミッションルームを順番に生成
            await TransitionManager.openDoorSequence(
                this.roomManager.getSpawnLocation("gameRoom", this.currentLevel, true),
                () => this.roomManager.generateRoom("gameRoom", this.currentLevel, true)
            );
        }
    }

    /* -------------------------
       ミッション失敗時
    ------------------------- */
    async onMissionFailed(player) {
        this.currentProgress = 0;
        PlayerProgressManager.setCurrentProgressForAll(this.gameKey, this.currentLevel);

        await TransitionManager.openDoorSequence(
            this.roomManager.getSpawnLocation("startRoom"),
            () => this.roomManager.generateRoom("startRoom")
        );
    }

    /* -------------------------
       ゴール到達時
    ------------------------- */
    async _onGoalReached(player) {
        this.elapsedMs = this._stopTimer();
        PlayerProgressManager.setClearResultForAll(this.gameKey, this.currentLevel);

        await TransitionManager.openDoorSequence(
            this.roomManager.getSpawnLocation("goalRoom"),
            () => this.roomManager.generateRoom("goalRoom")
        );

        // シナリオ進行など
        this.state = "ENDED";
    }
}
