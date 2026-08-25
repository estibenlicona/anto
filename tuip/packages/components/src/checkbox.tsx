import { InputHTMLAttributes, forwardRef, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label rendered next to the box and associated with it for assistive technology. */
  label?: string;
  /**
   * Neither checked nor unchecked — a partial selection within a group this
   * checkbox represents. Set via a DOM property, not an HTML attribute: the
   * platform has no declarative way to express it. Browsers already expose an
   * indeterminate native checkbox as `aria-checked="mixed"` on their own.
   */
  indeterminate?: boolean;
}

/**
 * Wraps a real `<input type="checkbox">`, kept in the document and focusable
 * but visually hidden, so Space, click-on-label and screen reader semantics
 * are the browser's own — nothing here reimplements them. The visible box and
 * its icons are decorative siblings of the input, driven entirely by CSS
 * (`peer-checked`, `peer-indeterminate`) rather than by re-rendering from
 * React state, so they track the real DOM state even in uncontrolled use.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, className, disabled, id, ...props }, forwardedRef) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;
    const internalRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "inline-flex items-center gap-2 text-body-sm text-neutral-default",
          disabled ? "cursor-not-allowed text-neutral-disabled" : "cursor-pointer",
        )}
      >
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={(node) => {
              (internalRef as { current: HTMLInputElement | null }).current = node;
              if (typeof forwardedRef === "function") forwardedRef(node);
              else if (forwardedRef) (forwardedRef as { current: HTMLInputElement | null }).current = node;
            }}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              // `compact` and not `control`: at 16 px a side, an 8 px radius
              // is half the side — a circle. The square is what tells the
              // user, before reading anything, that more than one option can
              // be picked; a radio is the round one.
              "pointer-events-none absolute inset-0 rounded-compact border-default border-neutral-bold bg-neutral-default",
              "peer-checked:border-brand-default peer-checked:bg-brand-bold",
              "peer-indeterminate:border-brand-default peer-indeterminate:bg-brand-bold",
              "peer-focus-visible:ring-focus peer-focus-visible:ring-neutral-focus-ring",
              "peer-disabled:border-neutral-disabled peer-disabled:bg-neutral-disabled",
              className,
            )}
          />
          <Icon
            name="check"
            size={16}
            className="pointer-events-none absolute inset-0 text-neutral-inverse opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden items-center justify-center peer-indeterminate:flex"
          >
            <span className="h-0.5 w-2 rounded-control bg-neutral-inverse" />
          </span>
        </span>
        {label}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
