CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`mall_name` text NOT NULL,
	`category_name` text NOT NULL,
	`category_id` text NOT NULL,
	`full_path` text,
	`parent_category_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mapping_learnings` (
	`id` text PRIMARY KEY NOT NULL,
	`source_mall` text NOT NULL,
	`source_category_name` text NOT NULL,
	`source_category_id` text NOT NULL,
	`target_mall` text NOT NULL,
	`target_category_name` text NOT NULL,
	`target_category_id` text NOT NULL,
	`is_manual_correction` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
