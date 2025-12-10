import { system, world } from "@minecraft/server";
import { PlayerStorage } from "../player/playerStorage";
import { signConfig } from "../configs/signConfig";
import { ActionFormData } from "@minecraft/server-ui";

export class ResultManager {
    static resultEventListener = null;    // 表示イベント

    static showResult() {
        // 看板インタラクト時
        this.resultEventListener = world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
            const { block, player } = ev;

            // ブロックが看板かどうかをチェック（必要なら種類を追加）
            if (!block.typeId.includes("sign")) return;

            const coordinates = `${block.location.x},${block.location.y},${block.location.z}`;
            const gameKey = signConfig[coordinates];
            if (!gameKey) return; // 紐づくゲームがなければ何もしない

            ev.cancel = true; // 看板編集UIを出さない

            const entry = PlayerStorage.get(player);  
            if (!playerData) return;

            const playerData = entry.data;
            this.showHighScoreForm(player, playerData, gameKey);
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
            console.warn(`can't find player data: ${player.name}`);
            return;
        }

        const form = new ActionFormData()
            .title(`ハイスコア`)
            .body(this.makeScoreText(progress))
            .button(`OK`);
        
        system.run(() => {
            form.show(player);
        })
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