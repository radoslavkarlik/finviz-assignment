import type { TaxonomyDbItem, TaxonomyItemResponse } from "#type";

import { Db } from "#db/db";
import cors from "cors";
import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
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

const port = Number(process.env.PORT) || 3000;

async function run() {
  const db = new Db();

  await db.init();

  // 1. Read the file only when needed
  const jsonPath = path.resolve(process.cwd(), "parsed.json");
  const rawData = await readFile(jsonPath, "utf8");
  const data = JSON.parse(rawData);

  await db.seed(data as TaxonomyDbItem[]);

  const app = express();
  if (process.env.NODE_ENV !== "production") {
    app.use(cors({ origin: true }));
  }

  app.get("/health", (_, res) => {
    res.status(200).send("OK");
  });

  app.use("/api-docs", express.static(path.join(process.cwd(), "public/docs")));

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

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

run().catch((error) => {
  console.error(error);
});
