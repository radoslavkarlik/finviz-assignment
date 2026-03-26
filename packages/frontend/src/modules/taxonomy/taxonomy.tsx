import { useGetApi } from "#api/taxonomy";
import { Input } from "#components/ui/input";
import { TAXONOMY_PAGE_SIZE, TaxonomyTable } from "#modules/taxonomy/taxonomy-table";
import { useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function Taxonomy() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const onSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const { data } = useGetApi({ page, offset: TAXONOMY_PAGE_SIZE, search });
  const items = useMemo(() => data?.data.items ?? [], [data]);
  const total = data?.data.total ?? 0;

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
        </search>
        <TaxonomyTable page={page} data={items} total={total} onPageChange={setPage} />
      </section>
    </main>
  );
}
