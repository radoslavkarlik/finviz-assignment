import type { TaxonomyDbItem, TaxonomyDbQueryItem } from "#type";

import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();

export async function initDb(): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS taxonomy (
        name TEXT PRIMARY KEY,
        size INTEGER
    );

    CREATE INDEX idx_taxonomy_lower_name ON taxonomy (LOWER(name));
    CREATE INDEX idx_taxonomy_size ON taxonomy (size);
  `);
}

export async function seedDb(data: Array<TaxonomyDbItem>): Promise<void> {
  const names = data.map((item) => item.name);
  const sizes = data.map((item) => item.size);

  await db.query(
    `INSERT INTO taxonomy (name, size)
     SELECT * FROM unnest($1::text[], $2::int[])
     ON CONFLICT (name) DO NOTHING`,
    [names, sizes],
  );
}

const subPathPropName = "subPath";

// creation of subpath prop when searching within subfolders to be able to sort by it
const subPathProp = `, regexp_replace(name, '^' || $1 || ' > (.*) > [^>]*$', '\\1') AS "${subPathPropName}"`;

const sortMap: Record<keyof TaxonomyDbQueryItem, string> = {
  name: "LOWER(name)",
  subPath: `LOWER("${subPathPropName}")`,
  size: "size",
};

export async function getItems(
  page: number,
  pageSize: number,
  parent: string,
  sortBy: keyof TaxonomyDbQueryItem,
  sortDir: "asc" | "desc",
  search: string,
  subfolders: boolean,
): Promise<{ readonly items: Array<TaxonomyDbQueryItem>; readonly total: number }> {
  const offset = (page - 1) * pageSize;

  const adjustedParent = await (async () => {
    if (parent) {
      return parent;
    }

    // fall back to the first item since we know there is always exactly 1 at top level
    const result = await db.query<{ readonly name: string }>(
      `SELECT name FROM taxonomy ORDER BY LOWER(name) ASC LIMIT 1`,
    );

    return result.rows[0]?.name;
  })();

  const whereClause =
    // matches all items starting after a parent, e.g., `parent > ** > *`
    `WHERE name LIKE $1 || ' > %'
        ${/* matches all ending segments against a search string that presents, e.g., `* > query` */ ""} 
        ${search ? `AND name ~ ('${search}' || '[^>]*$')` : ""}
        ${/* if not search within subfolders it prevent matching further than direct descendats, e.g., `parent > *` but not `parent > * > *` `* > query` */ ""} 
        ${subfolders ? "" : `AND name NOT LIKE $1 || ' > % > %'`}`;

  const selectionClause = `
    SELECT name, size${subfolders ? subPathProp : ""} FROM taxonomy
        ${whereClause}`;

  const [itemsResult, countResult] = await Promise.all([
    db.query<TaxonomyDbQueryItem>(
      // derive temporary table to be allowed to search by the created prop
      `${subfolders ? `SELECT * FROM (${selectionClause}) AS derived_table` : selectionClause}
        ORDER BY ${sortMap[sortBy]} ${sortDir.toUpperCase()}
        LIMIT $2 OFFSET $3`,
      [adjustedParent, pageSize, offset],
    ),
    db.query<{ readonly count: string }>(
      `SELECT COUNT(*) AS count FROM taxonomy
           ${whereClause}`,
      [adjustedParent],
    ),
  ]);

  return {
    items: itemsResult.rows,
    total: Number(countResult.rows[0]?.count) || 0,
  };
}

export async function dropDb() {
  await db.exec(`
    DROP INDEX idx_taxonomy_lower_name;
    DROP INDEX idx_taxonomy_size;
    DROP TABLE taxonomy;
  `);

  await db.close();
}
