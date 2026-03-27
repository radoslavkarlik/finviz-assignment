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

type Props<TData> = {
  readonly table: TableType<TData>;
  readonly page?: number;
  readonly pageCount?: number;
  readonly isLoading?: boolean;
  readonly skeletonRows?: number;
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
  onPageChange,
  onRowClick,
  isDisabled,
}: Props<TData>) {
  const pageCount = providedPageCount ?? table.getPageCount();

  return (
    <div className="rounded-lg border border-border bg-background shadow-sm">
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
