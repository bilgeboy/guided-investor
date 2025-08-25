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
  entry_date?: string | Date; // אם יש לך תאריכים
  exit_date?: string | Date;
}

interface TradesTableProps {
  trades: Trade[];
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function TradesTable({ trades }: TradesTableProps) {
  const columns: ColumnDef<Trade>[] = [
    {
      header: "מספר עסקה",
      accessorFn: (row, index) => index + 1, // נותן מספר רץ לכל שורה
    },
    {
      header: "סוג עסקה",
      accessorKey: "type",
      cell: ({ getValue }) => (getValue<string>() === "BUY" ? "LONG" : "SHORT"),
    },
    {
      header: "כניסה",
      accessorKey: "entry_price",
      cell: ({ getValue }) => numberFormatter.format(getValue<number>()),
    },
    {
      header: "יציאה",
      accessorKey: "exit_price",
      cell: ({ getValue }) => numberFormatter.format(getValue<number>()),
    },
    {
      header: "כמות מניות",
      accessorKey: "shares",
      cell: ({ getValue }) => numberFormatter.format(getValue<number>()),
    },
    {
      header: "P&L",
      accessorKey: "pnl",
      cell: ({ getValue }) => numberFormatter.format(getValue<number>()),
    },
    {
      header: "% רווח",
      accessorKey: "pct_return",
      cell: ({ getValue }) => `${getValue<number>().toFixed(2)}%`,
    },
    {
      header: "נר כניסה",
      accessorKey: "entry_index",
      cell: ({ getValue }) =>
        getValue()
          ? dateFormatter.format(new Date(getValue() as string | Date))
          : "-",
    },
    {
      header: "נר יציאה",
      accessorKey: "exit_index",
      cell: ({ getValue }) =>
        getValue() ? dateFormatter.format(new Date(getValue())) : "-",
    },
  ];

  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="border-b px-4 py-2 text-left sticky top-0 bg-gray-100"
              >
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
        {table.getRowModel().rows.map((row, idx) => (
          <tr
            key={row.id}
            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="border-b px-4 py-2 text-gray-800">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
