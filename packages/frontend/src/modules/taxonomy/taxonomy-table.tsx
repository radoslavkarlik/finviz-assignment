import type { TaxonomyItem } from "#api/model/taxonomyItem";

import { DataTable } from "#components/data-table";
import { useTaxonomyColumns } from "#modules/taxonomy/taxonomy-columns";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export const TAXONOMY_PAGE_SIZE = 10;

type Props = {
  readonly page: number;
  readonly data: Array<TaxonomyItem>;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
};

export function TaxonomyTable({ page, data, total, onPageChange }: Props) {
  const table = useReactTable({
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

  return <DataTable table={table} page={page} onPageChange={onPageChange} />;
}
