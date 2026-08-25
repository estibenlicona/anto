import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * A single pulsing block with no fixed shape. Size and rounding come entirely
 * from `className` (e.g. `h-9 w-9 rounded-pill` for an avatar, `h-2.5 w-1/2`
 * for a text line) — the definition calls for a skeleton that imitates the
 * real content it stands in for, not a generic rectangle, so no size or
 * shape prop would fit every case.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-control bg-neutral-subtle", className)}
      {...props}
    />
  );
}
