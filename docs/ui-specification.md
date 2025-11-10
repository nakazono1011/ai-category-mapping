# UI仕様書

## 1. ホーム画面（商品名からのマッピング）

### 1.1 レイアウト
- **コンテナ**: `w-full`（画面横幅いっぱい）
- **パディング**: `p-6`
- **スペーシング**: `space-y-6`

### 1.2 ヘッダー
- **タイトル**: 「カテゴリマッピングツール」、`text-4xl font-bold`
- **概要**: LLMを使用した自動マッピングの説明、`text-lg text-muted-foreground`

### 1.3 プロダクト説明セクション（Card）
- **タイトル**: 「このツールについて」
- **機能説明**:
  - 商品名リストから各モールのカテゴリを自動割り当て
  - RAG（Retrieval-Augmented Generation）による高精度なマッピング
  - 結果をクリップボードにコピーまたはCSVダウンロード
- **対応モール**: メルカリShops、楽天市場、ヤフーショッピング
- **使い方**: 4ステップの手順を番号付きリストで表示

### 1.4 入力フォーム（Card）
- **タイトル**: 「商品名を入力」
- **説明**: 「改行区切りで商品名を入力してください（最大100行）」
- **Textarea**:
  - `rows={10}`
  - `font-mono`
  - プレースホルダー: 改行区切りで表示
    ```
    商品名1
    商品名2
    商品名3
    ```
- **実行ボタン**: 「マッピング実行」、ローディング時は「マッピング中...」

### 1.5 結果テーブル（Card）

#### 1.5.1 テーブル全体
- **コンテナ**: `w-full overflow-auto max-h-[calc(100vh-300px)]`
- **テーブル**: `text-xs w-full table-fixed`
- **高さ制限**: 1画面に収まるようにスクロール可能

#### 1.5.2 列構成
| 列名 | 幅 | 内容 | スタイル |
|------|-----|------|---------|
| 商品名/元カテゴリ | 350px | 商品名（2行表示） | `font-medium`, `line-clamp-2`, `break-words` |
| メルカリShops | 250px | カテゴリID（太字）+ フルパス（muted色、2行） | - |
| 楽天市場 | 250px | カテゴリID（太字）+ フルパス（muted色、2行） | - |
| ヤフーショッピング | 250px | カテゴリID（太字）+ フルパス（muted色、2行） | - |

#### 1.5.3 セル内容（編集不可モード）
- **商品名列**:
  ```tsx
  <div className="break-words whitespace-normal overflow-hidden" style={{
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.25rem',
    maxHeight: '2.5rem',
  }}>
    {productName}
  </div>
  ```

- **モール列**:
  ```tsx
  <div className="space-y-1">
    {categoryId && (
      <div className="font-mono font-bold text-xs">
        {categoryId}
      </div>
    )}
    {fullPath && (
      <div className="break-words whitespace-normal overflow-hidden text-muted-foreground" style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: '1.25rem',
        maxHeight: '2.5rem',
      }}>
        {fullPath}
      </div>
    )}
  </div>
  ```

### 1.6 エクスポートボタン
- **クリップボードコピー**: カテゴリIDとフルパスを含む
- **CSVダウンロード**: カテゴリIDとフルパスを含む

## 2. 共通UIコンポーネント

### 2.1 テーブル
- **ベース**: shadcn/uiのTableコンポーネント
- **テキストサイズ**: `text-xs`
- **セル配置**: `align-top`（複数行表示時の位置調整）

### 2.2 ボタン
- **サイズ**: `sm`または`default`
- **テキストサイズ**: `text-xs`（テーブル内）

### 2.3 入力フィールド
- **テキストサイズ**: `text-xs`
- **プレースホルダー**: モール名を含む

## 3. カラーパレット

### 3.1 テキスト色
- **通常テキスト**: `text-foreground`（デフォルト）
- **mutedテキスト**: `text-muted-foreground`（フルパス表示）
- **エラーテキスト**: `text-red-500`

### 3.2 背景色
- **カード**: `bg-card`
- **テーブル**: `bg-background`

## 4. レスポンシブ対応

### 4.1 現在の実装
- 固定幅レイアウト（`table-fixed`）
- 横スクロール対応（`overflow-x-auto`）

### 4.2 今後の改善案
- モバイル対応（テーブルの縦スクロール化）
- ブレークポイントに応じた列幅調整

## 5. アクセシビリティ

### 5.1 実装済み
- セマンティックHTML（Table, TableHead, TableCell）
- ラベルと入力フィールドの関連付け

### 5.2 今後の改善案
- ARIA属性の追加
- キーボードナビゲーションの改善

---

**最終更新日**: 2024年12月

