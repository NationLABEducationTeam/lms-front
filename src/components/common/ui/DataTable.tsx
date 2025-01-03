import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
}

const DataTable = <T extends object>({ 
  data, 
  columns, 
  loading = false, 
  error = null 
}: DataTableProps<T>) => {
  if (error) {
    return (
      <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  if (loading) {
    return <div className="text-white text-center py-4">로딩 중...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-white/5">
            {columns.map((column, index) => (
              <TableHead key={index} className="text-blue-300">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-white/5">
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className="text-white">
                  {typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : String(row[column.accessor] ?? '-')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable; 