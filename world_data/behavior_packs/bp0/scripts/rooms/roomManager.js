// 部屋の生成・扉の監視

import { system, world } from "@minecraft/server";
import { exitGameDoorPos } from "../configs/rooms/exitGameRoomBlocks/exitGameDoorPos";

export class RoomManager {
    constructor({
        startPos,
        size,
        generators,
        roomType,
        correctDoorId
    }) {
        this.startPos = startPos;                   // 部屋の開始位置
        this.size = size;                           // 部屋のサイズ
        this.generators = generators;               // 部屋の各パーツを生成するFurnitureGeneratorの配列
        this.roomType = roomType;                   // 部屋のタイプ ("normal" or "anormal")
        this.correctDoorId = correctDoorId;         // 正しい扉のID ("front" or "back")
        this.doorEventListener = null;              // 扉を開けたイベントのリスナー

        this.doorList = this.initDoor();
    }

    /**
     * 外部のexitGameDoorPosを受け取って絶対座標のリストにする
     * コンストラクタ内で実行
     */
    initDoor() {
        return Object.entries(exitGameDoorPos).map(([id, rel]) => ({
            id,
            pos: {
                x: this.startPos.x + rel.x,
                y: this.startPos.y + rel.y,
                z: this.startPos.z + rel.z
            }
        }));
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

    /**
     * ドアの開閉イベントの購読開始
     */
    startListeningDoorEvents(callback) {
        // 既存リスナーの削除
        if(this.doorEventListener) this.doorEventListener.unsubscribe(this.doorEventListener);

        // 扉の開閉検知イベントの登録
        this.doorEventListener = world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
            const { block, player } = ev;
            ev.cancel = true;

            for(const entry of this.doorList) {
                if(
                    entry.pos.x === block.location.x,
                    entry.pos.y === block.location.y,
                    entry.pos.z === block.location.z
                ) {
                    callback({
                        player,                                         // 扉を開けたプレイヤー
                        isCorrect: entry.id === this.correctDoorId      // 開けた扉が正解かどうか
                    });
                }
            }
        });
    }

    /** ドアの開閉イベント購読停止 */
    stopListeningDoorEvents() {
        if(this.doorEventListener !== null) {
            system.run(() => {
                world.beforeEvents.playerInteractWithBlock.unsubscribe(this.doorEventListener);
                this.doorEventListener = null;
            });
        }
    }
}
