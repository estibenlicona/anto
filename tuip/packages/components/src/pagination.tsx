import { Icon } from "./icon";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  /** Current page, 1-indexed. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the target page when the user picks a page or a prev/next control. */
  onPageChange: (page: number) => void;
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
  className?: string;
}

type PageItem = number | "ellipsis";

/**
 * First, last and current page (plus one neighbor on each side) stay visible;
 * everything else collapses into a single ellipsis per gap. Mirrors the
 * pattern already used by every major pagination UI, so no one has to learn
 * a new one.
 */
function getPageItems(page: number, pageCount: number): PageItem[] {
  const siblingCount = 1;
  const totalVisible = siblingCount * 2 + 5;

  if (pageCount <= totalVisible) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);

  const items: PageItem[] = [1];
  if (left > 2) items.push("ellipsis");
  for (let candidate = left; candidate <= right; candidate++) {
    if (candidate !== 1 && candidate !== pageCount) items.push(candidate);
  }
  if (right < pageCount - 1) items.push("ellipsis");
  if (pageCount > 1) items.push(pageCount);

  return items;
}

const navButtonClasses = cn(
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-control border-default border-neutral-default text-neutral-subtle",
  "hover:bg-neutral-subtle-hover",
  "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
);

export function Pagination({
  page,
  pageCount,
  onPageChange,
  "aria-label": ariaLabel = "Paginación",
  className,
}: PaginationProps) {
  const items = getPageItems(page, pageCount);

  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center gap-1.5", className)}>
      <PaginationPrevious page={page} onPageChange={onPageChange} />

      {items.map((item, index) =>
        item === "ellipsis" ? (
          // Position in the sequence, not the item value, is what makes this key
          // stable: there are at most two ellipses and neither is ever a page number.
          <PaginationEllipsis key={`ellipsis-${index}`} />
        ) : (
          <PaginationItem key={item} page={item} active={item === page} onSelect={onPageChange} />
        ),
      )}

      <PaginationNext page={page} pageCount={pageCount} onPageChange={onPageChange} />
    </nav>
  );
}

export interface PaginationPreviousProps {
  page: number;
  onPageChange: (page: number) => void;
}

export function PaginationPrevious({ page, onPageChange }: PaginationPreviousProps) {
  return (
    <button
      type="button"
      aria-label="Página anterior"
      disabled={page <= 1}
      onClick={() => onPageChange(page - 1)}
      className={navButtonClasses}
    >
      <Icon name="chevron-right" size={16} className="rotate-180" />
    </button>
  );
}

export interface PaginationNextProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function PaginationNext({ page, pageCount, onPageChange }: PaginationNextProps) {
  return (
    <button
      type="button"
      aria-label="Página siguiente"
      disabled={page >= pageCount}
      onClick={() => onPageChange(page + 1)}
      className={navButtonClasses}
    >
      <Icon name="chevron-right" size={16} />
    </button>
  );
}

export interface PaginationItemProps {
  page: number;
  active?: boolean;
  onSelect: (page: number) => void;
}

export function PaginationItem({ page, active, onSelect }: PaginationItemProps) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(page)}
      className={cn(
        "flex h-8 min-w-8 shrink-0 items-center justify-center rounded-control px-2 text-body-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        active ? "bg-neutral-bold text-neutral-inverse" : "text-neutral-default hover:bg-neutral-subtle-hover",
      )}
    >
      {page}
    </button>
  );
}

export interface PaginationEllipsisProps {}

export function PaginationEllipsis({}: PaginationEllipsisProps = {}) {
  return (
    <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-subtle">
      …
    </span>
  );
}
