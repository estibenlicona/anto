import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ActivityTimelineProps extends HTMLAttributes<HTMLOListElement> {}

/**
 * A chronological sequence, not an unordered list — `<ol>` carries that
 * distinction to assistive technology for free. No surface of its own: it is
 * meant to sit inside whatever already provides one (a `Card`, a `Drawer`'s
 * body), the same call already made for `EmptyState`.
 */
export function ActivityTimeline({ className, ...props }: ActivityTimelineProps) {
  return <ol className={cn("flex flex-col", className)} {...props} />;
}

ActivityTimeline.displayName = "ActivityTimeline";

export type ActivityTimelineVariant = "success" | "info" | "warning" | "danger" | "neutral" | "discovery";

export interface ActivityTimelineItemProps {
  /** Who or what performed the action. Rendered first and set apart typographically from `action`. */
  actor: ReactNode;
  /** What the actor did, in the same line as `actor` and in regular weight. */
  action: ReactNode;
  /** Secondary line with the object of the action. Omit it rather than pass an empty node — no placeholder space is reserved for it. */
  detail?: ReactNode;
  /** Relative or absolute moment the entry happened, right-aligned. */
  timestamp: ReactNode;
  /**
   * Tone of the entry's dot, reusing the exact roles and mapping `Badge`
   * already validates. Decorative only — `action` always carries the same
   * meaning in text, so the dot's color is never the only way to tell entries
   * apart.
   */
  variant?: ActivityTimelineVariant;
}

// Identical to badge.tsx's dotClasses: same roles, same neutral exception
// (no bg-neutral-bold step suited to a dot, so it borrows the mid-gray text
// color via bg-current). Kept as its own copy rather than imported — each
// catalog component ships as self-contained source, copied on its own by the
// CLI, and this one doesn't declare "badge" as a registry dependency.
const dotClasses: Record<ActivityTimelineVariant, string> = {
  success: "bg-success-bold",
  info: "bg-info-bold",
  warning: "bg-warning-bold",
  danger: "bg-danger-bold",
  discovery: "bg-discovery-bold",
  neutral: "bg-current text-neutral-subtle",
};

export function ActivityTimelineItem({ actor, action, detail, timestamp, variant = "neutral" }: ActivityTimelineItemProps) {
  return (
    <li className="group relative flex gap-3 pb-6 last:pb-0">
      <span aria-hidden="true" className="flex flex-col items-center">
        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-pill", dotClasses[variant])} />
        <span className="mt-1 w-px flex-1 bg-neutral-default group-last:hidden" />
      </span>
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-body-sm text-neutral-default">
            <strong className="font-semibold">{actor}</strong> {action}
          </p>
          {detail && <p className="mt-0.5 text-body-sm text-neutral-subtle">{detail}</p>}
        </div>
        <span className="shrink-0 whitespace-nowrap text-body-sm text-neutral-subtle">{timestamp}</span>
      </div>
    </li>
  );
}

ActivityTimelineItem.displayName = "ActivityTimelineItem";
