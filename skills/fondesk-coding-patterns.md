---
name: fondesk-coding-patterns
description: Fondesk プロジェクトのコーディングパターンとアーキテクチャ
---

# Fondesk コーディングパターン

## NestJS モジュール構成

### 標準ファイル構成
```
module-name/
├── module-name.controller.ts      # HTTPエンドポイント
├── module-name.service.ts         # ビジネスロジック
├── module-name.entity.ts          # TypeORMエンティティ
├── module-name.module.ts          # モジュール定義
├── module-name.subscriber.ts      # サイドエフェクト処理
├── dto/
│   ├── create-module.dto.ts      # 作成用DTO
│   └── update-module.dto.ts      # 更新用DTO
├── module-name.controller.spec.ts # Controllerテスト
└── module-name.service.spec.ts    # Serviceテスト
```

## TypeORM パターン

### Entity 定義
```typescript
@Entity('table_name')
export class YourEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Index() // 頻繁にクエリされるカラムにインデックス
  @Column()
  accountId: number

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date // 論理削除

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account
}
```

### Repository パターン
- `@InjectRepository(Entity)` で依存性注入
- QueryBuilder を使った複雑なクエリ
- トランザクションが必要な場合は `@Transaction()` デコレータ

## サブスクライバーパターン

**サイドエフェクトはサブスクライバーで処理**

```typescript
@EventSubscriber()
export class YourSubscriber implements EntitySubscriberInterface<YourEntity> {
  listenTo() {
    return YourEntity
  }

  afterInsert(event: InsertEvent<YourEntity>) {
    // OpenSearchインデックス化、通知送信など
  }
}
```

**メインビジネスロジックをクリーンに保つため、以下をサブスクライバーで処理:**
- OpenSearch インデックス化
- 通知送信
- ログ記録
- イベント発行

## DTO とバリデーション

```typescript
export class CreateUserDto {
  @ApiProperty({ description: 'ユーザー名' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'メールアドレス' })
  @IsEmail()
  email: string

  @ApiProperty({ description: '年齢', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  age?: number
}
```

**必須デコレータ:**
- class-validator: `@IsString()`, `@IsNotEmpty()`, `@IsEmail()` など
- Swagger: `@ApiProperty()` でドキュメント化

## Controller パターン

```typescript
@Controller('api/v2/users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @Authenticate() // 認証必須
  @ApiOperation({ summary: 'ユーザー取得' })
  @ApiResponse({ status: 200, type: UserDto })
  async getUser(
    @Param('id', HashidPipe) id: number, // Hashidパイプで内部IDに変換
    @UserMeta() user: UserMetadata, // 認証済みユーザー情報
  ) {
    return this.userService.findOne(id, user.accountId)
  }
}
```

## エラーハンドリング

### Service層
```typescript
async createUser(dto: CreateUserDto): Promise<User> {
  try {
    const user = this.repository.create(dto)
    return await this.repository.save(user)
  } catch (error) {
    this.logger.error(`Failed to create user: ${error.message}`, error.stack)
    throw new InternalServerErrorException('ユーザーの作成に失敗しました')
  }
}
```

### 重要なポイント
- エラーを適切にログ
- ユーザーフレンドリーなエラーメッセージ
- エラーを無視しない（catch して何もしないは NG）

## セキュリティパターン

### 認証・認可
```typescript
@Authenticate() // 必須
async protectedEndpoint(@UserMeta() user: UserMetadata) {
  // user.accountId でマルチテナント対応
  // 必ずアカウントスコープで絞り込む
  return this.service.findByAccount(user.accountId)
}
```

### ウェブフック検証
```typescript
// Twilio、Stripeなどのウェブフックは署名検証必須
@Post('webhook')
@UseGuards(TwilioSignatureGuard)
async handleWebhook(@Body() payload: any) {
  // イデンポテンシーキーで重複処理を防ぐ
  const key = payload.idempotencyKey
  if (await this.isProcessed(key)) {
    return { status: 'already_processed' }
  }

  // 処理実装
}
```

## パフォーマンス考慮事項

- **コネクションプール制限**: MySQL は5接続のみ
- **N+1問題回避**: 適切に Eager/Lazy Loading
- **重い処理はキューへ**: Redis + Bull キュー使用
- **インデックス活用**: 頻繁にクエリされるカラムにインデックス

## 外部サービス統合

### 統一通知パターン
- Slack, Teams, LINE, Chatwork, Google Chat
- サービス固有モジュール + 統一通知プロセッサー

### ウェブフック処理
- Twilio, Stripe - 署名検証必須
- イデンポテンシー実装
- リトライ戦略（指数バックオフ）
