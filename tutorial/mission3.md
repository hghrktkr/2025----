# ゲームをかんせいさせよう！

```blocks

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

```template

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


## ゲームをかんせいさせよう！@unplugged
<p>ゲームをかんせいさせてあそんでみよう！</p>
<n></n>
<img style="display: block; margin: auto;" height="50%" width="50%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete3.gif">



## 目標(もくひょう)
<p>ゲームをかんせいさせてあそんでみよう！</p>
<p>・**ステージのとびらがしまったとき**に、**ウィザースケルトン**があらわれるようにする</p>
<p>・ウィザースケルトンをたおしたときに、**クリア！**とタイトルをひょうじして、プレイヤーを``||positions.ワールド(83, 63, 81)||``へテレポートさせる</p>
<p>・ウィザースケルトンにまけたときに、**しんでしまった・・・**とタイトルをひょうじして、ウィザースケルトンをけしてからプレイヤーを``||positions.ワールド(83, 63, 81)||``へテレポートさせる</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete3.gif">



## ゲームのながれをかんがえる①
<p>これまでは、ゲームがはじまるまでのしくみを作りました</p>
<p>下の図をさんこうにして、ゲームがはじまってからおわるまで、どんなことをすればよいか考えてみよう！</p>
<p>？のぶぶんでは、目標でかくにんしたことのうち、どんなことをすればよいでしょうか？</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_todo.png">



## ゲームのながれをかんがえる②
<p>下の図のように作ればよさそうです！</p>
<p>それぞれのぶぶんを作っていきましょう！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_todo2.png">



## ウィザースケルトンをスポーンする
<p>ウィザースケルトンをスポーンさせるように、**自分で考えてプログラミング**しよう！</p>
<p>**とびらがしまるときにスポーンさせる**には、どの``||functions.関数||``のどのぶぶんに入れればよいか考えてみよう！</p>
<p>ウィザースケルトンは、``||positions.ワールド(83, 49, 118)||``にスポーンさせよう</p>



## ゲームモードをかえる
<p>Minecraftのせかいでは、モンスターがスポーンできるのは**難易度(なんいど)がピースフルいがいのとき**です</p>
<p>ウィザースケルトンをスポーンさせる前に、難易度を**ノーマル**にするようプログラミングしよう！</p>
<p>・``||gameplay.ゲームプレイ||``から、``||gameplay.ゲームの難易度をピースフルにする||``をとりだして、ウィザースケルトンをスポーンさせる**前**にはめこむ</p>
<p>・難易度を**ノーマル**にする</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_set_difficulty.gif">

```blocks

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

```



## ウィザースケルトンをたおしたとき
<p>ウィザースケルトンをたおしたときのプログラムを**自分で考えてプログラミング**しよう！</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_todo2.png">
<p>・タイトルは、**全てのプレーヤー(@a)**に出すようにする</p>
<p>・ウィザースケルトンをたおしたというイベントは、``||mobs.モブ||``にある``||mobs.～が死亡した時||``をつかってしらべる</p>
<p>・プレイヤーは、``||positions.ワールド(83, 63, 81)||``へテレポートさせる</p>

```blocks

mobs.onMobKilled(mobs.monster(WITHER_SKELETON), function () {
    gameplay.title(mobs.target(ALL_PLAYERS), "クリア！！", "")
    player.teleport(world(83, 63, 81))
})

```



## プレイヤーがしんでしまったとき
<p>プレイヤーがしんでしまったときのプログラムを**自分で考えてプログラミング**しよう！</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_todo2.png">
<p>・タイトルは、**全てのプレーヤー(@a)**に出すようにする</p>
<p>・プレイヤーがしんでしまったというイベントは、``||player.プレイヤー||``にある``||player.プレイヤーが死んだ時||``をつかってしらべる</p>
<p>・プレイヤーは、``||positions.ワールド(83, 63, 81)||``へテレポートさせる</p>
<p>・ウィザースケルトンをたおすには、``||mobs.モブ||``にある、``||mobs.～を死亡させる||``と、``||mobs.すべての生き物||``をくみあわせて使う</p>

```blocks

player.onDied(function () {
    gameplay.title(mobs.target(ALL_PLAYERS), "しんでしまった・・・", "")
    mobs.kill(
    mobs.entitiesByType(mobs.monster(WITHER_SKELETON))
    )
    player.teleport(world(83, 63, 81))
})

```



## 難易度をピースフルにもどす
<p>ウィザースケルトンをたおしたときやプレイヤーがしんでしまったときに、難易度をピースフルにもどすよう**自分で考えてプログラミング**しよう！</p>
<p>・``||gameplay.ゲームプレイ||``にある``||gameplay.ゲームの難易度をピースフルにする||``を使う</p>

```blocks

player.onDied(function () {
    gameplay.title(mobs.target(LOCAL_PLAYER), "しんでしまった・・・", "")
    mobs.kill(
    mobs.entitiesByType(mobs.monster(WITHER_SKELETON))
    )
    gameplay.setDifficulty(PEACEFUL)
    player.teleport(world(83, 63, 81))
})
mobs.onMobKilled(mobs.monster(WITHER_SKELETON), function () {
    gameplay.title(mobs.target(LOCAL_PLAYER), "クリア！！", "")
    gameplay.setDifficulty(PEACEFUL)
    player.teleport(world(83, 63, 81))
})

```



## 実行しよう！
<p>プログラミングができあがったら、▶ボタンを押(お)して実行しよう</p>
<br></br>
<img height="50%" width="50%" src="https://vcode-esia.com/images_for_world_data/school/1st/execute.gif">
<br></br>
<p>ゲーム画面にもどったら、**白の彩釉テラコッタ**の上に立って**ネザライトの剣**と**盾**をうけとって中に入り、**橙色の彩釉テラコッタ**の上に立ってとびらをしめよう</p>
<p>とびらがしまったときにあらわれたウィザースケルトンとたたかおう！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete3.gif">
<br></br>
<p>たたかいがおわってテレポートしたら、**村人に話しかけよう**</p>