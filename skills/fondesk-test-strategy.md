---
name: fondesk-test-strategy
description: Fondesk プロジェクトのテスト戦略とベストプラクティス
---

# Fondesk テスト戦略

## テストカバレッジ目標

**すべての変更ファイルでテストカバレッジ100%を目指す**

```bash
# 変更したファイルのテストのみ実行
npm run test --prefix fondesk-api -- <file-pattern>

# カバレッジ確認
npm run test:cov --prefix fondesk-api -- <file-pattern>
```

## テスト駆動開発（TDD）

### バグ修正時は必ずTDD
1. **まず失敗するテストを書く** - バグを再現するテスト
2. **テストがパスする最小限のコードを書く** - 修正実装
3. **リファクタリング** - コードをクリーンに

### 新機能実装時
1. ハッピーパス（正常系）のテスト
2. エラーケースのテスト
3. エッジケースのテスト

## テストパターン

### Service のテスト

```typescript
describe('YourService', () => {
  let service: YourService
  let repository: Repository<Entity>

  beforeEach(async () => {
    // モジュール設定
    // repositoryをモック
  })

  it('should return expected result', async () => {
    // Arrange: テストデータ準備
    // Act: メソッド実行
    // Assert: 結果検証
  })

  it('should throw error for invalid input', async () => {
    // エラーケースのテスト
  })

  it('should handle edge case: empty result', async () => {
    // エッジケースのテスト
  })
})
```

### Controller のテスト

- Service をモック
- HTTP レスポンスの検証
- エラーハンドリングの確認

## テストすべきシナリオ

### 必須
- ✅ ハッピーパス（正常系）
- ✅ バリデーションエラー
- ✅ データベースエラー
- ✅ 外部サービスエラー

### エッジケース
- ✅ 空の配列/オブジェクト
- ✅ null/undefined
- ✅ 境界値（0, -1, 最大値）
- ✅ 並行実行時の挙動

## モックのベストプラクティス

### Repository モック
```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
}
```

### 外部サービスモック
```typescript
// 成功ケース
mockService.method.mockResolvedValue({ success: true })

// エラーケース
mockService.method.mockRejectedValue(new Error('...'))
```

## 実行時の注意

- リント・ビルドは CI で実行されるため、ローカルでは不要
- パフォーマンス重視のため、特定のテストファイルのみ実行
- カバレッジが100%でないテストは完成とみなさない
