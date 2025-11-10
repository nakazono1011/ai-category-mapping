"use server";

import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MallName, Category as CategoryType } from "@/lib/types";

export async function getCategoryList(mallName: MallName): Promise<CategoryType[]> {
	const result = await db
		.select()
		.from(categories)
		.where(eq(categories.mallName, mallName))
		.limit(10000); // 最大10000件まで

	return result.map((cat) => ({
		id: cat.id,
		mallName: cat.mallName as MallName,
		categoryName: cat.categoryName,
		categoryId: cat.categoryId,
		fullPath: cat.fullPath,
		parentCategoryId: cat.parentCategoryId,
	}));
}

export async function searchCategories(
	mallName: MallName,
	query: string,
): Promise<CategoryType[]> {
	const result = await db
		.select()
		.from(categories)
		.where(eq(categories.mallName, mallName))
		.limit(10000);

	// キーワードを分割して検索
	const keywords = query
		.split(/\s+/)
		.filter((k) => k.length > 1)
		.map((k) => k.toLowerCase());

	// スコアリング付きで検索
	const scored = result
		.map((cat) => {
			const categoryText = `${cat.categoryName} ${cat.fullPath || ""}`.toLowerCase();
			let score = 0;

			// 完全一致のキーワードがある場合、高いスコア
			keywords.forEach((keyword) => {
				if (categoryText.includes(keyword)) {
					score += 10;
					// カテゴリ名に含まれる場合はさらに高スコア
					if (cat.categoryName.toLowerCase().includes(keyword)) {
						score += 5;
					}
					// フルパスに含まれる場合も高スコア
					if (cat.fullPath?.toLowerCase().includes(keyword)) {
						score += 3;
					}
				}
			});

			return { category: cat, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 50) // 上位50件を返す
		.map((item) => ({
			id: item.category.id,
			mallName: item.category.mallName as MallName,
			categoryName: item.category.categoryName,
			categoryId: item.category.categoryId,
			fullPath: item.category.fullPath,
			parentCategoryId: item.category.parentCategoryId,
		}));

	return scored;
}

