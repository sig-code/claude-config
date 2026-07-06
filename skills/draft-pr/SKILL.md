---
name: draft-pr
description: 実装完了後に「セルフレビュー → コミット → push → Draft PR 作成」を一気通貫で行う。「PRを仕上げて」「ドラフトPRを作って」「PR作って」「コミットしてPRまで」と言われた時に使用する。コミットはGitmoji+日本語、PRは必ずDraftで日本語説明付き。
---

# Draft PR 作成スキル

## 🎯 ゴール

実装が一段落したら、**レビューで品質を担保 → 規約準拠でコミット → push → Draft PR を丁寧な日本語説明付きで作成** するまでを一気通貫で行う。マージ可能な状態に磨いてからレビュワーに渡す。

## 🚨 最重要ルール（必ず守る）

1. **必ず Draft で作成する**: `gh pr create --draft`。レビュー依頼前提でレビュワーに早めに共有する
2. **PR 作成前に必ずセルフレビューする**: `/code-review` で差分を点検し、見つけた問題は PR 化前に直す
3. **コミット規約を守る**: Gitmoji + 日本語（~/.claude/CLAUDE.md のグローバル Git 規約に従う）
4. **PR 説明は日本語で丁寧に**: 説明テンプレは `pr-description` スキルに従う。Why ファースト・影響範囲・重点レビュー箇所
5. **デフォルトブランチに直接コミットしない**: master/main にいる場合は必ず feature ブランチを切る
6. **コミット/push はユーザーの依頼時のみ**: 勝手に push しない。本スキルが呼ばれた時点で依頼ありとみなす

---

## 📋 フロー

### 1. 事前確認
```bash
git status --short          # 作業ツリーの状態
git branch --show-current   # 現在ブランチ
gh repo view --json defaultBranchRef -q .defaultBranchRef.name  # デフォルトブランチ
```
- デフォルトブランチ上なら `git checkout -b feature/<英語で説明的な名前>` でブランチを切る

### 2. セルフレビュー
- `/code-review high` で差分をレビュー
- **セキュリティ観点を最優先**: 認証バイパス・署名検証・環境変数の本番混入リスクなどを確認
- 見つけた問題は PR 化前に修正し、必要ならテストを追加
- Lint / 関連テストを実行してグリーンを確認
  ```bash
  npm run lint
  npx jest <関連spec>   # 該当プロジェクトのテストランナーに合わせる
  ```

### 3. コミット
- Gitmoji + 日本語で端的に（例: `🚀 通知ルール機能を追加`、`🐞 本番での誤バイパス防止`）
- 論理単位で分割（機能追加とセキュリティ修正は別コミット等）
- フッターに `Co-Authored-By` を付与する運用に従う

### 4. push
```bash
git push -u origin <branch>
```

### 5. Draft PR 作成
- タイトル: Gitmoji + 日本語
- 本文: `pr-description` のサイズ別テンプレに従い、`gh pr create` で直接渡す
```bash
gh pr create --draft --base <default> --head <branch> \
  --title "🚀 ..." --body "$(cat <<'EOF'
## 概要
...
EOF
)"
```

### 6. Linear 連携（ある場合）
- チームプレフィックスがあれば本文に `closes <PREFIX>-<番号>` を記載

---

## 📝 PR 本文に必ず含める項目

- **概要**: 1行目で「何を解決する PR か」（Why ファースト）
- **背景**: なぜこの変更が必要か。きっかけ・前提
- **変更内容**: ファイル単位の表（ファイル / 変更）
- **セキュリティ/リスク配慮**: 認証・本番影響・多層防御の説明（該当時）
- **動作確認**: チェックリスト（lint / test / 手動確認）
- **補足**: 現状維持の判断やスコープ外事項

---

## 🔗 関連スキル

- `pr-description`: PR 本文のサイズ別テンプレと書き方
- `/code-review`: 差分レビューの観点
- Git 規約: ~/.claude/CLAUDE.md（ブランチ命名・コミットメッセージ）

## ⚠️ アンチパターン

- ❌ レビューせずに即 PR 作成 → セルフレビューを必ず挟む
- ❌ 通常 PR で作成 → 必ず `--draft`
- ❌ 一時ファイル経由で本文をコピペ → `gh pr create --body` で直接渡す
- ❌ 英語のコミットメッセージや長文 → Gitmoji + 日本語で端的に
- ❌ master/main 上で直接作業 → feature ブランチを切る
