import { world } from "@minecraft/server";
import { PlayerManager } from "./player/playerManager";

// ロード時の初期処理
world.afterEvents.worldLoad.subscribe(() => {
    PlayerManager.initialize();
});

// プレイヤーがワールドに参加したとき
world.afterEvents.playerSpawn.subscribe((ev) => {
    const {player, initialSpawn} = ev;
});