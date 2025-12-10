// ゲームルール、難易度等に関する設定

/**
 * ゲームルールの設定{key:ゲームルール名, value:true/false}
 * 注意：world.gameRules[key] = gameRuleConfig[key];はまだEducation版では使えない模様
 */
export const gameRuleConfig = {
    lobby: {
        doDaylightCycle: false,         // 昼夜サイクルを進行させるか
        doWeatherCycle: false,          // 天候が変化するか
        doFireTick: true,               // 火の延焼・消滅が起こるか
        doMobSpawning: false,           // モブが自然スポーンするか
        doMobLoot: false,               // モブがドロップするか
        doTileDrops: false,             // ブロック破壊時にアイテムが落ちるか
        keepInventory: false,           // 死亡時にインベントリを保持するか
        fallDamage: true,               // 落下ダメージを受けるか
        fireDamage: true,               // 火や溶岩でダメージを受けるか
        drowningDamage: true,           // 溺死ダメージを受けるか
        naturalRegeneration: true,      // 自然回復するか
        doInsomnia: false,              // 不眠によるファントムがスポーンするか
        doImmediateRespawn: true,      // 即リスポーンするか
        pvp: false,                     // プレイヤー同士の攻撃を有効にするか
        mobGriefing: false,             // モブがブロックを壊したり動かしたりするか
        showCoordinates: false,          // 座標を表示するか
        showDeathMessages: false,       // 死亡メッセージを表示するか
        spawnRadius: 0,                 // スポーン地点のランダム半径（数値指定推奨）
        sendCommandFeedback: false,     // コマンド実行結果を表示するか
        maxCommandChainLength: 0        // コマンドチェーンの最大長（数値指定推奨）
    },
    build: {
        doDaylightCycle: false,         // 昼夜サイクルを進行させるか
        doWeatherCycle: false,          // 天候が変化するか
        doFireTick: true,               // 火の延焼・消滅が起こるか
        doMobSpawning: true,           // モブが自然スポーンするか
        doMobLoot: true,               // モブがドロップするか
        doTileDrops: true,             // ブロック破壊時にアイテムが落ちるか
        keepInventory: false,           // 死亡時にインベントリを保持するか
        fallDamage: true,               // 落下ダメージを受けるか
        fireDamage: true,               // 火や溶岩でダメージを受けるか
        drowningDamage: true,           // 溺死ダメージを受けるか
        naturalRegeneration: true,      // 自然回復するか
        doInsomnia: false,              // 不眠によるファントムがスポーンするか
        doImmediateRespawn: true,      // 即リスポーンするか
        pvp: true,                     // プレイヤー同士の攻撃を有効にするか
        mobGriefing: true,             // モブがブロックを壊したり動かしたりするか
        showCoordinates: true,          // 座標を表示するか
        showDeathMessages: false,       // 死亡メッセージを表示するか
        spawnRadius: 5,                 // スポーン地点のランダム半径（数値指定推奨）
        sendCommandFeedback: false,     // コマンド実行結果を表示するか
        maxCommandChainLength: 0        // コマンドチェーンの最大長（数値指定推奨）
    }
}

export const tickingArea = {
    start: {x: -49, y: -1, z: -49},
    end: {x: 49, y: 20, z: 49}
}

export const difficulty = {
    lobby: "peaceful",
    build: "normal"
}

/**
 * ゲームモード設定
 * 注意：player.setGameMode(GameMode.Survival);はまだEducation版では使えない模様
 */
export const gameMode = {
    lobby: "a @a",
    build: "s @a"
}