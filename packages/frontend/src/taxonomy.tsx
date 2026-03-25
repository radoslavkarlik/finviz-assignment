import type { TaxonomyItem } from "#api/model/taxonomyItem";

import { useGetApi } from "#api/taxonomy";
import { DataTable } from "#components/data-table";
import { Input } from "#components/ui/input";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const columnHelper = createColumnHelper<TaxonomyItem>();

const PAGE_SIZE = 10;

function formatBytes(bytes?: number): string {
  if (bytes == null) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function Taxonomy() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data } = useGetApi({ page, offset: PAGE_SIZE, search });
  const total = data?.data.total ?? 0;

  const table = useReactTable({
    data: useMemo(() => data?.data.items ?? [], [data]),
    getRowId: (row) => row.name ?? "",
    columns: useMemo(
      () => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: ({ getValue }) => getValue() ?? "—",
        }),
        columnHelper.accessor("size", {
          header: () => <span className="block text-right">Size</span>,
          cell: ({ getValue }) => (
            <span className="block text-right tabular-nums">
              {formatBytes(getValue())}
            </span>
          ),
        }),
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
    rowCount: total,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Taxonomy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and search taxonomy items</p>
        </header>
        <div className="flex items-center justify-between gap-4 mb-4">
          <Input
            className="h-9 w-64 bg-background"
            name="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearch(e.currentTarget.value)}
          />
          {total > 0 && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {total.toLocaleString()} item{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-background shadow-sm">
          <DataTable table={table} page={page} onPageChange={setPage} />
        </div>
      </section>
    </main>
  );
}
