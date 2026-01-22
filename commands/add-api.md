---
description: 新しいAPIエンドポイントを追加
---

# 新しいAPIエンドポイントを追加

以下の手順で新しいAPIエンドポイント `$ARGUMENTS` を追加してください：

## 1. 探索フェーズ（Plan Mode推奨）

既存の類似エンドポイントを確認：
- 関連するController、Service、Entity を探す
- 既存の実装パターンを理解する
- 必要な依存関係を特定する

## 2. 実装

以下の順序で実装してください：

### 2.1 DTO作成
- リクエスト/レスポンスのDTOを作成
- class-validatorデコレータを適切に設定（@IsString、@IsNotEmpty など）
- API仕様に合わせたバリデーションルールを定義

### 2.2 Entity更新（必要な場合）
- 新しいカラムが必要な場合はEntityを更新
- インデックスが必要なカラムには@Index()デコレータを追加
- リレーションを適切に定義

### 2.3 Service実装
- ビジネスロジックをServiceに実装
- 適切なエラーハンドリング（try-catch、例外スロー）
- 外部サービス呼び出しには適切なログを追加
- トランザクションが必要な場合は@Transaction()を使用

### 2.4 Controller実装
- HTTPメソッド（GET/POST/PUT/DELETE）を適切に選択
- パラメータバリデーションにPipeを使用（HashidPipe、ParseIntPipeなど）
- Swagger デコレータを追加：
  - @ApiOperation() - エンドポイントの説明
  - @ApiResponse() - レスポンスの定義
  - @ApiTags() - APIグループ化
- 認証が必要な場合は@Authenticate()デコレータを追加

## 3. テスト作成

### 3.1 ユニットテスト
- Service のユニットテストを作成（`*.service.spec.ts`）
- Controller のユニットテストを作成（`*.controller.spec.ts`）
- モックを適切に使用してテストを独立させる

### 3.2 テスト実行と検証
```bash
# 作成したファイルのテストのみ実行
npm run test --prefix fondesk-api -- <file-pattern>

# カバレッジ確認（100%を目指す）
npm run test:cov --prefix fondesk-api -- <file-pattern>
```

## 4. 最終確認

- [ ] DTOバリデーションが適切に設定されている
- [ ] Swaggerドキュメントが正しく生成される
- [ ] エラーハンドリングが適切
- [ ] テストカバレッジが100%
- [ ] ログが適切に出力される
- [ ] セキュリティ上の問題がない（SQLインジェクション、XSSなど）

## 5. コミット

適切なGitmojiとメッセージでコミット：
```
🚀 [機能名]APIを追加
```
