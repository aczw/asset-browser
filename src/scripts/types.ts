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

const StatusSchema = z.enum(StatusEnum);

type Status = z.infer<typeof StatusSchema>;

const MetadataSchema = z.object({
  assetName: z.string().nonempty(),
  hasTexture: z.boolean(),
  author: z.string().nonempty(),
  keywords: z.array(z.string().nonempty()),
  timestamp: z.number().positive(),
  note: z.string(),
  status: z.enum(StatusEnum),
});

type MetadataProps = z.infer<typeof MetadataSchema>;

export { MetadataSchema, type MetadataProps, type Status };
