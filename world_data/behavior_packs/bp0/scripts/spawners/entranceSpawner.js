import { BlockVolume, system, world } from "@minecraft/server";
import { entrancePictureConfig } from "../configs/entrancePictureConfig";

// 扉エンティティをスポーンさせるクラス
export class EntranceSpawner {

    /**
     * gameKeyに該当する扉エンティティをスポーンさせる
     * @param {string} gameKey game1 | game2
     * @returns 
     */
    static spawnEntrance(gameKey) {

        if(!entrancePictureConfig[gameKey]) {
            console.warn(`can't fined gameKey ${gameKey}`);
            return;
        }
        
        const { spawnPos, direction, type, dimension } = entrancePictureConfig[gameKey];
        const dim = world.getDimension(dimension);
        
        // 既にスポーンしている場合は全ての扉を一度デスポーン
        const spawnedEntrances = dim.getEntities({
            tags: ["entrance"]
        });

        if(spawnedEntrances.length > 0) {
            for (const e of spawnedEntrances) {
                system.run(() => {
                    e.triggerEvent("despawn");
                })
            }
        }

        try {
            system.run(() => {
                const newEntrance = dim.spawnEntity(type, spawnPos, {initialRotation: this.convertToYaw(direction)});
                newEntrance.addTag("entrance"); // getEntities検索用共通タグ
                newEntrance.addTag(gameKey);    // 個別識別用タグ
            })
        } catch (error) {
            console.warn(`can't spawn entity ${type}`, error);
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