"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MappingResult, MallName } from "@/lib/types";
import { useState } from "react";
import { saveMappingLearning } from "@/app/actions/mapping";

interface MappingResultTableProps {
	results: MappingResult[];
	onResultsChange: (results: MappingResult[]) => void;
	editable?: boolean;
}

const mallLabels: Record<MallName, string> = {
	mercari_shops: "メルカリShops",
	rakuten: "楽天市場",
	yahoo_shopping: "ヤフーショッピング",
	rakuma: "楽天ラクマ",
};

export function MappingResultTable({
	results,
	onResultsChange,
	editable = true,
}: MappingResultTableProps) {
	const [savingIndex, setSavingIndex] = useState<number | null>(null);

	const handleCellChange = (
		index: number,
		mall: MallName,
		field: "id" | "fullPath",
		value: string,
	) => {
		const newResults = [...results];
		if (!newResults[index].mappings[mall]) {
			newResults[index].mappings[mall] = { name: "", id: "", fullPath: "" };
		}
		if (field === "id") {
			newResults[index].mappings[mall]!.id = value;
		} else if (field === "fullPath") {
			newResults[index].mappings[mall]!.fullPath = value;
		}
		onResultsChange(newResults);
	};

	const handleSaveLearning = async (index: number) => {
		const result = results[index];
		if (!result.sourceCategory && !result.productName) {
			return;
		}

		setSavingIndex(index);

		try {
			// 各マッピング先モールに対して学習データを保存
			const savePromises: Promise<void>[] = [];

			if (result.sourceCategory) {
				// 既存カテゴリからのマッピングの場合
				Object.entries(result.mappings).forEach(([mall, mapping]) => {
					if (mapping?.id) {
						// fullPathからカテゴリ名を抽出（最後の部分をカテゴリ名として使用）
						const categoryName = mapping.fullPath?.split(">").pop()?.trim() || mapping.name || "";
						savePromises.push(
							saveMappingLearning({
								sourceMall: result.sourceCategory!.mall,
								sourceCategoryName: result.sourceCategory!.name,
								sourceCategoryId: result.sourceCategory!.id,
								targetMall: mall as MallName,
								targetCategoryName: categoryName,
								targetCategoryId: mapping.id,
								isManualCorrection: true,
							}),
						);
					}
				});
			} else if (result.productName) {
				// 商品名からのマッピングの場合、最初のマッピングをソースとして使用
				// （この場合は学習データとして保存しない方が良いかもしれません）
				// 必要に応じて実装を調整してください
			}

			await Promise.all(savePromises);
			alert("学習データを保存しました");
		} catch (error) {
			console.error("Error saving learning data:", error);
			alert("学習データの保存に失敗しました");
		} finally {
			setSavingIndex(null);
		}
	};

	return (
		<div className="w-full overflow-auto max-h-[calc(100vh-300px)]">
			<Table className="text-xs w-full table-fixed">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[350px]">商品名/元カテゴリ</TableHead>
						<TableHead className="w-[250px]">メルカリShops</TableHead>
						<TableHead className="w-[250px]">楽天市場</TableHead>
						<TableHead className="w-[250px]">ヤフーショッピング</TableHead>
						{editable && results.some((r) => r.sourceCategory) && (
							<TableHead className="w-[150px]">操作</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{results.map((result, index) => (
						<TableRow key={index}>
							<TableCell className="font-medium w-[350px] align-top">
								{result.productName ? (
									<div className="break-words whitespace-normal overflow-hidden" style={{
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical',
										lineHeight: '1.25rem',
										maxHeight: '2.5rem',
									}}>
										{result.productName}
									</div>
								) : (
									result.sourceCategory?.name
								)}
							</TableCell>
							{(["mercari_shops", "rakuten", "yahoo_shopping"] as MallName[]).map(
								(mall) => (
									<TableCell key={mall} className="w-[250px] align-top">
										{editable ? (
											<div className="space-y-1">
												<Input
													value={result.mappings[mall]?.id || ""}
													onChange={(e) =>
														handleCellChange(index, mall, "id", e.target.value)
													}
													placeholder={`${mallLabels[mall]}カテゴリID`}
													className="mb-1 text-xs"
												/>
												<Input
													value={result.mappings[mall]?.fullPath || ""}
													onChange={(e) =>
														handleCellChange(index, mall, "fullPath", e.target.value)
													}
													placeholder={`${mallLabels[mall]}フルパス`}
													className="text-xs"
												/>
											</div>
										) : (
											<div className="space-y-1">
												{result.mappings[mall]?.id && (
													<div className="font-mono font-bold text-xs">
														{result.mappings[mall]?.id}
													</div>
												)}
												{result.mappings[mall]?.fullPath && (
													<div className="break-words whitespace-normal overflow-hidden text-muted-foreground" style={{
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical',
														lineHeight: '1.25rem',
														maxHeight: '2.5rem',
													}}>
														{result.mappings[mall]?.fullPath}
													</div>
												)}
												{!result.mappings[mall]?.id && !result.mappings[mall]?.fullPath && (
													<div>-</div>
												)}
											</div>
										)}
									</TableCell>
								),
							)}
							{editable && result.sourceCategory && (
								<TableCell className="w-[150px]">
									<Button
										size="sm"
										onClick={() => handleSaveLearning(index)}
										disabled={savingIndex === index}
										className="text-xs"
									>
										{savingIndex === index ? "保存中..." : "学習データとして保存"}
									</Button>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

