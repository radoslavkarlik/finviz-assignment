import type { SortingState } from "@tanstack/react-table";

import { useGetApi } from "#api/taxonomy";
import { DataTable } from "#components/data-table";
import { Checkbox } from "#components/ui/checkbox";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";
import { TaxonomyBreadcrumbs } from "#modules/taxonomy/taxonomy-breadcrumbs";
import { TaxonomyColumnId } from "#modules/taxonomy/taxonomy-columns";
import { TAXONOMY_PAGE_SIZE, useTaxonomyTable } from "#modules/taxonomy/use-taxonomy-table";
import { useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// just for demonstration purposes, to simulate a slow API response
const RESPONSE_DELAY = import.meta.env.DEV ? 500 : 0;

export function Taxonomy() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subfolders, setSubfolders] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: TaxonomyColumnId.Name, desc: false },
  ]);
  const [page, setPage] = useState(1);

  const [currentLevel, setCurrentLevel] = useState("");

  const onSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const sortParams = sorting[0];

  const { data, isLoading } = useGetApi({
    ...(sortParams && {
      sortBy: sortParams.id as "name" | "size" | "subpath",
      sortDir: sortParams.desc ? "desc" : "asc",
    }),
    page,
    offset: TAXONOMY_PAGE_SIZE,
    search,
    ...(search && { subfolders }),
    delay: RESPONSE_DELAY,
    ...(currentLevel && { parent: currentLevel }),
  });

  const items = useMemo(() => data?.data.items ?? [], [data]);
  const total = data?.data.total ?? 0;
  const table = useTaxonomyTable(
    items,
    sorting,
    setSorting,
    page,
    total,
    !!search && subfolders,
    currentLevel,
  );

  const path = currentLevel ? currentLevel.split(" > ") : [data?.data.name ?? ""];

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <TaxonomyBreadcrumbs
          breadcrumbs={path}
          isLoading={isLoading}
          onClick={(_, index) => {
            if (index === 0) {
              setCurrentLevel("");
            } else {
              const fullPath = path.slice(0, index + 1).join(" > ");
              setCurrentLevel(fullPath);
            }

            setPage(1);
          }}
        />
        <header className="mb-8 mt-6">
          <h1 className="text-2xl font-semibold tracking-tight">Taxonomy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and search taxonomy items</p>
        </header>
        <search className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="flex flex-col gap-2">
            <Input
              className="h-9 w-full sm:w-72 bg-background"
              name="search"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => {
                const newQuery = e.currentTarget.value;

                setSearchInput(newQuery);
                onSearch(newQuery);
              }}
            />
            <Label className="cursor-pointer text-muted-foreground font-normal">
              <Checkbox
                checked={subfolders}
                onCheckedChange={(subfolders: boolean) => setSubfolders(subfolders)}
              />
              Search subitems
            </Label>
          </div>
          <div className="flex items-center h-9">
            {total > 0 && (
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {total.toLocaleString()} item{total !== 1 ? "s" : ""}
              </p>
            )}
            {isLoading && <Skeleton className="h-4 w-36" />}
          </div>
        </search>
        <DataTable
          table={table}
          page={page}
          pageCount={Math.ceil(total / TAXONOMY_PAGE_SIZE)}
          isLoading={isLoading}
          skeletonRows={TAXONOMY_PAGE_SIZE}
          onPageChange={setPage}
          isDisabled={(row) => !row.size}
          onRowClick={(row) => {
            setCurrentLevel(row.fullName ?? "");
            setPage(1);
          }}
        />
      </section>
    </main>
  );
}
