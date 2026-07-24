import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
}

export const Table = <T,>({
  columns,
  data,
  className = '',
  emptyMessage = 'No data available',
}: TableProps<T>) => {
  const cn = (...classes: (string | undefined | false)[]) =>
    classes.filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        className
      )}
    >
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  'px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300',
                  col.className
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
          {data.length ? (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {columns.map((col, colIdx) => {
                  const cell =
                    typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row as Record<string, unknown>)[col.accessor as string] as React.ReactNode;
                  return (
                    <td
                      key={colIdx}
                      className={cn(
                        'px-4 py-2 text-sm text-slate-700 dark:text-slate-200',
                        col.className
                      )}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-6 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
