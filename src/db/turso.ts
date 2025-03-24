import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const turso = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(turso, { casing: "snake_case" });

export { db };
