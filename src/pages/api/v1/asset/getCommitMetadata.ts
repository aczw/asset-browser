import { assets, commits, keywords } from "@/db/schema";
import { db } from "@/db/turso";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

const GET: APIRoute = async ({ url }) => {
  const name = url.searchParams.get("assetName");
  const version = url.searchParams.get("version");

  if (!name || !version) {
    return new Response(null, {
      status: 400,
      statusText: 'Missing or invalid query parameters. Expected "assetName" and "version"',
    });
  }

  const assetEntries = await db.select().from(assets).where(eq(assets.name, name));

  if (assetEntries.length === 0) {
    return new Response(null, {
      status: 404,
      statusText: "Asset not found",
    });
  }

  const commitEntries = await db.select().from(commits).where(eq(commits.version, version));
  const commit = commitEntries[0];

  const keywordEntries = await db
    .select({ keyword: keywords.keyword })
    .from(keywords)
    .where(eq(keywords.commitId, commit.id));

  const asset = assetEntries[0];

  return new Response(
    JSON.stringify({
      structureVersion: asset.structureVersion,
      hasTexture: asset.hasTexture,
      author: commit.author,
      keywords: keywordEntries,
      timestamp: commit.timestamp.getTime(),
      note: commit.note,
      status: commit.status,
    })
  );
};

export { GET };
