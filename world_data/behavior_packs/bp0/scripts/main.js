import { world } from "@minecraft/server";
import { PlayerManager } from "./player/playerManager";

// ロード時の初期処理
world.afterEvents.worldLoad.subscribe(() => {
    PlayerManager.initialize();
});