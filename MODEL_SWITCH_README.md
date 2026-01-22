# Claude Code モデル切り替えガイド

AWS Bedrock 経由で Claude Code のモデルを簡単に切り替えるためのスクリプトです。

## 利用可能なモデル

| モデル | 特徴 | 用途 |
|--------|------|------|
| **Sonnet 4.5** | バランス型 | 日常的な開発作業に最適 |
| **Opus 4.5** | 最高性能 | 複雑なタスク、高精度が必要な場合 |
| **Haiku 4.5** | 高速・低コスト | シンプルなタスク、クイックレスポンス |

## 使い方

### 方法1: エイリアスを使用（推奨）

新しいターミナルセッションで以下のコマンドが使えます：

```bash
# Sonnet 4.5 に切り替え
claude-sonnet

# Opus 4.5 に切り替え
claude-opus

# Haiku 4.5 に切り替え
claude-haiku

# 現在のモデルを確認
claude-model
```

### 方法2: スクリプトを直接実行

```bash
~/.claude/switch-model.sh sonnet   # Sonnet に切り替え
~/.claude/switch-model.sh opus     # Opus に切り替え
~/.claude/switch-model.sh haiku    # Haiku に切り替え
~/.claude/switch-model.sh          # ヘルプと現在のモデルを表示
```

## 重要な注意事項

1. **Claude Code の再起動が必要**
   - モデルを切り替えた後、変更を反映するには Claude Code を再起動してください
   - 現在実行中のセッションには反映されません

2. **エイリアスの読み込み**
   - 新しいターミナルセッションでエイリアスが有効になります
   - 現在のセッションで有効にするには: `source ~/.zshrc`

3. **バックアップ**
   - スクリプトは切り替え前に自動的に `~/.claude/settings.json.backup` を作成します

## モデルの選び方

### Sonnet 4.5 を使うべき場合
- 通常の開発作業
- コードレビュー
- バグ修正
- ドキュメント作成

### Opus 4.5 を使うべき場合
- 複雑なアーキテクチャ設計
- 大規模なリファクタリング
- 高度なデバッグ
- 重要な意思決定が必要な場合

### Haiku 4.5 を使うべき場合
- シンプルな質問
- クイックな確認
- コスト削減が重要な場合
- 高速なレスポンスが必要な場合

## トラブルシューティング

### エラー: jq がインストールされていません
```bash
brew install jq
```

### エイリアスが機能しない
```bash
source ~/.zshrc
```

### 設定ファイルの場所
- 設定ファイル: `~/.claude/settings.json`
- バックアップ: `~/.claude/settings.json.backup`
- スクリプト: `~/.claude/switch-model.sh`

## 技術詳細

### モデル ID
- Sonnet 4.5: `anthropic.claude-sonnet-4-5-20250929-v1:0`
- Opus 4.5: `anthropic.claude-opus-4-5-20251101-v1:0`
- Haiku 4.5: `anthropic.claude-haiku-4-5-20251001-v1:0`

### リージョン
- AWS Region: `ap-northeast-1` (東京)
- AWS Profile: `sandbox`

### 更新される設定項目
- `.model`: メインのモデル ID
- `.env.ANTHROPIC_MODEL`: 環境変数のモデル ID
