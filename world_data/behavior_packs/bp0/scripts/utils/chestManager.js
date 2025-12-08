// チェスト内のアイテム管理クラス(於建築)

import { ItemStack, system } from "@minecraft/server";
import { TEST_MODE } from "../configs/testModeFlag";
import { broadcastChat } from "./helpers";

export class ChestManager {
    constructor(dim, chest, config) {
        this.dim = dim;
        this.chest = chest;
        this.config = config;

        this.inventory = chest.getComponent("minecraft:inventory");
        this.container = this.inventory.container;

        this.occupiedSlots = config.items.map(item => item.slot);   // 占有スロット
        this.containerSize = this.container.size;                   // チェストのスロット数

        this.interval = null;                                       // 監視
    }

    /** アイテム追加 */
    setUp() {
        this.container.clearAll();

        // 指定スロットにアイテム追加
        this.config.items.forEach(item => {
            const { slot, type, amount} = item;
            this.container.setItem(slot, new ItemStack(type, amount));
            if(TEST_MODE.CONFIG) console.log(`item ${type} is set in slot ${slot}, amount: ${amount}`);
        });
    }

    /** 監視スタート */
    start() {
        this.interval = system.runInterval(() => this.tick(), this.config.refillIntervalSec * 20);
    }

    /** 監視停止 */
    stop() {
        if(!this.interval) return;
        system.clearRun(this.interval);
        this.interval = null;
    }

    /** 監視項目 */
    tick() {
        this.moveToUnprotectedSlots();
        this.keepProtectedSlots();
    }

    /** 占有済みに入っている指定以外のブロックを別のスロットへ移動 */
    moveToUnprotectedSlots() {
        const freeSlots = this.getFreeSlots();

        // 占有スロットの各番号を確認
        for(const occupiedSlot of this.occupiedSlots) {
            // 現在入っているアイテムを取得
            const item = this.container.getItem(occupiedSlot);

            // 空orそのスロットの正しいアイテムが入っていれば飛ばす
            if(!item || this.isCorrectItem(occupiedSlot, item)) continue;

            // freeSlotsの先頭のインデックスを取り出す
            const targetSlot = freeSlots.shift();

            // 空きがない場合は外に出して警告
            if(targetSlot === undefined) {
                this.dropItem(occupiedSlot, item);
                broadcastChat(`§cスロットがいっぱいです！${item.typeId}を外に出しました`);
                continue;
            }

            // 空きがある場合はそこへ移動
            this.container.setItem(targetSlot, item);
            this.container.setItem(occupiedSlot, undefined);
        }

    }

    /** 占有済みのスロットのアイテム維持 */
    keepProtectedSlots() {
        for(const item of this.config.items) {
            const {slot, type, amount} = item;

            const currentItem = this.container.getItem(slot);

            if(!currentItem || currentItem.typeId !== type || currentItem.amount !== amount) {
                this.container.setItem(slot, new ItemStack(type, amount));
            }
        }
    }

    /** 占有済みでないスロットの一覧を返す */
    getFreeSlots() {
        let freeSlots = [];

        for(let i = 0; i < this.containerSize; i++) {
            if(this.occupiedSlots.includes(i)) continue;
            if(!this.container.getItem(i)) freeSlots.push(i);
        }

        return freeSlots;
    }

    /**
     * スロットに実際に入っているアイテムと占有済みアイテムリストを比較
     * @param {number} slot スロット番号
     * @param {ItemStack} item 実際に入っているアイテム
     */
    isCorrectItem(slot, item) {
        // configから該当スロットの情報を取得
        const correctInfo = this.config.items.find(item => item.slot === slot);
        if(!correctInfo) return false;

        return correctInfo.type === item.typeId;
    }

    /**
     * inventoryからアイテムを削除し、チェストの外にドロップする
     * @param {number} slot 削除対象のスロット
     * @param {ItemStack} item 捨てるアイテム
     */
    dropItem(slot, item) {
        const pos = this.chest.location;
        this.dim.spawnItem(item, {
            x: pos.x + 0.5,
            y: pos.y + 1,
            z: pos.z + 0.5
        });

        this.container.setItem(slot, undefined);
    }

}