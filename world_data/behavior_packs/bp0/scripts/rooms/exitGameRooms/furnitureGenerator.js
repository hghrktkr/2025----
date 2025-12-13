import { world, system, BlockPermutation } from "@minecraft/server";
import LOCATION_UTILS from "../../utils/locationUtils";
import { broadcastChat } from "../../utils/helpers";

class FurnitureGenerator {
    constructor({key, blockTypes, positions, area} = {}) {
        this.key = key?? "default";
        this.blockTypes = Array.isArray(blockTypes) ? blockTypes : [blockTypes];
        this.positions = Array.isArray(positions) ? positions : [positions];
        this.area = area ?? null;   // startPos: {x: number, y: number, z: number}, size: {width: number, height: number}
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

    /**
     * 範囲内の家具・ブロックを消去
     * @param {{x: number, y: number, z: number}} startPos 開始座標
     * @param {{width: number, height: number}} size 大きさ
     */
    clearFurniture() {
        const dim = world.getDimension("overworld");
        const {startPos, size} = this.area;
        const {width, height} = size;

        let currentPos = {...startPos};

        for(let x = 0; x < width; x++) {
            for(let y = 0; y < height; y++) {
                currentPos = {
                    x: startPos.x + x,
                    y: startPos.y + y,
                    z: startPos.z
                }

                const block = dim.getBlock(currentPos);
                if(!block) continue;
                
                system.run(() => {
                    try {
                        block.setType("minecraft:air");
                    } catch (error) {
                        console.warn(`can't clear block at (${currentPos.x}, ${currentPos.y}, ${currentPos.z})`, error);
                    }
                });
            }
        }

        // サンタが残っていれば削除
        const entities = dim.getEntities({
            type: "edu:santa_claus_red"
        });
        if(entities.length > 0) {
            for(const santa of entities) {
                santa.remove();
            }
        }

    }

        /** ランダムに blockTypes から1つ選ぶ */
    pickRandomBlock() {
        return this.blockTypes[
            Math.floor(Math.random() * this.blockTypes.length)
        ];
    }

    /** ランダムにエリア内の 1 座標を返す */
    pickRandomPos() {
        const { startPos, size } = this.area;
        const { width, height } = size;

        return {
            x: startPos.x + Math.floor(Math.random() * width),
            y: startPos.y + Math.floor(Math.random() * height),
            z: startPos.z
        };
    }

    /** ランダム位置にランダムブロックを1つ置く */
    generateRandomOne() {
        if (!this.area) {
            console.warn("[FurnitureGenerator] area が指定されていません");
            return;
        }

        const dim = world.getDimension("overworld");
        const chosenType = this.pickRandomBlock();
        const pos = this.pickRandomPos();

        const block = dim.getBlock(pos);
        if (!block) {
            console.warn(`[FurnitureGenerator] block が存在しません`)
            return;
        };

        system.run(() => {
            block.setType(chosenType);
        });

        return { chosenType, pos };
    }

    /** パーティクルと座標を出す */
    showParticle(targetPos) {
        const dim = world.getDimension("overworld");
        const startPos = this.area.startPos;

        // 高さを調整
        const currentPos = LOCATION_UTILS.offsetPosition(startPos, {x: 0, y: 0.5, z: 0});
        broadcastChat(`ざひょう: (${targetPos.x, targetPos.y, targetPos.z})`);

        const particleInterval = system.runInterval(() => {
            for(let x = currentPos.x; x < targetPos.x; x++) {
                dim.spawnParticle("minecraft:balloon_gas_particle", {x: x, y: currentPos.y, z: currentPos.z});

                for(let z = currentPos.z; z < targetPos.z; z++) {
                    dim.spawnParticle("minecraft:electric_spark_particle", {x: x, y: currentPos.y, z: z});

                    for(let y = currentPos.y; y < targetPos.y; y++) {
                        dim.spawnParticle("minecraft:dragon_breath_trail", {x: x, y: y, z: z});
                    }
                }
            }

        }, 10);

        return particleInterval;
    }
}

export default FurnitureGenerator;
