import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import type { IconName } from "./icons/paths";

export type AlertVariant = "danger" | "warning" | "success" | "info";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Severity conveyed by color and icon together — never by color alone. */
  variant?: AlertVariant;
  /** Optional bold lead-in shown above the description. */
  title?: string;
  /**
   * Optional control rendered at the end of the alert, e.g. a `Button`. Alert
   * does not know what the action does or execute it — the consumer owns that.
   */
  action?: ReactNode;
}

const variantIcon: Record<AlertVariant, IconName> = {
  danger: "status-error",
  warning: "status-warning",
  success: "status-success",
  info: "status-info",
};

const variantClasses: Record<AlertVariant, string> = {
  danger: "border-danger-default bg-danger-subtle text-danger-default",
  warning: "border-warning-default bg-warning-subtle text-warning-default",
  success: "border-success-default bg-success-subtle text-success-default",
  info: "border-info-default bg-info-subtle text-info-default",
};

export function Alert({
  variant = "info",
  title,
  action,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3.5 rounded-r-control border-l-bold py-4 pl-4 pr-4",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Icon name={variantIcon[variant]} size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <p className="mb-1 text-body-sm font-semibold">{title}</p>}
        <div className="text-body-sm text-neutral-default">{children}</div>
      </div>
      {action && <div className="shrink-0 self-start">{action}</div>}
    </div>
  );
}
