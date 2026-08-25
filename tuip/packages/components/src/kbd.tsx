import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type KbdSize = "sm" | "md";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** The key or combination, as the user would read it: "1", "↵", "Ctrl+K". */
  children: React.ReactNode;
  /** `sm` for a panel footer or a hint line; `md` (default) next to an option title. */
  size?: KbdSize;
}

const sizeClasses: Record<KbdSize, string> = {
  sm: "h-5 min-w-5 px-1 text-label",
  md: "h-6 min-w-6 px-1.5 text-body-sm",
};

/**
 * A key, drawn as a key. Only documents a shortcut — whoever listens for the
 * keystroke is the consumer. It is `<kbd>`, so it is already semantic; it
 * takes no role and no focus, and the text cannot be selected by accident
 * when the reader drags across a hint line.
 */
export function Kbd({ children, size = "md", className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-control border-default border-neutral-default bg-neutral-subtle font-mono font-normal normal-case tracking-normal text-neutral-subtle",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
