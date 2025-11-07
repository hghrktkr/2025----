# 海の中への道を作ろう！

```blocks

let 開始位置: Position = null
let _3でわったあまり = 0
player.onChat("set", function () {
    開始位置 = world(83, 62, 91)
    while (blocks.testForBlock(WATER, 開始位置)) {
        みちをつくる(開始位置)
        開始位置 = positions.add(
        開始位置,
        pos(0, -1, 1)
        )
    }
})
function みちをつくる (開始位置: Position) {
    _3でわったあまり = 開始位置.getValue(Axis.Z) % 3
    blocks.fill(
    GLASS,
    positions.add(
    開始位置,
    pos(-2, 0, 0)
    ),
    positions.add(
    開始位置,
    pos(2, 4, 0)
    ),
    FillOperation.Replace
    )
    blocks.fill(
    AIR,
    positions.add(
    開始位置,
    pos(-1, 1, 0)
    ),
    positions.add(
    開始位置,
    pos(1, 3, 0)
    ),
    FillOperation.Replace
    )
    if (_3でわったあまり == 0) {
        blocks.place(SEA_LANTERN, 開始位置)
    }
}


```

```template

player.onChat("set", function () {

})

```

## 海の中への道を作ろう！ @unplugged
<p>関数をくりかえし呼び出して、海の中への道を作ろう！</p>
<n></n>
<img style="display: block; margin: auto;" height="50%" width="50%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete1.gif">



## 目標(もくひょう)
<p>``||functions.みちをつくる||``をくりかえし呼び出して、海の中への道を作ろう！</p>
<p>・チャットコマンドで「set」と入力すると、下の建物までくりかえし``||functions.みちをつくる||``を呼び出し、道を作る</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete1.gif">



## 道の作り方
<p>道を作る手順(てじゅん)をかんがえよう！</p>
<p>①``||variables.開始位置||``という変数に、作り始める位置の座標を入れる</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_start_position.png">
<p>②``||functions.みちをつくる||``を呼び出して、``||variables.開始位置||``を基準にして1ブロック分並べる</p>
<p>③``||variables.開始位置||``を次の位置に動かす</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_loop.gif">
<p>これを、建物につながるまでくりかえせば道ができそうです！</p>



## 変数を作る
<p>座標を入れる変数``||variables.開始位置||``を作成しよう！</p>
<p>・``||variables.変数||``を開いて、``||varibales.開始位置||``を作成する！</p>
<p>・``||player.チャットコマンドsetを入力したとき||``を実行したときに、``||variables.開始位置||``に、下の図の矢印の位置の**絶対座標**を**自分で確認して入れる**</p>
<p>※``||positions.ワールド(0, 0, 0)||``を使うことをわすれないようにしよう！</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_start_position.png">

```blocks

player.onChat("set", function () {
    開始位置 = world(83, 62, 91)
})

```



## 関数を作る
<p>みちをつくる関数を用意しよう！</p>
<p>・``||functions.関数||``を開き、**関数を作成する**をおす</p>
<p>・ブロックの種類(しゅるい)を**ガラス**にする</p>
<p>・関数の名前を**みちをつくる**と入力する</p>
<p>・**Position**をおして、座標の引数**開始位置**を作る</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_make_function1.gif">



## ブロックをならべる
<p>``||variables.開始位置||``を基準に、ブロックを並べよう！</p>
<p>・ガラスが下の図のようにならぶように、**自分で考えてプログラミング**しよう！</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_path_center.png">
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_path_side.png">

```blocks

function みちをつくる (開始位置: Position) {
    blocks.fill(
    GLASS,
    positions.add(
    開始位置,
    pos(-2, 0, 0)
    ),
    positions.add(
    開始位置,
    pos(2, 4, 0)
    ),
    FillOperation.Replace
    )
    blocks.fill(
    AIR,
    positions.add(
    開始位置,
    pos(-1, 1, 0)
    ),
    positions.add(
    開始位置,
    pos(1, 3, 0)
    ),
    FillOperation.Replace
    )
}

```



## あかりをつける
<p>このままだとみちの中が暗いので、**3ブロックに1つ**、ゆかに**シーランタン**をおくようにしよう！</p>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_mod3_none.png">



## 3ブロックに1回シーランタンを置く考え方①
<p>○回に1回何かを実行したいとき、プログラミングではよく**わり算のあまりを使った条件分岐**を使います！</p>
<p>たとえば、下の図を見ると、**Z座標を3でわったあまり**が**1、2、0、1、2、0、…とくりかえしている**ことがわかります</p>
<p>この性質を使って、**Z座標を3でわったあまりが0のときにシーランタンを置く**ようにすれば3回に1回置くことができそうです！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_mod3.png">



## 3ブロックに1回シーランタンを置く考え方②
<p>やることを確認しましょう！</p>
<p>・``||variables.3でわったあまり||``という変数を作り、引数**開始位置**のZ座標(南北)の数字を3でわったあまりを入れる</p>
<p>・``||functions.みちをつくる||``に、条件分岐で``||variables.3でわったあまり||``が**0のときにシーランタンを置く**プログラムを追加</p>
<p>の2つをすれば良さそうです！</p>



## 変数を作る
<p>``||variables.3でわったあまり||``という変数を作り、引数**開始位置**のZ座標(南北)の数字を3でわったあまりを入れよう！</p>
<p>・``||variables.3でわったあまり||``という変数を作る</p>
<p>・``||functions.みちをつくる||``に``||variables.変数 3でわったあまり を0にする||``をはめ込む</p>
<p>・``||math.計算||``から``||math.0 ÷ 1の余り||``を取り出して``||variables.変数 3でわったあまり を0にする||``にはめ込み、**右側の1**を**3**にする</p>
<p>・``||positions.ポジション||``から``||positions.positionのx(東西)座標||``を取り出して``||math.0 ÷ 1の余り||``の**左側の0**のところにはめ込む</p>
<p>・``||functions.みちをつくる||``の引数**開始位置**を取り出して``||positions.positionのx(東西)座標||``にはめ込む</p>
<p>・``||positions.開始位置のx(東西)座標||``の座標を、**Z(南北)**にする</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_make_variable1.gif">

```blocks

function みちをつくる (開始位置: Position) {
    _3でわったあまり = 開始位置.getValue(Axis.Z) % 3
    blocks.fill(
    GLASS,
    positions.add(
    開始位置,
    pos(-2, 0, 0)
    ),
    positions.add(
    開始位置,
    pos(2, 4, 0)
    ),
    FillOperation.Replace
    )
    blocks.fill(
    AIR,
    positions.add(
    開始位置,
    pos(-1, 1, 0)
    ),
    positions.add(
    開始位置,
    pos(1, 3, 0)
    ),
    FillOperation.Replace
    )
}

```



## 条件分岐を追加する
<p>条件分岐で**3でわったあまりが0のときにシーランタンを置く**プログラムを追加しよう！/p>
<p>・``||logic.論理||``から``||logic.もし～なら||``を取り出して、``||functions.みちをつくる||``の**下**にはめ込む</p>
<p>・``||logic.論理||``から``||logic.0 = 0||``を取り出して、``||logic.もし～なら||``にはめ込む</p>
<p>・``||logic.もし 3でわったあまり = 0なら||``となるようにする</p>
<p>・引数**開始位置**の場所に、**シーランタン**をおくようにする</p>

```blocks

function みちをつくる (開始位置: Position) {
    _3でわったあまり = 開始位置.getValue(Axis.Z) % 3
    blocks.fill(
    GLASS,
    positions.add(
    開始位置,
    pos(-2, 0, 0)
    ),
    positions.add(
    開始位置,
    pos(2, 4, 0)
    ),
    FillOperation.Replace
    )
    blocks.fill(
    AIR,
    positions.add(
    開始位置,
    pos(-1, 1, 0)
    ),
    positions.add(
    開始位置,
    pos(1, 3, 0)
    ),
    FillOperation.Replace
    )
    if (_3でわったあまり == 0) {
        blocks.place(SEA_LANTERN, 開始位置)
    }
}

```



## くりかえす数を考える
<p>ステージにつくまでくりかえし``||functions.みちをつくる||``を呼び出すにはどうすればいいのか考えよう！</p>
<p>・ステージにつくまでは、``||variables.開始位置||``の場所には**水がある**</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_testfor1_1.png">
<p>・ステージにみちがつながると、``||variables.開始位置||``の場所には**水がない**</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_testfor1_2.png">
<p>**もし水が**``||variables.開始位置||``**にあるならくりかえす**とすればうまくいきそうです！</p>



## くりかえしを作る
<p>チャットでsetと入力したときに、``||variables.開始位置||``にあるブロックが水ならばくりかえし``||functions.みちをつくる||``を呼び出そう</p>
<p>・``||player.チャットコマンドsetを入力した時||``に``||loops.もし～なら くりかえし||``をはめこむ</p>
<p>・``||player.チャットコマンドsetを入力した時||``に``||loops.もし～なら くりかえし||``をはめこむ</p>
<p>・``||blocks.ブロック||``から``||blocks.～が(~0, ~0, ~0)に存在する||``をとりだして、条件にはめこむ</p>
<p>・ブロックの種類を**水**にして、座標に``||variables.開始位置||``をはめこむ</p>
<p>・``||functions.関数||``から``||functions.呼び出し みちをつくる||``をとりだしてはめこみ、引数に``||variables.開始位置||``をはめこむ</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_loop1.gif">


```blocks

player.onChat("set", function () {
    開始位置 = world(83, 62, 91)
    while (blocks.testForBlock(WATER, 開始位置)) {
        みちをつくる(開始位置)
    }
})
function みちをつくる (開始位置: Position) {
    _3でわったあまり = 開始位置.getValue(Axis.Z) % 3
    blocks.fill(
    GLASS,
    positions.add(
    開始位置,
    pos(-2, 0, 0)
    ),
    positions.add(
    開始位置,
    pos(2, 4, 0)
    ),
    FillOperation.Replace
    )
    blocks.fill(
    AIR,
    positions.add(
    開始位置,
    pos(-1, 1, 0)
    ),
    positions.add(
    開始位置,
    pos(1, 3, 0)
    ),
    FillOperation.Replace
    )
    if (_3でわったあまり == 0) {
        blocks.place(SEA_LANTERN, 開始位置)
    }
}

```



## 変数に入った座標を動かす
<p>``||variables.開始位置||``を、つぎにブロックをならべはじめる場所に動くよう、**自分で考えてプログラミングしよう**！</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_move_variable1.gif">
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_positions_add1.png">


```blocks

player.onChat("set", function () {
    開始位置 = world(83, 62, 91)
    while (blocks.testForBlock(WATER, 開始位置)) {
        みちをつくる(開始位置)
        開始位置 = positions.add(
        開始位置,
        pos(0, -1, 1)
        )
    }
})
function みちをつくる (開始位置: Position) {
    _3でわったあまり = 開始位置.getValue(Axis.Z) % 3
    blocks.fill(
    GLASS,
    positions.add(
    開始位置,
    pos(-2, 0, 0)
    ),
    positions.add(
    開始位置,
    pos(2, 4, 0)
    ),
    FillOperation.Replace
    )
    blocks.fill(
    AIR,
    positions.add(
    開始位置,
    pos(-1, 1, 0)
    ),
    positions.add(
    開始位置,
    pos(1, 3, 0)
    ),
    FillOperation.Replace
    )
    if (_3でわったあまり == 0) {
        blocks.place(SEA_LANTERN, 開始位置)
    }
}

```



## 実行しよう！
<p>プログラミングができあがったら、▶ボタンを押(お)して実行しよう</p>
<br></br>
<img height="50%" width="50%" src="https://vcode-esia.com/images_for_world_data/school/1st/execute.gif">
<br></br>
<p>ゲーム画面にもどったら、チャットで「set」と入力してガラスのカベを並べよう</p>
<br></br>
<img width="100%" src="https://vcode-esia.com/images_for_world_data/Basic/Theme3/Lesson8/L8_complete1.gif">
<br></br>
<p>できあがったのを確認したら、**村人に話しかけよう**</p>
