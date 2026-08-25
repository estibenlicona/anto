import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {}

/**
 * A horizontal sequence of steps. No surface of its own — the card the
 * mockup draws around it belongs to the flow that hosts it, the same reason
 * `ActivityTimeline` doesn't own a border either.
 */
export function Stepper({ className, ...props }: StepperProps) {
  return <ol className={cn("flex items-center", className)} {...props} />;
}

Stepper.displayName = "Stepper";

export type StepperStepStatus = "completed" | "current" | "pending";

export interface StepperStepProps {
  /**
   * Assigned by the consumer, never computed from position — Stepper doesn't
   * inspect its children to infer which step is active, the same way Table
   * doesn't sort its own rows.
   */
  status: StepperStepStatus;
  /** Ordinal shown inside the circle for "current" and "pending". Ignored once `status` is "completed" — a checkmark replaces it. */
  step: number;
  /** Step name, rendered in bold. */
  label: ReactNode;
  /** Muted subtitle below the label, e.g. the step's own state in words ("en curso", "pendiente"). */
  description?: ReactNode;
}

export function StepperStep({ status, step, label, description }: StepperStepProps) {
  return (
    <li className="group flex flex-1 items-center last:flex-none">
      <div
        className={cn(
          "flex items-center gap-3",
          status === "pending" && "opacity-[.55]",
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-body-sm font-semibold",
            status === "completed" && "bg-success-bold text-success-on-bold",
            status === "current" && "bg-brand-bold text-brand-on-bold",
            status === "pending" && "border-default border-neutral-default text-neutral-subtle",
          )}
        >
          {status === "completed" ? <Icon name="check" size={16} /> : step}
        </span>
        <div>
          <div className="text-body-sm font-semibold text-neutral-default">{label}</div>
          {description && <div className="text-body-sm text-neutral-subtle">{description}</div>}
        </div>
      </div>
      <span className="mx-5 h-px flex-1 bg-neutral-default group-last:hidden" />
    </li>
  );
}

StepperStep.displayName = "StepperStep";
