import { ComponentPropsWithoutRef, ElementRef, forwardRef, useId } from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, "asChild"> {
  /** Visible label rendered next to the track and associated with it for assistive technology. */
  label?: string;
}

/**
 * Built on `@radix-ui/react-switch`: unlike Checkbox and RadioGroup, a toggle
 * switch has no native HTML element, so `role="switch"`, `aria-checked` and
 * Space/Enter handling come from the primitive instead of being hand-rolled.
 */
export const Switch = forwardRef<ElementRef<typeof RadixSwitch.Root>, SwitchProps>(
  ({ label, className, disabled, id, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "inline-flex items-center gap-2 text-body-sm text-neutral-default",
          disabled ? "cursor-not-allowed text-neutral-disabled" : "cursor-pointer",
        )}
      >
        <RadixSwitch.Root
          ref={ref}
          id={switchId}
          disabled={disabled}
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-pill border-default border-neutral-bold bg-neutral-strong transition-colors",
            "data-[state=checked]:border-brand-default data-[state=checked]:bg-brand-bold",
            "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring",
            "disabled:cursor-not-allowed disabled:border-neutral-disabled disabled:bg-neutral-disabled",
            // Same specificity as the data-state selector above, so a plain
            // `disabled:` rule loses the tie whenever Tailwind happens to
            // emit `data-[state=checked]:` later in the stylesheet. Pairing
            // both conditions outranks either alone, regardless of order.
            "disabled:data-[state=checked]:border-neutral-disabled disabled:data-[state=checked]:bg-neutral-disabled",
            className,
          )}
          {...props}
        >
          <RadixSwitch.Thumb
            className={cn(
              "block h-3.5 w-3.5 translate-x-0.5 rounded-pill bg-neutral-default transition-transform",
              "data-[state=checked]:translate-x-[18px]",
            )}
          />
        </RadixSwitch.Root>
        {label}
      </label>
    );
  },
);

Switch.displayName = "Switch";
