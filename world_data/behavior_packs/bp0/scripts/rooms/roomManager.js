// 部屋の生成

export class RoomManager {
    constructor({
        startPos,
        size,
        generators
    }) {
        this.startPos = startPos;           // 部屋の開始位置
        this.size = size;                   // 部屋のサイズ
        this.generators = generators;       // 部屋の各パーツを生成するFurnitureGeneratorの配列
    }

    /** generatorsに入れられた部屋の各部パーツを生成 */
    generateRoom() {
        for (const generator of this.generators) {
            try {
                generator.generate({startPos: this.startPos});
            } catch (error) {
                console.warn(`Failed to generate furniture: ${generator.key}`, error);
            }
        }
    }
}
