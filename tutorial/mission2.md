# とびらのしくみをつくろう！

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
player.onChat("gate", function () {
    blocks.fill(
    LIGHT_BLUE_STAINED_GLASS,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
    blocks.place(WHITE_GLAZED_TERRACOTTA, world(83, 48, 105))
    blocks.place(ORANGE_GLAZED_TERRACOTTA, world(83, 48, 107))
})
let とびら = false
とびら = false



```

```template

player.onChat("gate", function () {
})

```


## とびらのしくみをつくろう！ @unplugged
<p>とびらをつくって、あけしめするしくみをつくろう！</p>
<n></n>
<img style="display: block; margin: auto;" height="50%" width="50%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete2.gif">



## 目標(もくひょう)
<p>とびらをつくり、あけしめするしくみをつくろう！</p>
<p>・チャットコマンドで「gate」と入力すると、建物との間に、**空色の色付きガラス**の扉をつくり、その前と後ろに**白色の彩釉テラコッタと橙色の彩釉テラコッタ**をおく</p>
<p>・**白色の彩釉テラコッタ**の上に立つと、とびらがひらいてプレイヤーに**ネザライトの剣と盾(たて)**をわたす</p>
<p>・**橙色の彩釉テラコッタ**の上に立つと、とびらがとじる</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete2.gif">



## とびらをつくる
<p>下の図をさんこうにして、チャットコマンドで「set」と入力したときに**空色の色付きガラス**を**絶対座標**でならぶよう、**自分で考えてプログラミング**しよう</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_gate_center.png">
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_gate_side.png">

```blocks

player.onChat("gate", function () {
    blocks.fill(
    LIGHT_BLUE_STAINED_GLASS,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
})

```



## テラコッタをおく
<p>とびらの前とうしろに、とびらのあけしめのスイッチとなる**白色の彩釉テラコッタと橙色の彩釉テラコッタ**をおくよう、**自分で座標を考えてプログラミング**しよう</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_terracotta_center.png">
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_terracotta_side.png">

```blocks

player.onChat("gate", function () {
    blocks.fill(
    LIGHT_BLUE_STAINED_GLASS,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
    blocks.place(WHITE_GLAZED_TERRACOTTA, world(83, 48, 105))
    blocks.place(ORANGE_GLAZED_TERRACOTTA, world(83, 48, 107))
})

```



## とびらのしくみを考える
<p>**白色の彩釉テラコッタ**の上に立ったときにとびらがひらき、**橙色の彩釉テラコッタ**の上に立ったときにとびらがしまるようにするしくみを考えよう！</p>
<p>プレイヤーがいつテラコッタの上にのってもプログラムを実行できるように、``||loops.ずっと||``を使って、いつもチェックするのがよさそうです！</p>
<p>``||functions.とびらをあける||``、``||functioins.とびらをしめる||``という関数をつくり、条件分岐で、**プレイヤーの1ブロック下にテラコッタがあるとき**に呼び出すようにしましょう！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_conditional1.png">




## 関数をつくる
<p>まずは``||functions.とびらをあける||``、``||functions.とびらをしめる||``をつくろう！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_make_function1.png">




## ブロックをならべる
<p>``||functions.とびらをあける||``には**空気ブロック**を、``||functions.とびらをしめる||``には**空色の色付きガラス**をならべるように、下の図をさんこうに**自分で考えてプログラミング**しよう</p>
<p>``||player.チャットコマンドgateを入力した時||``のプログラムをヒントにしよう！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_terracotta_center.png">
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_terracotta_side.png">

```blocks

function とびらをあける () {
    blocks.fill(
    AIR,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
}
function とびらをしめる () {
    blocks.fill(
    LIGHT_BLUE_STAINED_GLASS,
    world(82, 49, 106),
    world(84, 51, 106),
    FillOperation.Replace
    )
}

```



## プレイヤーにアイテムをわたす
<p>``||functions.とびらをあける||``の中に、プレイヤーに**ネザライトの剣**と**盾**を1つずつわたすよう、**自分で考えてプログラミング**しよう</p>
<p>また、**けんとたてをてにいれた！**とメッセージ送信するようにしよう</p>

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
    player.say("けんとたてをてにいれた！")
}

```



## イベントを検知する①
<p>プレイヤーが**白色の彩釉テラコッタ**の上に立ったのを検知して、``||functions.とびらをあける||``を呼び出すようにしよう！</p>
<p>・``||loops.ループ||``から``||loops.ずっと||``をとりだす</p>
<p>・``||logic.論理||``から``||logic.もし～なら||``をとりだして``||loops.ずっと||``にはめこむ</p>
<p>・``||blocks.ブロック||``から``||blocks.～が(~0, ~0, ~0)に存在する||``をとりだして、条件にはめこむ</p>
<p>・ブロックの種類を**白色の彩釉テラコッタ**にして、座標を**(~0, ~-1, ~0)**にする</p>
<p>・``||functions.関数||``から``||functions.呼び出し とびらをあける||``をとりだしてはめこむ</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_event2.gif">



## イベントを検知する②
<p>おなじように、プレイヤーが**橙色の彩釉テラコッタ**の上に立ったのを検知して、``||functions.とびらをしめる||``を呼び出すように**自分で考えてプログラミング**しよう！</p>

```blocks

loops.forever(function () {
    if (blocks.testForBlock(WHITE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        とびらをあける()
    }
    if (blocks.testForBlock(ORANGE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        とびらをしめる()
    }
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
}

```



## とびらがあいているかたしかめる①
<p>**白色の彩釉テラコッタ**の上にのった時にとびらをあけて、ネザライトの剣と盾をわたすようにプログラミングしました</p>
<p>しかし、今のままだと、**白色の彩釉テラコッタ**の上にいるあいだずっと剣と盾をわたしつづけてしまいます…</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_error2.gif">
<p>``||functions.とびらをあける||``と``||functions.とびらをしめる||``を、テラコッタの上にのったときに**一度だけ**実行するにはどうすればよいでしょうか？</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_gate_check_1.png">
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_gate_check_2.png">



## とびらがあいているかたしかめる②
<p>**白色の彩釉テラコッタ**の上にのっているかどうかにくわえて、**とびらがあいているか**も条件分岐でかくにんすればよさそうです！</p>
<p>とびらをチェックするために、新しく変数``||variables.とびら||``を作って、``||variables.とびら||``が**真**ならあいている、**偽**ならしまっているというふうにしよう！</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_gate_check_3.png">
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_gate_check_4.png">
<p>下の図で、これから作る条件分岐をたしかめましょう</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_flow2.png">



## 変数をつくる
<p>新しく変数``||variables.とびら||``をつくろう</p>
<p>はじめ、とびらは**しまっている**はずなので、プログラムを実行したときに``||variables.とびら||``を**偽**にしよう</p>
<p>・変数``||variables.とびら||``をつくる</p>
<p>・``||loops.ループ||``から``||loops.最初だけ||``をとりだし、``||variables.変数 とびら を0にする||``をはめ込む</p>
<p>・``||logic.論理||``から``||logic.偽||``をとりだし、``||variables.変数 とびら を0にする||``にはめ込む</p>
<p>これで、とびらがしまっているということを変数であらわすことができるようになりました！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_make_variable2.gif">



## 条件分岐をついかする①
<p>つくった``||variables.とびら||``をつかって、下の図のようになるように、条件分岐をついかしよう！</p>
<p>・``||logic.もし 白の彩釉テラコッタが(~0, ~-1, ~0)にある なら||``の中に、もうひとつ``||logic.もし～なら||``をいれる</p>
<p>・``||logic.もし とびら = 偽 なら||``となるように条件を入れる</p>
<p>・``||functions.呼び出し とびらをあける||``を、``||logic.もし とびら = 偽 なら||``のなかにうごかす</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_flow2.png">

```blocks

loops.forever(function () {
    if (blocks.testForBlock(WHITE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        if (とびら == false) {
            とびらをあける()
        }
    }
    if (blocks.testForBlock(ORANGE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
            とびらをしめる()
    }
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
}

```



## 条件分岐をついかする②
<p>おなじように、プレイヤーが**橙色の彩釉テラコッタ**の上に立ったときに、もし``||variables.とびら||``が**真**なら、``||functions.とびらをしめる||``を呼び出すように、**自分で考えて条件分岐をついかしよう！**</p>

```blocks

loops.forever(function () {
    if (blocks.testForBlock(WHITE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        if (とびら == false) {
            とびらをあける()
        }
    }
    if (blocks.testForBlock(ORANGE_GLAZED_TERRACOTTA, pos(0, -1, 0))) {
        if (とびら == true) {
            とびらをしめる()
        }
    }
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
}

```



## 実行しよう！
<p>プログラミングができあがったら、▶ボタンを押(お)して実行しよう</p>
<br></br>
<img height="50%" width="50%" src="https://vcode-esia.com/images_for_world_data/school/1st/execute.gif">
<br></br>
<p>ゲーム画面にもどったら、チャットで「gate」と入力して**空色の色付きガラスのとびら**を並べよう</p>
<p>とびらができたら、**白の彩釉テラコッタ**の上に立って**ネザライトの剣**と**盾**をうけとって中に入り、**橙色の彩釉テラコッタ**の上に立ってとびらをしめよう</p>
<p>とびらがしまったのをかくにんしたら、**おくにすすんで地上にテレポートしよう！**</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete2.gif">
<br></br>
<p>テレポートしたら、**村人に話しかけよう**</p>