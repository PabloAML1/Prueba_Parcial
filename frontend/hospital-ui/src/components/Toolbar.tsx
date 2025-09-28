import type { ReactNode } from "react";

export interface ToolbarProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  createLabel?: string;
  onCreate?: () => void;
  isCreateDisabled?: boolean;
  createIcon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const inputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-300";

export function Toolbar({
  title,
  subtitle,
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  createLabel = "New",
  onCreate,
  isCreateDisabled = false,
  createIcon,
  actions,
  children,
  className,
}: ToolbarProps) {
  const hasSearch = typeof onSearchChange === "function";
  const hasCreate = typeof onCreate === "function";
  const hasRightArea =
    hasSearch || hasCreate || Boolean(actions) || Boolean(children);

  return (
    <header
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        {title ? (
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        ) : null}
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      {hasRightArea ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:items-center lg:justify-end lg:gap-3">
          {hasSearch ? (
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                className={inputClasses}
                placeholder={searchPlaceholder}
                value={searchValue ?? ""}
                onChange={(event) => onSearchChange?.(event.target.value)}
                autoComplete="off"
              />
              {searchValue ? (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-slate-400 transition-all hover:text-slate-600"
                  onClick={() => onSearchChange?.("")}
                  aria-label="Clear search"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              ) : null}
            </div>
          ) : null}

          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
          {children ? (
            <div className="flex items-center gap-2">{children}</div>
          ) : null}

          {hasCreate ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#274c77] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#274c77d1] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onCreate}
              disabled={isCreateDisabled}
            >
              {createIcon ?? <span className="text-base leading-none">+</span>}
              <span>{createLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

export default Toolbar;
