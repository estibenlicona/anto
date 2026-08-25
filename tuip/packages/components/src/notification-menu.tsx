import { ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export interface NotificationMenuProps {
  /** The element that opens the panel, e.g. a bell `Button`. */
  trigger: ReactNode;
  /** `NotificationMenuHeader`, `NotificationMenuItem` and `NotificationMenuFooter`, in that order. */
  children: ReactNode;
  /** Which side of the trigger the panel opens on. Defaults to "bottom". */
  side?: DropdownMenu.DropdownMenuContentProps["side"];
  /** Alignment along that side. Defaults to "end" — the trigger is typically the last icon in a top bar. */
  align?: DropdownMenu.DropdownMenuContentProps["align"];
  /** Additional classes merged onto the panel surface. */
  className?: string;
  /**
   * Controls open state from the outside, e.g. to coordinate several anchored
   * panels so only one is ever open at once. Omit both this and
   * `onOpenChange` for the default uncontrolled behavior — Radix then owns
   * open state itself, exactly as before this prop existed.
   */
  open?: boolean;
  /** Called on every open/close attempt when `open` is provided. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Anchored dropdown, same primitive as `Menu` (`@radix-ui/react-dropdown-menu`)
 * for the same free focus/keyboard/close behavior — but its own component,
 * not a wrapper around `Menu`/`MenuItem`: a notification's content (dot,
 * title, detail, timestamp, read state) doesn't fit the single-line
 * icon+label row `MenuItem` already resolves. Same relationship `Modal` and
 * `Drawer` already have while sharing `@radix-ui/react-dialog`.
 *
 * A dropdown, not a blocking overlay — same layer and elevation as `Menu`,
 * `Select` and `Combobox` (`z-menu` / `shadow-md`), not `Modal`/`Drawer`'s
 * heavier `z-overlay` / `shadow-lg`.
 */
export function NotificationMenu({
  trigger,
  children,
  side = "bottom",
  align = "end",
  className,
  open,
  onOpenChange,
}: NotificationMenuProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={side}
          align={align}
          sideOffset={4}
          className={cn(
            "z-menu flex w-[380px] flex-col overflow-hidden rounded-control border-default border-neutral-default bg-neutral-default shadow-md",
            className,
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

NotificationMenu.displayName = "NotificationMenu";

export interface NotificationMenuListProps {
  /** `NotificationMenuItem` elements, in the order they should appear. */
  children: ReactNode;
}

/**
 * The one piece that scrolls. `NotificationMenuHeader` and `NotificationMenuFooter`
 * stay pinned — the source shows "máx. 5 visibles" as a viewport constraint on
 * the notification list itself, not on the whole panel, so only this wrapper
 * gets a max height. `max-h-[500px]` is a deliberate approximation (roughly
 * five rows at their typical height, ~100px with one line of detail),
 * documented as such: row height varies with detail length, so no fixed
 * number is exact for every five rows of arbitrary content.
 */
export function NotificationMenuList({ children }: NotificationMenuListProps) {
  return <div className="max-h-[500px] overflow-y-auto">{children}</div>;
}

NotificationMenuList.displayName = "NotificationMenuList";

export interface NotificationMenuHeaderProps {
  /** The panel's title, e.g. "Notificaciones". */
  title: ReactNode;
  /** Optional action, e.g. "Marcar todas leídas" — participates in the same arrow-key navigation as the notifications. */
  action?: ReactNode;
  /** Called when the action is activated. */
  onActionSelect?: () => void;
}

export function NotificationMenuHeader({ title, action, onActionSelect }: NotificationMenuHeaderProps) {
  return (
    <div className="flex items-center border-b-default border-neutral-default px-[18px] py-3.5">
      <span className="text-body-sm font-semibold text-neutral-default">{title}</span>
      {action && (
        <DropdownMenu.Item
          onSelect={() => onActionSelect?.()}
          className="ml-auto cursor-pointer text-body-sm text-brand-default outline-none data-[highlighted]:underline"
        >
          {action}
        </DropdownMenu.Item>
      )}
    </div>
  );
}

NotificationMenuHeader.displayName = "NotificationMenuHeader";

export type NotificationMenuItemVariant = "success" | "info" | "warning" | "danger" | "discovery" | "neutral";

export interface NotificationMenuItemProps {
  /** Whether this notification hasn't been seen yet. Drives both the background and the text weight together — the source never varies one without the other. Defaults to `false` (read). */
  unread?: boolean;
  /** The notification's own title line. */
  label: ReactNode;
  /** Secondary line with the event's detail. */
  detail?: ReactNode;
  /** When it happened, e.g. "hace 12 min". */
  timestamp: ReactNode;
  /**
   * Tone of the notification's dot, reusing the exact roles and mapping
   * `ActivityTimeline` already validates. Defaults to "neutral".
   */
  variant?: NotificationMenuItemVariant;
  /** Called when the notification is activated by click, Enter or Space. */
  onSelect?: () => void;
}

// Identical to activity-timeline.tsx's dotClasses: same roles, same neutral
// exception (bg-current + text-neutral-subtle, since neutral has no bg-bold
// step suited to a dot). Two catalog components with color dots should look
// like each other, not each chase the slightly different gray its own mockup
// section happens to use. Kept as its own copy — this file doesn't declare
// "activity-timeline" as a registry dependency.
const dotClasses: Record<NotificationMenuItemVariant, string> = {
  success: "bg-success-bold",
  info: "bg-info-bold",
  warning: "bg-warning-bold",
  danger: "bg-danger-bold",
  discovery: "bg-discovery-bold",
  neutral: "bg-current text-neutral-subtle",
};

export function NotificationMenuItem({
  unread = false,
  label,
  detail,
  timestamp,
  variant = "neutral",
  onSelect,
}: NotificationMenuItemProps) {
  return (
    <DropdownMenu.Item
      onSelect={() => onSelect?.()}
      className={cn(
        "grid cursor-pointer grid-cols-[8px_1fr] gap-3 border-b-default border-neutral-default px-[18px] py-3.5 outline-none",
        "data-[highlighted]:bg-neutral-subtlest",
        unread ? "bg-neutral-default" : "bg-neutral-subtlest",
      )}
    >
      <span aria-hidden="true" className={cn("mt-1.5 h-[7px] w-[7px] shrink-0 rounded-pill", dotClasses[variant])} />
      <div className="min-w-0">
        <div className={cn("text-body-sm text-neutral-default", unread && "font-semibold")}>{label}</div>
        {detail && <div className="mt-0.5 text-body-sm text-neutral-subtle">{detail}</div>}
        <div className="mt-1 text-body-sm text-neutral-subtlest">{timestamp}</div>
      </div>
    </DropdownMenu.Item>
  );
}

NotificationMenuItem.displayName = "NotificationMenuItem";

export interface NotificationMenuFooterProps {
  /** The footer's single action, e.g. "Ver todas". */
  children: ReactNode;
  /** Called when the action is activated. */
  onSelect?: () => void;
}

export function NotificationMenuFooter({ children, onSelect }: NotificationMenuFooterProps) {
  return (
    <DropdownMenu.Item
      onSelect={() => onSelect?.()}
      className="cursor-pointer bg-neutral-subtlest px-[18px] py-3 text-center text-body-sm text-brand-default outline-none data-[highlighted]:underline"
    >
      {children}
    </DropdownMenu.Item>
  );
}

NotificationMenuFooter.displayName = "NotificationMenuFooter";
