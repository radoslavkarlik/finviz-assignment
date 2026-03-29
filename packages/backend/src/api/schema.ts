import z from "zod";

export const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  offset: z.coerce.number().int().positive().default(20),
  search: z.string().trim().default(""),
  subfolders: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  delay: z.coerce.number().int().min(0).default(0),
  parent: z.string().default(""),
  sortBy: z.enum(["name", "size", "subPath"]).default("name"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});
