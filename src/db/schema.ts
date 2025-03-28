import type { Status } from "@/scripts/types";
import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";

const assets = t.sqliteTable("assets", {
  id: t.int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  structureVersion: t.text().notNull(),
  hasTexture: t.int({ mode: "boolean" }).notNull(),
});

const commits = t.sqliteTable("commits", {
  id: t.int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  assetId: t
    .int()
    .references(() => assets.id)
    .notNull(),
  author: t
    .text()
    .references(() => authors.pennKey)
    .notNull(),
  version: t.text().notNull(),
  timestamp: t
    .integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  note: t.text().notNull(),
  status: t.text().$type<Status>().notNull(),
});

const authors = t.sqliteTable("authors", {
  pennKey: t.text({ mode: "text" }).primaryKey(),
});

const keywords = t.sqliteTable("keywords", {
  id: t.int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  commitId: t
    .int()
    .references(() => commits.id)
    .notNull(),
  keyword: t.text().notNull(),
});

export { assets, authors, commits, keywords };
