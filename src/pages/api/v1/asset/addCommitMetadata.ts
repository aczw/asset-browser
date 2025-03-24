import { assets } from "@/db/schema";
import { db } from "@/db/turso";
import { MetadataSchema } from "@/scripts/types";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

const POST: APIRoute = async ({ request }) => {
  const payload = await request.json();
  const parsed = MetadataSchema.safeParse(payload);

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
  console.log("data:", data);

  // Asset needs to already exist
  const assetEntries = await db.select().from(assets).where(eq(assets.name, data.assetName));

  if (assetEntries.length === 0) {
    const statusText = "Asset not found, needs to already exist in database to add new commit";
    return new Response(statusText, {
      status: 404,
      statusText,
    });
  }

  // const commitEntries = await db.select().from(commits).where(eq(commits.version, version));
  // const commit = commitEntries[0];

  // const keywordEntries = await db
  //   .select({ keyword: keywords.keyword })
  //   .from(keywords)
  //   .where(eq(keywords.commitId, commit.id));

  // const asset = assetEntries[0];

  // return new Response(
  //   JSON.stringify({
  //     structureVersion: asset.structureVersion,
  //     hasTexture: asset.hasTexture,
  //     author: commit.author,
  //     keywords: keywordEntries,
  //     timestamp: commit.timestamp.getTime(),
  //     note: commit.note,
  //     status: commit.status,
  //   }),
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );

  return new Response(null, { status: 200, statusText: "New commit metadata inserted!" });
};

export { POST };
