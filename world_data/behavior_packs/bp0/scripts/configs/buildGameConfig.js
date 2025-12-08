// configs/buildGameConfig.js

export const buildGameConfig = {
    dimension: "overworld",

    // 建築ステージのメイン地点
    stagePos: { x: 500, y: 120, z: 500 },

    // プレイヤー初期位置
    playerSpawnPos: { x: 500, y: 120, z: 500 },

    // NPC（サンタ）の位置と向き
    santa: {
        id: "edu:santa_claus_red",
        pos: { x: 502, y: 120, z: 500 },
        rotation: 180
    },

    // ロビーに戻るゲートの位置
    returnGate: {
        pos: { x: 500, y: 120, z: 505 },
        tag: "lobby_return"
    },

    // チェスト関連
    chest: {
        pos: { x: 498, y: 120, z: 500 },
        items: [
            { slot: 0, type: "minecraft:oak_planks", amount: 64 },
            { slot: 1, type: "minecraft:glass", amount: 64 },
            { slot: 2, type: "minecraft:stone", amount: 64 },
            { slot: 3, type: "minecraft:torch", amount: 64 },
        ],
        refillIntervalSec: 5
    }
};
