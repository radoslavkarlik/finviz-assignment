"use no memo";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { flexRender, type Table as TableType } from "@tanstack/react-table";

type Props<TData> = {
  readonly table: TableType<TData>;
  readonly page?: number;
  readonly onPageChange?: (page: number) => void;
};

export function DataTable<TData>({ table, page, onPageChange }: Props<TData>) {
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
