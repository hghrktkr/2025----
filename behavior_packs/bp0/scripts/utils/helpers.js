import { world } from "@minecraft/server";

// 全プレイヤーにタイトル表示
export function broadcastTitle(title, subtitle = "") {
  for (const player of world.getPlayers()) {
    player.onScreenDisplay.setTitle(title, { stayDuration:100,fadeInDuration:2,fadeOutDuration:4,subtitle:subtitle });
  }
}

// 全プレイヤーにチャット送信
export function broadcastChat(message) {
  world.sendMessage(`[Game] ${message}`);
}
