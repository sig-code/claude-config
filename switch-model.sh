#!/bin/zsh

# Claude Code モデル切り替えスクリプト

SETTINGS_FILE="$HOME/.claude/settings.json"

# 利用可能なモデル定義
declare -A MODELS
MODELS[sonnet]="anthropic.claude-sonnet-4-5-20250929-v1:0"
MODELS[opus]="anthropic.claude-opus-4-5-20251101-v1:0"
MODELS[haiku]="anthropic.claude-haiku-4-5-20251001-v1:0"

# 使用方法を表示
show_usage() {
    echo "使用法: switch-model.sh [sonnet|opus|haiku]"
    echo ""
    echo "利用可能なモデル:"
    echo "  sonnet - Claude Sonnet 4.5 (バランス型)"
    echo "  opus   - Claude Opus 4.5 (最高性能)"
    echo "  haiku  - Claude Haiku 4.5 (高速・低コスト)"
    echo ""
    echo "現在のモデル:"
    current_model=$(jq -r '.model' "$SETTINGS_FILE")
    echo "  $current_model"
}

# 引数チェック
if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

MODEL_KEY=$1

# モデルキーの検証
if [ -z "${MODELS[$MODEL_KEY]}" ]; then
    echo "エラー: 無効なモデル '$MODEL_KEY'"
    show_usage
    exit 1
fi

NEW_MODEL="${MODELS[$MODEL_KEY]}"

# settings.jsonが存在するか確認
if [ ! -f "$SETTINGS_FILE" ]; then
    echo "エラー: $SETTINGS_FILE が見つかりません"
    exit 1
fi

# jqがインストールされているか確認
if ! command -v jq &> /dev/null; then
    echo "エラー: jq がインストールされていません"
    echo "インストール: brew install jq"
    exit 1
fi

# バックアップ作成
cp "$SETTINGS_FILE" "${SETTINGS_FILE}.backup"

# モデルを更新
jq --arg model "$NEW_MODEL" \
   '.model = $model | .env.ANTHROPIC_MODEL = $model' \
   "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp"

# 更新が成功したか確認
if [ $? -eq 0 ]; then
    mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"
    echo "✓ モデルを $MODEL_KEY に切り替えました"
    echo "  モデルID: $NEW_MODEL"
    echo ""
    echo "変更を反映するには Claude Code を再起動してください"
else
    echo "エラー: モデルの切り替えに失敗しました"
    mv "${SETTINGS_FILE}.backup" "$SETTINGS_FILE"
    exit 1
fi
