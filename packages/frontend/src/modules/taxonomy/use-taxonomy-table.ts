import type { TaxonomyTreeItemResponse } from "#api/model/taxonomyTreeItemResponse";

import { useTaxonomyColumns } from "#modules/taxonomy/taxonomy-columns";
import {
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type SortingState,
} from "@tanstack/react-table";

export function useTaxonomyTable(
  data: Array<TaxonomyTreeItemResponse>,
  sorting: SortingState,
  onSortingChange: OnChangeFn<SortingState>,
  page: number,
  pageSize: number,
  total: number,
  subfolders: boolean,
  currentLevel: string,
) {
  return useReactTable({
    data,
    getRowId: (row) => row.fullName ?? "",
    columns: useTaxonomyColumns(subfolders, currentLevel),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting,
    },
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    rowCount: total,
    getCoreRowModel: getCoreRowModel(),
  });
}
