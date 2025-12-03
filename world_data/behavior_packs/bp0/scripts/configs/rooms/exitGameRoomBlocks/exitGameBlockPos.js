/** ブロックの相対座標とステート */
const exitGameBlockPos = {
    portrait: [
        { type: "block", pos: { x: 1, y: 1, z: 0 }, states: {"minecraft:cardinal_direction": "south"} }
    ],
    presentBox: [
        { type: "block", pos: { x: 2, y: 0, z: 3 }, states: {} },
        { type: "block", pos: { x: 3, y: 0, z: 2 }, states: {} },
        { type: "block", pos: { x: 2, y: 7, z: 6 }, states: {} }
    ],
    cake: [
        { type: "block", pos: { x: 5, y: 1, z: 6 }, states: {} }
    ],
    lantern: [
        { type: "block", pos: { x: 8, y: 9, z: 2 }, states: {} },
        { type: "block", pos: { x: 8, y: 9, z: 6 }, states: {} }
    ],
    teddyBear: [
        { type: "block", pos: { x: 0, y: 0, z: 9 }, states: {"minecraft:cardinal_direction": "west"} },
        { type: "block", pos: { x: 0, y: 0, z: 10 }, states: {"minecraft:cardinal_direction": "west"} },
        { type: "block", pos: { x: 1, y: 8, z: 10 }, states: {} },
        { type: "block", pos: { x: 4, y: 8, z: 10 }, states: {} }
    ],
    tree: [
        { type: "block", pos: { x: 8, y: 0, z: 1 }, states: {} },
        { type: "block", pos: { x: 5, y: 7, z: 10 }, states: {} }
    ],
    snowman: [
        { type: "block", pos: { x: 9, y: 0, z: 2 }, states: {"minecraft:cardinal_direction": "east"} },
        { type: "block", pos: { x: 9, y: 0, z: 3 }, states: {"minecraft:cardinal_direction": "east"} },
        { type: "block", pos: { x: 0, y: 7, z: 0 }, states: {"minecraft:cardinal_direction": "west"} }
    ],
    chair: [
        { type: "entity", pos: { x: 5, y: 0, z: 7 }, direction: "north" },
        { type: "entity", pos: { x: 5, y: 0, z: 4 }, direction: "south" }
    ]
}

export { exitGameBlockPos };
