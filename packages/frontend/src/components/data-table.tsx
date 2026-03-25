"use no memo";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { cn } from "#lib/utils";
import { flexRender, type Table as TableType } from "@tanstack/react-table";

type Props<TData> = {
  readonly table: TableType<TData>;
  readonly page?: number;
  readonly onPageChange?: (page: number) => void;
};

export function DataTable<TData>({ table, page, onPageChange }: Props<TData>) {
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col">
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
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-1 border-t border-border px-4 py-3"
        >
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
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-sm text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? "page" : undefined}
                  className={cn(
                    "min-w-8 h-8 px-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              ),
            );
          })()}
        </nav>
      )}
    </div>
  );
}
