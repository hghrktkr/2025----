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
    y: 121.5,
    z: -41,
    yaw: 180,
    pitch: 5,
    dimension: "overworld"
};

// ゲーム開始時のスポーン位置
export const gameSpawnLocation = {
    x: 856,
    y: 121,
    z: -89,
    yaw: 180,
    pitch: 0,
    dimension: "overworld"
};

// ミッション開始時のスポーン位置
export const missionSpawnLocation = {
    x: 840,
    y: 118,
    z: -150,
    yaw: 0,
    pitch: 270,
    dimension: "overworld"
};

// 作品制作のスポーン位置
export const buildSpawnLocation = {
    x: 1045,
    y: 102,
    z: 430,
    yaw: 180,
    pitch: 0,
    dimension: "overworld"
}