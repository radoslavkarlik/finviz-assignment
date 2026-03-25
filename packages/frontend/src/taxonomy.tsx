import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { TaxonomyItem } from "./api/model";

import { useGetApi } from "./api/taxonomy";

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

  const pageCount = data?.data.total ? Math.ceil(data.data.total / PAGE_SIZE) : 0;

  const table = useReactTable({
    data: useMemo(() => data?.data.items ?? [], [data]),
    columns: useMemo(() => [columnHelper.accessor("name", { header: "Name" })], []),
    pageCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: PAGE_SIZE,
      },
    },
    manualPagination: true,
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
      <div className="flex flex-col gap-2">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id}>{row.getValue("name")}</div>
        ))}
      </div>
      {pageCount > 1 && (
        <div className="flex justify-center gap-2">
          {(() => {
            const delta = 2;
            const pages: (number | "...")[] = [];

            for (let i = 1; i <= pageCount; i++) {
              if (i === 1 || i === pageCount || (i >= page - delta && i <= page + delta)) {
                pages.push(i);
              } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
              }
            }

            return pages.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1 text-amber-700">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`px-3 py-1 border rounded ${page === p ? "bg-amber-600 text-amber-100" : "bg-amber-200 text-amber-700"}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            );
          })()}
        </div>
      )}
    </main>
  );
}
