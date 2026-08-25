import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { Tooltip } from "./tooltip";

export interface SidebarNavItem {
  id: string;
  label: string;
  /** Rendered in a fixed 20×20px box — size and style are the consumer's own icon choice, Sidebar only provides the slot. */
  icon: ReactNode;
  href: string;
  /** Pending-work count for this person, e.g. requests awaiting their approval. Omit — never `0` — when nothing is pending. Displays as "99+" past 99. */
  badge?: number;
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

export type SidebarDensity = "comfortable" | "compact";

export interface SidebarProps {
  /** Groups and their items. At most two groups, at most seven items each — Sidebar doesn't enforce it, but the definition caps it there. */
  groups: SidebarNavGroup[];
  /** The currently active item's id, owned by the app's own router — Sidebar never infers it from position or anything else. */
  activeId: string;
  /** Called before navigating, with the item's id and href — lets the app intercept (e.g. unsaved changes) before its router acts on it. */
  onNavigate: (id: string, href: string) => void;
  /** Shows the collapse control at the bottom. Defaults to `true`. */
  collapsible?: boolean;
  /** Controls the collapsed state from outside. Without it, Sidebar manages its own state and persists it across sessions. */
  collapsed?: boolean;
  /** Called on every collapse/expand, in both controlled and uncontrolled mode. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Item height: 36px or 32px. Defaults to `"comfortable"`. */
  density?: SidebarDensity;
  /** Optional zone below the nav content — build version, a support link. */
  footer?: ReactNode;
  /** Accessible label for the navigation landmark. Defaults to a generic label — pass a more specific one (e.g. "Navegación de Capacidad") when the app shell knows its own product name. */
  ariaLabel?: string;
  /** Additional classes merged onto the root. */
  className?: string;
}

// Contrato compartido con app-shell.tsx: AppShell persiste el mismo estado
// bajo esta misma clave (ver el comentario allá). Si el formato cambia,
// cambia en ambos.
const STORAGE_KEY = "tuya-ui:sidebar-collapsed";

/**
 * No `localStorage` precedent existed anywhere in this package before this
 * component — both the SSR guard and the `try/catch` (private browsing and
 * disabled storage throw in some browsers) are deliberate, not boilerplate
 * copied from elsewhere.
 */
function readPersistedCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writePersistedCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage disabled — collapsing still works this session, it just won't be remembered.
  }
}

/**
 * Below 1120px, Sidebar collapses on its own — but only when nothing outside
 * already controls it. Reacts to the `matchMedia` `change` event (an actual
 * crossing), not a continuous check, so manually re-expanding afterward
 * isn't fought by the next render — same technique as Navbar's own
 * `useNarrowViewport`.
 */
function useAutoCollapse(enabled: boolean, onCross: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const mql = window.matchMedia("(max-width: 1119px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) onCross();
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [enabled]);
}

function formatBadge(count: number): string {
  return count > 99 ? "99+" : String(count);
}

/**
 * One level, grouped, with the active item marked by three signals at
 * once — a rail, a background and a text weight, never color alone. A
 * single piece, data-driven via `groups`, the same shape Navbar already
 * established rather than a compound family.
 */
export function Sidebar({
  groups,
  activeId,
  onNavigate,
  collapsible = true,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  density = "comfortable",
  footer,
  ariaLabel = "Navegación principal",
  className,
}: SidebarProps) {
  const isControlled = controlledCollapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(readPersistedCollapsed);
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  function setCollapsed(next: boolean) {
    if (!isControlled) {
      setInternalCollapsed(next);
      writePersistedCollapsed(next);
    }
    onCollapsedChange?.(next);
  }

  useAutoCollapse(!isControlled, () => setCollapsed(true));

  // La franja de colapso mide lo que medía antes: el alto de un ítem más los
  // 20px que ponía el relleno de su contenedor. Ahora que el botón es la
  // franja, ese alto va acá, de modo que mudar el relleno hacia adentro no
  // corra nada de lo que está encima.
  const collapseHeight = density === "compact" ? "h-[52px]" : "h-14";

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        // Misma superficie que la barra superior en su variante clara, a
        // propósito: es lo que hace que el shell se lea como una sola pieza en
        // vez de dos zonas con criterios distintos. No reemplazar por un blanco
        // propio — la coincidencia tiene que ser el mismo token, o el próximo
        // cambio la rompe sin que nadie lo note. El lienzo de la página queda
        // en `subtlest`, y de esa diferencia sale el segundo plano.
        "flex shrink-0 flex-col border-r-default border-neutral-default bg-neutral-default pt-3.5",
        // 248px/64px are the mockup's own fixed anatomy — no alias on the
        // spacing scale covers either, so both are arbitrary values rather
        // than a token substitution.
        collapsed ? "w-[64px]" : "w-[248px]",
        className,
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto">
        {groups.map((group, groupIndex) => (
          <SidebarGroup
            key={groupIndex}
            groupIndex={groupIndex}
            label={group.label}
            items={group.items}
            activeId={activeId}
            collapsed={collapsed}
            density={density}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {footer && <div className="border-t-default border-neutral-default px-2.5 py-2.5">{footer}</div>}

      {collapsible && (
        // El separador delimita una franja de ancho completo, así que el botón
        // *es* la franja: `w-full` y el relleno que antes tenía este contenedor
        // mudado adentro, para que el alto no cambie pero toda la zona
        // responda. Antes el botón era `flex` sin ancho propio y se encogía a
        // su contenido, de modo que la mitad derecha de una zona que se ve
        // como una sola no recibía ni clic ni hover.
        <div className="border-t-default border-neutral-default">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              // `px-6` (24px) de una sola vez, igual que el rótulo de grupo:
              // al ocupar la franja entera no hay contenedor que aporte parte
              // del inset, así que su distancia al borde es un número solo. Los
              // ítems llegan a esos mismos 24px por composición —el `px-3` del
              // `ul`, su borde de 2px y su `px-2.5`— porque ellos sí van
              // embutidos y reservan el indicador de activo.
              "flex w-full items-center gap-3 px-6 text-body-sm text-neutral-subtle outline-none",
              collapseHeight,
              // Sin `rounded-control`, a diferencia de los ítems: ellos flotan
              // embutidos dentro de la columna, y esta franja llega a los dos
              // bordes — redondearla la dejaría como un rectángulo mal
              // encajado dentro del área que el separador delimita.
              "hover:bg-neutral-subtle-hover focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
            )}
          >
            <Icon name="chevron-right" size={20} className={cn("shrink-0", !collapsed && "rotate-180")} />
            <span className={cn(collapsed && "sr-only")}>{collapsed ? "Expandir" : "Colapsar"}</span>
          </button>
        </div>
      )}
    </nav>
  );
}

Sidebar.displayName = "Sidebar";

export interface SidebarItemProps extends SidebarNavItem {
  active?: boolean;
  collapsed?: boolean;
  density?: SidebarDensity;
  onNavigate: (id: string, href: string) => void;
}

export function SidebarItem({
  id,
  label,
  icon,
  href,
  badge,
  active,
  collapsed,
  density = "comfortable",
  onNavigate,
}: SidebarItemProps) {
  const itemHeight = density === "compact" ? "h-8" : "h-9";
  const hasBadge = badge !== undefined && badge > 0;
  const accessibleLabel = hasBadge ? `${label}, ${badge} pendientes` : label;

  const link = (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={accessibleLabel}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(id, href);
      }}
      className={cn(
        "flex items-center gap-3 rounded-control border-l-bold px-2.5 text-body-sm outline-none",
        "focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        itemHeight,
        // El fondo del activo NO puede ser `default`: ese es el color de la
        // propia barra, y un fondo que iguala a su superficie deja de ser una
        // señal. `selected` es el paso que el sistema reserva para selección y
        // fila activa, y acompaña al riel de marca en vez de competirle.
        //
        // Se distingue del hover de un inactivo por tono y no por claridad, que
        // es lo que mantiene activo, hover y reposo como tres estados: entre
        // `subtle-hover` y cualquier gris claro la diferencia sería de un paso.
        active
          ? "border-l-brand-default bg-neutral-selected font-semibold text-neutral-default hover:opacity-80"
          : "border-l-transparent text-neutral-subtle hover:bg-neutral-subtle-hover",
      )}
    >
      <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      {hasBadge && (
        <span
          aria-hidden="true"
          className={cn(
            "ml-auto shrink-0 rounded-pill bg-brand-bold px-1.5 text-body-sm text-brand-on-bold",
            collapsed && "sr-only",
          )}
        >
          {formatBadge(badge as number)}
        </span>
      )}
    </a>
  );

  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

SidebarItem.displayName = "SidebarItem";

export interface SidebarGroupProps extends SidebarNavGroup {
  activeId: string;
  collapsed?: boolean;
  density?: SidebarDensity;
  onNavigate: (id: string, href: string) => void;
  /** Stable across the sidebar's own groups array — used for the group heading's `id`. */
  groupIndex: number;
}

export function SidebarGroup({ label, items, activeId, collapsed, density, onNavigate, groupIndex }: SidebarGroupProps) {
  const groupHeadingId = `sidebar-group-${groupIndex}`;
  return (
    <div className="mb-5">
      {/* `px-6` (24px) de una sola vez, contra el `px-3` del `ul` de abajo: el
          rótulo no es interactivo, así que no tiene rectángulo de hover que
          embutir ni indicador de activo que reservar. Los ítems llegan a esos
          mismos 24px sumando el relleno del `ul`, su borde de 2px y el suyo
          propio; acá esa distancia es un único número. La diferencia entre los
          dos valores es esa, no un descuido. */}
      <div
        id={groupHeadingId}
        className={cn("px-6 pb-2 text-label uppercase text-neutral-subtlest", collapsed && "sr-only")}
      >
        {label}
      </div>
      <ul aria-labelledby={groupHeadingId} className="flex flex-col gap-0.5 px-3">
        {items.map((item) => (
          <li key={item.id}>
            <SidebarItem
              {...item}
              active={item.id === activeId}
              collapsed={collapsed}
              density={density}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

SidebarGroup.displayName = "SidebarGroup";

