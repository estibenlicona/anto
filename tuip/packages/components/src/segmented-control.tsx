import { ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Renders in place of the visible label; `label` becomes this option's accessible name instead. */
  icon?: ReactNode;
}

export interface SegmentedControlProps {
  /** Options rendered as contiguous segments, in order. */
  options: SegmentedControlOption[];
  /** Name shared by every option. Generated when omitted. */
  name?: string;
  /** Selected option's value. */
  value: string;
  /** Called with the new value when the user selects a segment. */
  onValueChange: (value: string) => void;
  /** Accessible label for the group, since a visible legend is optional. */
  label?: string;
  /**
   * Visual shape only — both variants stay one `<fieldset>` sharing one `name`,
   * so grouping and keyboard behavior are identical.
   * - `joined` (default): one continuous pill, segments divided by inner borders.
   * - `separated`: each segment its own rounded box, with a gap between them.
   */
  variant?: "joined" | "separated";
  /** Additional classes merged onto the fieldset. */
  className?: string;
}

/**
 * A `<fieldset>` of native `<input type="radio">` sharing one `name`, styled
 * as contiguous segments instead of circles — same browser-native roving
 * focus and mutual exclusion RadioGroup already relies on, no keyboard
 * handling written by hand.
 */
export function SegmentedControl({
  options,
  name,
  value,
  onValueChange,
  label,
  variant = "joined",
  className,
}: SegmentedControlProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const separated = variant === "separated";

  return (
    <fieldset className={cn("m-0 inline-flex border-0 p-0", className)}>
      {label && <legend className="sr-only">{label}</legend>}
      <div
        className={cn(
          "inline-flex",
          // `joined` draws one box around the whole group and lets each segment
          // divide it from the inside; `separated` moves the box down to the
          // segment, so the container only has to space them out.
          separated
            ? "gap-1.5"
            : "overflow-hidden rounded-control border-default border-neutral-default",
        )}
      >
        {options.map((option, index) => {
          const optionId = `${groupName}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "relative flex cursor-pointer items-center justify-center px-3 py-1.5 text-body-sm font-medium text-neutral-default",
                "has-[:checked]:bg-neutral-bold has-[:checked]:text-neutral-inverse",
                "has-[:focus-visible]:ring-focus has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-neutral-focus-ring",
                "has-[:disabled]:cursor-not-allowed has-[:disabled]:text-neutral-disabled",
                separated && "rounded-control border-default border-neutral-default",
                !separated && index > 0 && "border-l-default border-neutral-default",
              )}
            >
              <input
                type="radio"
                id={optionId}
                name={groupName}
                value={option.value}
                disabled={option.disabled}
                checked={value === option.value}
                onChange={() => onValueChange(option.value)}
                aria-label={option.icon ? option.label : undefined}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              {option.icon ?? option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
