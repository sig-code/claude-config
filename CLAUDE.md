# Claude Code 設定

## コマンド
このディレクトリには、Claude Code で実行可能なカスタムコマンドが含まれています。

### コマンドドキュメント
新しいコマンドを追加する際は、以下の形式で `commands.md` ファイルを更新してください：

```markdown
## /コマンド名
簡潔な説明

- **使用法**: `/コマンド名 <引数> [オプション]`
- **機能**: コマンドの機能説明
- **オプション**:
  - `--オプション`: オプションの説明
- **備考**: 追加の注意事項
```

### 現在のコマンド
利用可能なコマンドは [`commands.md`](./commands.md) に記載されています。

### コマンド開発ガイドライン
- コマンドスクリプトは `commands/` ディレクトリに配置
- 分かりやすいファイル名を使用（例：`pr-desc.js`）
- 適切なエラーハンドリングとユーザーフィードバックを含める
- テンプレートファイルは `templates/` ディレクトリに配置
- コマンドドキュメントは簡潔に（1コマンドあたり200文字以内）

## commands.md の自動更新
コマンドを作成・修正した際は、commands.md を更新してドキュメントを最新に保ってください。これにより利用可能な機能の可視性を維持できます。

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

### プルリクエスト
- **タイトル**: 日本語で記述
- **説明**: 日本語で記述
- **承認**: 1人の approve が必要

## Hooks 設定

### 重要: type フィールドの有効な値
Claude Code Hooks の `type` フィールドには以下の値のみが有効です：
- `"command"` - bash コマンドを実行
- `"prompt"` - LLM ベースの評価（Stop, SubagentStop などで使用）

**⚠️ `"deny"` や `"warn"` は無効な値です！**

### ブロック（deny 相当）の実装方法
exit code 2 を使用してツール呼び出しをブロックします：
```json
{
  "type": "command",
  "command": "echo 'エラーメッセージ' >&2 && exit 2"
}
```
- stderr にメッセージを出力し、exit code 2 で終了
- Claude にエラーメッセージが表示され、ツール呼び出しがブロックされる

### 警告・確認（warn 相当）の実装方法
JSON 出力で `permissionDecision: "ask"` を返します：
```json
{
  "type": "command",
  "command": "echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"ask\",\"permissionDecisionReason\":\"警告メッセージ\"}}'"
}
```
- ユーザーに確認ダイアログが表示される
- `"permissionDecision": "allow"` で自動承認、`"deny"` でブロックも可能

### Exit Code の意味
| Exit Code | 動作 |
|-----------|------|
| 0 | 成功。stdout は verbose モードで表示 |
| 2 | ブロックエラー。stderr が Claude に表示される |
| その他 | 非ブロックエラー。処理は継続 |

### 参考ドキュメント
- https://code.claude.com/docs/en/hooks

## 深掘り質問ルール

実装タスクを受けた際は、以下を確認してから実装を開始：

### 必須確認項目
1. **技術アーキテクチャ**: データフロー、API設計、DB設計
2. **UI/UX**: ユーザーフロー、エラー処理、状態表示

### 質問形式
- AskUserQuestionツールを使用
- 2〜4個の質問、各2〜4個の選択肢
- 決定事項は計画ファイルに記録
