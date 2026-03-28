import { TaxonomyFlatItem, TaxonomyTreeItem } from "./type";

const SEPARATOR = " > ";

export function constructTree(
  items: ReadonlyArray<TaxonomyFlatItem>,
): TaxonomyTreeItem | undefined {
  const nodeMap = new Map<string, TaxonomyTreeItem>();

  for (const item of items) {
    const segments = item.name.split(SEPARATOR);
    const leafName = segments.at(-1);

    if (!leafName) {
      continue;
    }

    const node: TaxonomyTreeItem = {
      name: leafName,
      size: item.size,
      fullName: item.name,
      children: [],
    };

    nodeMap.set(item.name, node);

    const parentName = segments.slice(0, -1).join(SEPARATOR);
    const parentNode = nodeMap.get(parentName);

    if (parentNode) {
      parentNode.children.push(node);
    }
  }

  const firstItemName = items.at(0)?.name;
  const firstItem = firstItemName ? nodeMap.get(firstItemName) : undefined;

  return firstItem;
}
