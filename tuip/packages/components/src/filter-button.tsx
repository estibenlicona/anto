import { cn } from "@/lib/cn";
import { Checkbox } from "./checkbox";
import { Icon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterButtonProps {
  /** Trigger label, e.g. "Seniority". */
  label: string;
  /** Options shown in the checklist. */
  options: FilterOption[];
  /** Currently checked option values. Controlled — FilterButton holds no selection state of its own. */
  selected: string[];
  /** Called with the full new set of checked values whenever one is toggled. */
  onChange: (selected: string[]) => void;
  /** Additional classes merged onto the trigger button. */
  className?: string;
}

/**
 * A `Popover` trigger styled as a button, with a `Checkbox` per option inside
 * — the same two primitives a filter form already needed, composed instead of
 * a new primitive. Selection is controlled: FilterButton notifies the
 * consumer and never filters anything by itself, same contract as `Select` or
 * `Combobox`.
 */
export function FilterButton({ label, options, selected, onChange, className }: FilterButtonProps) {
  const isActive = selected.length > 0;

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <button
          type="button"
          className={cn(
            "inline-flex h-md items-center gap-1.5 rounded-control border-default px-3 text-body-sm font-medium",
            "focus-visible:outline-none focus-visible:ring-focus",
            isActive
              ? "border-brand-default bg-brand-subtle text-brand-default focus-visible:ring-brand-focus-ring"
              : "border-neutral-default bg-neutral-default text-neutral-default hover:bg-neutral-subtle-hover focus-visible:ring-neutral-focus-ring",
            className,
          )}
        >
          <Icon name="filter" size={16} />
          {label}
          {isActive && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-pill bg-brand-bold px-1 text-label text-neutral-inverse">
              {selected.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}
