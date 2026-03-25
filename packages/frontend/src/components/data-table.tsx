"use no memo";

import { flexRender, type Table } from "@tanstack/react-table";

type Props<TData> = {
  readonly table: Table<TData>;
  readonly page?: number;
  readonly onPageChange?: (page: number) => void;
};

export function DataTable<TData>({ table, page, onPageChange }: Props<TData>) {
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageCount > 1 && onPageChange && page !== undefined && (
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
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              ),
            );
          })()}
        </div>
      )}
    </div>
  );
}
