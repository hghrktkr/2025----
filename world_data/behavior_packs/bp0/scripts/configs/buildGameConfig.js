// configs/buildGameConfig.js

export const buildGameConfig = {
    dimension: "overworld",

    // 建築ステージのメイン地点
    stagePos: { x: 500, y: 120, z: 500 },

    // プレイヤー初期位置
    playerSpawnPos: { x: 1045, y: 102, z: 430 },

    // NPC（サンタ）の位置と向き
    santa: {
        id: "edu:santa_claus_red",
        pos: { x: 1047, y: 102, z: 428 },
        rotation: 180
    },

    // チェスト関連
    chest: {
        pos: { x: 1047, y: 102, z: 430 },
        items: [
            { slot: 0, type: "minecraft:oak_planks", amount: 64 },
            { slot: 1, type: "minecraft:glass", amount: 64 },
            { slot: 2, type: "minecraft:stone", amount: 64 },
            { slot: 3, type: "minecraft:torch", amount: 64 },
        ],
        refillIntervalSec: 5
    }
};
