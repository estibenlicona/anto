import { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export interface TooltipProps {
  /** The short phrase shown in the bubble. Never an action, never information required to complete a task. */
  content: ReactNode;
  /** The element that triggers the tooltip on hover or keyboard focus. */
  children: ReactNode;
  /** Which side of the trigger the bubble opens on. Defaults to "top". */
  side?: RadixTooltip.TooltipContentProps["side"];
  /** Alignment along that side. Defaults to "center". */
  align?: RadixTooltip.TooltipContentProps["align"];
  /** Additional classes merged onto the bubble. */
  className?: string;
}

/**
 * Self-contained — mounts its own `Tooltip.Provider`, unlike `ToastProvider`.
 * Open state and the 500ms show delay are local to each instance, so there is
 * nothing to coordinate between tooltips and no shared provider to set up.
 */
export function Tooltip({ content, children, side = "top", align = "center", className }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={500}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={4}
            className={cn(
              "z-menu max-w-[240px] rounded-control bg-neutral-bold px-2.5 py-1.5 text-body-sm text-neutral-inverse shadow-md",
              className,
            )}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

Tooltip.displayName = "Tooltip";
