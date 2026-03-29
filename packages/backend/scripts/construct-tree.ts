import { prepareDb } from "#api/prepare-db";
import { TaxonomyDbItem, TaxonomyTreeItem } from "#type";

const separator = " > ";

async function constructTree(): Promise<TaxonomyTreeItem> {
  using db = await prepareDb();
  const { client } = db;

  const { rows } = await client.query<TaxonomyDbItem>(
    "SELECT name, size FROM taxonomy ORDER BY LOWER(name)",
  );

  const tree: Record<string, TaxonomyTreeItem> = {};

  for (const row of rows) {
    const segments = row.name.split(separator);
    const name = segments.at(-1) ?? row.name;
    const parentId = row.name.slice(0, row.name.lastIndexOf(separator));
    const parent = tree[parentId];

    const newNode: TaxonomyTreeItem = {
      name,
      size: row.size,
      children: [],
    };

    tree[row.name] = newNode;

    if (parent) {
      parent.children.push(newNode);
    }
  }

  return tree[rows[0].name];
}

constructTree().then(console.log);
