// 部屋情報 RoomDefinitionに従う
import { RoomDefinition } from "./roomDefinition";

export const game3Rooms = {
    startRoom: {
        ...RoomDefinition,
        id: "g3_start",
        spawnLocation: {
            x: 837,
            y: 121,
            z: -71,
            dimension: "overworld"
        }
    },
    gameRooms: {
        lv1: {
            normalRoom: {
                ...RoomDefinition,
                id: "g3_lv1_normal",
                spawnLocation: {
                    x: 837,
                    y: 121,
                    z: -78,
                    dimension: "overworld"
                },
                startPos: {
                    x: 833,
                    y: 120,
                    z: -117,
                    dimension: "overworld"
                },
                blockTypes: ["edu:present_box", "edu:stuffed_bear"]
            },
            abnormalRoom: {
                ...RoomDefinition,
                id: "g3_lv1_abnormal",
                spawnLocation: {
                    x: 837,
                    y: 121,
                    z: -78,
                    dimension: "overworld"
                },
                startPos: {
                    x: 833,
                    y: 120,
                    z: -117,
                    dimension: "overworld"
                },
                blockTypes: ["edu:present_box", "edu:stuffed_bear", "edu:stuffed_bear_blink"]
            }
        },
        lv2: {
            normalRoom: {
                ...RoomDefinition,
                id: "g3_lv2_normal",
                spawnLocation: {
                    x: 837,
                    y: 121,
                    z: -78,
                    dimension: "overworld"
                },
                startPos: {
                    x: 833,
                    y: 120,
                    z: -117,
                    dimension: "overworld"
                },
                blockTypes: ["edu:present_box", "edu:stuffed_bear", "edu:snowman"]
            },
            abnormalRoom: {
                ...RoomDefinition,
                id: "g3_lv2_abnormal",
                spawnLocation: {
                    x: 837,
                    y: 121,
                    z: -78,
                    dimension: "overworld"
                },
                startPos: {
                    x: 833,
                    y: 120,
                    z: -117,
                    dimension: "overworld"
                },
                blockTypes: ["edu:present_box", "edu:stuffed_bear", "edu:stuffed_bear_blink", "edu:snowman_blink"]
            }
        },
        lv3: {
            normalRoom: {
                ...RoomDefinition,
                id: "g3_lv3_normal",
                spawnLocation: {
                    x: 837,
                    y: 121,
                    z: -78,
                    dimension: "overworld"
                },
                startPos: {
                    x: 833,
                    y: 120,
                    z: -117,
                    dimension: "overworld"
                },
                blockTypes: ["edu:present_box", "edu:stuffed_bear", "edu:snowman", "edu:christmas_tree"]
            },
            abnormalRoom: {
                ...RoomDefinition,
                id: "g3_lv3_abnormal",
                spawnLocation: {
                    x: 837,
                    y: 121,
                    z: -78,
                    dimension: "overworld"
                },
                startPos: {
                    x: 833,
                    y: 120,
                    z: -117,
                    dimension: "overworld"
                },
                blockTypes: ["edu:present_box", "edu:stuffed_bear", "edu:stuffed_bear_blink", "edu:snowman_blink", "edu:christmas_tree"]
            }
        },
    },
    goalRoom: {
        ...RoomDefinition,
        id: "g3_goal",
        spawnLocation: {
            x: 837,
            y: 121,
            z: -71,
            dimension: "overworld"
        }
    },
};