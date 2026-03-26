import { useGetApi } from "#api/taxonomy";
import { DataTable } from "#components/data-table";
import { Input } from "#components/ui/input";
import { Skeleton } from "#components/ui/skeleton";
import { TAXONOMY_PAGE_SIZE, useTaxonomyTable } from "#modules/taxonomy/use-taxonomy-table";
import { useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// just for demonstration purposes, to simulate a slow API response
const RESPONSE_DELAY = import.meta.env.DEV ? 500 : 0;

export function Taxonomy() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const onSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const { data, isLoading } = useGetApi({
    page,
    offset: TAXONOMY_PAGE_SIZE,
    search,
    delay: RESPONSE_DELAY,
  });

  const items = useMemo(() => data?.data.items ?? [], [data]);
  const total = data?.data.total ?? 0;
  const table = useTaxonomyTable(items, page, total);

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Taxonomy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and search taxonomy items</p>
        </header>
        <search className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input
            className="h-9 w-full sm:w-64 bg-background"
            name="search"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => {
              const newQuery = e.currentTarget.value;

              setSearchInput(newQuery);
              onSearch(newQuery);
            }}
          />
          {total > 0 && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {total.toLocaleString()} item{total !== 1 ? "s" : ""}
            </p>
          )}
          {isLoading && <Skeleton className="h-4 w-36" />}
        </search>
        <DataTable
          table={table}
          page={page}
          pageCount={Math.ceil(total / TAXONOMY_PAGE_SIZE)}
          isLoading={isLoading}
          skeletonRows={TAXONOMY_PAGE_SIZE}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}
