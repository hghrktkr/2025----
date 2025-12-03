const anormalRoomBlocks = {
    portrait: ["edu:portrait_santa_claus_black"],
    presentBox: ["edu:present_box_blue"],
    cake: ["minecraft:candle_cake", "minecraft:white_candle_cake", "minecraft:orange_candle_cake"],
    lantern: ["minecraft:soul_lantern"],
    teddyBear: ["edu:stuffed_bear_blink", "edu:stuffed_bear_right_hand_up"],
    tree: ["edu:christmas_tree_red"],
    snowman: ["edu:snowman_blink"]
};

const unlockableBlocks = {
    1: ["portrait", "cake", "teddyBear"],
    2: ["portrait", "cake", "teddyBear", "presentBox", "lantern", "tree"],
    3: ["portrait", "cake", "teddyBear", "presentBox", "lantern", "tree", "snowman"]
}

export { anormalRoomBlocks, unlockableBlocks };