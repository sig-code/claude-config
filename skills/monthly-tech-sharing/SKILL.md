---
name: monthly-tech-sharing
description: 月次フロントエンド・AI技術共有会のレポートを自動生成する。「月次共有会のレポート作って」「技術共有レポート」「今月の技術共有」と言われた時に使用する。fondesk/fondesk-ivr の直近30日のコミット・PRからAI・フロントエンド関連の取り組みを収集し、定型フォーマットで出力する。
---

# 月次技術共有レポート生成

月次フロントエンド・AI技術共有会のレポートを自動生成します。

## 手順

### 1. 対象期間を確定する

今日から過去30日間を対象とする。開始日時を以下で確認：
```bash
date -v-30d +%Y-%m-%d   # macOS
```

### 2. fondesk リポジトリの作業を収集する

過去1ヶ月のコミットを取得し、AI・フロントエンド関連を抽出する：
```bash
git log --oneline --since="30 days ago" --all | head -200
```

マージ済み PR 一覧を取得：
```bash
gh pr list --repo uluru/fondesk --state merged --limit 60 --json number,title,mergedAt,headRefName | jq '.[] | select(.mergedAt > "SINCE_DATE")'
```

**収集対象キーワード（以下を含む PR・コミットを対象とする）**
- AI系: `AI`, `transcri`, `summariz`, `LLM`, `openai`, `mcp`, `eval`, `promptfoo`, `claude`
- フロント系: `UI`, `UX`, `vue`, `nuxt`, `sentry`, `auth0`, `chunk`, `polyfill`, `component`, `error`

関連 PR の詳細を取得：
```bash
gh pr view <number> --repo uluru/fondesk
```

### 3. fondesk-ivr リポジトリの作業を収集する

過去1ヶ月のマージ済み PR を取得：
```bash
gh pr list --repo uluru/fondesk-ivr --state merged --limit 60
```

同じキーワードで AI・フロントエンド関連 PR を特定し、詳細を取得：
```bash
gh pr view <number> --repo uluru/fondesk-ivr
```

**除外する項目**（フロント・AIに無関係なものは含めない）
- 課金・Stripe・サブスクリプション処理
- データベースマイグレーション
- インフラ・デプロイ設定
- SQL・インデックス最適化
- 外部通知（Slack/メール）のリトライロジック

### 4. 技術的背景が必要な場合は WebSearch で補足する

削除したライブラリのセキュリティ問題、採用した技術の概要など、
文脈の補足が必要な場合は WebSearch で調査して簡潔に加える。

### 5. 以下のフォーマットでレポートを出力する

**出力ルール**
- プレーンテキスト形式
- PR番号は含めない
- 各項目は要点のみ簡潔に（3〜5行程度）
- 技術的な判断理由・背景を必ず含める
- 内容がない項目は「（なし）」と記載する

---

【最新技術・ツールのキャッチアップ】
- （新技術・新ツールの導入。導入目的と何が変わったかを含める）

【直近の技術課題と解決策】
- （発生した問題の背景と、どう解決したか。「なぜその方法を選んだか」を含める）

【AIツール・開発支援ツールの活用事例】
- （LLM活用・Claude Code スキル・開発効率化の具体的な事例。結果・効果を含める）

【ライブラリの選定・検証・リファクタリング】
- （ライブラリの追加・削除・更新。選定理由または削除理由を含める）

【パフォーマンス改善と品質保証】
- （速度改善・テスト強化・品質向上の取り組み。数値や効果を含める）
