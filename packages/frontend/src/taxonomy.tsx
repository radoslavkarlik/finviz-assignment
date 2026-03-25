import type { TaxonomyItem } from "#api/model/taxonomyItem";

import { useGetApi } from "#api/taxonomy";
import { DataTable } from "#components/data-table";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const columnHelper = createColumnHelper<TaxonomyItem>();

const PAGE_SIZE = 10;

export function Taxonomy() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const onSearch = (search: string) => {
    setSearch(search);
    setPage(1);
  };

  const { data } = useGetApi({ page, offset: PAGE_SIZE, search });

  const table = useReactTable({
    data: useMemo(() => data?.data.items ?? [], [data]),
    getRowId: (row) => row.name ?? "",
    columns: useMemo(
      () => [
        columnHelper.accessor("name", { header: "Name", cell: ({ row }) => row.original.name }),
      ],
      [],
    ),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: PAGE_SIZE,
      },
    },
    manualPagination: true,
    rowCount: data?.data.total ?? 0,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="border border-amber-200 bg-amber-400 p-4 items-center text-center text-xs text-amber-700 flex flex-col gap-4">
      <h1 className="uppercase text-xl">Taxonomy</h1>
      <input
        className="w-50 border border-amber-300 bg-amber-100 placeholder:text-amber-500"
        name="search"
        placeholder="Search taxonomy..."
        value={search}
        onChange={(e) => onSearch(e.currentTarget.value)}
      />
      <DataTable table={table} page={page} onPageChange={setPage} />
    </main>
  );
}
