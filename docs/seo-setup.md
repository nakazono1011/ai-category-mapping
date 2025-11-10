# SEO設定ガイド

## 設定済みのSEO要素

### 1. メタタグ（app/layout.tsx）

- **Title**: カテゴリマッピングツール | LLMで自動マッピング | モール併売支援
- **Description**: メルカリShops、楽天市場、ヤフーショッピングのカテゴリをLLM（Gemini）で自動マッピング。RAG技術により高精度なカテゴリ変換を実現。モール併売でカテゴリ設定の時間を98%削減。無料でご利用いただけます。
- **Keywords**: カテゴリマッピング、カテゴリ変換、モール併売、LLM、AI、Gemini、RAG等
- **Open Graph**: SNSシェア時の表示設定
- **Twitter Card**: Twitterシェア時の表示設定
- **Canonical URL**: 重複コンテンツ対策

### 2. robots.txt（public/robots.txt）

- すべてのクローラーにインデックスを許可
- Sitemapの場所を指定

### 3. sitemap.xml（app/sitemap.ts）

- Next.js App Routerの動的sitemap生成機能を使用
- `/sitemap.xml`として自動生成されます

### 4. 構造化データ（components/structured-data.tsx）

- Schema.orgのWebApplicationスキーマを使用
- Google検索結果でのリッチスニペット表示に対応

### 5. manifest.json（app/manifest.ts）

- PWA対応のためのマニフェストファイル
- `/manifest.json`として自動生成されます

## 追加で必要な作業

### 1. OG画像の作成

`public/og-image.png`（1200x630px）を作成してください。
- ツールのスクリーンショットやロゴを含む画像
- SNSシェア時に表示されます

### 2. ファビコンの設定

以下のファビコンファイルを`public`ディレクトリに配置してください：
- `favicon.ico`
- `icon-192.png`（192x192px）
- `icon-512.png`（512x512px）

### 3. Google Search Consoleの設定

1. [Google Search Console](https://search.google.com/search-console)にアクセス
2. プロパティを追加（URLプレフィックス: `https://ecategories.smile-comfort.com`）
3. 所有権の確認方法を選択：
   - HTMLタグ方式: `app/layout.tsx`の`verification.google`にコードを追加
   - またはDNSレコード方式を使用

### 4. ドメイン設定

本番環境のドメインが`ecategories.smile-comfort.com`でない場合、以下のファイルを更新してください：
- `app/layout.tsx`: `url`、`canonical`、`openGraph.url`を更新
- `app/sitemap.ts`: `baseUrl`を更新
- `public/robots.txt`: SitemapのURLを更新

### 5. パフォーマンス最適化

- 画像の最適化（Next.js Imageコンポーネントを使用）
- フォントの最適化（既に実装済み）
- コード分割（Next.jsが自動で対応）

## SEOチェックリスト

- [x] Titleタグの設定
- [x] Descriptionタグの設定
- [x] Keywordsタグの設定
- [x] Open Graphタグの設定
- [x] Twitter Cardタグの設定
- [x] Canonical URLの設定
- [x] robots.txtの作成
- [x] sitemap.xmlの作成
- [x] 構造化データ（JSON-LD）の追加
- [x] manifest.jsonの作成
- [x] lang属性の設定（ja）
- [ ] OG画像の作成
- [ ] ファビコンの設定
- [ ] Google Search Consoleの設定
- [ ] ドメイン設定の確認

## 参考リンク

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

