/** ブロックの相対座標とステート */
const exitGameBlockPos = {
    bed: [
        { pos: { x: 3, y: 7, z: 8 }, states: {} },
        { pos: { x: 3, y: 7, z: 8 }, states: {} }
    ],
    presentBox: [
        { pos: { x: 2, y: 0, z: 3 }, states: {} },
        { pos: { x: 3, y: 0, z: 2 }, states: {} },
        { pos: { x: 2, y: 7, z: 6 }, states: {} }
    ],
    cake: [
        { pos: { x: 5, y: 1, z: 6 }, states: {} }
    ],
    lantern: [
        { pos: { x: 8, y: 9, z: 2 }, states: {} },
        { pos: { x: 8, y: 9, z: 6 }, states: {} }
    ],
    teddyBear: [
        { pos: { x: 0, y: 0, z: 9 }, states: {"minecraft:cardinal_direction": "west"} },
        { pos: { x: 0, y: 0, z: 10 }, states: {"minecraft:cardinal_direction": "west"} },
        { pos: { x: 1, y: 8, z: 10 }, states: {} },
        { pos: { x: 4, y: 8, z: 10 }, states: {} }
    ],
    tree: [
        { pos: { x: 8, y: 0, z: 1 }, states: {} },
        { pos: { x: 5, y: 7, z: 10 }, states: {} }
    ],
    snowman: [
        { pos: { x: 9, y: 0, z: 2 }, states: {"minecraft:cardinal_direction": "east"} },
        { pos: { x: 9, y: 0, z: 3 }, states: {"minecraft:cardinal_direction": "east"} },
        { pos: { x: 0, y: 7, z: 0 }, states: {"minecraft:cardinal_direction": "west"} }
    ]
}

export { exitGameBlockPos };
