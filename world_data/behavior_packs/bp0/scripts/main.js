import { world } from "@minecraft/server";
import { PlayerManager } from "./player/playerManager";
import { GameEntranceManager } from "./games/gameEntranceManager";

PlayerManager.initialize();
GameEntranceManager.init();

// ロード時の初期処理
world.afterEvents.worldLoad.subscribe(() => {
});
