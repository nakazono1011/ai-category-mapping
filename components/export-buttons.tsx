"use client";

import { Button } from "@/components/ui/button";
import type { MappingResult, MallName } from "@/lib/types";

interface ExportButtonsProps {
	results: MappingResult[];
}

const mallLabels: Record<MallName, string> = {
	mercari_shops: "メルカリShops",
	rakuten: "楽天市場",
	yahoo_shopping: "ヤフーショッピング",
	rakuma: "楽天ラクマ",
};

export function ExportButtons({ results }: ExportButtonsProps) {
	const copyToClipboard = () => {
		const headers = [
			"商品名",
			"メルカリShopsカテゴリID",
			"メルカリShopsフルパス",
			"楽天市場カテゴリID",
			"楽天市場フルパス",
			"ヤフーショッピングカテゴリID",
			"ヤフーショッピングフルパス",
		];

		const rows = results.map((result) => {
			const productName = result.productName || result.sourceCategory?.name || "";
			return [
				productName,
				result.mappings.mercari_shops?.id || "",
				result.mappings.mercari_shops?.fullPath || "",
				result.mappings.rakuten?.id || "",
				result.mappings.rakuten?.fullPath || "",
				result.mappings.yahoo_shopping?.id || "",
				result.mappings.yahoo_shopping?.fullPath || "",
			];
		});

		const csv = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join("\t"))
			.join("\n");

		navigator.clipboard.writeText(csv);
		alert("クリップボードにコピーしました");
	};

	const downloadCSV = () => {
		const headers = [
			"商品名",
			"メルカリShopsカテゴリID",
			"メルカリShopsフルパス",
			"楽天市場カテゴリID",
			"楽天市場フルパス",
			"ヤフーショッピングカテゴリID",
			"ヤフーショッピングフルパス",
		];

		const rows = results.map((result) => {
			const productName = result.productName || result.sourceCategory?.name || "";
			return [
				productName,
				result.mappings.mercari_shops?.id || "",
				result.mappings.mercari_shops?.fullPath || "",
				result.mappings.rakuten?.id || "",
				result.mappings.rakuten?.fullPath || "",
				result.mappings.yahoo_shopping?.id || "",
				result.mappings.yahoo_shopping?.fullPath || "",
			];
		});

		const csv = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `category-mapping-${new Date().getTime()}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="flex gap-4">
			<Button onClick={copyToClipboard}>クリップボードにコピー</Button>
			<Button onClick={downloadCSV} variant="outline">
				CSVダウンロード
			</Button>
		</div>
	);
}

