import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

export const Table = <T,>({
  columns,
  data,
  className = '',
  emptyMessage = 'No records available.',
  stickyHeader = false,
}: TableProps<T>) => {
  const cn = (...classes: (string | undefined | false)[]) =>
    classes.filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-xs',
        className
      )}
    >
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className={cn('bg-slate-50/80 dark:bg-slate-800/50', stickyHeader && 'sticky top-0 z-10 backdrop-blur')}>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  'px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800',
                  col.className
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
          {data.length ? (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
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
                        'px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium',
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
                className="p-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
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
