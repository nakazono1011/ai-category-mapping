import { defineConfig, type Config } from "drizzle-kit";

export default defineConfig({
	schema: "./db/schema.ts",
	out: "./drizzle",
	dialect: "turso",
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL || "file:./db/local/local.db",
		authToken: process.env.TURSO_AUTH_TOKEN || "local",
	},
}) satisfies Config;
