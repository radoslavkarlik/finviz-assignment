import type { TaxonomyDbItem, TaxonomyItemResponse } from "#type";

import { Db } from "#db/db";
import cors from "cors";
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

const querySchema = z.object({
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

const db = new Db();
await db.init();

const __dirname = import.meta.dirname;
const data: Array<TaxonomyDbItem> = JSON.parse(
  readFileSync(join(__dirname, "parsed.json"), "utf-8"),
);

await db.seed(data);

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
const port = process.env.PORT ?? 3000;

const swagger = JSON.parse(readFileSync(join(__dirname, "swagger.json"), "utf-8"));

app.get("/swagger.json", (_req, res) => {
  res.json(swagger);
});

app.get("/api", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { page, offset, search, subfolders, delay, parent, sortBy, sortDir } = parsed.data;

  const start = performance.now();

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const result = await db.getItems(page, offset, parent, sortBy, sortDir, search, subfolders);

  const end = performance.now();

  return res.json({
    name: parent ? (result.items.at(0)?.name ?? "") : parent,
    items: result.items.map<TaxonomyItemResponse>((item) => ({
      name: item.name.split(" > ").at(-1) ?? "",
      fullName: item.name,
      size: item.size,
    })),
    total: result.total,
    performance: (end - start).toString(),
  });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
