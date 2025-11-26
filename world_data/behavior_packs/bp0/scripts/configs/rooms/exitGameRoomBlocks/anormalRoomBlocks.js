const anormalRoomBlocks = {
    bed: ["minecraft:white_bed", "minecraft:blue_bed", "minecraft:green_bed"],
    presentBox: ["edu:present_box_blue"],
    cake: ["minecraft:candle_cake", "minecraft:white_candle_cake", "minecraft:orange_candle_cake"],
    lantern: ["minecraft:soul_lantern"],
    teddyBear: ["edu:stuffed_bear_blink", "edu:stuffed_bear_right_hand_up"],
    tree: ["edu:christmas_tree_red"],
    snowman: ["edu:snowman_blink"]
};

const unlockableBlocks = {
    1: ["bed", "cake", "teddyBear"],
    2: ["bed", "cake", "teddyBear", "presentBox", "lantern", "tree"],
    3: ["bed", "cake", "teddyBear", "presentBox", "lantern", "tree", "snowman"]
}

export { anormalRoomBlocks, unlockableBlocks };