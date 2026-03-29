import type { TaxonomyItemResponse } from "#type";

import { prepareDb } from "#api/prepare-db";
import { querySchema } from "#api/schema";
import cors from "cors";
import express from "express";
import path from "node:path";

export async function startServer(port: number) {
  const db = await prepareDb();
  const app = express();

  if (process.env.NODE_ENV !== "production") {
    app.use(cors({ origin: true }));
  }

  app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok" });
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
      name: parent,
      items: result.items.map<TaxonomyItemResponse>((item) => ({
        name: item.name.split(" > ").at(-1) ?? "",
        fullName: item.name,
        size: item.size,
      })),
      total: result.total,
      performance: end - start,
    });
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}
