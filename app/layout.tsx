import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "カテゴリマッピングツール | LLMで自動マッピング | モール併売支援",
  description:
    "メルカリShops、楽天市場、ヤフーショッピングのカテゴリをLLM（Gemini）で自動マッピング。RAG技術により高精度なカテゴリ変換を実現。モール併売でカテゴリ設定の時間を98%削減。無料でご利用いただけます。",
  keywords: [
    "カテゴリマッピング",
    "カテゴリ変換",
    "モール併売",
    "LLM",
    "AI",
    "Gemini",
    "RAG",
    "自動化",
    "業務効率化",
    "EC",
    "メルカリ",
    "楽天",
    "ヤフーショッピング",
    "カテゴリコード",
    "カテゴリID",
    "マルチチャネル",
    "在庫管理",
    "商品登録",
    "時間短縮",
    "精度向上",
    "EC運営",
    "EC業務",
    "ECツール",
    "カテゴリ自動化",
    "AI活用",
  ],
  authors: [{ name: "合同会社スマイルコンフォート" }],
  creator: "合同会社スマイルコンフォート",
  publisher: "合同会社スマイルコンフォート",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ecategories.smile-comfort.com",
    siteName: "カテゴリマッピングツール",
    title: "カテゴリマッピングツール | LLMで自動マッピング | モール併売支援",
    description:
      "メルカリShops、楽天市場、ヤフーショッピングのカテゴリをLLM（Gemini）で自動マッピング。RAG技術により高精度なカテゴリ変換を実現。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "カテゴリマッピングツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "カテゴリマッピングツール | LLMで自動マッピング",
    description:
      "メルカリShops、楽天市場、ヤフーショッピングのカテゴリをLLMで自動マッピング。モール併売でカテゴリ設定の時間を98%削減。",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://ecategories.smile-comfort.com",
  },
  verification: {
    // Google Search Console用のverification codeを追加する場合はここに
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
