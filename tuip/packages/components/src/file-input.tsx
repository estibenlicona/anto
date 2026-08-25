import { ChangeEvent, DragEvent, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export interface FileInputProps {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /**
   * The selected file, or `null` when empty. Always controlled — unlike
   * `DateField` or `Combobox`, a `File` can't be assigned to an input by
   * script, so there is no meaningful uncontrolled `defaultValue`.
   */
  value: File | null;
  /** Called with the new file on selection, or `null` when removed. */
  onValueChange: (file: File | null) => void;
  /** Passed through to the native input's `accept` attribute. */
  accept?: string;
  /** Disables the field and excludes it from tab order. */
  disabled?: boolean;
  /** Additional classes merged onto the drop zone. */
  className?: string;
  /** Id applied to the field and referenced by `label`'s `htmlFor`. Generated when omitted. */
  id?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Dragging a file on is a convenience layered on top of a real
 * `<input type="file">` — visually hidden but never `display:none`, so it
 * stays focusable and in the tab order. Clicking the zone, or reaching it by
 * Tab and pressing Enter or Space, opens the OS file picker: behavior the
 * browser already resolves for a real file input, with no keyboard handling
 * of our own.
 */
export function FileInput({
  label,
  error,
  value,
  onValueChange,
  accept,
  disabled,
  className,
  id,
}: FileInputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const [dragActive, setDragActive] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.target.files?.[0] ?? null);
    // Reset so choosing the same file again still fires a change event.
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    if (disabled) return;
    // Only the first file is kept when several are dropped on a single-file
    // field — more forgiving than rejecting the whole drop with an error.
    const file = event.dataTransfer.files?.[0];
    if (file) onValueChange(file);
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span id={`${fieldId}-label`} className="text-body-sm font-medium text-neutral-default">
          {label}
        </span>
      )}
      {/*
        The input is a sibling that precedes the label, not nested inside it —
        `peer`/`peer-focus-visible:` only works between siblings in DOM order.
        The `htmlFor`/`id` pair alone is enough for a click anywhere on the
        label's non-interactive content to open the native picker; nesting
        isn't required for that.
      */}
      <input
        type="file"
        id={fieldId}
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        aria-labelledby={label ? `${fieldId}-label` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className="peer sr-only"
      />
      <label
        htmlFor={fieldId}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-control border-default border-dashed px-4 py-6 text-center",
          "peer-focus-visible:outline-none peer-focus-visible:ring-focus peer-focus-visible:ring-neutral-focus-ring",
          // Border color classes are mutually exclusive, never layered: two
          // classes setting the same CSS property at equal specificity race
          // on Tailwind's generated rule order, not on which was applied
          // last — the same bug already found and fixed once this session
          // for Switch's disabled+checked state.
          dragActive ? "border-brand-default bg-brand-subtle" : error ? "border-danger-default" : "border-neutral-default",
          disabled && "cursor-not-allowed bg-neutral-disabled",
          className,
        )}
      >
        {value ? (
          <div className="flex w-full items-center gap-2 text-left">
            <Icon name="attach-doc" size={20} className="shrink-0 text-neutral-subtle" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-body-sm text-neutral-default">{value.name}</div>
              <div className="text-body-sm text-neutral-subtle">{formatBytes(value.size)}</div>
            </div>
            <button
              type="button"
              aria-label="Quitar archivo"
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault();
                onValueChange(null);
              }}
              className="shrink-0 text-neutral-subtle hover:text-neutral-default"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        ) : (
          <>
            <Icon name="import" size={24} className="text-neutral-subtle" />
            <span className="text-body-sm text-neutral-subtle">Arrastrá un archivo o hacé clic para elegir</span>
          </>
        )}
      </label>
      {error && (
        <p id={errorId} className="text-body-sm text-danger-default">
          {error}
        </p>
      )}
    </div>
  );
}

FileInput.displayName = "FileInput";
