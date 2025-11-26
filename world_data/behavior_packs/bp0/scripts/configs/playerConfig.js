import { world } from "@minecraft/server";

// プレイヤーに関する設定
export const initialItems = [
    {
        typeId: "minecraft:stick",
        amount: 1,
        data: 0,
        info: null
    }
];

// 基本のスポーン位置
export const lobbySpawnLocation = {
    x: 846,
    y: 121,
    z: -41,
    dimension: world.getDimension("overworld")
};

// ゲーム開始時のスポーン位置
export const gameSpawnLocation = {
    x: 846,
    y: 121,
    z: -41,
    dimension: world.getDimension("overworld")
};