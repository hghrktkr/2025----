# christmas_fantasy_2025

##🪴 Branch 運用ルール

このプロジェクトでは、2名での共同開発を想定したブランチ運用を行います。

## 🌿 基本ルール
ブランチ名	用途	編集・push可能な人
main	完成済み・安定版のコード。ワールド公開や配布時に使う	全員（直接push禁止）
develop	開発中の統合ブランチ。テストや一時動作確認を行う	全員
feature/〇〇	新機能・調整・修正用ブランチ	担当者のみ
fix/〇〇	バグ修正専用ブランチ	担当者のみ

## 🧩 開発の流れ

開発を始めるとき

git checkout develop
git pull
git checkout -b feature/add-inkgun


作業が終わったら

git add .
git commit -m "インクガン射出処理を追加"
git push origin feature/add-inkgun


GitHub上で Pull Request (PR) を作成

ベースブランチ：develop

比較ブランチ：feature/add-inkgun

内容を確認して、もう一方の開発者がレビュー・承認します。

承認後にMerge

PRが承認されたら develop にマージします。

main には、テスト完了後に develop → main のPRを作成して反映します。

## 🧹 命名ルール

種別	命名例	内容
新機能追加	feature/add-inkgun	新しいクラス・機能を追加
設定変更	feature/update-config	config内容の変更
バグ修正	fix/inkgun-crash	既存機能の不具合修正
試験用ブランチ	test/spawn-check	一時的なデバッグや検証

## 🔒 禁止事項

main に直接コミットやpushはしない

develop は動作確認後のみマージ

コンフリクトが起きた場合は、担当者同士で相談して解消する
