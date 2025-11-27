import { world } from "@minecraft/server";

// 部屋の通常部屋の各パーツを生成する
class FurnitureGenerator {
    constructor(key,blockTypes, positions) {

        /**
         * @param {string} key - このgeneratorのキー
         * @param {string|string[]} blockTypes - 設置するブロック（単数 or 複数）
         * @param {Object|Object[]} positions - 相対座標（単数 or 複数）
         */

        this.key = key;
        this.blockTypes = Array.isArray(blockTypes) ? blockTypes : [blockTypes];
        this.positions = Array.isArray(positions) ? positions : [positions];
    }

    /** 指定されたブロックを指定された位置に設置 */
    generate({ startPos}) {
        const dim = world.getDimension("overworld");

        // blockTypesの中に複数のブロックがある場合はランダムに1つ選択
        const chosenType =
            this.blockTypes[Math.floor(Math.random() * this.blockTypes.length)];

        for (const rel of this.positions) {
            const abs = {
                x: startPos.x + rel.x,
                y: startPos.y + rel.y,
                z: startPos.z + rel.z,
            };
            system.run(() => {
                dim.getBlock(abs)?.setType(chosenType);
            });
        }
    }
}

export default FurnitureGenerator;