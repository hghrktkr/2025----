import { world, system, BlockPermutation } from "@minecraft/server";

class FurnitureGenerator {
    constructor(key, blockTypes, positions) {
        this.key = key;
        this.blockTypes = Array.isArray(blockTypes) ? blockTypes : [blockTypes];
        this.positions = Array.isArray(positions) ? positions : [positions];
    }

    /** directionキーをもとにyawを決める */
    convertToYaw(direction, defaultYaw = 0) {
        // rotation を方向から決める
        let rotationYaw = 0;
        switch (direction) {
            case "north":
                rotationYaw = 180;
                break;
            case "south":
                rotationYaw = 0;
                break;
            case "west":
                rotationYaw = 90;
                break;
            case "east":
                rotationYaw = 270;
                break;
            default:
                rotationYaw = defaultYaw;
                break;
        }

        return rotationYaw;
    }

    /** 指定されたブロックを指定された位置に設置 */
    generate({ startPos }) {
        const dim = world.getDimension("overworld");

        // blockTypesの中に複数のブロックがある場合はランダムに1つ選択
        const chosenType =
            this.blockTypes[Math.floor(Math.random() * this.blockTypes.length)];

        for (const item of this.positions) {
            const { type, pos, states, direction } = item;

            const abs = {
                x: startPos.x + pos.x,
                y: startPos.y + pos.y,
                z: startPos.z + pos.z,
            };

            system.run(() => {

                // ブロックの場合
                if(type === "block") {
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
                }

                // エンティティの場合
                if(type === "entity") {
                    const entity = dim.spawnEntity(chosenType, abs, {initialRotation:  this.convertToYaw(direction)});
                    entity.setRotation({x: 0, y: this.convertToYaw(direction)});
                }
            });
        }
    }
}

export default FurnitureGenerator;
