import cors from "cors";
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import swaggerUi from "swagger-ui-express";

import type { TaxonomyFlatItem, TaxonomyTreeItemResponse } from "./type";

import { constructTree } from "./construct-tree";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
const port = process.env.PORT ?? 3000;

const __dirname = import.meta.dirname;
const data: Array<TaxonomyFlatItem> = JSON.parse(
  readFileSync(join(__dirname, "parsed.json"), "utf-8"),
);
const swagger = JSON.parse(readFileSync(join(__dirname, "swagger.json"), "utf-8"));

app.get("/swagger.json", (_req, res) => {
  res.json(swagger);
});

app.get("/api", async (req, res) => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const offset = parseInt((req.query.offset as string) ?? "20", 10);
  const search = (req.query.search as string)?.trim() ?? "";
  const delay = parseInt((req.query.delay as string) ?? "0", 10);
  const parent = req.query.parent as string | undefined;

  const start = (page - 1) * offset;
  const subItems = parent ? data.filter((item) => item.name.startsWith(parent)) : data;
  const itemTree = constructTree(subItems);

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!itemTree) {
    res.json(null);
    return;
  }

  const searchedItems = search.trim()
    ? itemTree.children.filter((item) =>
        item.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : itemTree.children;

  const paginatedItems =
    searchedItems.slice(start, start + offset).map<TaxonomyTreeItemResponse>((item) => ({
      name: item.name,
      fullName: item.fullName,
      size: item.size,
    })) ?? [];

  res.json({ name: itemTree.name, items: paginatedItems, total: searchedItems.length });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
