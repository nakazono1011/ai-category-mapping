# 技術仕様書

## 1. アーキテクチャ

### 1.1 全体構成
```
Next.js App Router
├── Server Actions (内部API)
├── Client Components (UI)
└── Database (Turso/LibSQL)
```

### 1.2 データフロー
1. ユーザー入力 → Client Component
2. Client Component → Server Action
3. Server Action → AI API (Gemini)
4. Server Action → Database (Turso)
5. Server Action → Client Component (結果返却)

## 2. AIマッピング実装

### 2.1 商品名からのマッピング

#### 2.1.1 処理フロー
```typescript
mapProductsFromNames(productNames: string[])
├── 各商品名に対して並列処理
│   ├── 各モールに対して並列処理
│   │   ├── RAG: 関連カテゴリ検索
│   │   ├── カテゴリ候補の準備
│   │   ├── LLM呼び出し (gemini-2.0-flash-lite)
│   │   └── 結果パース
│   └── 結果マージ
└── MappingResult[]を返却
```

#### 2.1.2 RAG実装
```typescript
// 1. 商品名からキーワード抽出
const keywords = extractKeywords(productName);

// 2. 関連カテゴリ検索
const relevantCategories = await searchCategories(mall, keywords);

// 3. カテゴリ候補の準備
const categoryCandidates = relevantCategories.length >= 20
  ? relevantCategories
  : [...relevantCategories, ...additionalCategories];
```

#### 2.1.3 プロンプト構造
```
商品名: {productName}

以下のカテゴリリストから、この商品に最も適切なカテゴリを1つ選択してください。

カテゴリリスト:
{categoryList}

注意事項:
- 全てのカテゴリから選択してください
- カテゴリIDは必ず上記のリストに含まれているものを使用してください

JSON形式で返答してください:
{
  "categoryId": "カテゴリID",
  "categoryName": "カテゴリ名",
  "fullPath": "フルパス"
}
```

## 3. データベース実装

### 3.1 接続設定
```typescript
// lib/db.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./db/local/local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);
```

### 3.2 スキーマ定義
```typescript
// db/schema.ts
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  mallName: text("mall_name").notNull(),
  categoryName: text("category_name").notNull(),
  categoryId: text("category_id").notNull(),
  fullPath: text("full_path"),
  parentCategoryId: text("parent_category_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

### 3.3 クエリ例

#### 3.3.1 カテゴリリスト取得
```typescript
const categories = await db
  .select()
  .from(categories)
  .where(eq(categories.mallName, mallName))
  .limit(10000);
```

#### 3.3.2 カテゴリ検索（RAG）
```typescript
const results = await db
  .select()
  .from(categories)
  .where(
    and(
      eq(categories.mallName, mallName),
      or(
        like(categories.categoryName, `%${query}%`),
        like(categories.fullPath, `%${query}%`)
      )
    )
  )
  .limit(100);
```

## 4. Server Actions実装

### 4.1 カテゴリ取得
```typescript
// app/actions/categories.ts
export async function getCategoryList(mallName: MallName): Promise<Category[]>
export async function searchCategories(mallName: MallName, query: string): Promise<Category[]>
```

### 4.2 AIマッピング
```typescript
// app/actions/ai-mapping.ts
export async function mapProductsFromNames(productNames: string[]): Promise<MappingResult[]>
```

## 5. クライアント側実装

### 5.1 フォーム管理
```typescript
// React Hook Form + Zod
const schema = z.object({
  productNames: z.string().min(1, "商品名を入力してください"),
});

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### 5.2 状態管理
```typescript
const [results, setResults] = useState<MappingResult[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 6. エクスポート機能

### 6.1 クリップボードコピー
```typescript
const copyToClipboard = () => {
  const text = results.map(result => {
    const row = [result.productName || result.sourceCategory?.name];
    malls.forEach(mall => {
      const mapping = result.mappings[mall];
      if (mapping) {
        row.push(mapping.id || "", mapping.fullPath || "");
      } else {
        row.push("", "");
      }
    });
    return row.join("\t");
  }).join("\n");
  
  navigator.clipboard.writeText(text);
};
```

### 6.2 CSVダウンロード
```typescript
const downloadCSV = () => {
  const headers = ["商品名", ...malls.flatMap(mall => [`${mallLabels[mall]}カテゴリID`, `${mallLabels[mall]}フルパス`])];
  const rows = results.map(result => {
    const row = [result.productName || result.sourceCategory?.name || ""];
    malls.forEach(mall => {
      const mapping = result.mappings[mall];
      row.push(mapping?.id || "", mapping?.fullPath || "");
    });
    return row;
  });
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mapping-results.csv";
  link.click();
};
```

## 7. エラーハンドリング

### 7.1 バリデーション
- フォーム入力のバリデーション（Zod）
- 商品名の最大行数チェック（100行）

### 7.2 エラー表示
```typescript
{error && (
  <Card className="border-red-500">
    <CardContent className="pt-6">
      <p className="text-red-500">{error}</p>
    </CardContent>
  </Card>
)}
```

## 8. パフォーマンス最適化

### 8.1 並列処理
- モールごとの並列マッピング（`Promise.all`）
- 商品ごとの並列処理

### 8.2 コンテキストサイズ削減
- RAGによる関連カテゴリのみをコンテキストに含める
- 最大50件のカテゴリ候補

### 8.3 モデル選択
- 商品名からのマッピング: 軽量モデル（`gemini-2.0-flash-lite`）

## 9. セキュリティ

### 9.1 環境変数
- APIキーは環境変数で管理
- `.env.local`はGitにコミットしない

### 9.2 入力検証
- Zodによるバリデーション
- SQLインジェクション対策（Drizzle ORMのパラメータ化クエリ）

## 10. デプロイ

### 10.1 Vercel設定
- 環境変数の設定
- ビルドコマンド: `pnpm build`
- 出力ディレクトリ: `.next`

### 10.2 データベース
- 本番環境: Turso
- ローカル開発: SQLite

---

**最終更新日**: 2024年12月

