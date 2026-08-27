import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "@tuya-ui/components";
import { findComponent } from "../data/registry";
import { navigationOrder } from "../data/navigation";

interface SearchEntry {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  to: string;
}

/**
 * The index is the navigation, flattened: a page reachable from the sidebar is
 * findable, and one that is not cannot be missed here.
 */
function buildEntries(): SearchEntry[] {
  return navigationOrder().map(({ section, item }) => {
    // A component entry also matches on its description, which the nav does not
    // carry. Looked up by the route's last segment, which is the registry's own
    // identifier — the label is the display form and no longer matches it.
    const componentName = item.to.startsWith("/components/")
      ? item.to.slice("/components/".length)
      : undefined;
    const component = componentName ? findComponent(componentName) : undefined;
    return {
      id: item.to,
      label: item.label,
      hint: section.label,
      keywords: [item.label, section.label, component?.description ?? "", component?.category ?? ""]
        .join(" ")
        .toLowerCase(),
      to: item.to,
    };
  });
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const navigate = useNavigate();

  const entries = useMemo(buildEntries, []);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((entry) => entry.keywords.toLowerCase().includes(term));
  }, [entries, query]);

  // `showModal` is what gives us the focus trap, the backdrop, Escape-to-close
  // and focus restoration to the trigger — none of which we hand-roll here.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setQuery("");
      setHighlighted(0);
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function go(entry: SearchEntry) {
    navigate(entry.to);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) =>
        results.length === 0 ? 0 : (index - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[highlighted];
      if (entry) go(entry);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      // Escape triggers the dialog's own close event; keep React state in sync.
      onClose={onClose}
      aria-label="Buscar en la documentación"
      // El mismo overlay que ya usan Modal, Drawer y CommandPalette.
      className="w-full max-w-lg rounded-surface border border-neutral-default bg-neutral-default p-0 text-neutral-default backdrop:bg-neutral-scrim"
    >
      <div className="border-b border-neutral-default p-3">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlighted(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar componentes y secciones…"
          aria-label="Término de búsqueda"
          className="w-full rounded-control bg-neutral-default px-3 py-2 text-body-sm text-neutral-default placeholder:text-neutral-subtle focus-visible:outline-none"
        />
      </div>

      {results.length === 0 ? (
        <p className="px-4 py-8 text-center text-body-sm text-neutral-subtle">
          No hay resultados para “{query}”.
        </p>
      ) : (
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.map((entry, index) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => go(entry)}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-body-sm",
                  index === highlighted
                    ? "bg-neutral-selected text-neutral-default"
                    : "text-neutral-subtle",
                )}
              >
                <span>{entry.label}</span>
                <span className="text-body-sm text-neutral-subtle">{entry.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  );
}
