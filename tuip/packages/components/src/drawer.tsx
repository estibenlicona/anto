import { HTMLAttributes, ReactNode, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type DrawerSize = "sm" | "lg";

export interface DrawerProps {
  /** Whether the drawer is open. Pass together with `onOpenChange` for a controlled drawer. */
  open?: boolean;
  /** Initial open state for an uncontrolled drawer. */
  defaultOpen?: boolean;
  /** Called when the drawer is opened or closed, by any means (Escape, overlay click, the close button). */
  onOpenChange?: (open: boolean) => void;
  /** Panel width. Defaults to "sm" (480px), the only width the definition illustrates. */
  size?: DrawerSize;
  /** `DrawerHeader`, `DrawerBody` and `DrawerFooter`, in that order. */
  children: ReactNode;
  /** Additional classes merged onto the panel. */
  className?: string;
}

const SIZE_WIDTH: Record<DrawerSize, string> = {
  sm: "w-drawer-sm",
  lg: "w-drawer-lg",
};

/**
 * For consulting, not deciding — a Drawer never unmounts the table or list
 * behind it, so closing one never loses that page's scroll or selection.
 * Same shape as `Modal` (no built-in trigger, `open`/`onOpenChange` owned by
 * the consumer) because the two share one primitive, `@radix-ui/react-dialog`,
 * and differ only in how their panel is positioned and animated.
 *
 * Same focus-return fix as `Modal`: without `Dialog.Trigger`, Radix has
 * nothing to restore focus to on close, so the opener is captured manually
 * in `onOpenAutoFocus` (before Radix moves focus into the panel) and
 * restored in `onCloseAutoFocus`.
 */
export function Drawer({ open, defaultOpen, onOpenChange, size = "sm", children, className }: DrawerProps) {
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-neutral-bold/40" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(event) => {
            if (openerRef.current) {
              event.preventDefault();
              openerRef.current.focus();
            }
          }}
          className={cn(
            // Mismo criterio que Modal: panel claro, así que se delimita con el
            // trazo estándar en vez de depender de la sombra. Sólo el lado
            // expuesto — los otros tres caen fuera de la pantalla.
            "fixed inset-y-0 right-0 z-overlay flex h-full flex-col border-l-default border-neutral-default bg-neutral-default shadow-lg",
            "transition-transform duration-200 ease-out data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
            SIZE_WIDTH[size],
            className,
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

Drawer.displayName = "Drawer";

export interface DrawerHeaderProps {
  /** The drawer's accessible title, rendered as `Dialog.Title`. Radix requires it for assistive technology. */
  title: ReactNode;
  /** Short label above the title, e.g. "Capacidad" over a person's name. */
  eyebrow?: ReactNode;
  /** Content rendered alongside the title, before the close button. */
  children?: ReactNode;
}

export function DrawerHeader({ title, eyebrow, children }: DrawerHeaderProps) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b-default border-neutral-default px-6 py-5">
      <div className="flex-1">
        {eyebrow && (
          <div className="mb-1.5 text-body-sm font-semibold uppercase tracking-wide text-neutral-subtle">
            {eyebrow}
          </div>
        )}
        <Dialog.Title className="text-lg font-semibold text-neutral-default">{title}</Dialog.Title>
        {children}
      </div>
      <Dialog.Close asChild>
        <button type="button" aria-label="Cerrar" className="shrink-0 text-neutral-subtle hover:text-neutral-default">
          <Icon name="close" size={20} />
        </button>
      </Dialog.Close>
    </div>
  );
}

DrawerHeader.displayName = "DrawerHeader";

/** Fills the remaining height and scrolls on its own — the panel itself never scrolls as a whole. */
export function DrawerBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />;
}

DrawerBody.displayName = "DrawerBody";

export function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex shrink-0 gap-3 border-t-default border-neutral-default px-6 py-4", className)} {...props} />
  );
}

DrawerFooter.displayName = "DrawerFooter";
