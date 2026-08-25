import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import { FieldHint, FieldLabel, fieldStateClasses, useFieldDescription } from "./field";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** Guidance shown below the field while there is no error — units, formats, where a value comes from. */
  hint?: ReactNode;
  /**
   * Marks the field as required: adds the asterisk next to the label and
   * `aria-required`. It deliberately does NOT set the native `required`
   * attribute — that would hand validation to the browser, which blocks
   * submit with its own bubble before a form's `onSubmit` can run its own
   * checks and report them its own way.
   */
  required?: boolean;
  /** Non-interactive content rendered inside the field, before the editable text (e.g. a currency symbol). */
  prefix?: ReactNode;
  /** Non-interactive content rendered inside the field, after the editable text (e.g. a unit). */
  suffix?: ReactNode;
}

/**
 * El adorno se lee como una celda propia del control, no como texto suelto
 * dentro del campo: fondo escalonado y un filete que lo separa del valor
 * editable. Así "COP" o "FTE" se leen como parte del control y no como algo
 * que el usuario escribió.
 */
const adornmentClasses = "shrink-0 self-stretch flex items-center bg-neutral-subtle px-3 text-body-sm text-neutral-subtle";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, required, prefix, suffix, className, disabled, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const { errorId, hintId, describedBy } = useFieldDescription(inputId, error, hint);
    const hasAdornment = prefix !== undefined || suffix !== undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <FieldLabel htmlFor={inputId} required={required}>
            {label}
          </FieldLabel>
        )}
        {hasAdornment ? (
          <div
            className={cn(
              // `overflow-hidden` recorta el fondo del adorno contra el radio
              // del contenedor; sin él la celda desborda las esquinas.
              "flex items-stretch overflow-hidden rounded-control border-default bg-neutral-default focus-within:ring-focus",
              fieldStateClasses(Boolean(error)),
              !error && "focus-within:ring-neutral-focus-ring",
              error && "focus-within:ring-danger-focus-ring",
              disabled && "cursor-not-allowed bg-neutral-disabled",
            )}
          >
            {prefix !== undefined && (
              <span className={cn(adornmentClasses, "border-r-default", fieldStateClasses(Boolean(error)))}>
                {prefix}
              </span>
            )}
            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-required={required || undefined}
              aria-describedby={describedBy}
              className={cn(
                "min-w-0 flex-1 bg-transparent px-3 py-2 text-body-sm text-neutral-default",
                "focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:text-neutral-disabled",
                className,
              )}
              {...props}
            />
            {suffix !== undefined && (
              <span className={cn(adornmentClasses, "border-l-default", fieldStateClasses(Boolean(error)))}>
                {suffix}
              </span>
            )}
          </div>
        ) : (
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            className={cn(
              "rounded-control border-default bg-neutral-default px-3 py-2 text-body-sm text-neutral-default",
              "focus-visible:outline-none focus-visible:ring-focus",
              "disabled:cursor-not-allowed disabled:bg-neutral-disabled disabled:text-neutral-disabled",
              fieldStateClasses(Boolean(error)),
              !error && "focus-visible:ring-neutral-focus-ring",
              error && "focus-visible:ring-danger-focus-ring",
              className,
            )}
            {...props}
          />
        )}
        <FieldHint error={error} hint={hint} errorId={errorId} hintId={hintId} />
      </div>
    );
  },
);

Input.displayName = "Input";
