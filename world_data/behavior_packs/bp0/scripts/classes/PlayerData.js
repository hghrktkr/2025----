export class PlayerData {
    constructor(player) {
        this.id = player.id;
        this.name = player.name;
        
        this.isInGame = false;                  // ゲーム中か
        this.currentRoomIndex = null;           // 現在の部屋（int）
        this.failCount = 0;                     // 間違えた回数（リザルト用）
        this.gameProgress = null;               // ゲームの進行状況（string）
        this.currentPos = {x: 0, y: 0, z: 0}    // プレイヤーの座標（保存用）
    }    
}