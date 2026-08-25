import { ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export interface MenuProps {
  /** The element that opens the menu, e.g. a `Button` with the "more" icon. */
  trigger: ReactNode;
  /** `MenuItem` and `MenuSeparator` elements, in the order they should appear. */
  children: ReactNode;
  /** Which side of the trigger the menu opens on. Defaults to "bottom". */
  side?: DropdownMenu.DropdownMenuContentProps["side"];
  /** Alignment along that side. Defaults to "start". */
  align?: DropdownMenu.DropdownMenuContentProps["align"];
  /** Additional classes merged onto the menu surface. */
  className?: string;
  /**
   * Controls open state from the outside, e.g. to coordinate several menus so
   * only one is ever open at once. Omit both this and `onOpenChange` for the
   * default uncontrolled behavior — Radix then owns open state itself, exactly
   * as before this prop existed.
   */
  open?: boolean;
  /** Called on every open/close attempt when `open` is provided. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Anchored dropdown for a list of actionable items. Arrow-key navigation,
 * `Escape`, and `Home`/`End` are native to `@radix-ui/react-dropdown-menu` —
 * nothing here reimplements them.
 */
export function Menu({ trigger, children, side = "bottom", align = "start", className, open, onOpenChange }: MenuProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={side}
          align={align}
          sideOffset={4}
          className={cn(
            "z-menu w-[220px] overflow-hidden rounded-control border-default border-neutral-default bg-neutral-default p-1 shadow-md",
            className,
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

Menu.displayName = "Menu";

export interface MenuItemProps {
  /** Decorative icon rendered before the label, e.g. `<Icon name="edit" size={16} />`. */
  icon?: ReactNode;
  /** The item's label. */
  children: ReactNode;
  /**
   * Marks the dangerous variant of an item, e.g. "Eliminar". Colors the item
   * with the `danger` role instead of position alone. Place it last, after a
   * `MenuSeparator` — Menu does not enforce this order itself.
   */
  destructive?: boolean;
  /** Excludes the item from selection and keyboard navigation. */
  disabled?: boolean;
  /** Called when the item is activated by click, Enter or Space. */
  onSelect?: () => void;
}

export function MenuItem({ icon, children, destructive, disabled, onSelect }: MenuItemProps) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={() => onSelect?.()}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-body-sm text-neutral-default outline-none",
        "data-[highlighted]:bg-neutral-subtle",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-neutral-disabled",
        destructive && "text-danger-default",
      )}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      )}
      {children}
    </DropdownMenu.Item>
  );
}

MenuItem.displayName = "MenuItem";

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 border-t-default border-neutral-default" />;
}

MenuSeparator.displayName = "MenuSeparator";
