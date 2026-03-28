import type { GetApiSortBy } from "#api/model/getApiSortBy";
import type { TaxonomyTreeItemResponse } from "#api/model/taxonomyTreeItemResponse";

import { formatTaxonomyBytes } from "#lib/format-taxonomy-size";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

export const TaxonomyColumnId = {
  Name: "name",
  Size: "size",
  Subpath: "subPath",
} as const satisfies Record<string, GetApiSortBy>;

const columnHelper = createColumnHelper<TaxonomyTreeItemResponse>();

export function useTaxonomyColumns(subfolders: boolean, currentLevel: string) {
  return useMemo(() => {
    const name = columnHelper.accessor("name", {
      id: TaxonomyColumnId.Name,
      header: "Name",
      enableSorting: true,
      cell: ({ getValue }) => getValue() ?? "—",
    });

    const subpath = columnHelper.accessor("fullName", {
      id: TaxonomyColumnId.Subpath,
      header: "Subpath",
      enableSorting: true,
      sortDescFirst: false,
      cell: ({ getValue, row }) => {
        const fullName = getValue();

        if (!fullName) {
          return "—";
        }

        const effectiveLevel = currentLevel || fullName.split(" > ")[0];
        const prefix = `${effectiveLevel} > `;
        const suffix = row.original.name ? ` > ${row.original.name}` : "";
        const stripped = fullName.slice(prefix.length, fullName.length - suffix.length);

        return stripped || "—";
      },
    });

    const size = columnHelper.accessor("size", {
      id: TaxonomyColumnId.Size,
      header: "Size",
      meta: { align: "right" },
      enableSorting: true,
      sortDescFirst: false,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{formatTaxonomyBytes(row.original.size)}</div>
      ),
    });

    return subfolders ? [name, subpath, size] : [name, size];
  }, [subfolders, currentLevel]);
}
