export const entrancePictureConfig = {
    game1: {
        spawnPos: {x:835,  y:127,  z:-54.3 },
        direction: "south",
        type: "edu:picture_door_game1",
        dimension: "overworld"
    },
    game2: {
        spawnPos: {x:857,  y:127,  z:-54.3 },
        direction: "south",
        type: "edu:picture_door_game2",
        dimension: "overworld"
    },
    game3: {
        spawnPos: {x:846.5,  y:123,  z:-53 },
        direction: "south",
        type: "edu:marker",
        dimension: "overworld"
    },
    game3Return: {
        spawnPos: {x:1051,  y:101,  z:439 },
        direction: "south",
        type: "edu:marker",
        dimension: "overworld"
    }
};

export const gateConfig = {
    startPos: {x: 844, y: 123, z: -54},
    endPos: {x: 848, y: 127, z: -54},
    dimension: "overworld",
    blockType: "edu:fake_portal"
};

export const returnGateConfig = {
    frame: {
        startPos: {x: 1049, y: 100, z: 439},
        endPos: {x: 1053, y: 104, z: 439},
        dimension: "overworld",
    blockType: "minecraft:obsidian"
    },
    gate: {
        startPos: {x: 1050, y: 101, z: 439},
        endPos: {x: 1052, y: 103, z: 439},
        dimension: "overworld",
    blockType: "edu:fake_portal"
    }
};