# Claude Code ベストプラクティス設定完了

Fondesk プロジェクト用に Claude Code のベストプラクティス設定を完了しました。

## 📋 作成された設定

### 1. カスタムコマンド (`~/.claude/commands/`)

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `/model` | モデル切り替え | `/model opus` |
| `/add-api` | APIエンドポイント追加 | `/add-api ユーザー取得API` |
| `/fix-bug` | TDDでバグ修正 | `/fix-bug ログイン時のエラー` |
| `/add-feature` | 新機能追加 | `/add-feature Google OAuth` |

### 2. サブエージェント (`~/.claude/agents/`)

| エージェント | モデル | 用途 |
|-------------|--------|------|
| `security-reviewer` | Opus | セキュリティ脆弱性レビュー |
| `code-reviewer` | Sonnet | コード品質レビュー |
| `test-generator` | Sonnet | テスト生成 |
| `migration-validator` | Sonnet | マイグレーション検証 |

**使用例:**
```
サブエージェントを使ってこのコードをセキュリティレビューして
サブエージェントを使ってテストを生成して
サブエージェントを使ってこのマイグレーションを検証して
```

### 3. フック (`~/.claude/settings.json`)

#### 禁止事項（deny）
- ✅ master/mainブランチへの直接プッシュ
- ✅ .envファイルの変更
- ✅ --no-verifyフラグの使用

#### 警告（warn）
- ⚠️ master/mainブランチでの作業
- ⚠️ 既存マイグレーションファイルの編集
- ⚠️ 外部リソースへのPOST/PUT/DELETE操作

#### 自動検証（AfterWrite）
- 📝 テストファイル作成時: テスト実行コマンドを表示
- 📊 Entity作成時: インデックス追加の確認
- 🔧 Service作成時: エラーハンドリングの確認
- ✨ DTO作成時: バリデーションデコレータの確認
- 🗄️ マイグレーション作成時: 検証項目の表示

### 4. CLAUDE.md の最適化

- 元の205行から126行に短縮
- Claude が推測できないことだけを簡潔に記載
- ベストプラクティスに準拠

### 5. スキル (`~/.claude/skills/`)

| スキル | 内容 |
|--------|------|
| `fondesk-test-strategy` | テスト戦略とTDDパターン |
| `fondesk-coding-patterns` | アーキテクチャとコーディングパターン |

スキルはコンテキストに応じて自動的に適用されます。

## 🚀 使い方

### 基本的なワークフロー

#### 1. 新しいAPIエンドポイントを追加
```
/add-api ユーザープロフィール取得API
```

Claude が以下を自動実行:
- Plan Modeで既存パターンを確認
- DTO、Service、Controller、テストを作成
- テストカバレッジ100%を確認
- Swaggerドキュメントを生成

#### 2. バグを修正
```
/fix-bug ログイン後にリダイレクトが失敗する
```

Claude が以下を自動実行:
- 再現テストを作成（TDD）
- 根本原因を調査
- 修正を実装
- エッジケースをテスト

#### 3. 新機能を追加
```
/add-feature Google OAuth ログイン
```

Claude が以下を自動実行:
- 要件をインタビュー
- Plan Modeで計画を作成
- 実装
- テスト
- セキュリティレビュー（サブエージェント）

### サブエージェントの活用

#### セキュリティレビュー
```
サブエージェントを使ってこの実装をセキュリティレビューして
```

別のコンテキストで専門的なセキュリティレビューを実行し、結果を報告。

#### コードレビュー
```
サブエージェントを使ってコードレビューして
```

#### テスト生成
```
サブエージェントを使って UserService のテストを生成して
```

#### マイグレーション検証
```
サブエージェントを使ってこのマイグレーションを検証して
```

本番環境への影響、実行順序、リスクを評価。

## 💡 ベストプラクティス

### コンテキスト管理
- `/clear` を頻繁に使用して、無関係なタスク間でコンテキストをリセット
- 2回以上修正が必要な場合は `/clear` して新しいプロンプトで再開

### Plan Mode の活用
- 複雑なタスクは Plan Mode で探索→計画→実装
- シンプルなタスク（タイポ修正など）は Plan Mode をスキップ

### 検証を常に提供
- テストを書いて自動検証
- テストカバレッジ100%を目指す
- サブエージェントでレビュー

### 具体的な指示
- ファイル名、パターン、制約を明示
- 既存のパターンを参照
- 検証方法を指定

## 🎯 次のステップ

### 1. 動作確認

新しいセッションで Claude Code を起動:
```bash
claude --continue
```

### 2. コマンドを試す

```
/model       # 現在のモデルを確認
/add-api     # ヘルプを表示
```

### 3. フックをテスト

意図的に禁止操作を試して、フックが動作するか確認:
```
.envファイルを編集してみて
```
→ 🚫 エラーメッセージが表示されるはず

### 4. イテレーティブに改善

- 新しいパターンが見つかったら CLAUDE.md に追加
- よく使うワークフローをカスタムコマンド化
- 必要に応じてサブエージェントやスキルを追加

## 📚 参考リソース

- **Claude Code ベストプラクティス**: https://code.claude.com/docs/best-practices
- **プロジェクトガイドライン**: `fondesk/.claude/docs/guideline.md`
- **Git規約**: `fondesk/.claude/docs/git-convention.md`

---

## ⚙️ 設定ファイル一覧

```
~/.claude/
├── commands/
│   ├── add-api.md
│   ├── add-feature.md
│   ├── fix-bug.md
│   └── model.md
├── agents/
│   ├── security-reviewer.md
│   ├── code-reviewer.md
│   ├── test-generator.md
│   └── migration-validator.md
├── skills/
│   ├── fondesk-test-strategy.md
│   └── fondesk-coding-patterns.md
├── settings.json          # フック設定を含む
├── CLAUDE.md             # グローバル設定
├── commands.md           # コマンド一覧
└── MODEL_SWITCH_README.md # モデル切り替えガイド

/Users/t_mashimo/dev/fondesk/.claude/
└── CLAUDE.md             # プロジェクト固有設定（最適化済み）
```

---

🎉 **設定完了！Claude Code をフルに活用して、効率的な開発を楽しんでください！**
