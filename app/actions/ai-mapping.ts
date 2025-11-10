"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getCategoryList, searchCategories } from "./categories";
import type { MallName, MappingResult } from "@/lib/types";

const google = createGoogleGenerativeAI({
	apiKey: process.env.GEMINI_API_KEY || "",
});

// 商品名から1つのモールのカテゴリをマッピング（RAG使用）
async function mapProductToMall(
	productName: string,
	mall: MallName,
	allCategories: Awaited<ReturnType<typeof getCategoryList>>,
): Promise<{ name: string; id: string; fullPath?: string } | undefined> {
	// RAG: 商品名から関連するカテゴリを検索（上位50件）
	const relevantCategories = await searchCategories(mall, productName);

	// 関連カテゴリが少ない場合は、全カテゴリから追加で取得
	const categoryCandidates =
		relevantCategories.length >= 20
			? relevantCategories
			: [
					...relevantCategories,
					...allCategories
						.filter(
							(c) =>
								!relevantCategories.some(
									(rc) => rc.categoryId === c.categoryId,
								),
						)
						.slice(0, 30),
				];

	if (categoryCandidates.length === 0) {
		return undefined;
	}

	// カテゴリ一覧をプロンプト用に整形
	const categoryList = categoryCandidates
		.map((c) => `${c.fullPath || c.categoryName} (ID: ${c.categoryId})`)
		.join("\n");

	const model = google("gemini-2.0-flash-lite");

	const prompt = `以下の商品名に対して、${mall === "mercari_shops" ? "メルカリShops" : mall === "rakuten" ? "楽天市場" : "ヤフーショッピング"}のカテゴリ一覧から最も適切なカテゴリを1つ選択してください。

商品名: ${productName}

カテゴリ一覧:
${categoryList}

重要: 上記のカテゴリ一覧の中から、商品名に最も適したカテゴリを1つだけ選択してください。カテゴリIDは必ず上記のリストに含まれているものを使用してください。

JSON形式で以下のように返してください:
{
  "name": "カテゴリ名",
  "id": "カテゴリID"
}`;

	try {
		const { text } = await generateText({
			model,
			prompt,
		});

		// JSONを抽出
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);
			if (parsed.id && parsed.name) {
				// fullPathを取得
				const category = allCategories.find((c) => c.categoryId === parsed.id);
				return {
					name: parsed.name,
					id: parsed.id,
					fullPath: category?.fullPath || undefined,
				};
			}
		}
	} catch (error) {
		console.error(`Error mapping product "${productName}" to ${mall}:`, error);
	}

	return undefined;
}

export async function mapProductsFromNames(
	productNames: string[],
): Promise<MappingResult[]> {
	if (productNames.length === 0) {
		return [];
	}

	if (productNames.length > 30) {
		throw new Error("一度に処理できる商品名は30行までです");
	}

	// 各モールの全カテゴリ一覧を取得（fullPath取得用）
	const [mercariCategories, rakutenCategories, yahooCategories] =
		await Promise.all([
			getCategoryList("mercari_shops"),
			getCategoryList("rakuten"),
			getCategoryList("yahoo_shopping"),
		]);

	const results: MappingResult[] = [];

	// 各商品名に対してマッピングを実行
	for (const productName of productNames) {
		if (!productName.trim()) {
			continue;
		}

		// 各モールに対して並列でマッピングを実行
		const [mercariMapping, rakutenMapping, yahooMapping] = await Promise.all([
			mapProductToMall(productName, "mercari_shops", mercariCategories),
			mapProductToMall(productName, "rakuten", rakutenCategories),
			mapProductToMall(productName, "yahoo_shopping", yahooCategories),
		]);

		results.push({
			productName,
			mappings: {
				mercari_shops: mercariMapping,
				rakuten: rakutenMapping,
				yahoo_shopping: yahooMapping,
			},
		});
	}

	return results;
}

// カテゴリから1つのモールのカテゴリをマッピング（RAG使用）
async function mapCategoryToMall(
	sourceMall: MallName,
	sourceCategoryName: string,
	sourceCategoryId: string,
	targetMall: MallName,
	allCategories: Awaited<ReturnType<typeof getCategoryList>>,
): Promise<{ name: string; id: string; fullPath?: string } | undefined> {
	// RAG: 元カテゴリ名から関連するカテゴリを検索
	const relevantCategories = await searchCategories(
		targetMall,
		sourceCategoryName,
	);

	// 関連カテゴリが少ない場合は、全カテゴリから追加で取得
	const categoryCandidates =
		relevantCategories.length >= 20
			? relevantCategories
			: [
					...relevantCategories,
					...allCategories
						.filter(
							(c) =>
								!relevantCategories.some(
									(rc) => rc.categoryId === c.categoryId,
								),
						)
						.slice(0, 30),
				];

	if (categoryCandidates.length === 0) {
		return undefined;
	}

	// カテゴリ一覧をプロンプト用に整形
	const categoryList = categoryCandidates
		.map((c) => `${c.fullPath || c.categoryName} (ID: ${c.categoryId})`)
		.join("\n");

	const model = google("gemini-2.5-flash");

	const prompt = `以下の${sourceMall === "mercari_shops" ? "メルカリShops" : sourceMall === "rakuten" ? "楽天市場" : "ヤフーショッピング"}のカテゴリに対して、${targetMall === "mercari_shops" ? "メルカリShops" : targetMall === "rakuten" ? "楽天市場" : "ヤフーショッピング"}のカテゴリ一覧から最も適切なカテゴリを1つ選択してください。

元カテゴリ:
- モール: ${sourceMall}
- カテゴリ名: ${sourceCategoryName}
- カテゴリID: ${sourceCategoryId}

カテゴリ一覧:
${categoryList}

重要: 上記のカテゴリ一覧の中から、元カテゴリに最も適したカテゴリを1つだけ選択してください。カテゴリIDは必ず上記のリストに含まれているものを使用してください。

JSON形式で以下のように返してください:
{
  "name": "カテゴリ名",
  "id": "カテゴリID"
}`;

	try {
		const { text } = await generateText({
			model,
			prompt,
		});

		// JSONを抽出
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);
			if (parsed.id && parsed.name) {
				// fullPathを取得
				const category = allCategories.find((c) => c.categoryId === parsed.id);
				return {
					name: parsed.name,
					id: parsed.id,
					fullPath: category?.fullPath || undefined,
				};
			}
		}
	} catch (error) {
		console.error(`Error mapping category to ${targetMall}:`, error);
	}

	return undefined;
}

export async function mapCategoriesFromCategory(
	sourceMall: MallName,
	sourceCategoryName: string,
	sourceCategoryId: string,
	targetMalls: MallName[],
): Promise<MappingResult[]> {
	if (targetMalls.length === 0) {
		return [];
	}

	// 各モールの全カテゴリ一覧を取得（fullPath取得用）
	const categoryLists = await Promise.all(
		targetMalls.map((mall) => getCategoryList(mall)),
	);

	// 各モールに対して並列でマッピングを実行
	const mappingPromises = targetMalls.map((mall, index) =>
		mapCategoryToMall(
			sourceMall,
			sourceCategoryName,
			sourceCategoryId,
			mall,
			categoryLists[index],
		).then((mapping) => ({ mall, mapping })),
	);

	const mappingResults = await Promise.all(mappingPromises);

	const mappings: MappingResult["mappings"] = {};
	mappingResults.forEach(({ mall, mapping }) => {
		if (mapping) {
			mappings[mall] = mapping;
		}
	});

	return [
		{
			sourceCategory: {
				mall: sourceMall,
				name: sourceCategoryName,
				id: sourceCategoryId,
			},
			mappings,
		},
	];
}
