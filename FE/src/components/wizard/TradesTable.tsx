import React from "react";
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";

interface Trade {
  entry_index: number;
  exit_index: number;
  entry_price: number;
  exit_price: number;
  shares: number;
  pnl: number;
  pct_return: number;
  type: string;
}

interface TradesTableProps {
  trades: Trade[];
}

export default function TradesTable({ trades }: TradesTableProps) {
  const columns: ColumnDef<Trade>[] = [
    { header: "סוג עסקה", accessorKey: "type" },
    { header: "כניסה", accessorKey: "entry_price" },
    { header: "יציאה", accessorKey: "exit_price" },
    { header: "כמות מניות", accessorKey: "shares" },
    { header: "P&L", accessorKey: "pnl" },
    { header: "% רווח", accessorKey: "pct_return" },
    { header: "נר כניסה", accessorKey: "entry_index" },
    { header: "נר יציאה", accessorKey: "exit_index" },
  ];

  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full border border-gray-200 text-sm">
      <thead className="bg-gray-100">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="border p-2 text-left">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="even:bg-gray-50">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="border p-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
