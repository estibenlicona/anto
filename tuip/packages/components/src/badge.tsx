import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "success" | "info" | "warning" | "danger" | "neutral" | "discovery";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status tone conveyed by the badge's colors and dot. Never `brand` — that role is reserved for the primary action of a view. */
  variant?: BadgeVariant;
  /**
   * Whether the badge draws its status dot. On by default.
   *
   * The dot marks that what the badge says is a **condition** — something that
   * is happening and can stop happening: "En curso", "Cerrada". Turn it off
   * when the badge carries a fixed classification instead, like a level of a
   * scale: there the dot adds nothing and competes with the label that already
   * says it. Turning it off changes nothing else — same shape, same variant,
   * same padding.
   *
   * Either way the text has to say it on its own: the dot is never the only
   * channel.
   */
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-subtle text-success-default",
  info: "bg-info-subtle text-info-default",
  warning: "bg-warning-subtle text-warning-default",
  danger: "bg-danger-subtle text-danger-default",
  discovery: "bg-discovery-subtle text-discovery-default",
  neutral: "bg-neutral-subtle text-neutral-default",
};

// The five status roles expose their mid step only as a background utility
// (bg-{role}-bold), so the dot uses it directly. `neutral` has no such step —
// its background.bold is near-black, meant for dark surfaces, not a dot — so
// it borrows the matching mid-gray from text-neutral-subtle via `bg-current`.
const dotClasses: Record<BadgeVariant, string> = {
  success: "bg-success-bold",
  info: "bg-info-bold",
  warning: "bg-warning-bold",
  danger: "bg-danger-bold",
  discovery: "bg-discovery-bold",
  neutral: "bg-current text-neutral-subtle",
};

export function Badge({ variant = "neutral", dot = true, className, children, ...props }: BadgeProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-body-sm font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-pill", dotClasses[variant])} />
      )}
      {children}
    </span>
  );
}
