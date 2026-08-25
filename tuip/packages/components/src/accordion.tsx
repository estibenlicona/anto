import { ComponentPropsWithoutRef } from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import type { AccordionMultipleProps, AccordionSingleProps } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type AccordionProps =
  | Omit<AccordionSingleProps, "asChild">
  | Omit<AccordionMultipleProps, "asChild">;

/**
 * Built on `@radix-ui/react-accordion`: no native HTML element resolves the
 * expandable-header pattern (roving tabindex, arrow keys, Home/End,
 * aria-expanded/aria-controls), so that comes from the primitive instead of
 * being hand-rolled. `<details>` was considered but doesn't support a
 * controlled `multiple` mode without extra JavaScript.
 */
export function Accordion({ className, ...props }: AccordionProps) {
  return <RadixAccordion.Root className={className} {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixAccordion.Item>, "asChild">) {
  return (
    <RadixAccordion.Item
      className={cn("border-b-default border-neutral-default last:border-b-0", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>, "asChild">) {
  return (
    <RadixAccordion.Header>
      <RadixAccordion.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-2 py-3.5 text-left text-body-sm font-medium text-neutral-default",
          "hover:text-neutral-subtle",
          "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
          "disabled:cursor-not-allowed disabled:text-neutral-disabled",
          "group",
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          name="chevron-down"
          size={16}
          className="shrink-0 text-neutral-subtle transition-transform group-data-[state=open]:rotate-180"
        />
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
}

export function AccordionContent({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixAccordion.Content>, "asChild">) {
  return (
    <RadixAccordion.Content
      className={cn("pb-3.5 text-body-sm text-neutral-subtle", className)}
      {...props}
    />
  );
}
