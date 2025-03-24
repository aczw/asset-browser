import { MetadataSchema } from "@/scripts/types";
import type { APIRoute } from "astro";

const POST: APIRoute = async ({ request }) => {
  const payload = await request.json();
  const parsed = MetadataSchema.safeParse(payload);

  if (!parsed.success) {
    const statusText = `Incorrect payload. Error: ${parsed.error}`;
    return new Response(statusText, {
      status: 400,
      statusText,
    });
  }

  // const assetEntries = await db.select().from(assets).where(eq(assets.name, name));

  // if (assetEntries.length === 0) {
  //   const statusText = "Asset not found";
  //   return new Response(statusText, {
  //     status: 404,
  //     statusText,
  //   });
  // }

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

  return new Response(null);
};

export { POST };
