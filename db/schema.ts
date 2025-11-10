import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
	id: text("id").primaryKey(),
	mallName: text("mall_name").notNull(), // mercari_shops, rakuten, yahoo_shopping, rakuma
	categoryName: text("category_name").notNull(),
	categoryId: text("category_id").notNull(),
	fullPath: text("full_path"), // カテゴリのフルパス（例: "家具・インテリア > ケース・ボックス・コンテナ"）
	parentCategoryId: text("parent_category_id"), // 親カテゴリID（階層構造がある場合）
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const mappingLearnings = sqliteTable("mapping_learnings", {
	id: text("id").primaryKey(),
	sourceMall: text("source_mall").notNull(), // mercari_shops, rakuten, yahoo_shopping, rakuma
	sourceCategoryName: text("source_category_name").notNull(),
	sourceCategoryId: text("source_category_id").notNull(),
	targetMall: text("target_mall").notNull(),
	targetCategoryName: text("target_category_name").notNull(),
	targetCategoryId: text("target_category_id").notNull(),
	isManualCorrection: integer("is_manual_correction", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type MappingLearning = typeof mappingLearnings.$inferSelect;
export type NewMappingLearning = typeof mappingLearnings.$inferInsert;

