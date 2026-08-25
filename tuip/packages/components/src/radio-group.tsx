import { useId } from "react";
import { cn } from "@/lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Visible legend for the group, associated with it via `<fieldset>`/`<legend>`. */
  label?: string;
  /** Options rendered as radios, in order. */
  options: RadioOption[];
  /** Name shared by every radio in the group. Generated when omitted. */
  name?: string;
  /** Selected option's value. Pass together with `onValueChange` for a controlled group. */
  value?: string;
  /** Initial selected value for an uncontrolled group. */
  defaultValue?: string;
  /** Called with the new value when the user selects an option. */
  onValueChange?: (value: string) => void;
  /** Disables every option in the group. An individual option can also disable itself. */
  disabled?: boolean;
  /** Additional classes merged onto the fieldset. */
  className?: string;
}

/**
 * A `<fieldset>` of native `<input type="radio">` sharing one `name` — the
 * browser groups them, moves focus and selection together with the arrow
 * keys, and enforces mutual exclusion on its own. Nothing here reimplements
 * roving focus; it only styles what the browser already does correctly.
 */
export function RadioGroup({
  label,
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <fieldset className={cn("m-0 flex flex-col gap-2 border-0 p-0", className)}>
      {label && (
        <legend className="p-0 text-body-sm font-medium text-neutral-default">{label}</legend>
      )}
      <div className="flex flex-col gap-1.5">
        {options.map((option) => {
          const optionId = `${groupName}-${option.value}`;
          const isDisabled = disabled || option.disabled;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "inline-flex items-center gap-2 text-body-sm text-neutral-default",
                isDisabled ? "cursor-not-allowed text-neutral-disabled" : "cursor-pointer",
              )}
            >
              <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                <input
                  type="radio"
                  id={optionId}
                  name={groupName}
                  value={option.value}
                  disabled={isDisabled}
                  checked={value !== undefined ? value === option.value : undefined}
                  defaultChecked={value === undefined ? defaultValue === option.value : undefined}
                  onChange={() => onValueChange?.(option.value)}
                  className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-pill border-default border-neutral-bold bg-neutral-default",
                    "peer-checked:border-brand-default",
                    "peer-focus-visible:ring-focus peer-focus-visible:ring-neutral-focus-ring",
                    "peer-disabled:border-neutral-disabled peer-disabled:bg-neutral-disabled",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 flex items-center justify-center text-brand-default opacity-0",
                    "peer-checked:opacity-100 peer-disabled:text-neutral-disabled",
                  )}
                >
                  <span className="h-2 w-2 rounded-pill bg-current" />
                </span>
              </span>
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
