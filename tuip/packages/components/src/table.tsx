import {
  Children,
  HTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { Icon } from "./icon";
import { cn } from "@/lib/cn";

export type TableDensity = "comfortable" | "compact" | "matrix";

/** Which edge a column's contents line up against. */
export type TableAlign = "left" | "right";

/**
 * Density is set once on Table and read by TableHead/TableCell below it.
 * Threading it as a prop on every cell would force the consumer to repeat it
 * across a table that can have hundreds of rows, all composed by hand.
 */
const DensityContext = createContext<TableDensity>("comfortable");

const cellPadding: Record<TableDensity, string> = {
  comfortable: "px-4 py-3",
  compact: "px-3 py-1.5",
  // Below compact on both axes, and horizontally is the point: a matrix cell
  // holds a meter or a single digit, not a sentence, and the padding that
  // makes text readable pushes the columns so far apart that the eye can no
  // longer compare one row against the next.
  matrix: "px-2 py-1",
};

// Always shorter than the body's at the same density — a header label needs
// less room than a data cell, so it does not need the same range to read
// well at any of them. Density still moves it, from a lower base.
const headerCellPadding: Record<TableDensity, string> = {
  comfortable: "px-4 py-2",
  compact: "px-3 py-1",
  matrix: "px-2 py-0.5",
};

/**
 * Alignment is the opposite shape from density: it varies per column, so it
 * cannot ride the context above — it is passed on each cell of the column.
 *
 * `right` carries tabular figures with it rather than exposing them as a
 * second prop. A numeric column aligned right but still set in proportional
 * digits does not line up row to row, which is the only reason to align it
 * right in the first place; splitting the two would let a consumer land in
 * that half-correct state.
 */
const alignment: Record<TableAlign, string> = {
  left: "text-left",
  right: "text-right tabular-nums",
};

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Row height and cell padding across the whole table. Defaults to the original, unchanged spacing. */
  density?: TableDensity;
  /**
   * Drops the table's own border and rounded corners, for when it already sits
   * inside a container that draws them — a Card, most often. Defaults to
   * `false`, the standalone table that frames itself.
   */
  flush?: boolean;
  /**
   * Pins the first column in place while the rest of the table scrolls
   * sideways, so a wide matrix never loses whose row you are reading.
   * Defaults to `false`, the table that scrolls whole.
   *
   * Requires that no ancestor clips with `overflow: hidden`: that is what
   * cancels `position: sticky`, and it fails silently — the column simply
   * scrolls away. Table's own container uses `overflow-x-auto`, which is
   * compatible; the trap is a wrapper added around it.
   */
  stickyFirstColumn?: boolean;
}

/**
 * Sticky lives on the cells themselves rather than on a `<colgroup>` or a
 * mirrored table, because it is the only technique that keeps a single
 * `<table>` — and with it the native semantics assistive technology reads.
 *
 * The rules hang off the scroll container instead of the `<table>` so the
 * shadow can key off its `data-scrolled` state in the same place.
 */
const stickyColumn = [
  // `:not([data-detail])` leaves the detail row out: its single cell spans the
  // whole width, so pinning it left with a seam beside it would draw a frozen
  // column where there is none.
  "[&_tr:not([data-detail])>*:first-child]:sticky",
  "[&_tr:not([data-detail])>*:first-child]:left-0 [&_tr:not([data-detail])>*:first-child]:z-10",
  // A sticky cell with no background of its own lets the scrolling content
  // pass through it. Each section takes the background it already has, so the
  // frozen column never introduces a color the table did not have before.
  "[&_thead_tr>*:first-child]:bg-neutral-subtlest",
  "[&_tfoot_tr>*:first-child]:bg-neutral-subtlest",
  "[&_tbody_tr:not([data-detail])>*:first-child]:bg-neutral-default",
  // The row's own hover no longer reaches the first cell now that the cell
  // paints over it, so it is restated here.
  "[&_tbody_tr:not([data-detail]):hover>*:first-child]:bg-neutral-subtlest",
  // Only once something is hidden to the left: drawn always, the line stops
  // meaning "here is where the frozen part begins" and becomes one more rule
  // in the grid.
  "[&[data-scrolled=true]_tr:not([data-detail])>*:first-child]:shadow-edge",
].join(" ");

export function Table({
  density = "comfortable",
  flush = false,
  stickyFirstColumn = false,
  className,
  ...props
}: TableProps) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scroller.current;
    if (!node || !stickyFirstColumn) return;
    // The state goes straight to the DOM instead of through `useState`: a
    // single gesture fires dozens of scroll events, and re-rendering every row
    // of a matrix on each one is exactly what this table cannot afford.
    const sync = () => {
      node.dataset.scrolled = node.scrollLeft > 0 ? "true" : "false";
    };
    sync();
    node.addEventListener("scroll", sync, { passive: true });
    return () => node.removeEventListener("scroll", sync);
  }, [stickyFirstColumn]);

  return (
    <div
      ref={scroller}
      className={cn(
        "w-full overflow-x-auto bg-neutral-default",
        !flush && "rounded-surface border-default border-neutral-default",
        stickyFirstColumn && stickyColumn,
      )}
    >
      <DensityContext.Provider value={density}>
        <table className={cn("w-full border-collapse text-body-sm", className)} {...props} />
      </DensityContext.Provider>
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  // Almost-white — the same page-canvas step Table's own body sits one level
  // above (bg-neutral-default), not a solid gray chrome band.
  return <thead className={cn("bg-neutral-subtlest", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    // The last body row drops its rule so it does not double up against the
    // surrounding border — the container's own, or TableFooter's border-t.
    // Scoped to tbody on purpose: the header row is also the last (and only)
    // tr in thead, and its rule is what separates the head from the body.
    <tbody className={cn("[&>tr:last-child]:border-b-0", className)} {...props} />
  );
}

export function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  // Shares TableHeader's almost-white background, not a tone of its own.
  return (
    <tfoot
      className={cn("border-t-default border-neutral-default bg-neutral-subtlest", className)}
      {...props}
    />
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /**
   * Content shown below the row when it is open. Passing it is what makes the
   * row expandable; a row without it renders exactly as it did before.
   */
  detail?: ReactNode;
  /**
   * Whether the detail is open. The row is always controlled: who is open is
   * screen state — a screen may need to open the row its URL points at — and
   * a row that kept its own would fight that.
   */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Accessible name of the toggle. Say which row it opens ("Ver detalle de
   * Paula Restrepo"): the control has no text of its own, and "expand" repeated
   * down a column tells a screen-reader user nothing about where they are.
   */
  detailLabel?: string;
}

export function TableRow({
  className,
  children,
  detail,
  expanded = false,
  onExpandedChange,
  detailLabel,
  ...props
}: TableRowProps) {
  const detailId = useId();
  const rowClassName = cn(
    "border-b-default border-neutral-default hover:bg-neutral-subtlest",
    className,
  );

  if (detail === undefined) {
    return (
      <tr className={rowClassName} {...props}>
        {children}
      </tr>
    );
  }

  const cells = Children.toArray(children);

  // Counted from the row itself rather than asked of the consumer: a colSpan
  // passed by hand goes stale the moment a column is added, and nothing warns.
  const columnCount = cells.reduce<number>((total, cell) => {
    if (!isValidElement<{ colSpan?: number }>(cell)) return total + 1;
    return total + (cell.props.colSpan ?? 1);
  }, 0);

  const control = (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={detailId}
      aria-label={detailLabel}
      onClick={() => onExpandedChange?.(!expanded)}
      className={cn(
        "-ml-1 shrink-0 rounded-control p-1 text-neutral-subtle",
        "hover:text-neutral-default",
        "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
      )}
    >
      <Icon
        name="chevron-down"
        size={16}
        className={cn("transition-transform", expanded && "rotate-180")}
      />
    </button>
  );

  // The control goes inside the first cell instead of in a column of its own:
  // an extra leading column would take the place the identity column holds —
  // the one `stickyFirstColumn` pins — and would force every consumer to add a
  // matching empty header cell.
  const [first, ...rest] = cells;
  const firstWithControl = isValidElement<{ children?: ReactNode }>(first)
    ? cloneElement(
        first,
        undefined,
        <span className="flex items-center gap-2">
          {control}
          {first.props.children}
        </span>,
      )
    : first;

  return (
    <>
      <tr className={rowClassName} {...props}>
        {firstWithControl}
        {rest}
      </tr>
      {/*
        The detail row is always in the DOM so `aria-controls` never points at
        an element that is not there; `hidden` is what takes it out of the
        accessibility tree, and its content is only built when open so a closed
        matrix does not pay for detail nobody is reading.
      */}
      <tr id={detailId} data-detail hidden={!expanded} className="border-b-default border-neutral-default">
        {/*
          Comfortable padding regardless of the table's density: the detail is
          something to read, not a cell in the grid, and squeezing it to match a
          matrix would make the one surface with prose on it the hardest to read.
        */}
        <td colSpan={columnCount} className="bg-neutral-subtlest px-4 py-3 text-neutral-default">
          {expanded ? detail : null}
        </td>
      </tr>
    </>
  );
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Which edge this column lines up against. `right` also sets tabular figures. Defaults to "left". */
  align?: TableAlign;
  /** Current sort direction of this column, when it participates in sorting. */
  sortDirection?: "asc" | "desc";
  /**
   * Makes the header an accessible sort trigger and calls this when activated.
   * Sorting the underlying data stays the caller's responsibility — TableHead
   * only renders the affordance and announces the current direction.
   */
  onSort?: () => void;
}

export function TableHead({
  className,
  align = "left",
  sortDirection,
  onSort,
  children,
  ...props
}: TableHeadProps) {
  const density = useContext(DensityContext);
  // The label token is 12px/semibold/letter-spaced; uppercase and font-bold
  // are re-declared here on top of it rather than folded into the token —
  // uppercase because the CSS reset sets text-transform:none on button, and
  // bold because text-label's own weight is semibold, one step lighter than
  // what a header on a solid muted background needs to read clearly.
  // text-neutral-default (not -subtle) is what clears 4.5:1 against
  // bg-neutral-subtlest — verified in verify-tokens.ts, not assumed by eye.
  const headClasses = cn(
    headerCellPadding[density],
    alignment[align],
    "text-label uppercase font-bold text-neutral-subtle",
    className,
  );

  if (!onSort) {
    return (
      <th className={headClasses} {...props}>
        {children}
      </th>
    );
  }

  return (
    <th
      aria-sort={
        sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : "none"
      }
      className={headClasses}
      {...props}
    >
      {/* The button is inline-level, so the th's own text-align is what pushes
          it to the correct edge; it carries the alignment too for its label.
          `uppercase` and `font-bold` have to be repeated here even though the
          CSS reset inherits font-weight onto button: the reset also resets
          `text-transform: none`, and the color utility below overrides the
          inherited color regardless, so neither rides the th's classes for
          free — same reason headClasses re-declares them on the th itself. */}
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "inline-flex items-center gap-1 uppercase font-bold text-neutral-default hover:text-brand-default focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
          alignment[align],
        )}
      >
        {children}
        {sortDirection === "asc" ? (
          <Icon name="chevron-down" size={16} className="rotate-180 text-brand-default" />
        ) : sortDirection === "desc" ? (
          <Icon name="chevron-down" size={16} className="text-brand-default" />
        ) : (
          <Icon name="sort" size={16} />
        )}
      </button>
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Which edge this column lines up against. `right` also sets tabular figures. Defaults to "left". */
  align?: TableAlign;
}

export function TableCell({ className, align = "left", ...props }: TableCellProps) {
  const density = useContext(DensityContext);
  return (
    <td
      className={cn(cellPadding[density], alignment[align], "text-neutral-default", className)}
      {...props}
    />
  );
}
