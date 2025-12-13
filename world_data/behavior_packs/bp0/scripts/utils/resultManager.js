import { system, world } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { signConfig } from "../configs/signConfig";
import { ActionFormData } from "@minecraft/server-ui";
import { broadcastChat } from "./helpers";

export class ResultManager {
    static resultEventListener = null;    // 表示イベント
    static isShowing = false;             // 多重実行防止
    static showingPlayers = new Set();    // スコア閲覧中のプレイヤー

    /** 看板をインタラクトするとリザルトを表示する */
    static showResult() {
        if(this.resultEventListener) this.stopShowResult(); // 既に存在する場合は一度消去

        this.resultEventListener =
            world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
                const { block, player } = ev;

                if (!block.typeId.includes("sign")) return;

                const coordinates = `${block.location.x},${block.location.y},${block.location.z}`;
                const gameKey = signConfig[coordinates];
                if (!gameKey) return;

                ev.cancel = true;

                // プレイヤー単位で多重実行防止
                if (this.showingPlayers.has(player.id)) return;
                this.showingPlayers.add(player.id);

                const entry = PlayerStorage.get(player);
                if (!entry) {
                    this.showingPlayers.delete(player.id);
                    return;
                }

                this.showHighScoreForm(player, entry.data, gameKey);
            });
    }


    static stopShowResult() {
        if(this.resultEventListener !== null) {
            system.run(() => {
                world.beforeEvents.playerInteractWithBlock.unsubscribe(this.resultEventListener);
                this.resultEventListener = null;
            });
        }
    }

    /**
     * ハイスコアのフォームを作成して表示
     * @param {player} player 
     * @param {object} playerData 
     * @param {string} gameKey game1 | game2 | game3
     * @returns 
     */
    static showHighScoreForm(player, playerData, gameKey) {
        const progress = playerData[gameKey];
        if(!progress) {
            this.showingPlayers.delete(player.id);
            return;
        }

        const form = new ActionFormData()
            .title("ハイスコア")
            .body(this.makeScoreText(progress))
            .button("OK");

        system.run(() => {
            form.show(player)
                .then(() => {
                    // フォームを閉じたら解除
                    this.showingPlayers.delete(player.id);
                })
                .catch(() => {
                    // 念のため
                    this.showingPlayers.delete(player.id);
                });
        });
    }


    static makeScoreText(progress) {
        return [
            "§e=== ハイスコア ===",
            `§bLv1: §f${this.formatTime(progress.lv1.clearTime)} (${progress.lv1.cleared ? "Clear" : "未クリア"})`,
            `§bLv2: §f${this.formatTime(progress.lv2.clearTime)} (${progress.lv2.cleared ? "Clear" : "未クリア"})`,
            `§bLv3: §f${this.formatTime(progress.lv3.clearTime)} (${progress.lv3.cleared ? "Clear" : "未クリア"})`,
        ].join("\n");
    }

    static formatTime(ms) {
        if (!ms || ms === 0) return "-";
        const sec = (ms / 1000).toFixed(2);
        return `${sec}秒`;
    }
}