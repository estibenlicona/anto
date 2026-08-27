import { ComponentPropsWithoutRef, useEffect } from "react";
import { Command } from "cmdk";
import { cn } from "@/lib/cn";

export type CommandPaletteProps = Omit<ComponentPropsWithoutRef<typeof Command.Dialog>, "asChild">;

/**
 * Combines `@radix-ui/react-dialog` (already used by `Modal`, for the
 * centered overlay and trapped focus) with `cmdk` (already used by
 * `Combobox`, for the filtered list) via `cmdk`'s own `Command.Dialog` — no
 * component in the catalog hand-rolls this pairing, cmdk already ships it.
 *
 * Unlike `Combobox`, there is no field to anchor to: this opens from
 * anywhere on the screen via `⌘K`/`Ctrl+K`, registered here and cleaned up
 * on unmount so mounting `CommandPalette` once is enough for the whole app.
 */
export function CommandPalette({
  overlayClassName,
  contentClassName,
  onOpenChange,
  ...props
}: CommandPaletteProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange?.(!props.open);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, props.open]);

  return (
    <Command.Dialog
      onOpenChange={onOpenChange}
      overlayClassName={cn(
        // `scrim`: oscuro en los dos temas, ver la nota en Modal.
        "fixed inset-0 z-overlay bg-neutral-scrim",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        overlayClassName,
      )}
      contentClassName={cn(
        "fixed left-1/2 top-[20vh] z-overlay w-modal-md -translate-x-1/2 overflow-hidden rounded-surface border-default border-neutral-default bg-neutral-default shadow-lg",
        // Misma llegada que Modal: es un panel centrado, y cmdk envuelve el
        // Dialog de Radix, así que expone el mismo `data-state`.
        "data-[state=open]:animate-panel-in data-[state=closed]:animate-panel-out",
        contentClassName,
      )}
      {...props}
    />
  );
}

export function CommandPaletteInput({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Command.Input>, "asChild">) {
  return (
    <Command.Input
      className={cn(
        "w-full border-b-default border-neutral-default px-4 py-3 text-body-sm text-neutral-default outline-none placeholder:text-neutral-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function CommandPaletteList({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Command.List>, "asChild">) {
  return <Command.List className={cn("max-h-80 overflow-y-auto p-2", className)} {...props} />;
}

export function CommandPaletteEmpty({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Command.Empty>, "asChild">) {
  return (
    <Command.Empty
      className={cn("px-3 py-6 text-center text-body-sm text-neutral-subtle", className)}
      {...props}
    />
  );
}

export function CommandPaletteGroup({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Command.Group>, "asChild">) {
  return (
    <Command.Group
      className={cn(
        "px-2 py-1.5 text-label text-neutral-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
        className,
      )}
      {...props}
    />
  );
}

export function CommandPaletteItem({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Command.Item>, "asChild">) {
  return (
    <Command.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-body-sm text-neutral-default outline-none",
        "data-[selected=true]:bg-neutral-selected",
        "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-neutral-disabled",
        className,
      )}
      {...props}
    />
  );
}
