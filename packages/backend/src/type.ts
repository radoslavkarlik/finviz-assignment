export type TaxonomyFlatItem = {
  readonly name: string;
  readonly size: number;
};

export type TaxonomyTreeItem = {
  readonly name: string;
  readonly size: number;
  readonly fullName: string;
  readonly children: Array<TaxonomyTreeItem>;
};

export type TaxonomyTreeItemResponse = {
  readonly name: string;
  readonly size: number;
  readonly fullName: string;
};
