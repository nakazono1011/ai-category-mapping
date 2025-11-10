"use server";

import { db } from "@/lib/db";
import { mappingLearnings } from "@/db/schema";
import { nanoid } from "nanoid";
import type { MappingLearning } from "@/lib/types";

export async function saveMappingLearning(learning: MappingLearning): Promise<void> {
	await db.insert(mappingLearnings).values({
		id: nanoid(),
		sourceMall: learning.sourceMall,
		sourceCategoryName: learning.sourceCategoryName,
		sourceCategoryId: learning.sourceCategoryId,
		targetMall: learning.targetMall,
		targetCategoryName: learning.targetCategoryName,
		targetCategoryId: learning.targetCategoryId,
		isManualCorrection: learning.isManualCorrection,
	});
}

