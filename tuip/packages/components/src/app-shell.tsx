import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { Sidebar, type SidebarDensity, type SidebarNavGroup } from "./sidebar";
import {
  NavbarSearch,
  NavbarUtilities,
  type NavbarNotification,
  type NavbarUser,
  type NavbarUserMenuAction,
  type NavbarUtilityLink,
} from "./navbar";

export interface AppShellProps {
  /** The app's name, shown as text next to the brand mark in the sidebar header — never an image. */
  product: string;
  /** Sidebar navigation groups and items — the same shape Sidebar takes standalone. */
  groups: SidebarNavGroup[];
  /** The currently active item's id, owned by the app's own router. */
  activeId: string;
  /** Called before navigating, with the item's id and href. */
  onNavigate: (id: string, href: string) => void;
  /** The signed-in person: name, role and initials. */
  user: NavbarUser;
  /** Actions in the account panel — every product needs at least a way to sign out. */
  userMenu: NavbarUserMenuAction[];
  /** Utility links on the bar's right, e.g. "Ayuda". Defaults to a single "Ayuda" link. */
  utilities?: NavbarUtilityLink[];
  /** Pending notifications. Defaults to `[]`. */
  notifications?: NavbarNotification[];
  /** Opens the app's own command palette. Without a handler, the search box isn't rendered at all. */
  onSearch?: () => void;
  /** Called when "Marcar leídas" is activated. Without a handler, that action isn't shown. */
  onMarkAllNotificationsRead?: () => void;
  /** Called when "Ver todas" is activated. Without a handler, that action isn't shown. */
  onViewAllNotifications?: () => void;
  /** Intercepts utility-link activation for the app's own router. */
  onNavbarNavigate?: (href: string) => void;
  /**
   * Arranca colapsado sin esperar a la preferencia guardada. Cuando se pasa,
   * manda sobre la clave persistida en el primer render; el toggle sigue
   * escribiendo la preferencia como siempre.
   */
  defaultCollapsed?: boolean;
  /** Item height of the sidebar navigation. Defaults to `"comfortable"`. */
  density?: SidebarDensity;
  /** Optional zone below the sidebar's nav content — build version, a support link. */
  sidebarFooter?: ReactNode;
  /** Accessible label for the sidebar navigation landmark. */
  ariaLabel?: string;
  /** Additional classes merged onto the shell's root. */
  className?: string;
  /** The app's content column: breadcrumb strip, main, whatever the app composes. */
  children: ReactNode;
}

/**
 * Contrato compartido con `sidebar.tsx`, a propósito: es la misma preferencia
 * de la misma persona, y las dos piezas nunca conviven en una vista (AppShell
 * usa Sidebar controlado, que no persiste por su cuenta). Compartir la clave
 * hace que migrar una app de Sidebar suelto a AppShell conserve el estado que
 * la persona ya eligió. Si el formato de esta clave cambia, cambia en ambos.
 */
const STORAGE_KEY = "tuya-ui:sidebar-collapsed";

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
    // Storage deshabilitado — el colapso funciona esta sesión, sin recordarse.
  }
}

const defaultUtilities: NavbarUtilityLink[] = [{ label: "Ayuda" }];

type ShellPanel = "notifications" | "account";

/**
 * La fusión de Navbar y Sidebar: el sidebar a toda altura con la marca en su
 * cabecera, la barra al lado con la hamburguesa como primer elemento, y el
 * contenido como hijos. Composición pura sobre las piezas existentes —
 * Sidebar controlado (sin su franja de colapso), NavbarSearch y
 * NavbarUtilities — sin cambiarles el contrato a ninguna.
 *
 * El shell nace claro (variant "light" hacia las piezas de la barra): la
 * variante oscura se suma cuando exista el primer producto que la pida, igual
 * que decidió Link con sus tonos.
 */
export function AppShell({
  product,
  groups,
  activeId,
  onNavigate,
  user,
  userMenu,
  utilities = defaultUtilities,
  notifications = [],
  onSearch,
  onMarkAllNotificationsRead,
  onViewAllNotifications,
  onNavbarNavigate,
  defaultCollapsed,
  density = "comfortable",
  sidebarFooter,
  ariaLabel,
  className,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(
    () => defaultCollapsed ?? readPersistedCollapsed(),
  );
  // El mismo slot único de paneles que orquesta Navbar: a lo sumo uno abierto
  // entre notificaciones y cuenta. Se hereda también la limitación documentada
  // de Radix — pasar de un panel al otro toma dos activaciones.
  const [openPanel, setOpenPanel] = useState<ShellPanel | null>(null);

  // Auto-colapso bajo 1120px, con la técnica de Sidebar: reacciona al cruce
  // (evento `change`), no a un chequeo continuo, así re-expandir con la
  // hamburguesa no es peleado por el siguiente render. El guard de
  // `matchMedia` cubre SSR y jsdom.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(max-width: 1119px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setCollapsed(true);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    writePersistedCollapsed(next);
  }

  function panelProps(panel: ShellPanel) {
    return {
      open: openPanel === panel,
      onOpenChange: (open: boolean) => setOpenPanel(open ? panel : null),
    };
  }

  return (
    <div className={cn("flex min-h-screen", className)}>
      <aside className="sticky top-0 z-navigation flex h-screen shrink-0 flex-col">
        {/* Misma altura que la barra (h-14) y mismo filete: la línea corre
            continua de borde a borde. La anatomía de la marca está copiada de
            NavbarBrand (cuadro 24px bg-brand-bold + producto body-sm
            semibold) — ver el comentario espejo allá; NavbarBrand no tiene
            modo sólo-cuadro y dárselo acoplaría un estado que suelto no
            necesita. */}
        <div
          className={cn(
            "flex h-14 w-full shrink-0 items-center gap-2.5 border-b-default border-r-default border-neutral-default bg-neutral-default",
            collapsed ? "justify-center" : "px-4",
          )}
        >
          <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-control bg-brand-bold" />
          {!collapsed && (
            <span className="truncate text-body-sm font-semibold text-neutral-default">{product}</span>
          )}
        </div>
        <Sidebar
          groups={groups}
          activeId={activeId}
          onNavigate={onNavigate}
          collapsed={collapsed}
          collapsible={false}
          density={density}
          footer={sidebarFooter}
          ariaLabel={ariaLabel}
          className="min-h-0 flex-1"
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "sticky top-0 z-navigation flex h-14 shrink-0 items-center gap-3",
            "border-b-default border-neutral-default bg-neutral-default pl-2.5 pr-5",
          )}
        >
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir la navegación" : "Contraer la navegación"}
            aria-expanded={!collapsed}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-neutral-subtle outline-none",
              "hover:bg-neutral-subtle-hover focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
            )}
          >
            <Icon name="menu" size={20} />
          </button>
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-neutral-subtle-pressed" />
          <NavbarSearch onSearch={onSearch} variant="light" />
          <div className="min-w-0 flex-1" />
          <NavbarUtilities
            utilities={utilities}
            notifications={notifications}
            user={user}
            userMenu={userMenu}
            variant="light"
            onNavigate={onNavbarNavigate}
            onMarkAllNotificationsRead={onMarkAllNotificationsRead}
            onViewAllNotifications={onViewAllNotifications}
            notificationsOpen={panelProps("notifications").open}
            onNotificationsOpenChange={panelProps("notifications").onOpenChange}
            accountOpen={panelProps("account").open}
            onAccountOpenChange={panelProps("account").onOpenChange}
          />
        </header>
        {children}
      </div>
    </div>
  );
}

AppShell.displayName = "AppShell";
