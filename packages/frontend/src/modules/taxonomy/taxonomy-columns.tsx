import type { TaxonomyItem } from "#api/model/taxonomyItem";

import { formatTaxonomyBytes } from "#lib/format-taxonomy-size";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

const columnHelper = createColumnHelper<TaxonomyItem>();

export function useTaxonomyColumns() {
  return useMemo(() => {
    const name = columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => getValue() ?? "—",
    });

    const size = columnHelper.accessor("size", {
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatTaxonomyBytes(row.original.size)}
        </div>
      ),
    });

    return [name, size];
  }, []);
}
