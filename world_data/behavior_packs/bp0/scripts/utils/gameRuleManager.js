import { system, world } from "@minecraft/server";
import { difficulty, gameMode, gameRuleConfig } from "../configs/ruleConfig";
import { TEST_MODE } from "../configs/testModeFlag";

export class GameRuleManager {
    static currentSettings = null;

    static startLobbySettings() {
        if(TEST_MODE.CONFIG) return;
        this.stopSettings();
        this.currentSettings = system.runInterval(() => {
            this.setGameRule(gameRuleConfig.lobby);
            this.setGameMode(gameMode.lobby);
            this.setDifficulty(difficulty.lobby);
            this.canFly(false);
        }, 20 * 2);
    }

    static startBuildSettings() {
        if(TEST_MODE.CONFIG) return;
        this.stopSettings();
        this.currentSettings = system.runInterval(() => {
            this.setGameRule(gameRuleConfig.build);
            this.setGameMode(gameMode.build);
            this.setDifficulty(difficulty.build);
            this.canFly(true);
        }, 20 * 2);
    }

    static stopSettings() {
        system.clearRun(this.currentSettings);
        this.currentSettings = null;
    }

    /** ゲームルールの適用 */
    static setGameRule(rules) {
        const dim = world.getDimension("overworld");

        for (const [key, value] of Object.entries(rules)) {
            dim.runCommand(`gamerule ${key} ${value}`);
        }
    }

    /** ゲームモードの適用 */
    static setGameMode(mode) {
        const dim = world.getDimension("overworld");

        dim.runCommand(`gamemode ${mode}`);
    }

    static setDifficulty(level) {
        const dim = world.getDimension("overworld");

        dim.runCommand(`difficulty ${level}`);
    }

    static canFly(bool) {
        const dim = world.getDimension("overworld");

        dim.runCommand(`ability @a mayfly ${bool}`);
    }
}