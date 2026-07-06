---
description: AI Task Viewer (ローカル) のタスクを操作・確認する
---

`aitask` CLI（グローバル登録済み / DB: `~/.claude/ai-tasks/tasks.db`）を使って、ローカルの AI タスクを管理する。

引数: $ARGUMENTS

## 方針
- 引数が空、または「一覧 / 状況 / 何やってる」系 → `aitask list --json` と `aitask sessions --json` を実行し、進捗を要約して報告。**さらに `aitask requests --json` を確認**し、分解待ちがあれば先に知らせる。
- 「#N を分解 / 細かく / ブレイクダウン」系 → 対象タスクを `aitask show <N> --json` で把握し、**3〜7個程度の実行可能なサブタスク**に分解。`aitask add "..." --project <親と同じ> --parent N [--priority]` で登録し、最後に `aitask clear-decompose N` で分解フラグを下ろす。
- 「追加 / 作って」系 → タスクを**細かく分解**し、`aitask add "..." --project <推定> [--priority] [--parent N]` で登録。親タスク→サブタスクの順で parent_id を繋ぐ。
- 「開始 / 着手」→ `aitask start <id>`、「完了」→ `aitask done <id>`、進捗メモ → `aitask note <id> "..."`。
- ステータス/優先度変更 → `aitask update <id> --status ... --priority ...`。
- ビューアは Claude 起動時に自動起動済み（http://localhost:4319）。

## UI からの分解依頼（重要）
ビューアの「Claude で分解」ボタンを押すとタスクに分解フラグが立つ。`/task` 実行時や作業の区切りで `aitask requests --json` を確認し、フラグが立っていれば上記「分解」手順で処理してフラグを下ろすこと。

## 自動記録のルール（このセッション中ずっと）
- 実装・調査タスクに着手したら、対応する aitask を `start`、要所で `note` を残す。
- セッションIDが additionalContext で渡っていれば `--session <id>` を付ける。
- project はカレントディレクトリ名（fondesk / card-optimizer 等）を既定にする。

まず現状を把握してから動くこと。
