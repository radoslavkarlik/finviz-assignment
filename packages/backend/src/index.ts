import cors from "cors";
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

import type { TaxonomyFlatItem, TaxonomyTreeItemResponse } from "./type";

import { constructTree } from "./construct-tree";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  offset: z.coerce.number().int().positive().default(20),
  search: z.string().trim().default(""),
  subfolders: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
  delay: z.coerce.number().int().min(0).default(0),
  parent: z.string().optional(),
  sortBy: z.enum(["name", "size", "subpath"]).default("name"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

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
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { page, offset, search, subfolders, delay, parent, sortBy } = parsed.data;
  const sortDir = parsed.data.sortDir === "desc" ? -1 : 1;

  const start = (page - 1) * offset;
  const subItems = parent ? data.filter((item) => item.name.startsWith(parent)) : data;

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const searchTrimmed = search.trim().toLowerCase();

  if (subfolders && searchTrimmed) {
    const rootName = subItems[0].name ?? "";

    const matchedItems = subItems.filter((item) => {
      if (item.name === parent) {
        return false;
      }

      const leafName = item.name.split(" > ").at(-1) ?? item.name;

      return leafName.toLowerCase().includes(searchTrimmed);
    });

    const sortedMatchedItems = [...matchedItems].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (sortBy === "size") {
        aVal = a.size;
        bVal = b.size;
      } else if (sortBy === "subpath") {
        aVal = a.name.split(" > ").slice(1, -1).join(" > ").toLowerCase();
        bVal = b.name.split(" > ").slice(1, -1).join(" > ").toLowerCase();
      } else {
        aVal = (a.name.split(" > ").at(-1) ?? a.name).toLowerCase();
        bVal = (b.name.split(" > ").at(-1) ?? b.name).toLowerCase();
      }
      return aVal < bVal ? -sortDir : aVal > bVal ? sortDir : 0;
    });

    const paginatedItems = sortedMatchedItems
      .slice(start, start + offset)
      .map<TaxonomyTreeItemResponse>((item) => ({
        name: item.name.split(" > ").at(-1) ?? item.name,
        fullName: item.name,
        size: item.size,
      }));

    return res.json({ name: rootName, items: paginatedItems, total: sortedMatchedItems.length });
  }

  const itemTree = constructTree(subItems);

  if (!itemTree) {
    return res.json(null);
  }

  const filteredItems = searchTrimmed
    ? itemTree.children.filter((item) => item.name.toLowerCase().includes(searchTrimmed))
    : itemTree.children;

  const searchedItems = [...filteredItems].sort((a, b) => {
    const aVal = sortBy === "size" ? a.size : a.name.toLowerCase();
    const bVal = sortBy === "size" ? b.size : b.name.toLowerCase();
    return aVal < bVal ? -sortDir : aVal > bVal ? sortDir : 0;
  });

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
