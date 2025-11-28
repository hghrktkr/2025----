import { world, system, BlockPermutation } from "@minecraft/server";

class FurnitureGenerator {
    constructor(key, blockTypes, positions) {
        this.key = key;
        this.blockTypes = Array.isArray(blockTypes) ? blockTypes : [blockTypes];
        this.positions = Array.isArray(positions) ? positions : [positions];
    }

    /** 指定されたブロックを指定された位置に設置 */
    generate({ startPos }) {
        const dim = world.getDimension("overworld");

        // blockTypesの中に複数のブロックがある場合はランダムに1つ選択
        const chosenType =
            this.blockTypes[Math.floor(Math.random() * this.blockTypes.length)];

        for (const item of this.positions) {
            const { pos, states } = item;

            const abs = {
                x: startPos.x + pos.x,
                y: startPos.y + pos.y,
                z: startPos.z + pos.z,
            };

            system.run(() => {
                const block = dim.getBlock(abs);
                if (!block) return;

                // --- 状態なし：普通に setType ---
                if (!states || Object.keys(states).length === 0) {
                    block.setType(chosenType);
                    return;
                }

                // --- 状態あり：permutation を作って適用する ---
                let perm = BlockPermutation.resolve(chosenType);

                for (const [stateKey, value] of Object.entries(states)) {
                    try {
                        perm = perm.withState(stateKey, value);
                    } catch (e) {
                        console.warn(
                            `[FurnitureGenerator] State error: ${stateKey}=${value} in ${chosenType}`
                        );
                    }
                }

                block.setPermutation(perm);
            });
        }
    }
}

export default FurnitureGenerator;
