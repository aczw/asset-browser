import { assets, authors, commits, keywords } from "@/db/schema";
import { db } from "@/db/turso";
import { NewAssetMetadataSchema } from "@/scripts/types";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

const POST: APIRoute = async ({ request }) => {
  const payload = await request.json();
  const parsed = NewAssetMetadataSchema.safeParse(payload);

  if (!parsed.success) {
    const statusText = `Incorrectly formatted payload. TODO: parse zod errors and return them - ${
      parsed.error.flatten().fieldErrors
    }`;
    return new Response(statusText, {
      status: 400,
      statusText,
    });
  }

  const { data } = parsed;

  // Asset cannot already exist
  const assetEntries = await db.select().from(assets).where(eq(assets.name, data.assetName));

  if (assetEntries.length !== 0) {
    const statusText = "Asset already exists!";
    return new Response(statusText, {
      status: 400,
      statusText,
    });
  }

  const newAssetEntry = await db
    .insert(assets)
    .values({
      name: data.assetName,
      structureVersion: data.structureVersion,
      hasTexture: data.hasTexture,
    })
    .returning({ assetId: assets.id });
  const assetId = newAssetEntry[0].assetId;

  const authorEntries = await db.select().from(authors).where(eq(authors.pennKey, data.author));

  if (authorEntries.length === 0) {
    await db.insert(authors).values({
      pennKey: data.author,
    });
  }

  const returned = await db
    .insert(commits)
    .values({
      assetId: assetId,
      author: data.author,
      version: "01.00.00",
      note: data.note,
      status: data.status,
    })
    .returning({ commitId: commits.id });
  const commitId = returned[0].commitId;

  data.keywords.forEach(async (keyword) => {
    await db.insert(keywords).values({
      commitId,
      keyword,
    });
  });

  return new Response(null, { status: 201, statusText: "New asset metadata inserted!" });
};

export { POST };
