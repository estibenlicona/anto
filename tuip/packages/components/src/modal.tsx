import { HTMLAttributes, ReactNode, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  /** Whether the modal is open. Pass together with `onOpenChange` for a controlled modal. */
  open?: boolean;
  /** Initial open state for an uncontrolled modal. */
  defaultOpen?: boolean;
  /** Called when the modal is opened or closed, by any means (Escape, overlay click, the close button). */
  onOpenChange?: (open: boolean) => void;
  /** Content width. Defaults to "sm" (480px), the only width the definition illustrates. */
  size?: ModalSize;
  /** `ModalHeader`, `ModalBody` and `ModalFooter`, in that order. */
  children: ReactNode;
  /** Additional classes merged onto the content panel. */
  className?: string;
}

const SIZE_WIDTH: Record<ModalSize, string> = {
  sm: "w-modal-sm",
  md: "w-modal-md",
  lg: "w-modal-lg",
};

/**
 * For deciding, not consulting — a Modal blocks the page until the user
 * responds. No built-in trigger: the confirmation this is built for almost
 * never fires from a button right next to it (a `MenuItem`, a table row, an
 * async check), so the consumer owns `open`/`onOpenChange` the same way it
 * would own Radix's own `Dialog.Root`.
 *
 * That absence of `Dialog.Trigger` has one consequence Radix can't cover on
 * its own: with no trigger for it to remember, Radix has nothing to restore
 * focus to on close and falls back to `document.body`. `onOpenAutoFocus`
 * fires before Radix moves focus into the content, so `document.activeElement`
 * there is still whatever opened the modal — captured and restored manually
 * on close via `onCloseAutoFocus`.
 */
export function Modal({ open, defaultOpen, onOpenChange, size = "sm", children, className }: ModalProps) {
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            // `scrim` es oscuro en los dos temas; `bold/40` se invertía en
            // oscuro y aclaraba la página que tenía que apagar.
            "fixed inset-0 z-overlay bg-neutral-scrim",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          )}
        />
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
            // El panel lleva borde y las burbujas oscuras no: lo que decide es
            // la superficie, no el hecho de ser una superposición. Este panel es
            // claro, así que sobre una página clara necesita trazo propio —
            // `shadow-lg` se proyecta hacia abajo y deja el borde superior sin
            // definir, que es justo donde el diálogo se fundía con la pantalla.
            // Tooltip y Toast usan `bg-neutral-bold` y se recortan solos.
            "fixed left-1/2 top-1/2 z-overlay flex max-h-[85vh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-surface border-default border-neutral-default bg-neutral-default shadow-lg",
            // Un panel centrado se asienta desde apenas abajo (la receta
            // `panel`); Radix mantiene el nodo montado mientras dura la
            // animación de salida, así que el cierre también se ve. El
            // centrado va por `translate` y la receta por `transform`: son
            // dos propiedades y no se pisan.
            "data-[state=open]:animate-panel-in data-[state=closed]:animate-panel-out",
            // The size utilities are fixed widths — 480px does not fit a phone.
            // Below the smallest breakpoint the panel yields to the viewport
            // and keeps a `group` (16px) margin on each side, the same air the
            // one-column layout gives everything else; from 640px up the cap
            // never engages, so desktop is unchanged.
            "max-w-[calc(100%-2rem)]",
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

Modal.displayName = "Modal";

export interface ModalHeaderProps {
  /** The modal's accessible title, rendered as `Dialog.Title`. Radix requires it for assistive technology. */
  title: ReactNode;
  /** Content rendered alongside the title, before the close button. */
  children?: ReactNode;
}

export function ModalHeader({ title, children }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6">
      <div className="flex-1">
        {/* `text-heading-md`, the scale's card-title step, not `text-lg`: the
            preset replaces Tailwind's own font sizes, so `text-lg` emits no
            rule and the title silently inherited the body size. The step
            bundles its weight, so no `font-semibold` alongside. */}
        <Dialog.Title className="text-heading-md text-neutral-default">{title}</Dialog.Title>
        {children}
      </div>
      <Dialog.Close asChild>
        {/* The same 32px icon-button box the Navbar utilities use, so the
            close has a hit area and a visible focus ring — a bare 20px glyph
            had neither. The negative margins pull the box back so the glyph
            stays where it sat: level with the title's first line and flush
            with the panel's inner edge; only the box grew, not the layout. */}
        <button
          type="button"
          aria-label="Cerrar"
          className={cn(
            "-mr-1.5 -mt-[3px] flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-neutral-subtle outline-none",
            "transition-colors hover:bg-neutral-subtle-hover hover:text-neutral-default",
            "focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-brand-focus-ring",
          )}
        >
          <Icon name="close" size={20} />
        </button>
      </Dialog.Close>
    </div>
  );
}

ModalHeader.displayName = "ModalHeader";

/**
 * Not every Modal's content is a single describing sentence — the mockup's
 * body is a warning paragraph, but a form or a comparison never would be.
 * `Modal` passes `aria-describedby={undefined}` to `Dialog.Content` so Radix
 * treats that omission as deliberate, instead of leaving its "missing
 * Description" development warning unresolved.
 */
export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-y-auto px-6 py-3 text-body-sm text-neutral-subtle", className)} {...props} />;
}

ModalBody.displayName = "ModalBody";

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 justify-end gap-3 rounded-b-surface border-t-default border-neutral-default bg-neutral-subtle px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

ModalFooter.displayName = "ModalFooter";
