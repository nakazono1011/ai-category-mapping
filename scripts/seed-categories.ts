import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { categories } from "../db/schema";
import { nanoid } from "nanoid";
import iconv from "iconv-lite";

const client = createClient({
	url: process.env.TURSO_DATABASE_URL || "file:./db/local/local.db",
	authToken: process.env.TURSO_AUTH_TOKEN || "local",
});

const db = drizzle(client);

type MercariRow = {
	カテゴリID: string;
	カテゴリ名: string;
	"カテゴリ名（フル）": string;
};

type RakutenRow = {
	ジャンルID: string;
	パス名: string;
};

type YahooShoppingRow = {
	id: string;
	name: string;
	path_name: string;
	relation: string;
	updated_at: string;
};

async function seedMercari(filePath: string) {
	console.log("メルカリShopsのカテゴリをインポート中...");
	const fileBuffer = readFileSync(filePath);
	const fileContent = iconv.decode(fileBuffer, "Shift_JIS");
	const records = parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
	}) as MercariRow[];

	const categoryData = records.map((row) => ({
		id: nanoid(),
		mallName: "mercari_shops" as const,
		categoryName: row["カテゴリ名"],
		categoryId: row["カテゴリID"],
		fullPath: row["カテゴリ名（フル）"],
		parentCategoryId: null,
	}));

	// バッチサイズを500に制限して分割挿入
	const batchSize = 500;
	for (let i = 0; i < categoryData.length; i += batchSize) {
		const batch = categoryData.slice(i, i + batchSize);
		await db.insert(categories).values(batch);
	}
	console.log(
		`メルカリShops: ${categoryData.length}件のカテゴリをインポートしました`,
	);
}

async function seedRakuten(filePath: string) {
	console.log("楽天市場のカテゴリをインポート中...");
	const fileBuffer = readFileSync(filePath);
	const fileContent = iconv.decode(fileBuffer, "Shift_JIS");
	const records = parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
	}) as RakutenRow[];

	const categoryData = records.map((row) => ({
		id: nanoid(),
		mallName: "rakuten" as const,
		categoryName: row["パス名"].split(">").pop()?.trim() || row["パス名"],
		categoryId: row["ジャンルID"],
		fullPath: row["パス名"],
		parentCategoryId: null,
	}));

	// バッチサイズを500に制限して分割挿入
	const batchSize = 500;
	for (let i = 0; i < categoryData.length; i += batchSize) {
		const batch = categoryData.slice(i, i + batchSize);
		await db.insert(categories).values(batch);
	}
	console.log(
		`楽天市場: ${categoryData.length}件のカテゴリをインポートしました`,
	);
}

async function seedYahooShopping(filePath: string) {
	console.log("ヤフーショッピングのカテゴリをインポート中...");
	const fileBuffer = readFileSync(filePath);
	const fileContent = iconv.decode(fileBuffer, "Shift_JIS");
	const records = parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
	}) as YahooShoppingRow[];

	const categoryData = records.map((row) => ({
		id: nanoid(),
		mallName: "yahoo_shopping" as const,
		categoryName: row.name,
		categoryId: row.id,
		fullPath: row.path_name,
		parentCategoryId: null,
	}));

	// バッチサイズを500に制限して分割挿入
	const batchSize = 500;
	for (let i = 0; i < categoryData.length; i += batchSize) {
		const batch = categoryData.slice(i, i + batchSize);
		await db.insert(categories).values(batch);
	}
	console.log(
		`ヤフーショッピング: ${categoryData.length}件のカテゴリをインポートしました`,
	);
}

async function main() {
	const mercariPath =
		process.argv[2] ||
		"/Users/nakazono/Downloads/【メルカリ】カテゴリコード一覧.csv";
	const rakutenPath =
		process.argv[3] || "/Users/nakazono/Downloads/【楽天】ジャンルID一覧.csv";
	const yahooPath =
		process.argv[4] ||
		"/Users/nakazono/Downloads/【ヤフショ】プロダクトカテゴリコード一覧.csv";

	try {
		await seedMercari(mercariPath);
		await seedRakuten(rakutenPath);
		await seedYahooShopping(yahooPath);
		console.log("すべてのカテゴリのインポートが完了しました");
	} catch (error) {
		console.error("エラーが発生しました:", error);
		process.exit(1);
	}
}

main();
