import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Progress } from "./progress";
import type { AccentTone } from "@/lib/accent-tone";

export interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  /** Percentage shown both as the bar's fill and as the figure beside it. Above 100 the bar saturates to danger; the figure stays honest. */
  value: number;
  /** Early-warning threshold passed straight to Progress — the bar and the figure describe the same number. */
  warningFrom?: number;
  /** A quantity in accent, no state: forwarded to Progress, which then ignores `warningFrom`. */
  tone?: AccentTone;
  /** Accessible label for the bar. */
  label?: string;
  /** Floor for the whole row, so the bar never collapses inside a tight cell. Defaults to 7rem. */
  minWidth?: string;
}

/**
 * A Progress with its value written next to it: a percentage a reader should
 * both see at a glance (the bar) and read exactly (the figure). The row kind
 * of bar — dedication of a person in a squad, utilization in a people list.
 */
export function Meter({
  value,
  warningFrom,
  tone,
  label,
  minWidth = "7rem",
  className,
  style,
  ...props
}: MeterProps) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      style={{ minWidth, ...style }}
      {...props}
    >
      <Progress
        className="flex-1"
        value={value}
        warningFrom={warningFrom}
        tone={tone}
        label={label}
      />
      <span className="text-body-sm font-semibold tabular-nums text-neutral-default">{value}%</span>
    </div>
  );
}
