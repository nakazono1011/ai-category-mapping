import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../db/schema";

const client = createClient({
	url: process.env.TURSO_DATABASE_URL || "file:./db/local/local.db",
	authToken: process.env.TURSO_AUTH_TOKEN || "local",
});

export const db = drizzle(client, { schema });

