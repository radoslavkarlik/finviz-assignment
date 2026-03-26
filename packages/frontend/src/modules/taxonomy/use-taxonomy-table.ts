import type { TaxonomyItem } from "#api/model/taxonomyItem";

import { useTaxonomyColumns } from "#modules/taxonomy/taxonomy-columns";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export const TAXONOMY_PAGE_SIZE = 10;

export function useTaxonomyTable(data: Array<TaxonomyItem>, page: number, total: number) {
  return useReactTable({
    data,
    getRowId: (row) => row.name ?? "",
    columns: useTaxonomyColumns(),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: TAXONOMY_PAGE_SIZE,
      },
    },
    manualPagination: true,
    rowCount: total,
    getCoreRowModel: getCoreRowModel(),
  });
}
