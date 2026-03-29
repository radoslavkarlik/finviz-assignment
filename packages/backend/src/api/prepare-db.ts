import { Db } from "#db/db";
import { TaxonomyDbItem } from "#type";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function prepareDb(): Promise<Db> {
  const db = new Db();

  await db.init();

  const jsonPath = path.resolve(process.cwd(), "parsed.json");
  const rawData = await readFile(jsonPath, "utf8");
  const data = JSON.parse(rawData);

  await db.seed(data as TaxonomyDbItem[]);

  return db;
}
