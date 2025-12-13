import { CommandPermissionLevel, CustomCommandParamType, system, world } from "@minecraft/server";
import { PlayerManager } from "./player/playerManager";
import { GameEntranceManager } from "./games/gameEntranceManager";
import { GameManagerBase } from "./games/gameManagerBase";
import { ResultManager } from "./utils/resultManager";
import { ScenarioManager } from "./scenario/scenarioManager";
import { MissionGameManager } from "./games/missionGameManager";

PlayerManager.initialize();
GameEntranceManager.enterPicture();
ResultManager.showResult();

// ロード時の初期処理
world.afterEvents.worldLoad.subscribe(() => {
    GameManagerBase._setupSpawnTickingAreas();
});

// カスタムコマンドを登録
system.beforeEvents.startup.subscribe((init) => {
    const commandRegistry = init.customCommandRegistry;

    //
    // ① 射撃コマンド
    //
    commandRegistry.registerCommand(
        {
            name: "edu:s",
            description: "入力した座標にサンタを飛ばす",
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [
                { type: CustomCommandParamType.Integer, name: "width" },
                { type: CustomCommandParamType.Integer, name: "height" }
            ]
        },
        (origin, width, height) => {
            const player = origin?.sourceEntity;
            if (!player) return;

            if (!(ScenarioManager.currentGameManager instanceof MissionGameManager)) {
                player.sendMessage("§c射的ゲーム以外では使えません");
                return;
            }

            if (ScenarioManager.currentGameManager.state === "RUNNING") {
                ScenarioManager.currentGameManager._shootSequence(
                    player,
                    width,
                    height
                );
            }
        }
    );

    //
    // ② スタートコマンド
    //
    commandRegistry.registerCommand(
        {
            name: "edu:go",
            description: "射的ゲームを開始する",
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: []
        },
        (origin) => {
            const player = origin?.sourceEntity;
            if (!player) return;

            if (!(ScenarioManager.currentGameManager instanceof MissionGameManager)) {
                player.sendMessage("§c射的ゲーム以外では使えません");
                return;
            }
            if (ScenarioManager.currentGameManager.state === "READY") {
                ScenarioManager.currentGameManager.startGame(player);
            }
        }
    );
});