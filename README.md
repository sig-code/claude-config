# Claude Code 最強設定集

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Optimized-blue)](https://claude.ai/code)

[Claude Code](https://claude.ai/code) のベストプラクティスに基づいた実践的な設定集。
NestJS/TypeScript プロジェクト（特に Fondesk）向けに最適化されていますが、他のプロジェクトにも応用可能です。

## 🌟 特徴

- ✅ **カスタムコマンド**: よく使うワークフローをコマンド化
- ✅ **サブエージェント**: 専門的なレビュー・検証を別コンテキストで実行
- ✅ **自動フック**: 禁止操作のブロック、自動検証
- ✅ **スキル**: ドメイン知識の自動適用
- ✅ **最適化された CLAUDE.md**: 簡潔で実用的なルール集

## 📁 設定一覧

### 📋 カスタムコマンド ([`commands/`](./commands/))

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| [`/model`](./commands/model.md) | モデル切り替え（Sonnet/Opus/Haiku） | `/model opus` |
| [`/add-api`](./commands/add-api.md) | APIエンドポイント追加ワークフロー | `/add-api ユーザー取得API` |
| [`/fix-bug`](./commands/fix-bug.md) | TDDバグ修正ワークフロー | `/fix-bug ログインエラー` |
| [`/add-feature`](./commands/add-feature.md) | 新機能追加ワークフロー | `/add-feature OAuth認証` |

### 🤖 サブエージェント ([`agents/`](./agents/))

| エージェント | モデル | 用途 | 使用例 |
|-------------|--------|------|--------|
| [`security-reviewer`](./agents/security-reviewer.md) | Opus | セキュリティ脆弱性レビュー | `サブエージェントを使ってセキュリティレビューして` |
| [`code-reviewer`](./agents/code-reviewer.md) | Sonnet | コード品質レビュー | `サブエージェントを使ってコードレビューして` |
| [`test-generator`](./agents/test-generator.md) | Sonnet | テスト自動生成 | `サブエージェントを使ってテストを生成して` |
| [`migration-validator`](./agents/migration-validator.md) | Sonnet | マイグレーション検証 | `サブエージェントを使ってマイグレーションを検証して` |

### 🎯 スキル ([`skills/`](./skills/))

| スキル | 説明 | 自動適用 |
|--------|------|----------|
| [`fondesk-test-strategy`](./skills/fondesk-test-strategy.md) | テスト戦略（TDD、カバレッジ100%） | ✅ |
| [`fondesk-coding-patterns`](./skills/fondesk-coding-patterns.md) | NestJS/TypeORM パターン | ✅ |
| [`legacy-code-improvement`](./skills/legacy-code-improvement.md) | レガシーコード改善手法 | ✅ |

### 🔒 フック設定

#### 禁止操作（自動ブロック）
- 🚫 master/main ブランチへの直接プッシュ
- 🚫 .env ファイルの変更
- 🚫 --no-verify フラグの使用

#### 警告
- ⚠️ master/main ブランチでの作業
- ⚠️ 既存マイグレーションファイルの編集
- ⚠️ 外部リソースへの POST/PUT/DELETE

#### 自動検証（AfterWrite）
- ✅ テストファイル作成 → テスト実行コマンド表示
- 📊 Entity 作成 → インデックス追加の確認
- 🔧 Service 作成 → エラーハンドリングの確認
- ✨ DTO 作成 → バリデーションデコレータの確認
- 🗄️ マイグレーション作成 → 検証項目の表示

## 🚀 インストール

### 1. リポジトリをクローン

```bash
git clone https://github.com/sig-code/claude-code-config.git
cd claude-code-config
```

### 2. 設定ファイルをコピー

```bash
# コマンド、エージェント、スキルをコピー
cp -r commands agents skills ~/.claude/

# commands.md をコピー
cp commands.md ~/.claude/

# グローバル CLAUDE.md をコピー（既存がある場合はバックアップ推奨）
cp CLAUDE.md ~/.claude/

# モデル切り替えスクリプトをコピー
cp switch-model.sh ~/.claude/
chmod +x ~/.claude/switch-model.sh
```

### 3. フック設定を追加

`settings.template.json` を参考に、`~/.claude/settings.json` にフック設定を追加してください。

**重要**: `settings.template.json` はテンプレートです。以下の値を自分の環境に合わせて設定してください：
- `AWS_BEARER_TOKEN_BEDROCK`: 自分の AWS トークン
- `AWS_PROFILE`: 自分の AWS プロファイル
- その他の環境変数

### 4. エイリアスを追加（オプション）

`~/.zshrc` または `~/.bashrc` に追加：

```bash
# Claude Code モデル切り替えエイリアス
alias claude-sonnet="$HOME/.claude/switch-model.sh sonnet"
alias claude-opus="$HOME/.claude/switch-model.sh opus"
alias claude-haiku="$HOME/.claude/switch-model.sh haiku"
alias claude-model="$HOME/.claude/switch-model.sh"
```

```bash
source ~/.zshrc  # または source ~/.bashrc
```

## 📖 使い方

### カスタムコマンド

```bash
# APIエンドポイント追加
/add-api ユーザープロフィール取得API

# バグ修正（TDD）
/fix-bug ログイン後のリダイレクトエラー

# 新機能追加
/add-feature Google OAuth ログイン

# モデル切り替え
/model opus    # 複雑なタスク用
/model sonnet  # 通常の開発作業用
```

### サブエージェント

```bash
# セキュリティレビュー
サブエージェントを使ってこのコードをセキュリティレビューして

# コードレビュー
サブエージェントを使ってコードレビューして

# テスト生成
サブエージェントを使って UserService のテストを生成して

# マイグレーション検証
サブエージェントを使ってこのマイグレーションを検証して
```

### スキルの自動適用

スキルはコンテキストに応じて自動的に適用されます。例えば：

- テストを書く場面 → `fondesk-test-strategy` が適用
- NestJS コードを書く場面 → `fondesk-coding-patterns` が適用
- レガシーコード改善 → `legacy-code-improvement` が適用

## 🎯 ベストプラクティス

### コンテキスト管理
- 無関係なタスク間で `/clear` を実行
- 2回以上修正が必要なら `/clear` して再開

### Plan Mode の活用
- 複雑なタスク: Plan Mode で探索→計画→実装
- シンプルなタスク: 直接実装

### 検証の徹底
- テストカバレッジ 100% を目指す
- サブエージェントでレビュー
- フックで自動検証

## 🔧 カスタマイズ

### プロジェクト固有の設定

プロジェクトルートに `.claude/CLAUDE.md` を作成して、プロジェクト固有のルールを追加できます。

例（NestJS プロジェクト）：
```markdown
# プロジェクト名 - Claude Code 設定

## よく使うコマンド
\`\`\`bash
npm run test -- <pattern>
npm run migration:generate --name=Name
\`\`\`

## 禁止事項
- master ブランチへの直接コミット
- .env ファイルの変更

## アーキテクチャ
- Controller → Service → Repository
- TypeORM エンティティは Plain Old Class として扱う
\`\`\`
```

### 新しいコマンドの追加

1. `~/.claude/commands/` に markdown ファイルを作成
2. `~/.claude/commands.md` に追加

詳細は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

### 新しいサブエージェントの追加

`~/.claude/agents/` に markdown ファイルを作成：

```markdown
---
name: your-agent-name
description: エージェントの説明
tools: Read, Grep, Glob
model: sonnet
---

# エージェントの役割と指示
...
```

## 📚 参考リソース

- [Claude Code 公式ドキュメント](https://code.claude.com/docs)
- [Claude Code ベストプラクティス](https://code.claude.com/docs/best-practices)
- [セットアップ完了ガイド](./SETUP_COMPLETE.md)
- [モデル切り替えガイド](./MODEL_SWITCH_README.md)

## 🤝 コントリビューション

改善提案やバグ報告は Issue または Pull Request でお願いします。

### 貢献方法

1. Fork する
2. Feature ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m '🚀 素晴らしい機能を追加'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照してください。

## 🙏 謝辞

この設定は以下のリソースを参考にしています：

- [Claude Code Best Practices](https://code.claude.com/docs/best-practices)
- 和田卓人「実録レガシーコード改善」
- Michael C. Feathers『レガシーコード改善ガイド』
- NestJS コミュニティのベストプラクティス

## 📬 連絡先

質問や提案がある場合は、Issue を作成してください。

---

⭐ 役に立ったら Star をお願いします！
