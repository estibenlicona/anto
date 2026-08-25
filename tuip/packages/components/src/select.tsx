import { forwardRef, useId, type ReactNode } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { FieldHint, FieldLabel, useFieldDescription } from "./field";

export type SelectSize = "small" | "medium" | "large";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** Guidance shown below the field while there is no error — formats, where a value comes from. */
  hint?: ReactNode;
  /** Marks the field as required: adds the asterisk next to the label and `aria-required` on the trigger. */
  required?: boolean;
  /** Between 7 and 20 options is what this component is for — fewer, use a radio group; more, use Combobox. */
  options: SelectOption[];
  /** Shown in the trigger while no option is selected. */
  placeholder?: string;
  /** Control height, padding and text size. */
  size?: SelectSize;
  /**
   * Shows a loading row inside the dropdown instead of an empty list. Set
   * while `options` resolves from the backend, so the dropdown never opens
   * onto nothing.
   */
  loading?: boolean;
  /** Disables the trigger and excludes it from tab order. */
  disabled?: boolean;
  /** Name submitted with the enclosing form. */
  name?: string;
  /** Selected option's value. Pass together with `onValueChange` for a controlled field. */
  value?: string;
  /** Initial selected value for an uncontrolled field. */
  defaultValue?: string;
  /** Called with the new value when the user selects an option. */
  onValueChange?: (value: string) => void;
  /** Additional classes merged onto the trigger. */
  className?: string;
  /** Id applied to the trigger and referenced by `label`'s `htmlFor`. Generated when omitted. */
  id?: string;
}

const SIZE_TRIGGER: Record<SelectSize, string> = {
  small: "h-sm px-2.5 text-body-sm",
  medium: "h-md px-3 text-body-sm",
  large: "h-lg px-3.5 text-body",
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      required,
      options,
      placeholder = "Seleccionar…",
      size = "medium",
      loading = false,
      disabled,
      name,
      value,
      defaultValue,
      onValueChange,
      className,
      id,
    },
    ref,
  ) => {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const { errorId, hintId, describedBy } = useFieldDescription(triggerId, error, hint);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <FieldLabel htmlFor={triggerId} required={required}>
            {label}
          </FieldLabel>
        )}
        <RadixSelect.Root
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            id={triggerId}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            placeholder={placeholder}
            size={size}
            error={error}
            className={className}
          />

          <RadixSelect.Portal>
            <RadixSelect.Content
              position="popper"
              sideOffset={4}
              className="z-menu overflow-hidden rounded-control border-default border-neutral-default bg-neutral-default shadow-md"
            >
              <RadixSelect.Viewport className="max-h-64 p-1">
                {loading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-body-sm text-neutral-subtle">
                    <Icon name="sync" size={16} className="animate-spin" />
                    Cargando…
                  </div>
                ) : (
                  options.map((option) => (
                    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
        <FieldHint error={error} hint={hint} errorId={errorId} hintId={hintId} />
      </div>
    );
  },
);

Select.displayName = "Select";

export interface SelectTriggerProps
  extends Pick<SelectProps, "placeholder" | "size" | "error" | "className"> {
  id?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      placeholder = "Seleccionar…",
      size = "medium",
      error,
      className,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-required": ariaRequired,
    },
    ref,
  ) => {
    return (
      <RadixSelect.Trigger
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        aria-required={ariaRequired}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-control border-default bg-neutral-default text-neutral-default",
          SIZE_TRIGGER[size],
          "focus-visible:outline-none focus-visible:ring-focus",
          "disabled:cursor-not-allowed disabled:bg-neutral-disabled disabled:text-neutral-disabled",
          "data-[placeholder]:text-neutral-subtle",
          // Excluyentes, no acumulativas: `cn` sólo concatena, así que dos clases
          // que fijan el mismo color conviven y gana la que la hoja emita después.
          !error && "border-neutral-default focus-visible:ring-neutral-focus-ring",
          error && "border-danger-default focus-visible:ring-danger-focus-ring",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <Icon name="chevron-down" size={16} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
    );
  },
);

SelectTrigger.displayName = "SelectTrigger";

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export function SelectItem({ value, disabled, children }: SelectItemProps) {
  return (
    <RadixSelect.Item
      value={value}
      disabled={disabled}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-control px-3 py-2 text-body-sm text-neutral-default outline-none",
        "data-[highlighted]:bg-neutral-selected data-[highlighted]:text-neutral-default",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-neutral-disabled",
      )}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator>
        <Icon name="check" size={16} />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

SelectItem.displayName = "SelectItem";
