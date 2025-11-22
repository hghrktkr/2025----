// ゲーム中の部屋定義
export const RoomDefinition = {
    id: "",

    // テレポート先
    spawnLocation: { x: 0, y: 0, z: 0, dimension: "overworld" },

    // プレイヤー開始位置
    startPos: { x: 0, y: 0, z: 0, dimension: "overworld" },

    // コピペ用
    size: { width: 7, height: 10, depth: 7 },

    // 使用するブロック種
    blockTypes: [],

    // アイテム（必要な場合）
    itemsTypes: []
};