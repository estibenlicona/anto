import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
}

/**
 * `Input` with a leading search icon. Not `Input` composed as a child — the
 * icon has to sit relative to just the input line, and `Input` has no slot
 * for one, so the input line is reimplemented here with the same classes
 * `Input` uses, instead of wrapping `Input` and risking the icon drifting
 * off the input line whenever a label is present.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ label, error, className, disabled, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-body-sm font-medium text-neutral-default">
            {label}
          </label>
        )}
        <div className="relative">
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-subtle"
          />
          <input
            ref={ref}
            type="search"
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              "w-full rounded-control border-default bg-neutral-default py-2 pl-9 pr-3 text-body-sm text-neutral-default",
              "focus-visible:outline-none focus-visible:ring-focus",
              "disabled:cursor-not-allowed disabled:bg-neutral-disabled disabled:text-neutral-disabled",
              !error && "border-neutral-default focus-visible:ring-neutral-focus-ring",
              error && "border-danger-default focus-visible:ring-danger-focus-ring",
              className,
            )}
            {...props}
          />
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

SearchField.displayName = "SearchField";
