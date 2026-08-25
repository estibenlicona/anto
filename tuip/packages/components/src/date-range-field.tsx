import { FocusEvent, forwardRef, useId, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker, type DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { calendarClassNames, calendarComponents, calendarPanelClassName, parseIsoDate, toIsoDate } from "./date-calendar";

const RANGE_READ_FORMATTER = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });

function formatRange(start: Date, end: Date): string {
  return `${RANGE_READ_FORMATTER.format(start)} – ${RANGE_READ_FORMATTER.format(end)}`;
}

export interface DateRangeFieldProps {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** Start of the selected range, as an ISO string (`YYYY-MM-DD`). Pass together with `onRangeChange` for a controlled field. */
  startValue?: string;
  /** End of the selected range, as an ISO string (`YYYY-MM-DD`). Pass together with `onRangeChange` for a controlled field. */
  endValue?: string;
  /** Initial start value for an uncontrolled field, as an ISO string. */
  defaultStartValue?: string;
  /** Initial end value for an uncontrolled field, as an ISO string. */
  defaultEndValue?: string;
  /** Called with the new ISO start and end values on every keystroke and on every calendar selection. */
  onRangeChange?: (startValue: string, endValue: string) => void;
  /** Earliest selectable date. Earlier days stay visible in the calendar, disabled instead of hidden. */
  minDate?: Date;
  /** Latest selectable date. Later days stay visible in the calendar, disabled instead of hidden. */
  maxDate?: Date;
  /** Disables the field and excludes it from tab order. */
  disabled?: boolean;
  /** Name submitted with the enclosing form for the start date. */
  startName?: string;
  /** Name submitted with the enclosing form for the end date. */
  endName?: string;
  /** Additional classes merged onto the field. */
  className?: string;
  /** Id applied to the field's container and referenced by `label`'s `htmlFor`. Generated when omitted. */
  id?: string;
}

export const DateRangeField = forwardRef<HTMLDivElement, DateRangeFieldProps>(
  (
    {
      label,
      error,
      startValue,
      endValue,
      defaultStartValue,
      defaultEndValue,
      onRangeChange,
      minDate,
      maxDate,
      disabled,
      startName,
      endName,
      className,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = error ? `${fieldId}-error` : undefined;

    const [open, setOpen] = useState(false);
    // Uncontrolled fallback so the field works without startValue/endValue.
    const [internalStart, setInternalStart] = useState(defaultStartValue ?? "");
    const [internalEnd, setInternalEnd] = useState(defaultEndValue ?? "");
    const currentStart = startValue ?? internalStart;
    const currentEnd = endValue ?? internalEnd;

    const startDate = parseIsoDate(currentStart);
    const endDate = parseIsoDate(currentEnd);

    // Reading mode starts collapsed only when there is already a full range
    // to abbreviate; an empty or partial field has nothing to read, so it
    // opens straight into the editable ISO inputs.
    const [editing, setEditing] = useState(() => !(startDate && endDate));

    function commit(nextStart: string, nextEnd: string) {
      setInternalStart(nextStart);
      setInternalEnd(nextEnd);
      onRangeChange?.(nextStart, nextEnd);
    }

    function handleBlur(event: FocusEvent<HTMLDivElement>) {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      // The calendar renders in a portal, outside this container, so leave
      // reading collapse to the popover's own onOpenChange while it is open.
      if (open) return;
      if (parseIsoDate(currentStart) && parseIsoDate(currentEnd)) setEditing(false);
    }

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={fieldId} className="text-body-sm font-medium text-neutral-default">
            {label}
          </label>
        )}
        <div
          ref={ref}
          id={fieldId}
          onBlur={handleBlur}
          className={cn(
            "flex items-center rounded-control border-default bg-neutral-default pr-1.5 text-neutral-default",
            "focus-within:ring-focus",
            disabled && "bg-neutral-disabled text-neutral-disabled",
            // Excluyentes, no acumulativas: `cn` sólo concatena, así que dos clases
            // que fijan el mismo color conviven y gana la que la hoja emita después.
            !error && "border-neutral-default focus-within:ring-neutral-focus-ring",
            error && "border-danger-default focus-within:ring-danger-focus-ring",
            className,
          )}
        >
          {editing ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5 px-3 py-2">
              <input
                name={startName}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                disabled={disabled}
                value={currentStart}
                onChange={(event) => commit(event.target.value, currentEnd)}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                aria-label="Inicio del rango"
                className="min-w-0 flex-1 bg-transparent text-body-sm text-inherit outline-none placeholder:text-neutral-subtle disabled:cursor-not-allowed"
              />
              <span className="text-neutral-subtle" aria-hidden="true">
                →
              </span>
              <input
                name={endName}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                disabled={disabled}
                value={currentEnd}
                onChange={(event) => commit(currentStart, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                aria-label="Fin del rango"
                className="min-w-0 flex-1 bg-transparent text-body-sm text-inherit outline-none placeholder:text-neutral-subtle disabled:cursor-not-allowed"
              />
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setEditing(true)}
              className="min-w-0 flex-1 truncate px-3 py-2 text-left text-body-sm text-inherit disabled:cursor-not-allowed"
            >
              {startDate && endDate ? formatRange(startDate, endDate) : ""}
            </button>
          )}
          <Popover.Root
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next && parseIsoDate(currentStart) && parseIsoDate(currentEnd)) setEditing(false);
            }}
          >
            <Popover.Trigger asChild disabled={disabled}>
              <button
                type="button"
                aria-label="Abrir calendario"
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-neutral-subtle",
                  "hover:bg-neutral-selected hover:text-neutral-default",
                  "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring",
                  "disabled:cursor-not-allowed disabled:text-neutral-disabled",
                )}
              >
                <Icon name="calendar" size={16} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="start" sideOffset={4} className={calendarPanelClassName}>
                <DateRangeFieldCalendar
                  selected={{ from: startDate, to: endDate }}
                  minDate={minDate}
                  maxDate={maxDate}
                  onSelect={(range) => {
                    const nextStart = range?.from ? toIsoDate(range.from) : "";
                    const nextEnd = range?.to ? toIsoDate(range.to) : "";
                    commit(nextStart, nextEnd);
                    if (range?.from && range?.to) setOpen(false);
                  }}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        {error && (
          <p id={errorId} className="text-body-sm text-danger-default">
            {error}
          </p>
        )}
      </div>
    );
  },
);

DateRangeField.displayName = "DateRangeField";

export interface DateRangeFieldCalendarProps {
  /** Currently selected range. Either end may be `undefined`. */
  selected: DateRange;
  /** Called with the (possibly partial) range on every selection step. */
  onSelect: (range: DateRange | undefined) => void;
  /** Earliest selectable date. Earlier days stay visible, disabled instead of hidden. */
  minDate?: Date;
  /** Latest selectable date. Later days stay visible, disabled instead of hidden. */
  maxDate?: Date;
}

export function DateRangeFieldCalendar({ selected, onSelect, minDate, maxDate }: DateRangeFieldCalendarProps) {
  return (
    <DayPicker
      mode="range"
      locale={es}
      selected={selected}
      defaultMonth={selected.from ?? minDate}
      fromDate={minDate}
      toDate={maxDate}
      onSelect={onSelect}
      classNames={calendarClassNames}
      components={calendarComponents}
    />
  );
}

DateRangeFieldCalendar.displayName = "DateRangeFieldCalendar";
