# 📝 ゲーム進行仕様書（確定版）
## 1. 概要

本ゲームは、洋館（ポータル）を拠点として進行するシナリオ型の脱出風ゲームである。プレイヤーはシナリオの進行に伴って新しいゲームへの扉を開放し、各ゲームをレベル制でクリアしていく。

## 2. シナリオ構造

opening → game1 → game2 → game3 → ending

各ゲームは 最大レベル3 まで存在
各レベルは前のレベルをクリアすることで開放
各シナリオ内にプレイヤー固有のフラグ管理領域を持つ

## 3. ゲーム進行フロー
### 3.1 スタートルームへ入室

プレイヤーが洋館（ポータル）からゲームの扉を通過するとスタートルームへ入室

行う処理:
- ゲームルール説明
- プレイするレベルの自動選択（初回はレベル1）
- クリア済みのレベル数に応じて次レベルへ（最大Lv3）
- PlayerData.spawnLocation にスタートルームの座標を保存
- needsSave = true としてセーブ

### 3.2 ゲーム開始（ゲームルームへ遷移）

扉を通過するとゲーム開始

処理手順:
- 画面暗転
- 入力制御（InputPermission OFF）
- 扉のSE再生
- RoomManager がゲームルームを生成
- 指定位置へテレポート
- 暗転解除
- クリアタイム計測開始（プレイヤー操作可能時間のみ）

### 3.3 ゲーム中の動作パターン

ゲームルームには2つの形式がある：
- ミッション形式: 指定されたタスク（例：特定位置にブロックを置く）を達成すると次の部屋へ進行
- 8番出口形式: 複数の扉から正解を選ぶ 正解に進むと次の部屋へ

RoomManager は部屋生成時にどちらの形式かを決定・構築する。

### 3.4 ゴール

指定した部屋数に到達するとゴールルームへ遷移

処理内容:
- クリアタイムを表示
- ベストタイムを PlayerData へ保存（良いタイムのみ更新）
- レベルクリアフラグを更新
- needsSave = true としてセーブ

### 3.5 クリア後（次シナリオ解放）

シナリオの currentScenarioId を次に進める

処理内容:
- 洋館（ポータル）内に次のゲームへの扉が生成される
- プレイヤーはポータルへテレポートされる

## 4. レベル進行仕様

### 4.1 レベルの扱い

各ゲームにおいて
- 初回 → Lv1
- Lv1クリア → 次回はLv2
- Lv2クリア → 次回はLv3
- Lv3クリア → レベル上昇は行わない

### 4.2 レベル別の部屋数

レベルごとに指定した部屋数を用意する（GameConfig で管理）

## 5. PlayerData 仕様

### 5.1 ゲーム進行構造
function createGameProgress() {
    return {
        lv1: { cleared: false, currentProgress: 0, clearTime: 0 },
        lv2: { cleared: false, currentProgress: 0, clearTime: 0 },
        lv3: { cleared: false, currentProgress: 0, clearTime: 0 },
        spawnLocation: null // {x, y, z, dimension}
    };
}

### 5.2 PlayerData 全体
    export class PlayerData {
        constructor(player) {
            this.id = player.id;
            this.name = player.name;

            // 次ログイン時の開始位置（進行中シナリオで変動）
            this.lastLocation = null;

            // シナリオ進行
            this.scenario = {
                currentScenarioId: "opening",
                flags: {}
            };

            // 各ゲームの進捗
            this.game1 = createGameProgress();
            this.game2 = createGameProgress();
            this.game3 = createGameProgress();

            // セーブデータ管理
            this.save = {
                needsSave: false,
                dateTime: "",
                version: 1
            };
        }
    }

## 6. マルチプレイ仕様

同じ部屋に複数プレイヤーが同時に入る想定
入室後の進行は 各プレイヤーが独立して管理（タイム、クリアフラグなど）

## 7. ゴール時のタイム計測

暗転中は計測しない
操作可能になった瞬間にスタート
ゴール後の演出開始時点でストップ

## 8. 洋館（ポータル）仕様

洋館はゲーム全体のハブエリア

各シナリオをクリアするたびに次シナリオの扉が生成される

扉の先がスタートルームになる
