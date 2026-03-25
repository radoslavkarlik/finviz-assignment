import { useGetApi } from "#api/taxonomy";
import { DataTable } from "#components/data-table";
import { Input } from "#components/ui/input";
import { useTaxonomyColumns } from "#taxonomy-columns";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

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
    columns: useTaxonomyColumns(),
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
        <search className="flex items-center justify-between gap-4 mb-4">
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
        </search>
        <DataTable table={table} page={page} onPageChange={setPage} />
      </section>
    </main>
  );
}
