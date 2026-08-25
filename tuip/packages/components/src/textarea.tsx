import { ReactNode, TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import {
  FieldHint,
  FieldLabel,
  fieldFocusRingClasses,
  fieldStateClasses,
  useFieldDescription,
} from "./field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** Guidance shown below the field while there is no error. */
  hint?: ReactNode;
  /** Same contract as Input: the asterisk and `aria-required`, never the native `required`. */
  required?: boolean;
  /** Initial height, in lines. Defaults to 3. */
  rows?: number;
  /**
   * Whether the reader can drag the field taller. Only ever vertical: a field
   * that grows sideways breaks the column it sits in. `none` for a fixed box.
   */
  resize?: "vertical" | "none";
}

/**
 * The multi-line pair of Input: same label, hint, error and focus treatment,
 * from the same shared pieces, so a form mixing both reads as one control
 * family. Grows only downward, and only if the consumer allows it.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, required, rows = 3, resize = "vertical", className, disabled, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const { errorId, hintId, describedBy } = useFieldDescription(fieldId, error, hint);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <FieldLabel htmlFor={fieldId} required={required}>
            {label}
          </FieldLabel>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full min-w-0 rounded-control border-default bg-neutral-default px-3 py-2 text-body-sm text-neutral-default",
            "disabled:cursor-not-allowed disabled:bg-neutral-disabled disabled:text-neutral-disabled",
            resize === "vertical" ? "resize-y" : "resize-none",
            fieldStateClasses(Boolean(error)),
            fieldFocusRingClasses(Boolean(error)),
            className,
          )}
          {...props}
        />
        <FieldHint error={error} hint={hint} errorId={errorId} hintId={hintId} />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
