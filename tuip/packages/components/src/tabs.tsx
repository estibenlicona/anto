import { ComponentPropsWithoutRef } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

/**
 * Built on `@radix-ui/react-tabs`: unlike Checkbox or RadioGroup, no native
 * HTML element resolves the `tablist`/`tab`/`tabpanel` pattern (roving
 * tabindex, arrow keys, Home/End, panel association), so that comes from the
 * primitive instead of being hand-rolled.
 */
export function Tabs({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixTabs.Root>, "asChild">) {
  return <RadixTabs.Root className={className} {...props} />;
}

export function TabsList({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixTabs.List>, "asChild">) {
  return (
    <RadixTabs.List
      className={cn("flex gap-7 border-b-default border-neutral-default", className)}
      {...props}
    />
  );
}

export interface TabsTriggerProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTabs.Trigger>, "asChild"> {
  /** Shown in monospace next to the label, e.g. the number of items in this section. */
  count?: number;
}

export function TabsTrigger({ className, count, children, ...props }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "-mb-px inline-flex items-center gap-1.5 border-b-bold border-transparent pb-3.5 text-body-sm text-neutral-subtle",
        "hover:text-neutral-default",
        "data-[state=active]:border-brand-default data-[state=active]:font-semibold data-[state=active]:text-neutral-default",
        "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        "disabled:cursor-not-allowed disabled:text-neutral-disabled",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="font-mono text-label text-neutral-subtle">{count}</span>
      )}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixTabs.Content>, "asChild">) {
  return (
    <RadixTabs.Content
      className={cn(
        "pt-4 focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        className,
      )}
      {...props}
    />
  );
}
