// 部屋の生成、スポーン位置などの部屋情報の取得

import { BlockVolume, world } from "@minecraft/server";
import LOCATION_UTILS from "../utils/locationUtils";
import { PlayerProgressManager } from "../player/playerProgressManager";

export class RoomManager {
    constructor(roomData) {
        this.roomData = roomData;
    }

    /* -------------------------
    部屋の操作
     ------------------------- */

        /**
         * 指定した部屋のスポーン位置取得
         * @param {"startRoom"|"goalRoom"|"gameRoom"} roomType 部屋の種類 "startRoom", "goalRoom", "gameRoom"
         * @param {number} currentLevel プレイ中のレベル
         * @param {boolean} isNormal ノーマル部屋か怪異部屋か
         * @returns 
         */
        getSpawnLocation(roomType, currentLevel = null, isNormal = true) {
            let room;
            switch(roomType) {
                case "startRoom":
                    room = this._getStartRoom();
                    break;
                case "goalRoom":
                    room = this._getGoalRoom();
                    break;
                case "gameRoom":
                    if(currentLevel === null) return null;
                    room = this._getGameRoom(lvKey, isNormal);
                    break;
                default:
                    return null;
            }
            return room?.spawnLocation ?? null;
        }
        

        /**
         * 指定した部屋生成
         * @param {"startRoom"|"goalRoom"|"gameRoom"} roomType 部屋の種類 "startRoom", "goalRoom", "gameRoom"
         * @param {number} currentLevel プレイ中のレベル
         * @param {boolean} isNormal ノーマル部屋か怪異部屋か
         * @returns 
         */
        async generateRoom(roomType, currentLevel = null, isNormal = true) {
            const room = this._getRoom(roomType, currentLevel, isNormal);
            if(!room) return null;

            const { startPos, endPos } = this._getRoomBounds(room);
            const dimension = room.startPos.dimension;
            const { blockTypes } = room;

            let randomPos = LOCATION_UTILS.makeRandomPos(startPos, endPos);

            for(const blockType of blockTypes) {
                while (!LOCATION_UTILS.isAir(dimension, randomPos)) {
                    randomPos = LOCATION_UTILS.makeRandomPos(startPos, endPos);
                }
                try {
                    world.getDimension(dimension).setBlockType(randomPos,blockType);
                } catch (error) {
                    console.warn(`can't set block ${blockType} at ${randomPos.x}, ${randomPos.y}, ${randomPos.z}`, error);
                }
            }
        }

        /**
         * 指定した部屋削除
         * @param {"startRoom"|"goalRoom"|"gameRoom"} roomType 部屋の種類 "startRoom", "goalRoom", "gameRoom"
         * @param {number} currentLevel プレイ中のレベル
         * @param {boolean} isNormal ノーマル部屋か怪異部屋か
         * @returns 
         */
        async clearRoom(roomType, currentLevel = null, isNormal = true) {
            const room = this._getRoom(roomType, currentLevel, isNormal);
            if(!room) return null;

            const { startPos, endPos } = this._getRoomBounds(room);
            const dimension = room.startPos.dimension;
            const blockVolume = new BlockVolume(startPos, endPos);
            try {
                world.getDimension(dimension).fillBlocks(blockVolume, "minecraft:air");
            } catch (error) {
                console.warn(`can't clear blocks`, error);
            }
        }

    /* -------------------------
    クラス内関数
     ------------------------- */

        /**
         * 部屋のデータ取得
         * @param {"startRoom"|"goalRoom"|"gameRoom"} roomType 部屋の種類 "startRoom", "goalRoom", "gameRoom"
         * @param {number} currentLevel プレイ中のレベル
         * @param {boolean} isNormal ノーマル部屋か怪異部屋か
         * @returns 
         */
        _getRoom(roomType, currentLevel = null, isNormal = true) {
            switch(roomType) {
                case "startRoom": return this._getStartRoom();
                case "goalRoom": return this._getGoalRoom();
                case "gameRoom": 
                    if(currentLevel === null) return null;
                    return this._getGameRoom(currentLevel, isNormal);
                default: return null;
            }
        }

        /**
         * startPos, endPos取得
         * @param {object} room 部屋のデータ
         * @returns 
         */
        _getRoomBounds(room) {
            const { startPos, size } = room;
            return {
                startPos,
                endPos: {
                    x: startPos.x + size.width - 1,
                    y: startPos.y + size.height - 1,
                    z: startPos.z + size.depth - 1
                }
            };
        }

        /** スタートルームのデータ取得 */
        _getStartRoom() {
            return this.roomData.startRoom;
        }

        /** ゴールルームのデータ取得 */
        _getGoalRoom() {
            return this.roomData.goalRoom;
        }

        /**
         * ゲームルームのデータ取得
         * @param {number} currentLevel プレイ中のレベル
         * @param {boolean} isNormal ノーマル部屋か怪異部屋か
         * @returns 
         */
        _getGameRoom(currentLevel, isNormal = true) {
            const lvKey = PlayerProgressManager.convertLvKey(currentLevel);
            if(!this.roomData.gameRooms[lvKey]) return null;
            return isNormal
                ? this.roomData.gameRooms[lvKey].normalRoom
                : this.roomData.gameRooms[lvKey].abnormalRoom;
        }
}