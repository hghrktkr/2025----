# ゲームをさらに面白くしよう！



```template

player.onDied(function () {
    gameplay.title(mobs.target(ALL_PLAYERS), "しんでしまった・・・", "")
    mobs.kill(
    mobs.entitiesByType(mobs.monster(WITHER_SKELETON))
    )
    gameplay.setDifficulty(PEACEFUL)
    player.teleport(world(83, 63, 81))
})
mobs.onMobKilled(mobs.monster(WITHER_SKELETON), function () {
    gameplay.title(mobs.target(ALL_PLAYERS), "クリア！！", "")
    gameplay.setDifficulty(PEACEFUL)
    player.teleport(world(83, 63, 81))
})
function とびらをあける () {
    blocks.fill(
    AIR,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
    mobs.give(
    mobs.target(LOCAL_PLAYER),
    NETHERITE_SWORD,
    1
    )
    mobs.give(
    mobs.target(LOCAL_PLAYER),
    SHIELD,
    1
    )
    player.say("けんとたてをてにいれた！")
}
function とびらをしめる () {
    blocks.fill(
    LIGHT_BLUE_STAINED_GLASS,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
    gameplay.setDifficulty(NORMAL)
    mobs.spawn(mobs.monster(WITHER_SKELETON), world(83, 49, 118))
}
loops.forever(function () {
    if (blocks.testForBlock(WHITE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        if (とびら == false) {
            とびらをあける()
            とびら = true
        }
    }
    if (blocks.testForBlock(ORANGE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        if (とびら == true) {
            とびらをしめる()
            とびら = false
        }
    }
})
let とびら = false
とびら = false

```

## ゲームをさらに面白くしよう！@unplugged
<p>工夫(くふう)してゲームをもっと難(むずか)しくしたり面白くしたりしよう！</p>


## 例①
<p>とびらをひらいたときに手に入るアイテムをふやそう！</p>



## 例➁
<p>白の彩釉テラコッタの上に立った時に、プレイヤーに特殊効果(とくしゅこうか)を与えるようにしよう！</p>

```blocks

function とびらをあける () {
    blocks.fill(
    AIR,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
    mobs.give(
    mobs.target(LOCAL_PLAYER),
    NETHERITE_SWORD,
    1
    )
    mobs.give(
    mobs.target(LOCAL_PLAYER),
    SHIELD,
    1
    )
    mobs.applyEffect(STRENGTH, mobs.target(LOCAL_PLAYER), 300, 10)
    player.say("けんとたてをてにいれた！")
}

```


## 例③
<p>倒(たお)したときに出てくるモンスターの数を増(ふ)やそう！</p>
<p>``||mobs.モンスターが死んだ時||``を使って、ウィザースケルトンをたおすとラヴェジャーがスポーンするようにして、ラヴェジャーをたおしたらクリアとなるようにしよう！</p>

```blocks

mobs.onMobKilled(mobs.monster(WITHER_SKELETON), function () {
    mobs.spawn(mobs.monster(RAVAGER), world(83, 49, 118))
    player.say("つぎはラヴェジャーだ！")
})
mobs.onMobKilled(mobs.monster(RAVAGER), function () {
    gameplay.title(mobs.target(ALL_PLAYERS), "クリア！", "")
    gameplay.setDifficulty(PEACEFUL)
    player.teleport(world(83, 63, 81))
})
player.onDied(function () {
    gameplay.title(mobs.target(ALL_PLAYERS), "しんでしまった・・・", "")
    mobs.kill(
    mobs.entitiesByType(mobs.monster(WITHER_SKELETON))
    )
    mobs.kill(
    mobs.entitiesByType(mobs.monster(RAVAGER))
    )
    gameplay.setDifficulty(PEACEFUL)
    player.teleport(world(83, 63, 81))
})

```