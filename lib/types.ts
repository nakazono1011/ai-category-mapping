export type MallName = "mercari_shops" | "rakuten" | "yahoo_shopping" | "rakuma";

export interface Category {
	id: string;
	mallName: MallName;
	categoryName: string;
	categoryId: string;
	fullPath: string | null;
	parentCategoryId: string | null;
}

export interface MappingResult {
	productName?: string;
	sourceCategory?: {
		mall: MallName;
		name: string;
		id: string;
	};
	mappings: {
		[key in MallName]?: {
			name: string;
			id: string;
			fullPath?: string;
		};
	};
}

export interface MappingLearning {
	sourceMall: MallName;
	sourceCategoryName: string;
	sourceCategoryId: string;
	targetMall: MallName;
	targetCategoryName: string;
	targetCategoryId: string;
	isManualCorrection: boolean;
}

