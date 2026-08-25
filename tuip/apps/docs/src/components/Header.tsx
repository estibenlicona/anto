import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@tuya-ui/components";
import reactPackage from "@tuya-ui/components/package.json";
import { SearchDialog } from "./SearchDialog";
import { firstComponentPath } from "../data/navigation";

/**
 * The areas a reader jumps between often enough to deserve a permanent link.
 * Each points at the first page of its area — there is no landing page above
 * them to aim at.
 */
const GLOBAL_LINKS = [
  { label: "Fundamentos", to: "/fundamentos/tipografia", area: "/fundamentos" },
  { label: "Componentes", to: firstComponentPath(), area: "/components" },
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center gap-6 border-b border-neutral-default bg-neutral-default/90 px-6 backdrop-blur">
      <Link to="/" className="flex flex-shrink-0 items-center gap-2.5">
        <span
          aria-hidden
          className="flex h-[26px] w-[26px] items-center justify-center rounded-control bg-brand-bold text-body-sm font-semibold text-neutral-inverse"
        >
          t
        </span>
        <span className="text-body font-semibold tracking-tight text-neutral-default">
          Tuip
        </span>
        <span className="rounded-control border border-neutral-default px-1.5 py-px font-mono text-label text-neutral-subtle">
          v{reactPackage.version}
        </span>
      </Link>

      {/* A field rather than a button: the search is the header's main affordance,
          and its shortcut has to be readable without opening anything. */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-[34px] min-w-0 max-w-[420px] flex-1 items-center gap-2.5 rounded-control border border-neutral-default px-3 text-body-sm text-neutral-subtle hover:border-neutral-bold"
      >
        <SearchIcon />
        <span className="truncate">Buscar componentes, tokens, guías…</span>
        <kbd className="ml-auto rounded-control border border-neutral-default px-1.5 font-mono text-label">
          ⌘K
        </kbd>
      </button>

      <nav aria-label="Navegación global" className="ml-auto flex items-center gap-5 text-body-sm">
        {GLOBAL_LINKS.map((link) => {
          // The link aims at one page but stands for a whole area, so it reads
          // as current anywhere inside that area, not only on its target.
          const isActive = pathname.startsWith(link.area);
          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "hover:text-brand-default",
                isActive ? "text-brand-default" : "text-neutral-default",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}
