// 部屋の生成

class RoomManager {
    constructor({
        startPos,
        size,
        generators
    }) {
        this.startPos = startPos;
        this.size = size;
        this.generators = generators;
    }

    /** generatorsに入れられた部屋の各部パーツを生成 */
    generateRoom() {
        for (const generator of this.generators) {
            generator.generate({
                startPos: this.startPos,
                size: this.size
            });
        }
    }
}
