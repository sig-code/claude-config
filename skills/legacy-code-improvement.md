---
name: legacy-code-improvement
description: レガシーコード（テストのないコード）の段階的改善手法。接合部の活用、Extract/Sprout戦術、ドメインモデル分離による実践的改善ガイド
---

# レガシーコード改善スキル

## 📌 クイックリファレンス

### レガシーコードの定義
> テストのないコードは悪いコードである
> — Michael C. Feathers

### レガシーコードのジレンマ
- コードを変更するにはテストが必要
- テストを書くにはコードの変更が必要

### 解決の鍵
**接合部（Seam）**: その場所を直接編集せずにプログラムの振る舞いを変えられる場所

---

## 🎯 改善の優先順位

### 1位: バージョン管理（最優先）
```bash
git init
git add .
git commit -m "Initial commit: 現状を記録"
```
バージョン管理なしでの作業は危険すぎる。

### 2位: 自動化
- ビルド・デプロイの自動化
- 簡単なスクリプトでも良い
- 0と1の差は大きい

### 3位: テスティング
- 自動テストは安全な変更の前線基地
- TDDで新規コードから改善

---

## 🛠️ 実践テクニック

### 接合部の作成

#### パターン1: 依存性の注入
```typescript
// ❌ Before: テスト困難
class UserService {
  async getUser(id: number) {
    const now = new Date(); // 直接依存
    const random = Math.random(); // ランダム性
    // ...
  }
}

// ✅ After: 接合部を作成
class UserService {
  constructor(
    private readonly timeProvider = () => new Date(),
    private readonly randomProvider = () => Math.random()
  ) {}

  async getUser(id: number) {
    const now = this.timeProvider(); // 注入可能
    const random = this.randomProvider(); // テスト時に固定可能
    // ...
  }
}
```

#### パターン2: Humble Object
テスト容易性を下げる要素を薄く切り出す。

```typescript
// ❌ Before: ハンドラにロジック混在
@Controller()
class QuizController {
  @Post('quiz')
  async startQuiz(@Body() body: any) {
    const random = Math.floor(Math.random() * questions.length);
    const score = 0;
    const message = `クイズ: ${questions[random].q}`;
    // 基盤とロジックが混在
    return { message, score };
  }
}

// ✅ After: ロジックを分離
// ドメインモデル（Plain Old Class）
class QuizSession {
  constructor(private questions: Question[]) {}

  start(getRandomIndex: () => number) {
    const index = getRandomIndex();
    return {
      question: this.questions[index],
      score: 0
    };
  }
}

// コントローラーは薄く
@Controller()
class QuizController {
  @Post('quiz')
  async startQuiz(@Body() body: any) {
    const session = new QuizSession(questions);
    const result = session.start(() => Math.floor(Math.random() * questions.length));
    return { message: `クイズ: ${result.question.q}`, score: result.score };
  }
}
```

---

## 📋 改善戦術の選択

### Extract 戦術
既存コードをテストで保護しながら抽出。

**使用場面:**
- 既存コードをテストで十分保護できる
- リファクタリングの余地がある

**手順:**
1. 粗粒度のテストでコード全体を保護
2. テストをグリーンに保ちながらロジックを抽出
3. 抽出したコードに細粒度のテストを追加

### Sprout 戦術
新規コードだけTDDで開発。

**使用場面:**
- 既存コードのテストが困難
- 新機能追加が中心

**手順:**
1. 新規機能を独立した関数/クラスとして実装
2. 新しいコードはTDDで開発
3. レガシーコードから新しいコードを呼び出す

---

## 🏗️ ドメインモデル分離

### 問題
フレームワークコードとビジネスロジックが混在 = 2つの変更理由が1つのコードに（単一責任の原則違反）

### 解決
```typescript
// ✅ 3層に分離

// 1. コアドメイン層（Plain Old Class）
class Quiz {
  constructor(private questions: Question[]) {}

  calculateScore(answers: Answer[]): number {
    // ビジネスロジックのみ
  }
}

// 2. プレゼンテーション層
class QuizPresenter {
  formatMessage(quiz: Quiz): string {
    // 表示ロジックのみ
  }
}

// 3. アダプタ層（コントローラー）
@Controller()
class QuizController {
  @Post('quiz')
  async startQuiz() {
    const quiz = new Quiz(questions); // ドメイン呼び出し
    const message = this.presenter.formatMessage(quiz); // プレゼンテーション
    return { message };
  }
}
```

---

## 📊 事実と情報の分離

### 原則
- **事実（データ）**: 生データのみ格納
- **情報**: 事実から計算

```typescript
// ✅ 事実を格納
interface SessionDump {
  startedAt: number;
  questions: {
    item: Question;
    startedAt: number;
    finishedAt: number;
    attempts: Array<{
      userAnswer: string;
      result: 'correct' | 'incorrect';
    }>;
  }[];
}

// ✅ 情報は計算
class Session {
  score(): number {
    return this.dump.questions.filter(q =>
      q.attempts.some(a => a.result === 'correct')
    ).length;
  }

  averageTime(): number {
    const times = this.dump.questions.map(q =>
      q.finishedAt - q.startedAt
    );
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}
```

---

## ✅ 改善チェックリスト

### コード変更前
- [ ] バージョン管理に入っているか
- [ ] 現状のテストは全てパスしているか
- [ ] 変更理由を明確に説明できるか

### テスト追加時
- [ ] 接合部を見つけたか
- [ ] Humble Object パターンを適用したか
- [ ] Extract か Sprout か戦術を選択したか

### リファクタリング後
- [ ] テストは全てグリーンか
- [ ] ドメインロジックが Plain Old Class に分離されているか
- [ ] 事実と情報が分離されているか
- [ ] 単一責任の原則を満たしているか

---

## 🎓 重要な原則

### TDDのサイクル
1. テストを書く（Red）
2. 最小限の実装（Green）
3. **リファクタリング**（Refactor）← ここで質が上がる

### 設計原則
- **単一責任の原則（SRP）**: 同じ理由で変更するものはまとめる
- **安定依存の原則**: 安定度の高い方向に依存（ドメイン > アダプタ > 詳細）

### テストピラミッド
```
    /\     E2E（少なく）
   /  \
  /----\   統合（中程度）
 /------\
/________\ ユニット（分厚く）
```

---

## 🚨 Fondesk 固有の注意点

### NestJS コードの改善
- Controller からビジネスロジックを Service へ
- Service から Pure な Domain Model へさらに抽出
- Subscriber は薄く保つ（ドメインロジックを含めない）

### TypeORM エンティティ
- Entity に複雑なロジックを書かない
- 計算ロジックは Domain Model に

### テスト戦略
- Repository をモックして Service をテスト（統合テスト）
- Pure な Domain Model を直接テスト（ユニットテスト・高速）

---

## 📚 参考

- 和田卓人「実録レガシーコード改善」2024
- Michael C. Feathers『レガシーコード改善ガイド』
- Kent Beck『テスト駆動開発』
