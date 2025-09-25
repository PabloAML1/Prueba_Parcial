import type { Key, ReactNode } from "react";

type TableAlignment = "left" | "center" | "right";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const alignClassMap: Record<TableAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export interface DataTableColumn<TData extends Record<string, unknown>> {
  id: string;
  /** Header label or custom node */
  header: ReactNode;
  /** Field name in the data record to render when no custom cell is provided */
  field?: keyof TData;
  /** Custom renderer for the cell content */
  cell?: (row: TData) => ReactNode;
  /** Text alignment for the column */
  align?: TableAlignment;
  /** Optional width constraint (Tailwind class names) */
  width?: string;
  /** Additional Tailwind classes for the cell */
  className?: string;
}

export interface DataTableProps<TData extends Record<string, unknown>> {
  columns: Array<DataTableColumn<TData>>;
  data: TData[];
  className?: string;
  striped?: boolean;
  compact?: boolean;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyMessage?: string;
  renderActions?: (row: TData) => ReactNode;
  actionsHeader?: ReactNode;
  rowKey?: (row: TData, index: number) => Key;
  onRowClick?: (row: TData) => void;
}

const defaultEmptyMessage = "No records to display.";

function resolveFieldValue<TData extends Record<string, unknown>>(
  row: TData,
  field: keyof TData
): ReactNode {
  const rawValue = row[field];

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return "-";
  }

  if (typeof rawValue === "boolean") {
    return rawValue ? "Yes" : "No";
  }

  if (rawValue instanceof Date) {
    return rawValue.toLocaleString();
  }

  if (typeof rawValue === "number") {
    return rawValue.toLocaleString();
  }

  return rawValue as ReactNode;
}

function resolveRowKey<TData extends Record<string, unknown>>(
  row: TData,
  index: number,
  rowKey?: (row: TData, index: number) => Key
): Key {
  if (rowKey) {
    return rowKey(row, index);
  }

  if (typeof row === "object" && row !== null && "id" in row) {
    const maybeId = (row as Record<string, unknown>).id;
    if (typeof maybeId === "string" || typeof maybeId === "number") {
      return maybeId;
    }
  }

  return index;
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  className,
  striped = true,
  compact = false,
  isLoading = false,
  loadingRowCount,
  emptyMessage = defaultEmptyMessage,
  renderActions,
  actionsHeader = "Actions",
  rowKey,
  onRowClick,
}: DataTableProps<TData>) {
  const hasActions = Boolean(renderActions);
  const showSkeleton = isLoading && data.length === 0;
  const skeletonRowCount = loadingRowCount ?? 3;
  const cellPadding = compact ? "px-3 py-2 text-sm" : "px-4 py-3";
  const bodyFont = compact ? "text-sm" : "text-base";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table
          className="min-w-full divide-y divide-slate-200"
          aria-busy={isLoading}
        >
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600",
                    column.align
                      ? alignClassMap[column.align]
                      : alignClassMap.left,
                    column.width
                  )}
                >
                  {column.header}
                </th>
              ))}
              {hasActions ? (
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap"
                >
                  {actionsHeader}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className={cn("divide-y divide-slate-200", bodyFont)}>
            {showSkeleton ? (
              Array.from({ length: skeletonRowCount }).map(
                (_, skeletonIndex) => (
                  <tr
                    key={`loading-${skeletonIndex}`}
                    className="animate-pulse"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          cellPadding,
                          column.align
                            ? alignClassMap[column.align]
                            : alignClassMap.left,
                          column.className
                        )}
                      >
                        <div className="h-2.5 w-3/4 rounded bg-slate-200" />
                      </td>
                    ))}
                    {hasActions ? (
                      <td className={cn(cellPadding, "text-right")}>
                        <div className="ml-auto h-2.5 w-1/3 rounded bg-slate-200" />
                      </td>
                    ) : null}
                  </tr>
                )
              )
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className={cn(cellPadding, "text-center text-slate-500")}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={resolveRowKey(row, index, rowKey)}
                  className={cn(
                    striped && index % 2 === 1 ? "bg-slate-50/60" : "bg-white",
                    onRowClick &&
                      "cursor-pointer transition-colors hover:bg-slate-100 focus-visible:outline-none"
                  )}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(row);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!onRowClick) {
                      return;
                    }

                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        cellPadding,
                        column.align
                          ? alignClassMap[column.align]
                          : alignClassMap.left,
                        column.className
                      )}
                    >
                      {column.cell
                        ? column.cell(row)
                        : column.field
                        ? resolveFieldValue(row, column.field)
                        : null}
                    </td>
                  ))}
                  {hasActions ? (
                    <td className={cn(cellPadding, "text-right")}>
                      {renderActions?.(row)}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
