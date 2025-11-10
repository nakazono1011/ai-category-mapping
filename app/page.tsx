"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { mapProductsFromNames } from "@/app/actions/ai-mapping";
import { MappingResultTable } from "@/components/mapping-result-table";
import { ExportButtons } from "@/components/export-buttons";
import type { MappingResult } from "@/lib/types";

const schema = z.object({
	productNames: z.string().min(1, "商品名を入力してください"),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
	const [results, setResults] = useState<MappingResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showContactDialog, setShowContactDialog] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		setError(null);
		setResults([]);

		try {
			const productNames = data.productNames
				.split("\n")
				.map((name) => name.trim())
				.filter((name) => name.length > 0);

			if (productNames.length > 30) {
				setShowContactDialog(true);
				setIsLoading(false);
				return;
			}

			const mappingResults = await mapProductsFromNames(productNames);
			setResults(mappingResults);
		} catch (err) {
			setError(err instanceof Error ? err.message : "エラーが発生しました");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full space-y-6 p-6">
			<div className="space-y-4">
				<h1 className="text-4xl font-bold">カテゴリマッピングツール</h1>
				<p className="text-lg text-muted-foreground">
					LLMを使用して、商品名から国内主要ECモールのカテゴリを自動マッピングします
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>このツールについて</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h3 className="font-semibold mb-2">機能</h3>
						<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
							<li>商品名リストから各モールのカテゴリを自動割り当て</li>
							<li>
								RAG（Retrieval-Augmented Generation）による高精度なマッピング
							</li>
							<li>結果をクリップボードにコピーまたはCSVダウンロード</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-2">対応モール</h3>
						<p className="text-sm text-muted-foreground">
							メルカリShops、楽天市場、ヤフーショッピング
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-2">使い方</h3>
						<ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
							<li>
								下記のテキストエリアに、改行区切りで商品名を入力してください（最大30行）
							</li>
							<li>「マッピング実行」ボタンをクリックして処理を開始します</li>
							<li>各モールのカテゴリIDとフルパスが自動的に割り当てられます</li>
							<li>
								結果を確認し、「クリップボードにコピー」または「CSVダウンロード」でエクスポートできます
							</li>
						</ol>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>商品名を入力</CardTitle>
					<CardDescription>
						改行区切りで商品名を入力してください（最大30行）
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="productNames">商品名リスト</Label>
							<Textarea
								id="productNames"
								{...register("productNames")}
								placeholder={`商品名1
商品名2
商品名3`}
								rows={10}
								className="font-mono"
							/>
							{errors.productNames && (
								<p className="text-sm text-red-500">
									{errors.productNames.message}
								</p>
							)}
						</div>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "マッピング中..." : "マッピング実行"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{error && (
				<Card className="border-red-500">
					<CardContent className="pt-6">
						<p className="text-red-500">{error}</p>
					</CardContent>
				</Card>
			)}

			{results.length > 0 && (
				<>
					<Card>
						<CardHeader>
							<CardTitle>マッピング結果</CardTitle>
							<CardDescription>
								結果を確認し、必要に応じて手動で修正してください
							</CardDescription>
						</CardHeader>
						<CardContent>
							<MappingResultTable
								results={results}
								onResultsChange={setResults}
								editable={false}
							/>
						</CardContent>
					</Card>

					<ExportButtons results={results} />
				</>
			)}

			<Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>30件を超える商品名のマッピングについて</DialogTitle>
						<DialogDescription>
							一度に処理できる商品名は30件までです。31件以上の商品名のマッピングをご希望の場合は、お問い合わせフォームよりご連絡ください。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowContactDialog(false)}
						>
							閉じる
						</Button>
						<Button
							onClick={() => {
								window.open("https://www.smile-comfort.com#contact", "_blank");
							}}
						>
							お問い合わせフォームへ
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
