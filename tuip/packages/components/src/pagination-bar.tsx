import { useId } from "react";
import { cn } from "@/lib/cn";
import { Pagination, type PaginationProps } from "./pagination";
import { Select } from "./select";

export interface PaginationBarProps
  extends Pick<PaginationProps, "page" | "pageCount" | "onPageChange"> {
  /** Total number of results across every page. */
  total: number;
  /** Results shown per page. */
  pageSize: number;
  /** Choices offered in the page-size selector. */
  pageSizeOptions: number[];
  /** Called with the newly chosen page size. PaginationBar does not recompute `page` itself. */
  onPageSizeChange: (pageSize: number) => void;
  /** Additional classes merged onto the row. */
  className?: string;
}

/**
 * Combines, in one row, the result-range summary Pagination is explicitly
 * barred from carrying itself (its own requirement says so) with a page-size
 * Select and Pagination's own navigation. Composes Pagination unchanged —
 * `page`/`pageCount`/`onPageChange` pass straight through.
 */
export function PaginationBar({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: PaginationBarProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pageSizeId = useId();

  const pageSizeSelectOptions = pageSizeOptions.map((size) => ({
    value: String(size),
    label: `${size} por página`,
  }));

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-body-sm text-neutral-subtle">
        Mostrando <span className="font-medium text-neutral-default">{from}–{to}</span> de{" "}
        <span className="font-medium text-neutral-default">{total}</span>
      </p>
      <div className="flex items-center gap-3">
        {/* sr-only: el propio Select no tiene una prop aria-label, así que la
            asociación accesible se arma con un label externo apuntando a su id. */}
        <label htmlFor={pageSizeId} className="sr-only">
          Resultados por página
        </label>
        <Select
          id={pageSizeId}
          size="small"
          options={pageSizeSelectOptions}
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        />
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
