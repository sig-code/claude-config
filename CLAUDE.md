# Claude Code 設定

## Git 規約

### ブランチ命名
- わかりやすく英語で記述する
- 例：`feature/add-notification-system`、`fix/twilio-webhook-error`

### コミットメッセージ
- **言語**: 日本語で記述する
- **長さ**: 30文字以内を目安に端的に作業内容を記載（Gitmoji は文字数に含めない）
- **Gitmoji**: 以下の15種のみ使用する（~/.gitmoji.json と同一セット。リスト外の絵文字は使わない）

#### 使用する Gitmoji
- 🔥 `:fire:` - コードやファイルを削除
- 🐞 `:bug:` - バグや不具合を修正
- 📝 `:memo:` - ドキュメントを追加・更新
- 📈 `:enhancement:` - 機能改善やコード改良
- 🚀 `:feature:` - 新機能を追加
- 💄 `:lipstick:` - UI・スタイル・アセットを追加・更新
- ✅ `:white_check_mark:` - テストを追加・更新・通過
- ⬆️ `:arrow_up:` - 依存関係をアップグレード
- ⬇️ `:arrow_down:` - 依存関係をダウングレード
- ➕ `:heavy_plus_sign:` - 依存関係を追加
- ➖ `:heavy_minus_sign:` - 依存関係を削除
- ✏️ `:pencil2:` - タイポ・誤字を修正
- 🩹 `:simple_fix:` - 軽微な問題の小さな修正
- 🧪 `:test_tube:` - 失敗するテストを追加
- 🚧 `:construction:` - 作業途中（WIP）

#### コミットメッセージ例
```
🚀 通知ルール機能を追加
🐞 Twilio ウェブフック検証を修正
⬆️ nodemailer を 9.0.1 に更新
🔥 未使用コンポーネントを削除
```

### コミット・PR の依頼時
- コミット依頼時は `/commit-commands:commit`、PR 作成までは `/commit-commands:commit-push-pr`（Draft 指定可）の手順に従う

### 禁止事項
- `git push --force` / `git push --force-with-lease` は絶対に使用しない。rebase で履歴が diverge した場合は、新しいブランチを作って対応する

### プルリクエスト
- **タイトル**: 日本語で記述
- **説明**: 日本語で記述
- **承認**: 1人の approve が必要

## パッケージ追加

新規パッケージの導入前に `npm view <pkg> time --json` で最新版のリリース日を確認し、**リリースから7日未満なら導入せずユーザーに確認する**（サプライチェーン攻撃対策）。

## Issue 起票のルール

Issue の起票は **Linear MCP** を使用する。

- Linear MCP が未接続の場合は、起票内容のドラフトを用意した上で接続を促す
- プロジェクトごとのチームプレフィックスがある場合、PR 本文に `closes <PREFIX>-<番号>` を記載して紐付ける

## セッション運用

- 作業単位が変わったら `/clear` する。長い作業は着手前に計画を plans/ に書き出し、継続時は計画ファイルを再読して再開する（`/compact` は同一作業のまま容量が逼迫した時のみの次善手段）
