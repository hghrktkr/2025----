import { world } from "@minecraft/server";

// ロード時の初期処理
world.afterEvents.worldLoad.subscribe(() => {

});

// プレイヤーがワールドに参加したとき
world.afterEvents.playerSpawn.subscribe((ev) => {
    const {player, initialSpawn} = ev;
});