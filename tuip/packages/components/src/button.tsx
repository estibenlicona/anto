import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "danger" | "link";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis of the action. Use `primary` for the main action of a view. */
  variant?: ButtonVariant;
  /** Control height, padding and text size. */
  size?: ButtonSize;
  /** Decorative icon rendered before the label. */
  iconBefore?: ReactNode;
  /** Decorative icon rendered after the label. */
  iconAfter?: ReactNode;
  /** Shows a progress indicator and blocks activation while the action runs. */
  isLoading?: boolean;
}

/**
 * Every variant carries a border, but only `secondary` shows one.
 *
 * A 1px border adds 2px to the box, so bordering one variant and not the others
 * would leave `secondary` sitting 2px taller than the `primary` beside it. The
 * rest take a transparent border instead: the background paints under it
 * (`background-clip` is `border-box`), so they look untouched while occupying
 * the same box. Adding a variant without one reintroduces that 2px jump, and it
 * is hard to trace back.
 *
 * `secondary` uses `border-neutral-soft`, the translucent stroke: it hints at
 * the edge without the weight of an opaque one. It is deliberately below the
 * 3:1 a boundary needs — see the token, which says so.
 *
 *
 * Each variant takes its focus halo from its own base colour, so a focused
 * control reads as itself lit up rather than as a foreign ring dropped on top.
 *
 * `subtle` and `link` stay unbounded on purpose. Their whole point is not to
 * read as a box: `subtle` is the low-emphasis action and `link` is meant to
 * look like linked text. Giving them an outline makes all three the same thing.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    "border-default border-transparent bg-brand-bold text-brand-on-bold",
    "hover:bg-brand-bold-hover active:bg-brand-bold-pressed",
    "focus-visible:ring-brand-focus-ring",
  ),
  secondary: cn(
    "border-default border-neutral-soft bg-neutral-subtle text-neutral-default",
    "hover:bg-neutral-subtle-hover active:bg-neutral-subtle-pressed",
    "focus-visible:ring-neutral-focus-ring",
  ),
  subtle: cn(
    "border-default border-transparent bg-transparent text-neutral-default",
    "hover:bg-neutral-subtle-hover active:bg-neutral-subtle-pressed",
    "focus-visible:ring-neutral-focus-ring",
  ),
  danger: cn(
    "border-default border-transparent bg-danger-bold text-danger-on-bold",
    "hover:bg-danger-bold-hover active:bg-danger-bold-pressed",
    "focus-visible:ring-danger-focus-ring",
  ),
  link: cn(
    "border-default border-transparent bg-transparent text-brand-default underline underline-offset-2",
    "hover:bg-neutral-subtle-hover",
    "focus-visible:ring-brand-focus-ring",
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "gap-1.5 px-3 py-1 text-body-sm",
  medium: "gap-2 px-4 py-2 text-body-sm",
  large: "gap-2 px-5 py-2.5 text-body",
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-pill border-bold border-current border-r-transparent"
    />
  );
}

/** Icons are decoration next to a label, so they are hidden from assistive tech. */
function Decoration({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center">
      {children}
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      iconBefore,
      iconAfter,
      isLoading = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // A loading button must not fire its action, and `aria-busy` is what tells
    // assistive tech the action is already in progress.
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-control font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {isLoading ? <Spinner /> : iconBefore && <Decoration>{iconBefore}</Decoration>}
        {children}
        {iconAfter && !isLoading && <Decoration>{iconAfter}</Decoration>}
      </button>
    );
  },
);

Button.displayName = "Button";
