import { forwardRef, useMemo, useState, type ButtonHTMLAttributes } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type ComboboxSize = "small" | "medium" | "large";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxSingleProps {
  /** Turns on multi-selection with removable chips. Defaults to single selection. */
  multiple?: false;
  /** Selected value. Pass together with `onValueChange` for a controlled field. */
  value?: string;
  /** Initial selected value for an uncontrolled field. */
  defaultValue?: string;
  /** Called with the new value when the user selects an option. */
  onValueChange?: (value: string) => void;
}

interface ComboboxMultipleProps {
  /** Turns on multi-selection with removable chips. */
  multiple: true;
  /** Selected values. Pass together with `onValueChange` for a controlled field. */
  value?: string[];
  /** Initial selected values for an uncontrolled field. */
  defaultValue?: string[];
  /** Called with the new set of values when the user selects or removes an option. */
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = (ComboboxSingleProps | ComboboxMultipleProps) & {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** More than 20 options is what this component is for — fewer, use Select. */
  options: ComboboxOption[];
  /** Shown in the trigger while nothing is selected. */
  placeholder?: string;
  /** Control height, padding and text size. */
  size?: ComboboxSize;
  /**
   * Shows a loading row inside the list instead of an empty list. Set while
   * `options` resolves from the backend, so the list never opens onto nothing.
   */
  loading?: boolean;
  /** Disables the trigger and excludes it from tab order. */
  disabled?: boolean;
  /** Additional classes merged onto the trigger. */
  className?: string;
  /** Id applied to the trigger and referenced by `label`'s `htmlFor`. Generated when omitted. */
  id?: string;
};

const SIZE_TRIGGER: Record<ComboboxSize, string> = {
  small: "min-h-sm px-2.5 text-body-sm",
  medium: "min-h-md px-3 text-body-sm",
  large: "min-h-lg px-3.5 text-body",
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function Combobox(props: ComboboxProps) {
  const {
    label,
    error,
    options,
    placeholder = "Buscar…",
    size = "medium",
    loading = false,
    disabled,
    className,
    id,
  } = props;

  const generatedId = `combobox-${label ?? "field"}`;
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Uncontrolled fallback so the component works without a value/onValueChange
  // pair, the same way a plain <select> does.
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    toArray(props.multiple ? props.defaultValue : props.defaultValue),
  );
  const selected = toArray(props.multiple ? props.value : props.value) ?? internalValue;
  const values = props.value !== undefined ? toArray(props.value) : internalValue;

  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );

  function commit(next: string[]) {
    setInternalValue(next);
    if (props.multiple) {
      props.onValueChange?.(next);
    } else {
      props.onValueChange?.(next[0] ?? "");
    }
  }

  function selectOption(optionValue: string) {
    if (props.multiple) {
      const next = values.includes(optionValue)
        ? values.filter((value) => value !== optionValue)
        : [...values, optionValue];
      commit(next);
      setSearch("");
    } else {
      commit([optionValue]);
      setSearch("");
      setOpen(false);
    }
  }

  function removeChip(optionValue: string) {
    commit(values.filter((value) => value !== optionValue));
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={fieldId} className="text-body-sm font-medium text-neutral-default">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <ComboboxTrigger
            id={fieldId}
            disabled={disabled}
            error={error}
            aria-describedby={errorId}
            size={size}
            className={className}
            multiple={props.multiple}
            selectedOptions={selectedOptions}
            placeholder={placeholder}
            onRemove={removeChip}
          />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className={cn(
              "z-menu w-[--radix-popover-trigger-width] overflow-hidden rounded-control border-default border-neutral-default bg-neutral-default shadow-md",
              // Crece desde el campo (la receta `float`); va sobre Popover,
              // así que el origen es el de Popover.
              "[transform-origin:var(--radix-popover-content-transform-origin)]",
              "data-[state=open]:animate-float-in data-[state=closed]:animate-float-out",
            )}
          >
            <Command shouldFilter={!loading} className="flex flex-col">
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Escribe para filtrar…"
                onKeyDown={(event) => {
                  // Backspace on an empty search removes the last chip, so
                  // undoing a multi-select pick never requires reopening the
                  // list to find and toggle it off.
                  if (props.multiple && event.key === "Backspace" && search === "" && values.length > 0) {
                    removeChip(values[values.length - 1]);
                  }
                }}
                className="border-b-default border-neutral-default px-3 py-2 text-body-sm text-neutral-default outline-none placeholder:text-neutral-subtle"
              />
              <CommandList className="max-h-64 overflow-y-auto p-1">
                {loading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-body-sm text-neutral-subtle">
                    <Icon name="sync" size={16} className="animate-spin" />
                    Cargando…
                  </div>
                ) : (
                  <>
                    <CommandEmpty className="px-3 py-2 text-body-sm text-neutral-subtle">
                      Sin resultados para “{search}”.
                    </CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <ComboboxItem
                          key={option.value}
                          label={option.label}
                          disabled={option.disabled}
                          selected={values.includes(option.value)}
                          onSelect={() => selectOption(option.value)}
                        />
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <p id={errorId} className="text-body-sm text-danger-default">
          {error}
        </p>
      )}
    </div>
  );
}

Combobox.displayName = "Combobox";

export interface ComboboxTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  error?: string;
  size?: ComboboxSize;
  multiple?: boolean;
  selectedOptions: ComboboxOption[];
  placeholder: string;
  onRemove: (value: string) => void;
}

export const ComboboxTrigger = forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  (
    {
      error,
      "aria-describedby": ariaDescribedBy,
      size = "medium",
      className,
      multiple,
      selectedOptions,
      placeholder,
      onRemove,
      type: _type,
      ...rest
    },
    ref,
  ) => {
    const showPlaceholder = selectedOptions.length === 0;

    return (
      <button
        ref={ref}
        type="button"
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        className={cn(
          "flex w-full flex-wrap items-center gap-1.5 rounded-control border-default bg-neutral-default text-left text-neutral-default",
          SIZE_TRIGGER[size],
          "focus-visible:outline-none focus-visible:ring-focus",
          "disabled:cursor-not-allowed disabled:bg-neutral-disabled disabled:text-neutral-disabled",
          // Excluyentes, no acumulativas: `cn` sólo concatena, así que dos clases
          // que fijan el mismo color conviven y gana la que la hoja emita después.
          !error && "border-neutral-default focus-visible:ring-neutral-focus-ring",
          error && "border-danger-default focus-visible:ring-danger-focus-ring",
          className,
        )}
        {...rest}
      >
        {multiple && selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 rounded-control bg-neutral-selected px-1.5 py-0.5 text-body-sm text-neutral-default"
            >
              {option.label}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Quitar ${option.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(option.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemove(option.value);
                  }
                }}
                className="cursor-pointer text-neutral-subtle hover:text-neutral-default"
              >
                <Icon name="close" size={16} />
              </span>
            </span>
          ))
        ) : (
          <span className={cn("truncate", showPlaceholder && "text-neutral-subtle")}>
            {showPlaceholder ? placeholder : selectedOptions[0]?.label}
          </span>
        )}
        <Icon name="chevron-down" size={16} className="ml-auto shrink-0 text-neutral-subtle" />
      </button>
    );
  },
);

ComboboxTrigger.displayName = "ComboboxTrigger";

export interface ComboboxItemProps {
  label: string;
  disabled?: boolean;
  selected?: boolean;
  onSelect: () => void;
}

export function ComboboxItem({ label, disabled, selected, onSelect }: ComboboxItemProps) {
  return (
    <CommandItem
      value={label}
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-control px-3 py-2 text-body-sm text-neutral-default",
        "data-[selected=true]:bg-neutral-selected",
        "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-neutral-disabled",
      )}
    >
      {label}
      {selected && <Icon name="check" size={16} />}
    </CommandItem>
  );
}

ComboboxItem.displayName = "ComboboxItem";
