import type { StyledComponent } from "react-day-picker";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a `YYYY-MM-DD` string into a local `Date`, or `undefined` if it is not a valid ISO date. */
export function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value || !ISO_DATE_PATTERN.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Formats a `Date` as `YYYY-MM-DD`, in local time. */
export function toIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Maps react-day-picker's default class names to the system's tokens, so
 * DateField and DateRangeField render one identical calendar instead of the
 * library's own stylesheet. Days outside `fromDate`/`toDate` land in
 * `day_disabled` automatically and stay visible, just dimmed and inert.
 */
export const calendarClassNames = {
  months: "flex flex-col",
  month: "space-y-3",
  caption: "flex items-center justify-between px-1",
  caption_label: "text-body-sm font-medium text-neutral-default",
  nav: "flex items-center gap-1",
  nav_button: cn(
    "inline-flex h-6 w-6 items-center justify-center rounded-control text-neutral-subtle",
    "hover:bg-neutral-selected hover:text-neutral-default",
    "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
  ),
  table: "w-full border-collapse",
  head_row: "flex",
  head_cell: "w-9 text-body-sm font-medium text-neutral-subtle",
  row: "mt-1 flex w-full",
  cell: "relative flex h-9 w-9 items-center justify-center p-0 text-body-sm",
  day: cn(
    "flex h-9 w-9 items-center justify-center rounded-control text-neutral-default",
    "hover:bg-neutral-selected",
    "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
  ),
  day_today: "font-semibold text-brand-default",
  day_selected: "bg-brand-bold text-brand-on-bold hover:bg-brand-bold",
  day_disabled: "cursor-not-allowed text-neutral-disabled hover:bg-transparent",
  day_outside: "text-neutral-subtle",
  day_range_start: "rounded-r-none bg-brand-bold text-brand-on-bold hover:bg-brand-bold",
  day_range_end: "rounded-l-none bg-brand-bold text-brand-on-bold hover:bg-brand-bold",
  day_range_middle: "rounded-none bg-neutral-selected text-neutral-default hover:bg-neutral-selected",
};

function CalendarIconLeft({ className }: StyledComponent) {
  return <Icon name="chevron-right" size={16} className={cn("rotate-180", className)} />;
}

function CalendarIconRight({ className }: StyledComponent) {
  return <Icon name="chevron-right" size={16} className={className} />;
}

/** Swaps react-day-picker's default arrow glyphs for the system's own icon, in both directions. */
export const calendarComponents = { IconLeft: CalendarIconLeft, IconRight: CalendarIconRight };

/** Classes for the popover surface that hosts the calendar, shared so both fields open an identical panel. */
export const calendarPanelClassName =
  "z-menu rounded-control border-default border-neutral-default bg-neutral-default p-3 shadow-md";
