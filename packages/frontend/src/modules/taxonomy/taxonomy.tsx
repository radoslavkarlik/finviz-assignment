import type { SortingState } from "@tanstack/react-table";

import { useGetApi } from "#api/taxonomy";
import { AppTheme } from "#app-theme";
import { DataTable } from "#components/data-table";
import { Checkbox } from "#components/ui/checkbox";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Skeleton } from "#components/ui/skeleton";
import { TaxonomyBreadcrumbs } from "#modules/taxonomy/taxonomy-breadcrumbs";
import { TaxonomyColumnId } from "#modules/taxonomy/taxonomy-columns";
import { useTaxonomyTable } from "#modules/taxonomy/use-taxonomy-table";
import { useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// just for demonstration purposes, to simulate a slow API response
const RESPONSE_DELAY = import.meta.env.DEV ? 200 : 0;
const TAXONOMY_PAGE_SIZE = 10;

export function Taxonomy() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subfolders, setSubfolders] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: TaxonomyColumnId.Name, desc: false },
  ]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(TAXONOMY_PAGE_SIZE);

  const [currentLevel, setCurrentLevel] = useState("");

  const onSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const sortParams = sorting[0];

  const { data, isLoading } = useGetApi({
    ...(sortParams && {
      sortBy: sortParams.id as "name" | "size" | "subPath",
      sortDir: sortParams.desc ? "desc" : "asc",
    }),
    page,
    offset: pageSize,
    search,
    ...(search && { subfolders }),
    delay: RESPONSE_DELAY,
    ...(currentLevel && { parent: currentLevel }),
  });

  const items = useMemo(() => data?.data.items ?? [], [data]);
  const total = data?.data.total ?? 0;
  const performance = data?.data.performance;
  const table = useTaxonomyTable(
    items,
    sorting,
    setSorting,
    page,
    pageSize,
    total,
    !!search && subfolders,
    currentLevel,
  );

  const path = currentLevel ? currentLevel.split(" > ") : [data?.data.name ?? ""];

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-muted/30">
      <section className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
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
        <header className="mt-6 mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Taxonomy</h1>
            <p className=" mt-1 text-sm text-muted-foreground">Browse and search taxonomy items</p>
          </div>
          <AppTheme />
        </header>
        <search className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Input
              className="h-9 w-full bg-background sm:w-72"
              name="search"
              placeholder="Search..."
              value={searchInput}
              onChange={(newQuery) => {
                setSearchInput(newQuery);
                onSearch(newQuery);
              }}
            />
            <Label className="cursor-pointer font-normal text-muted-foreground">
              <Checkbox
                checked={subfolders}
                onCheckedChange={(subfolders: boolean) => setSubfolders(subfolders)}
              />
              Search subitems
            </Label>
          </div>
          <div className="flex h-9 items-center gap-3">
            {isLoading ? (
              <Skeleton className="h-4 w-36" />
            ) : (
              <p className="text-sm whitespace-nowrap text-muted-foreground">
                {total.toLocaleString()} item{total !== 1 ? "s" : ""}
                {performance && (
                  <span className="ml-2 text-xs">({Number(performance).toFixed(0)}ms)</span>
                )}
              </p>
            )}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {[3, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </search>
        <div className="flex min-h-0 flex-1 flex-col">
          <DataTable
            table={table}
            page={page}
            pageCount={Math.ceil(total / pageSize)}
            isLoading={isLoading}
            skeletonRows={pageSize}
            onPageChange={setPage}
            isDisabled={(row) => !row.size}
            emptyText="No taxonomy entries found."
            onRowClick={(row) => {
              setCurrentLevel(row.fullName ?? "");
              setPage(1);
            }}
          />
        </div>
      </section>
    </main>
  );
}
