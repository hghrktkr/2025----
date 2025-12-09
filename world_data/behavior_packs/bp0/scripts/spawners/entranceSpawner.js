import { BlockVolume, system, world } from "@minecraft/server";
import { entrancePictureConfig } from "../configs/entrancePictureConfig";
import { TEST_MODE } from "../configs/testModeFlag";

// 扉エンティティをスポーンさせるクラス
export class EntranceSpawner {

    /**
     * gameKeyに該当する扉エンティティをスポーンさせる
     * @param {string} gameKey game1 | game2 | game3 | game3Return
     * @returns 
     */
    static spawnEntrance(gameKey) {

        if(!entrancePictureConfig[gameKey]) {
            console.warn(`can't fined gameKey ${gameKey}`);
            return;
        }

        if(TEST_MODE.CONFIG) console.log(`${gameKey} is spawning...`);
        
        const { spawnPos, direction, type, dimension } = entrancePictureConfig[gameKey];
        const dim = world.getDimension(dimension);

        if(TEST_MODE.CONFIG) console.log(`spawn pos: (${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z})`);
        if(TEST_MODE.CONFIG) console.log(`direction: ${direction}`);
        if(TEST_MODE.CONFIG) console.log(`type: ${type}`);

        try {
            system.run(() => {
                const newEntrance = dim.spawnEntity(type, spawnPos, {initialRotation: this.convertToYaw(direction)});

                if(!newEntrance.isValid) console.warn(`can't spawn ${type} successfully`);
                
                newEntrance.addTag("entrance"); // getEntities検索用共通タグ
                newEntrance.addTag(gameKey);    // 個別識別用タグ
            })
        } catch (error) {
            console.warn(`can't spawn entity ${type}`, error);
        }
    }

    /** すべての扉をデスポーンさせる */
    static clearEntrance() {
        const spawnedEntrances = world.getDimension("overworld").getEntities({
            tags: ["entrance"]
        });

        if(spawnedEntrances.length > 0) {
            for(const e of spawnedEntrances) {
                system.run(() => {
                    e.triggerEvent("despawn");
                })
            }
        }
    }

    static convertToYaw(direction, defaultYaw = 0) {
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

    /**
     * ゲートのポータル風ブロックを並べる
     * @param {{x: number, y: number, z: number}} startPos 開始位置
     * @param {{x: number, y: number, z: number}} endPos 終了位置
     * @param {string} dimension
     * @param {string} blockType
     */
    static spawnGate(startPos, endPos, dimension, blockType) {
        const dim = world.getDimension(dimension);

        const volume = new BlockVolume(
            startPos,
            endPos
        );

        try {
            system.run(() => {
                dim.fillBlocks(volume, blockType);
            });
        } catch (error) {
            console.warn(`can't fill blocks;`, error);
        }
    }
}