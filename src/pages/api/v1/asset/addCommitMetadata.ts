import { assets, commits } from "@/db/schema";
import { db } from "@/db/turso";
import { NewCommitMetadataSchema } from "@/scripts/types";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

const POST: APIRoute = async ({ request }) => {
  const payload = await request.json();
  const parsed = NewCommitMetadataSchema.safeParse(payload);

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

  // Asset needs to already exist
  const assetEntries = await db.select().from(assets).where(eq(assets.name, data.assetName));

  if (assetEntries.length === 0) {
    const statusText = "Asset not found, needs to already exist in database to add new commit";
    return new Response(statusText, {
      status: 404,
      statusText,
    });
  }

  const asset = assetEntries[0];
  const commitEntries = await db.select().from(commits).where(eq(commits.assetId, asset.id));

  // Increment version. Need to find most recent version first
  let newVersion = "";
  if (commitEntries.length !== 0) {
    commitEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const { version: oldVersion } = commitEntries[0];
    const split = oldVersion.split(".");

    function increment(versionSection: number) {
      const incr = versionSection + 1;
      return incr > 9 ? String(incr) : `0${incr}`;
    }

    switch (data.versionIncrement) {
      case "major": {
        newVersion = `${increment(Number(split[0]))}.00.00`;
        break;
      }

      case "minor": {
        newVersion = `${split[0]}.${increment(Number(split[1]))}.${split[2]}`;
        break;
      }

      case "patch": {
        newVersion = `${split[0]}.${split[1]}.${increment(Number(split[2]))}`;
        break;
      }
    }
  } else {
    const statusText = "Asset exists but does not have at least one associated commit!";
    return new Response(statusText, {
      status: 500,
      statusText,
    });
  }

  await db.insert(commits).values({
    assetId: asset.id,
    author: data.author,
    version: newVersion,
    note: data.note,
    status: data.status,
  });

  return new Response(null, { status: 201, statusText: "New commit metadata inserted!" });
};

export { POST };
