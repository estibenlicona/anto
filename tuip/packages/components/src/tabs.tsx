import { ComponentPropsWithoutRef, ReactNode } from "react";
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

export type TabsListVariant = "line" | "surface";

export interface TabsListProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixTabs.List>,
  "asChild"
> {
  /**
   * How the list sits on the page.
   *
   * `line` (default) is the bare row: labels separated by air over a single
   * rule, for tabs that divide a page or a panel body.
   *
   * `surface` is the row that **heads a card**: it sits on the almost-white
   * step (`bg-neutral-subtlest`), takes the card's inset padding so its first
   * label lines up with the content below, and packs the triggers — each
   * trigger then brings its own horizontal padding, so the wide `line` gap
   * would read as holes. Reach for it when the tabs are the card's own header
   * rather than a divider inside its body.
   */
  variant?: TabsListVariant;
}

const listVariantClasses: Record<TabsListVariant, string> = {
  line: "gap-7",
  surface: "gap-1 bg-neutral-subtlest px-4",
};

export function TabsList({ variant = "line", className, ...props }: TabsListProps) {
  return (
    <RadixTabs.List
      className={cn(
        "flex border-b-default border-neutral-default",
        listVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixTabs.Trigger>,
  "asChild"
> {
  /** Shown in monospace next to the label, e.g. the number of items in this section. */
  count?: number;
  /**
   * A second line under the label that sums up what the section holds — "6
   * historias · 30 SP", "3 de 6 fuera de tolerancia" — so the reader can pick
   * a tab without opening it. It is what keeps tabs from hiding their
   * content: a row of bare labels tells nothing about which one is worth the
   * click.
   *
   * With a description the trigger stacks its two lines and takes its own
   * horizontal padding, so it pairs naturally with `TabsList`'s `surface`
   * variant. The description is read as part of the tab's accessible name,
   * like `count`; keep it to one short line.
   */
  description?: ReactNode;
}

export function TabsTrigger({
  className,
  count,
  description,
  children,
  ...props
}: TabsTriggerProps) {
  const described = description !== undefined;
  return (
    <RadixTabs.Trigger
      className={cn(
        "-mb-px border-b-bold border-transparent text-body-sm text-neutral-subtle",
        // One line: the label sits on the rule with air below it. Two lines:
        // the trigger becomes a small column with its own inset, 12px above
        // and 10px below so the rule reads as underlining the block.
        described
          ? "flex flex-col items-start gap-0 px-3 pb-2.5 pt-3 text-left"
          : "inline-flex items-center gap-1.5 pb-3.5",
        "hover:text-neutral-default",
        "data-[state=active]:border-brand-default data-[state=active]:font-semibold data-[state=active]:text-neutral-default",
        "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        "disabled:cursor-not-allowed disabled:text-neutral-disabled",
        className,
      )}
      {...props}
    >
      {described ? (
        <>
          <span className="inline-flex items-center gap-1.5">
            {children}
            {count !== undefined && (
              <span className="font-mono text-label text-neutral-subtle">{count}</span>
            )}
          </span>
          {/* Regular weight and normal tracking on purpose: the description is
              a reading, not a rubric, and it must not go bold with the active
              label above it. */}
          <span className="text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
            {description}
          </span>
        </>
      ) : (
        <>
          {children}
          {count !== undefined && (
            <span className="font-mono text-label text-neutral-subtle">{count}</span>
          )}
        </>
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
