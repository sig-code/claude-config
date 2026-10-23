# claude-config

Claude Code のグローバル設定（`~/.claude`）を git で管理するためのリポジトリです。
対象は CLAUDE.md、スキル、出力スタイル、設定のテンプレートです。
セッション履歴や認証情報を含むファイル（settings.json、statusline.sh など）は .gitignore で除外しています。

## 構成

| パス | 内容 |
|---|---|
| `CLAUDE.md` | 全プロジェクト共通のルール（Git 規約、Issue 起票、サブエージェント委任の基準、日本語出力） |
| `skills/` | 自作スキル。下表を参照 |
| `output-styles/` | 出力スタイル。`ja-style`（日本語で書き起こす）と `concise`（結論先行） |
| `settings.template.json` | settings.json の雛形。許可リスト、通知フック、ステータスライン、出力スタイルの設定例 |

### スキル

| スキル | 用途 |
|---|---|
| `bug-fix` | バグ調査・修正・インシデント対応・Bugsnag トリアージ |
| `first-review` | PR や差分のレビューで、精読の前に変更の輪郭を把握する |
| `release-note` | fondesk / fondesk-ivr のリリースノートと Slack 投稿文を作る |
| `monthly-tech-sharing` | 月次の技術共有会レポートを直近のコミット・PR から生成する |
| `yomiyasu` | AI が生成した日本語の推敲。リンター `scripts/yomiyasu_lint.py` を含む |
| `mashimo-voice` | 眞下卓也名義の発信物を同じ人格で書くための世界観と線引き |
| `eli5` | トピックを何も知らない人向けに、図を中心に説明する HTML を作る |
| `grilling` | 設計やプランを作る前に、質問を重ねて前提を詰める |
| `archify` | アーキテクチャ図・シーケンス図・状態遷移図を HTML/SVG で作る |

## 使い方

1. このリポジトリを `~/.claude` として clone する（既存の `~/.claude` がある場合は中身を退避してから）
2. `settings.template.json` を参考に `~/.claude/settings.json` を書く。モデル名や許可リストは環境に合わせて変える
3. `statusline.sh` は各自で用意する（モデル名・Node 版・ブランチを表示するスクリプトを想定）

スキルは `skills/<name>/SKILL.md` を置くだけで Claude Code が読み込みます。

## ライセンス

MIT License。詳細は [LICENSE](./LICENSE) を参照してください。
