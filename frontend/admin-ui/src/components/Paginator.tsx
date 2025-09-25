import { useMemo } from "react";

export interface PaginatorProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  pageSizeLabel?: string;
  isLoading?: boolean;
  showSummary?: boolean;
  summaryLabel?: string;
  className?: string;
}

const defaultPageSizeOptions = [10, 20, 50];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const formatNumber = (value: number) => value.toLocaleString();

const summaryText = (
  totalItems: number,
  start: number,
  end: number,
  label: string,
) => {
  if (totalItems === 0) {
    return `No ${label}`;
  }

  if (totalItems === 1) {
    return `Showing 1 ${label}`;
  }

  return `Showing ${formatNumber(start)} - ${formatNumber(end)} of ${formatNumber(totalItems)} ${label}`;
};

const buttonClasses =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

const selectClasses =
  "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-300";

export function Paginator({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultPageSizeOptions,
  pageSizeLabel = "Rows per page",
  isLoading = false,
  showSummary = true,
  summaryLabel = "results",
  className,
}: PaginatorProps) {
  const { totalPages, currentPage, startItem, endItem, normalizedPageSizeOptions } = useMemo(() => {
    const safePageSize = Math.max(pageSize, 1);
    const calculatedTotalPages = Math.max(1, Math.ceil(Math.max(totalItems, 0) / safePageSize));
    const clampedPage = clamp(page, 1, calculatedTotalPages);
    const start = totalItems === 0 ? 0 : (clampedPage - 1) * safePageSize + 1;
    const end = totalItems === 0 ? 0 : Math.min(totalItems, clampedPage * safePageSize);
    const uniqueOptions = Array.from(new Set(pageSizeOptions)).filter((option) => option > 0);
    uniqueOptions.sort((a, b) => a - b);

    return {
      totalPages: calculatedTotalPages,
      currentPage: clampedPage,
      startItem: start,
      endItem: end,
      normalizedPageSizeOptions: uniqueOptions.length > 0 ? uniqueOptions : defaultPageSizeOptions,
    };
  }, [page, pageSize, totalItems, pageSizeOptions]);

  const canGoPrevious = currentPage > 1 && !isLoading && totalItems > 0;
  const canGoNext = currentPage < totalPages && !isLoading && totalItems > 0;
  const shouldRenderPageSize = Boolean(onPageSizeChange) && normalizedPageSizeOptions.length > 0;

  return (
    <nav
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="navigation"
      aria-label="Pagination"
    >
      {showSummary ? (
        <p className="text-sm text-slate-600">
          {summaryText(totalItems, startItem, endItem, summaryLabel)}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        {shouldRenderPageSize ? (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>{pageSizeLabel}:</span>
            <select
              className={selectClasses}
              value={pageSize}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              disabled={isLoading}
            >
              {normalizedPageSizeOptions.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={buttonClasses}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
          >
            Previous
          </button>
          <span className="min-w-[6rem] text-center text-sm font-medium text-slate-600">
            Page {formatNumber(currentPage)} of {formatNumber(totalPages)}
          </span>
          <button
            type="button"
            className={buttonClasses}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Paginator;
