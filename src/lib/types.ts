import { z } from "astro:schema";

const CommitSchema = z.object({
  author: z.string(),
  version: z.string(),
  timestamp: z.string(),
  note: z.string(),
});

const VersionMapSchema = z.record(z.string(), z.string());

const MetadataSchema = z.object({
  assetName: z.string(),
  assetStructureVersion: z.string(),
  keywords: z.string().array(),
  hasTexture: z.boolean(),
  commit: CommitSchema,
  versionMap: VersionMapSchema,
});

type Commit = z.infer<typeof CommitSchema>;
type VersionMap = z.infer<typeof VersionMapSchema>;
type Metadata = z.infer<typeof MetadataSchema>;

// Combined asset data for frontend display
type AssetWithDetails = {
  name: string;
  thumbnailUrl: string;
  version: string;
  creator: string;
  lastModifiedBy: string;
  checkedOutBy: string | null;
  isCheckedOut: boolean;
  materials: boolean;
  keywords: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
};

type GetUserBody = {
  user: {
    pennKey: string;
    fullName: string;
    assetsCreated: { name: string; createdAt: string }[];
    checkedOutAssets: { name: string; checkedOutAt: string }[];
    recentCommits: { assetName: string; version: string; note: string; timestamp: string }[];
  };
};

export {
  MetadataSchema,
  type AssetWithDetails,
  type Commit,
  type GetUserBody,
  type Metadata,
  type VersionMap,
};
