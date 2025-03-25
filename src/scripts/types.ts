import { z } from "astro/zod";

const StatusEnum = [
  "In Progress",
  "Not Started",
  "Completed",
  "Published",
  "Approved",
  "Latest",
  "Broken",
] as const;

const VersionIncrement = ["major", "minor", "patch"] as const;

const StatusSchema = z.enum(StatusEnum);

const NewAssetMetadataSchema = z.object({
  assetName: z.string().nonempty(),
  hasTexture: z.boolean(),
  author: z.string().nonempty(),
  keywords: z.array(z.string().nonempty()),
  note: z.string(),
  status: z.enum(StatusEnum),
});

const NewCommitMetadataSchema = NewAssetMetadataSchema.extend({
  versionIncrement: z.enum(VersionIncrement),
});

type Status = z.infer<typeof StatusSchema>;
type NewAssetMetadata = z.infer<typeof NewAssetMetadataSchema>;
type NewCommitMetadata = z.infer<typeof NewCommitMetadataSchema>;

export {
  NewAssetMetadataSchema,
  NewCommitMetadataSchema,
  type NewAssetMetadata,
  type NewCommitMetadata,
  type Status,
};
