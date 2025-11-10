export function StructuredData() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "カテゴリマッピングツール",
		description:
			"メルカリShops、楽天市場、ヤフーショッピングのカテゴリをLLM（Gemini）で自動マッピング。RAG技術により高精度なカテゴリ変換を実現。",
		url: "https://ecategories.smile-comfort.com",
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "JPY",
		},
		provider: {
			"@type": "Organization",
			name: "合同会社スマイルコンフォート",
			url: "https://www.smile-comfort.com",
		},
		featureList: [
			"商品名からの自動カテゴリマッピング",
			"メルカリShops対応",
			"楽天市場対応",
			"ヤフーショッピング対応",
			"RAG技術による高精度マッピング",
			"CSVエクスポート",
			"クリップボードコピー",
		],
		keywords:
			"カテゴリマッピング,カテゴリ変換,モール併売,LLM,AI,Gemini,RAG,自動化,業務効率化,EC,メルカリ,楽天,ヤフーショッピング",
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

