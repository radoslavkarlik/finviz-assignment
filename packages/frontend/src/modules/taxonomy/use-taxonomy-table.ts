import type { TaxonomyTreeItemResponse } from "#api/model/taxonomyTreeItemResponse";

import { useTaxonomyColumns } from "#modules/taxonomy/taxonomy-columns";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export const TAXONOMY_PAGE_SIZE = 10;

export function useTaxonomyTable(
  data: Array<TaxonomyTreeItemResponse>,
  page: number,
  total: number,
) {
  return useReactTable({
    data,
    getRowId: (row) => row.fullName ?? "",
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
