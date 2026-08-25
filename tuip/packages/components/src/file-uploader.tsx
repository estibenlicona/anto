import { ChangeEvent, DragEvent, ReactNode, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { Progress } from "./progress";

export interface FileUploaderItem {
  /** Stable id for this row — used for removal and React's list key, independent of the file's own name. */
  id: string;
  file: File;
  /** Drives the row's icon, color and whether a progress bar shows — a single source of truth, not separate flags that could disagree. */
  status: "uploading" | "success" | "error";
  /** Shown as a `Progress` bar while `status` is "uploading". */
  progress?: number;
  /** Shown next to the row while `status` is "error", without affecting any other row. */
  errorMessage?: string;
}

export interface FileUploaderProps {
  /** Visible label rendered above the field and associated with it for assistive technology. */
  label?: string;
  /** Error message shown below the field. Setting it also marks the field as invalid. */
  error?: string;
  /** The files and their per-row state. Controlled by the consumer — FileUploader never fabricates a status on its own. */
  files: FileUploaderItem[];
  /** Called with every newly dropped or picked file, added or not yet added to `files` — the consumer decides. */
  onFilesAdded: (files: File[]) => void;
  /** Called when a row's remove button is activated. */
  onFileRemove?: (id: string) => void;
  /** Passed through to the native input's `accept` attribute. */
  accept?: string;
  /** Disables the field and excludes it from tab order. */
  disabled?: boolean;
  /** Additional classes merged onto the drop zone. */
  className?: string;
  /** Id applied to the field and referenced by `label`'s association. Generated when omitted. */
  id?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Same drag-and-drop-over-a-real-input mechanism as `FileInput` — see its
 * doc comment — but every file dropped or picked is passed to `onFilesAdded`,
 * not just the first.
 */
export function FileUploader({
  label,
  error,
  files,
  onFilesAdded,
  onFileRemove,
  accept,
  disabled,
  className,
  id,
}: FileUploaderProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const [dragActive, setDragActive] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) onFilesAdded(Array.from(event.target.files));
    // Reset so picking the same file(s) again still fires a change event.
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    if (disabled) return;
    if (event.dataTransfer.files?.length) onFilesAdded(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span id={`${fieldId}-label`} className="text-body-sm font-medium text-neutral-default">
          {label}
        </span>
      )}
      {/* Input precedes the label as a sibling — see FileInput for why. */}
      <input
        type="file"
        id={fieldId}
        multiple
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
          // Mutually exclusive border-color classes — see file-input.tsx for why.
          dragActive ? "border-brand-default bg-brand-subtle" : error ? "border-danger-default" : "border-neutral-default",
          disabled && "cursor-not-allowed bg-neutral-disabled",
          className,
        )}
      >
        <Icon name="import" size={24} className="text-neutral-subtle" />
        <span className="text-body-sm text-neutral-subtle">Arrastrá archivos o hacé clic para elegir</span>
      </label>
      {files.length > 0 && (
        <ul aria-live="polite" className="flex flex-col gap-2">
          {files.map((item) => (
            <FileUploaderRow key={item.id} item={item} onRemove={onFileRemove ? () => onFileRemove(item.id) : undefined} />
          ))}
        </ul>
      )}
      {error && (
        <p id={errorId} className="text-body-sm text-danger-default">
          {error}
        </p>
      )}
    </div>
  );
}

FileUploader.displayName = "FileUploader";

export interface FileUploaderRowProps {
  item: FileUploaderItem;
  onRemove?: () => void;
}

export function FileUploaderRow({ item, onRemove }: FileUploaderRowProps) {
  const { file, status, progress, errorMessage } = item;

  let statusContent: ReactNode = null;
  if (status === "uploading") {
    statusContent = <Progress value={progress ?? 0} label={`Subiendo ${file.name}`} className="mt-1.5" />;
  } else if (status === "success") {
    statusContent = <Icon name="check" size={16} className="shrink-0 text-success-default" />;
  } else if (status === "error") {
    statusContent = <Icon name="status-error" size={16} className="shrink-0 text-danger-default" />;
  }

  return (
    <li className="flex items-start gap-2 rounded-control border-default border-neutral-default px-3 py-2">
      <Icon name="attach-doc" size={20} className="mt-0.5 shrink-0 text-neutral-subtle" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-body-sm text-neutral-default">{file.name}</span>
          <span className="shrink-0 text-body-sm text-neutral-subtle">{formatBytes(file.size)}</span>
          {status !== "uploading" && statusContent}
        </div>
        {status === "uploading" && statusContent}
        {status === "error" && errorMessage && <p className="mt-0.5 text-body-sm text-danger-default">{errorMessage}</p>}
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={`Quitar ${file.name}`}
          onClick={onRemove}
          className="shrink-0 text-neutral-subtle hover:text-neutral-default"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </li>
  );
}
