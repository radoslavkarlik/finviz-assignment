import { cn } from "#components/lib/utils";
import { Skeleton } from "#components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePage,
  TablePageEllipsis,
  TablePagination,
  TableRow,
} from "#components/ui/table";
import { flexRender, type Table as TableType } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type Props<TData> = {
  readonly table: TableType<TData>;
  readonly page?: number;
  readonly pageCount?: number;
  readonly isLoading?: boolean;
  readonly skeletonRows?: number;
  readonly emptyText?: string;
  readonly onPageChange?: (page: number) => void;
  readonly onRowClick?: (row: TData) => void;
  readonly isDisabled?: (row: TData) => boolean;
};

export function DataTable<TData>({
  table,
  page,
  pageCount: providedPageCount,
  isLoading,
  skeletonRows = 10,
  emptyText = "No results found.",
  onPageChange,
  onRowClick,
  isDisabled,
}: Props<TData>) {
  const pageCount = providedPageCount ?? table.getPageCount();
  const isEmpty = !isLoading && table.getRowModel().rows.length === 0;

  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-border bg-background shadow-sm">
      <Table containerClassName="overflow-y-auto flex-1 min-h-0">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort() && !isEmpty;
                const sorted = header.column.getIsSorted();

                const { meta } = header.column.columnDef;
                const alignRight = meta?.align === "right";

                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={
                      canSort
                        ? (e) => {
                            header.column.getToggleSortingHandler()?.(e);
                            onPageChange?.(1);
                          }
                        : undefined
                    }
                    className={cn(
                      canSort &&
                        "cursor-pointer select-none hover:text-muted-foreground hover:brightness-150",
                      canSort && !sorted && "text-muted-foreground",
                      alignRight && "text-right",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        alignRight && "w-full justify-end",
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <>
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5 shrink-0" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5 shrink-0" />
                          ) : (
                            <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground/50" />
                          )}
                        </>
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i}>
                  {table.getAllColumns().map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : isEmpty
              ? [
                  <TableRow key="empty" className="hover:bg-transparent">
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {emptyText}
                    </TableCell>
                  </TableRow>,
                ]
              : table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={
                      onRowClick && !isLoading && (!isDisabled || !isDisabled(row.original))
                        ? () => {
                            onRowClick(row.original);
                          }
                        : undefined
                    }
                  >
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
        <TablePagination>
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
                <TablePageEllipsis key={`ellipsis-${i}`} />
              ) : (
                <TablePage
                  key={p}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? "page" : undefined}
                  isActive={page === p}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </TablePage>
              ),
            );
          })()}
        </TablePagination>
      )}
    </div>
  );
}
