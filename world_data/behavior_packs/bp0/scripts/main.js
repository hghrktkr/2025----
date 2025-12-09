import { world } from "@minecraft/server";
import { PlayerManager } from "./player/playerManager";
import { GameEntranceManager } from "./games/gameEntranceManager";
import { GameManagerBase } from "./games/gameManagerBase";

PlayerManager.initialize();
GameEntranceManager.enterPicture();

// ロード時の初期処理
world.afterEvents.worldLoad.subscribe(() => {
    GameManagerBase._setupSpawnTickingAreas();
});