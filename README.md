# カテゴリマッピングWebアプリケーション

国内主要ECモール（メルカリShops、楽天市場、ヤフーショッピング）間のカテゴリコードをLLMを使用して自動マッピングするWebアプリケーションです。

## 機能

- **商品名からのマッピング**: 改行区切りの商品名リストから各モールのカテゴリを自動割り当て
- **RAGによる高精度マッピング**: Retrieval-Augmented Generationで関連カテゴリのみをコンテキストに含めることで精度向上
- **エクスポート機能**: クリップボードコピーとCSVダウンロード
- **プロダクト説明**: ホーム画面にツールの説明と使い方を表示

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js Server Actions
- **データベース**: Turso (LibSQL)
- **ORM**: Drizzle ORM
- **AI/LLM**: Google Gemini API
- **UIコンポーネント**: shadcn/ui
- **フォーム管理**: React Hook Form + Zod
- **その他**: useSWR, nuqs, date-fns

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
GEMINI_API_KEY=your_gemini_api_key
TURSO_DATABASE_URL=file:./db/local/local.db
TURSO_AUTH_TOKEN=local
```

本番環境（Vercel）では、Vercelの環境変数設定で以下を設定してください：

```env
GEMINI_API_KEY=your_gemini_api_key
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

### 3. データベースのセットアップ

```bash
# マイグレーション実行
pnpm drizzle-kit migrate --config=drrizle.config.ts

# カテゴリデータの投入
TURSO_DATABASE_URL="file:./db/local/local.db" TURSO_AUTH_TOKEN="local" pnpm tsx scripts/seed-categories.ts
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使用方法

1. ホーム画面で改行区切りで商品名を入力（最大100行）
2. 「マッピング実行」ボタンをクリック
3. 各モールのカテゴリIDとフルパスが自動的に割り当てられます
4. 結果を確認し、「クリップボードにコピー」または「CSVダウンロード」でエクスポート

## プロジェクト構造

```
ecategories/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── ai-mapping.ts    # LLMマッピング処理
│   │   └── categories.ts    # カテゴリ取得
│   └── page.tsx             # ホーム画面（商品名からのマッピング機能）
├── components/
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── mapping-result-table.tsx  # マッピング結果テーブル
│   └── export-buttons.tsx        # エクスポートボタン
├── db/
│   └── schema.ts         # データベーススキーマ
├── docs/                 # ドキュメント
│   ├── requirements.md        # 要件定義書
│   ├── ui-specification.md   # UI仕様書
│   └── technical-specification.md # 技術仕様書
├── lib/
│   ├── db.ts             # データベース接続
│   └── types.ts          # 型定義
└── scripts/
    └── seed-categories.ts # カテゴリデータ投入スクリプト
```

## ドキュメント

詳細な仕様については、以下のドキュメントを参照してください：

- [要件定義書](./docs/requirements.md) - プロジェクトの要件と機能仕様
- [UI仕様書](./docs/ui-specification.md) - UI/UXの詳細仕様
- [技術仕様書](./docs/technical-specification.md) - 実装の技術的詳細

## ライセンス

MIT
