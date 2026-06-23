# Claude Code 設定

## Git 規約

### ブランチ命名
- わかりやすく英語で記述する
- 例：`feature/add-notification-system`、`fix/twilio-webhook-error`

### コミットメッセージ
- **言語**: 日本語で記述する
- **長さ**: 15文字以内で端的に作業内容を記載
- **Gitmoji**: 適切な絵文字を付与する

#### 使用する Gitmoji
- 🔥 `:fire:` - コードやファイルを削除
- 🐞 `:bug:` - バグや不具合を修正
- 📝 `:memo:` - ドキュメントを追加・更新
- 📈 `:enhancement:` - 機能改善やコード改良
- 🚀 `:feature:` - 新機能を追加
- ✅ `:white_check_mark:` - テストを追加・更新・通過
- ➕ `:heavy_plus_sign:` - 依存関係を追加
- ➖ `:heavy_minus_sign:` - 依存関係を削除
- 🩹 `:simple_fix:` - 軽微な問題の小さな修正

#### コミットメッセージ例
```
🚀 通知ルール機能を追加
🐞 Twilio ウェブフック検証を修正
📈 データベースクエリを最適化
🔥 未使用コンポーネントを削除
```

### 禁止事項
- `git push --force` / `git push --force-with-lease` は絶対に使用しない。rebase で履歴が diverge した場合は、新しいブランチを作って対応する

### プルリクエスト
- **タイトル**: 日本語で記述
- **説明**: 日本語で記述
- **承認**: 1人の approve が必要

## Issue 起票のルール

Issue の起票は **Linear MCP** を使用する。

- Linear MCP が未接続の場合は、起票内容のドラフトを用意した上で接続を促す
- プロジェクトごとのチームプレフィックスがある場合、PR 本文に `closes <PREFIX>-<番号>` を記載して紐付ける

