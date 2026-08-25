import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Decorative illustration, e.g. `<Icon name="status-empty" size={32} />`. Hidden from assistive technology. */
  icon?: ReactNode;
  /** Short lead-in naming what's missing. */
  title: string;
  /** Optional explanation of why the space is empty or what to do about it. */
  description?: string;
  /**
   * Optional control rendered below the description, e.g. a `Button` that
   * invites creating the first item. EmptyState does not know what the
   * action does or execute it — the consumer owns that.
   */
  action?: ReactNode;
}

/**
 * Centered icon, title, description and action. Has no border or background
 * of its own — it relies on whatever surface hosts it (a Card, a Table's
 * body, a page section), the same way Alert relies on the consumer's layout.
 */
export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-5 py-8 text-center", className)} {...props}>
      {icon && (
        <div aria-hidden="true" className="mb-4 text-neutral-subtle">
          {icon}
        </div>
      )}
      <p className="text-body font-semibold text-neutral-default">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-[44ch] text-body-sm text-neutral-subtle">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
