import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useCollapsedNavigation } from "@/lib/use-collapsed-navigation";
import { Sidebar, type SidebarDensity, type SidebarNavGroup } from "./sidebar";

export interface ModuleShellProps {
  /** Sidebar navigation groups and items — the same shape Sidebar takes standalone. */
  groups: SidebarNavGroup[];
  /** The currently active item's id, owned by the module's own router. */
  activeId: string;
  /** Called before navigating, with the item's id and href. */
  onNavigate: (id: string, href: string) => void;
  /**
   * Arranca colapsado sin esperar a la preferencia guardada. Cuando se pasa,
   * manda sobre la clave persistida en el primer render; el control de colapso
   * sigue escribiendo la preferencia como siempre.
   */
  defaultCollapsed?: boolean;
  /** Item height of the sidebar navigation. Defaults to `"comfortable"`. */
  density?: SidebarDensity;
  /** Optional zone below the sidebar's nav content and above the collapse control — build version, a support link. */
  sidebarFooter?: ReactNode;
  /** Accessible label for the sidebar navigation landmark — pass the module's name (e.g. "Navegación de Capacidad"): it is the only place the column names the module, since the host's bar owns the visible title. */
  ariaLabel?: string;
  /**
   * Height, in px, of the host's bar this column sits under. The column
   * sticks right below that bar and its height discounts it, so the module's
   * navigation never hides behind the host's chrome. Defaults to `0`: the
   * column takes the full viewport, exactly like AppShell's.
   */
  topOffset?: number;
  /** Additional classes merged onto the shell's root. */
  className?: string;
  /** The module's content column: breadcrumb strip, main, whatever the module composes. */
  children: ReactNode;
}

/**
 * La mitad "módulo" de AppShell: la columna lateral a toda la altura
 * disponible y el contenido como hijos. Sin barra superior propia — esa es
 * del host que aloja al módulo (Navbar), y esta pieza se apoya debajo — y
 * **sin cabecera de marca**: el título visible lo pone la barra del host, y
 * una segunda marca en la columna lo duplicaba a menor tamaño. La columna
 * empieza directamente por la navegación.
 *
 * Sin barra no hay hamburguesa: el control de colapso es la franja al pie
 * que Sidebar ya trae suelto — de borde a borde, con su chevron y su rótulo —
 * y acá se usa en modo controlado para que el estado lo gobierne el shell:
 * misma clave persistida y mismo umbral de auto-colapso que AppShell
 * (`useCollapsedNavigation`). Composición pura, sin cambiarle el contrato a
 * Sidebar. Nace claro, como AppShell.
 *
 * El desplazamiento superior viaja como variable CSS que fija el propio
 * componente desde `topOffset` — no una que el host tenga que conocer — para
 * que `top` y `height` de la columna salgan de un solo número.
 */
export function ModuleShell({
  groups,
  activeId,
  onNavigate,
  defaultCollapsed,
  density = "comfortable",
  sidebarFooter,
  ariaLabel,
  topOffset = 0,
  className,
  children,
}: ModuleShellProps) {
  const { collapsed, toggle } = useCollapsedNavigation(defaultCollapsed);
  const offsetStyle = { "--tuya-ui-shell-top": `${topOffset}px` } as CSSProperties;

  return (
    <div
      className={cn("flex min-h-[calc(100vh-var(--tuya-ui-shell-top))]", className)}
      style={offsetStyle}
    >
      <aside className="sticky top-[var(--tuya-ui-shell-top)] z-navigation flex h-[calc(100vh-var(--tuya-ui-shell-top))] shrink-0 flex-col">
        <Sidebar
          groups={groups}
          activeId={activeId}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onCollapsedChange={toggle}
          density={density}
          footer={sidebarFooter}
          ariaLabel={ariaLabel}
          className="min-h-0 flex-1"
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

ModuleShell.displayName = "ModuleShell";
