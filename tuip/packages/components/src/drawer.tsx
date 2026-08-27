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
        <Dialog.Overlay
          className={cn(
            // `scrim`: oscuro en los dos temas, ver la nota en Modal.
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
            // Mismo criterio que Modal: panel claro, así que se delimita con el
            // trazo estándar en vez de depender de la sombra. Sólo el lado
            // expuesto — los otros tres caen fuera de la pantalla.
            "fixed inset-y-0 right-0 z-overlay flex h-full flex-col border-l-default border-neutral-default bg-neutral-default shadow-lg",
            // Entra desde el borde por el que asoma (la receta `slide`): viaja
            // su propio ancho, y por eso es la única que va en el paso lento.
            // Antes era una `transition` sobre `translate`, que nunca llegaba
            // a verse: Radix monta el nodo ya en estado abierto —no hay un
            // "desde" que transicionar— y lo desmonta al instante al cerrar,
            // porque sólo espera a una `animation`, no a una `transition`.
            "data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
            // Los anchos son fijos y el menor (480px) no entra en un teléfono:
            // anclado a la derecha, el panel se salía por la izquierda y su
            // cabecera quedaba fuera de pantalla. Bajo el punto de quiebre
            // menor los paneles laterales se superponen a toda la pantalla —
            // es lo que el sistema documenta para esa franja— así que el tope
            // es el ancho de la ventana; desde 640px no interviene.
            "max-w-full",
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
          // `text-label` es el paso de rúbrica del sistema —el mismo que la
          // cabecera de columna y el título de grupo del Sidebar— y ya trae
          // su tamaño, peso y tracking. Antes era body-sm en mayúsculas con
          // un tracking de fábrica: una rúbrica que no existía en la escala.
          <div className="mb-1.5 text-label uppercase text-neutral-subtle">{eyebrow}</div>
        )}
        {/* `text-heading-md` y no `text-lg`: el preset reemplaza la escala de
            tamaños de Tailwind, así que `text-lg` no emitía regla y el título
            heredaba el tamaño del cuerpo. El paso trae su peso. */}
        <Dialog.Title className="text-heading-md text-neutral-default">{title}</Dialog.Title>
        {children}
      </div>
      <Dialog.Close asChild>
        {/* La misma caja de 32px que usan Modal y las utilidades de Navbar:
            área de clic y anillo de foco, que el glifo suelto no tenía. El
            margen negativo centra la caja con la primera línea del bloque de
            texto —la del eyebrow (16px) cuando lo hay, la del título (26px)
            cuando no— para que el glifo quede donde estaba. */}
        <button
          type="button"
          aria-label="Cerrar"
          className={cn(
            "-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-neutral-subtle outline-none",
            eyebrow ? "-mt-2" : "-mt-[3px]",
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
