import type { TaxonomyTreeItemResponse } from "#api/model/taxonomyTreeItemResponse";

import { formatTaxonomyBytes } from "#lib/format-taxonomy-size";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

const columnHelper = createColumnHelper<TaxonomyTreeItemResponse>();

export function useTaxonomyColumns(subfolders: boolean, currentLevel: string) {
  return useMemo(() => {
    const name = columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => getValue() ?? "—",
    });

    const subpath = columnHelper.accessor("fullName", {
      header: "Subpath",
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
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{formatTaxonomyBytes(row.original.size)}</div>
      ),
    });

    return subfolders ? [name, subpath, size] : [name, size];
  }, [subfolders, currentLevel]);
}
