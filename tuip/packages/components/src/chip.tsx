import { ReactNode } from "react";
import { Icon } from "./icon";
import { cn } from "@/lib/cn";

interface ChipBaseProps {
  /** Chip label. */
  children: ReactNode;
  className?: string;
}

export interface RemovableChipProps extends ChipBaseProps {
  selectable?: false;
  /** Called when the user activates the remove control. Chip does not remove itself. */
  onRemove: () => void;
  /** Accessible label for the remove control. Defaults to "Quitar <label>" when the label is plain text. */
  removeLabel?: string;
  selected?: never;
  onSelectedChange?: never;
  count?: never;
}

export interface SelectableChipProps extends ChipBaseProps {
  /** Turns the chip into a filter toggle: the whole chip is the control. */
  selectable: true;
  /** Whether the filter is on. Pass together with `onSelectedChange`: the chip never flips itself. */
  selected: boolean;
  /** Called with the next state when the user activates the chip. */
  onSelectedChange: (selected: boolean) => void;
  /** How many things the filter matches, shown after the label and read as part of its name. */
  count?: number;
  onRemove?: never;
  removeLabel?: never;
}

export type ChipProps = RemovableChipProps | SelectableChipProps;

const baseClasses =
  "inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-body-sm text-neutral-default";

/**
 * Two chips that look alike and behave differently, told apart by the props:
 * a removable chip (an applied filter with its ×) or a selectable one (a
 * filter the reader switches on and off in place, with an optional count).
 * The selected state is neutral, never brand: a filter that is on is not the
 * primary action of the screen.
 */
export function Chip(props: ChipProps) {
  if (props.selectable) {
    const { children, selected, onSelectedChange, count, className } = props;
    const label = typeof children === "string" ? children : undefined;
    return (
      <button
        type="button"
        aria-pressed={selected}
        aria-label={label !== undefined && count !== undefined ? `${label}, ${count}` : undefined}
        onClick={() => onSelectedChange(!selected)}
        className={cn(
          baseClasses,
          "border-default focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring",
          selected
            ? "border-neutral-bold bg-neutral-bold text-neutral-inverse"
            : "border-neutral-default bg-neutral-default hover:bg-neutral-subtle-hover",
          className,
        )}
      >
        {children}
        {count !== undefined && (
          <span
            aria-hidden="true"
            className={cn(
              "tabular-nums",
              selected ? "text-neutral-inverse" : "text-neutral-subtle",
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }

  const { children, onRemove, removeLabel, className } = props;
  return (
    <span className={cn(baseClasses, "bg-neutral-selected", className)}>
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={
          removeLabel ?? (typeof children === "string" ? `Quitar ${children}` : "Quitar filtro")
        }
        className={cn(
          "inline-flex items-center justify-center rounded-control text-neutral-subtle hover:text-neutral-default",
          "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        )}
      >
        <Icon name="close" size={16} />
      </button>
    </span>
  );
}
