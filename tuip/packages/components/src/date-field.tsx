import { forwardRef, useId, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { calendarClassNames, calendarComponents, calendarPanelClassName, parseIsoDate, toIsoDate } from "./date-calendar";

export interface DateFieldProps {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** Selected date as an ISO string (`YYYY-MM-DD`). Pass together with `onValueChange` for a controlled field. */
  value?: string;
  /** Initial value for an uncontrolled field, as an ISO string. */
  defaultValue?: string;
  /** Called with the new ISO value on every keystroke and on every calendar selection, so typing never waits for the calendar. */
  onValueChange?: (value: string) => void;
  /** Earliest selectable date. Earlier days stay visible in the calendar, disabled instead of hidden. */
  minDate?: Date;
  /** Latest selectable date. Later days stay visible in the calendar, disabled instead of hidden. */
  maxDate?: Date;
  /** Shown in the field while it is empty. */
  placeholder?: string;
  /** Disables the field and excludes it from tab order. */
  disabled?: boolean;
  /** Name submitted with the enclosing form. */
  name?: string;
  /** Additional classes merged onto the field. */
  className?: string;
  /** Id applied to the field and referenced by `label`'s `htmlFor`. Generated when omitted. */
  id?: string;
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      label,
      error,
      value,
      defaultValue,
      onValueChange,
      minDate,
      maxDate,
      placeholder = "YYYY-MM-DD",
      disabled,
      name,
      className,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = error ? `${fieldId}-error` : undefined;

    const [open, setOpen] = useState(false);
    // Uncontrolled fallback so the field works without a value/onValueChange
    // pair, the same way Input does.
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const currentValue = value ?? internalValue;

    function commit(next: string) {
      setInternalValue(next);
      onValueChange?.(next);
    }

    const selectedDate = parseIsoDate(currentValue);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={fieldId} className="text-body-sm font-medium text-neutral-default">
            {label}
          </label>
        )}
        <div
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
          <input
            ref={ref}
            id={fieldId}
            name={name}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={placeholder}
            disabled={disabled}
            value={currentValue}
            onChange={(event) => commit(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              "min-w-0 flex-1 bg-transparent px-3 py-2 text-body-sm text-inherit outline-none",
              "placeholder:text-neutral-subtle disabled:cursor-not-allowed",
            )}
          />
          <Popover.Root open={open} onOpenChange={setOpen}>
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
                <DateFieldCalendar
                  selected={selectedDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  onSelect={(date) => {
                    commit(toIsoDate(date));
                    setOpen(false);
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

DateField.displayName = "DateField";

export interface DateFieldCalendarProps {
  /** Currently selected date, or `undefined` when nothing is selected yet. */
  selected?: Date;
  /** Called with the picked date when the user selects a day. */
  onSelect: (date: Date) => void;
  /** Earliest selectable date. Earlier days stay visible, disabled instead of hidden. */
  minDate?: Date;
  /** Latest selectable date. Later days stay visible, disabled instead of hidden. */
  maxDate?: Date;
}

export function DateFieldCalendar({ selected, onSelect, minDate, maxDate }: DateFieldCalendarProps) {
  return (
    <DayPicker
      mode="single"
      locale={es}
      selected={selected}
      defaultMonth={selected ?? minDate}
      fromDate={minDate}
      toDate={maxDate}
      onSelect={(date) => {
        if (!date) return;
        onSelect(date);
      }}
      classNames={calendarClassNames}
      components={calendarComponents}
    />
  );
}

DateFieldCalendar.displayName = "DateFieldCalendar";
