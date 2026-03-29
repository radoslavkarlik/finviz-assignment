export type TaxonomyDbItem = {
  readonly name: string;
  readonly size: number;
};

export type TaxonomyDbQueryItem = TaxonomyDbItem & {
  readonly subPath?: string;
};

export type TaxonomyItemResponse = TaxonomyDbQueryItem & {
  readonly fullName: string;
};

export type TaxonomyTreeItem = TaxonomyDbItem & {
  readonly children: Array<TaxonomyTreeItem>;
};
