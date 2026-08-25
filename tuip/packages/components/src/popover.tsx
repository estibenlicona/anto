import { ComponentPropsWithoutRef, useRef } from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

/**
 * Built on `@radix-ui/react-popover`, the same primitive `Combobox` and
 * `DateField` already use internally — exposed here as its own component for
 * arbitrary content (a filter form, a preview) instead of staying buried in
 * those three implementations.
 */
export function Popover(props: ComponentPropsWithoutRef<typeof RadixPopover.Root>) {
  return <RadixPopover.Root {...props} />;
}

export function PopoverTrigger({
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixPopover.Trigger>, "asChild">) {
  return <RadixPopover.Trigger asChild {...props} />;
}

/**
 * Anchors the surface to an element other than the trigger — or to an element
 * when there is no trigger at all. That second case is the point: a grid of
 * many cells keeps one controlled Popover and moves its anchor to whichever
 * cell was activated, instead of mounting a Popover per cell.
 *
 * Two ways to name the anchored element. Wrapping it is the direct one, and
 * `asChild` means no extra node appears. Passing `virtualRef` instead renders
 * nothing at all and points at an element the consumer already holds — which
 * is what a grid wants: wrapping only the active cell would change the shape
 * of the tree at that position on every activation, and React would remount
 * the cell, taking the focus with it.
 */
export function PopoverAnchor({
  ...props
}: Omit<ComponentPropsWithoutRef<typeof RadixPopover.Anchor>, "asChild">) {
  return <RadixPopover.Anchor asChild {...props} />;
}

export interface PopoverContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixPopover.Content>, "asChild"> {
  /**
   * Whether the surface carries its own padding. Turn it off for content that
   * bleeds to the edge — a header with its own background, a footer with its
   * own top border — and pad the sections yourself.
   *
   * This is a prop and not something you pass through `className`: `cn` here
   * concatenates, it does not merge Tailwind classes, so a `p-0` from outside
   * would lose to the `p-4` this component writes.
   */
  padded?: boolean;
}

export function PopoverContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  padded = true,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onPointerDownOutside,
  onFocusOutside,
  ...props
}: PopoverContentProps) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const closedByOutside = useRef(false);

  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        onOpenAutoFocus={(event) => {
          // Antes de que el foco entre a la superficie: quién lo tenía es lo
          // que hay que devolver al cerrar.
          previouslyFocused.current = document.activeElement as HTMLElement | null;
          closedByOutside.current = false;
          onOpenAutoFocus?.(event);
        }}
        onPointerDownOutside={(event) => {
          closedByOutside.current = true;
          onPointerDownOutside?.(event);
        }}
        onFocusOutside={(event) => {
          closedByOutside.current = true;
          onFocusOutside?.(event);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;

          // Radix devuelve el foco a su disparador, y en modo controlado no
          // hay ninguno: se queda con `null`, hace `preventDefault()` y el foco
          // termina en el `body` — el usuario de teclado pierde el lugar donde
          // estaba. Se lo devuelve a quien lo tenía al abrirse, que sin
          // disparador es el elemento anclado.
          //
          // No cuando el cierre vino de tocar afuera: ahí el foco tiene que
          // quedar donde el usuario acaba de tocar, no volver de un salto.
          if (closedByOutside.current) return;
          const previous = previouslyFocused.current;
          if (previous?.isConnected) {
            event.preventDefault();
            previous.focus();
          }
        }}
        className={cn(
          "z-menu w-popover-min rounded-control border-default border-neutral-default bg-neutral-default shadow-md",
          // Un contenido más alto que el espacio que queda se sale de la
          // pantalla y su encabezado deja de verse — el caso justo donde el
          // popover más se necesita. Radix mide cuánto hay y lo publica;
          // la superficie se acota a eso y desplaza adentro.
          "max-h-[var(--radix-popover-content-available-height)] overflow-y-auto",
          padded && "p-4",
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
}
