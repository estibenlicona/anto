import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@features/authentication/index";
import { getModuleBasePath, modulePath } from "@shared/services/modulePath";
import { filterNav } from "@features/auth-session";
import { useDedicationAttentionCount } from "@features/dedication/hooks/useDedicationAttentionCount";
import {
  Breadcrumb,
  Icon,
  ModuleShell,
  ToastProvider,
  type SidebarNavGroup,
} from "@tuya-ui/components";
import {
  capacityNavGroups,
  capacityRouteTitles,
  resolveCapacityNavId,
} from "@features/capacity-shell/navigation";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";

/**
 * El shell del módulo: sidebar único filtrado por permisos, sin barra
 * superior propia — la única barra es la del host, y `ModuleShell` de tuip
 * ubica esta columna debajo de ella con `topOffset`.
 *
 * El breadcrumb, que en la app standalone vivía en la topbar, pasa al
 * encabezado del contenido. Reusa el provider del shell del lead (hooks que
 * ya consumen todas las pantallas de detalle) sin renombrarlo: el mecanismo
 * es del módulo entero desde este change.
 */
const CapacityBreadcrumb: React.FC<{ activeId: string }> = ({ activeId }) => {
  const { trailing } = useLeadBreadcrumb();
  const pageTitle = capacityRouteTitles[activeId];
  // Como todo enlace interno, por modulePath(): la base ya viene normalizada
  // (sin barra final, raíz "/" contemplada) y no hay que limpiar nada a mano.
  const parentHref = modulePath(capacityNavHref(activeId));
  return (
    <Breadcrumb
      items={
        trailing
          ? [
              { label: "Gestión de Capacidad", href: modulePath() },
              { label: pageTitle, href: parentHref },
              { label: trailing },
            ]
          : [
              { label: "Gestión de Capacidad", href: modulePath() },
              { label: pageTitle },
            ]
      }
    />
  );
};

const CapacityBreadcrumbActions: React.FC = () => {
  const { actions } = useLeadBreadcrumb();
  if (!actions) return null;
  return <div className="flex shrink-0 items-center gap-2">{actions}</div>;
};

function capacityNavHref(id: string): string {
  for (const group of capacityNavGroups) {
    const item = group.items.find((entry) => entry.id === id);
    if (item) return item.href;
  }
  return "";
}

export interface CapacityShellProps {
  basePath: string;
  topOffset: number;
}

// `basePath` sigue en el contrato del shell (lo entrega el módulo), pero los
// enlaces salen del registro normalizado de modulePath, no de la prop cruda.
export const CapacityShell: React.FC<CapacityShellProps> = ({ topOffset }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // La base normalizada del registro, no la prop cruda: con "/capacidad/" o
  // "/" la prop haría fallar el prefijo y el menú marcaría mal la entrada.
  const base = getModuleBasePath();
  const relative =
    base === "/"
      ? location.pathname
      : location.pathname.startsWith(base)
        ? location.pathname.slice(base.length)
        : location.pathname;
  const activeId = resolveCapacityNavId(relative);

  // Sin el permiso de la sección, la entrada no existe y el badge no consulta.
  const dedicationAttention = useDedicationAttentionCount(
    hasPermission("Dedicacion")
  );

  const sidebarGroups: SidebarNavGroup[] = useMemo(
    () =>
      filterNav(capacityNavGroups, {
        // El menú del módulo se decide sólo por permisos de sección.
        hasRole: () => true,
        hasPermission,
      }).map((group) => ({
        label: group.label,
        items: group.items.map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
          icon: <Icon name={item.icon} size={20} />,
          badge:
            item.id === "lead-dedicacion" ? dedicationAttention : undefined,
        })),
      })),
    [hasPermission, dedicationAttention]
  );

  return (
    <ToastProvider>
      <LeadBreadcrumbProvider>
        <ModuleShell
          groups={sidebarGroups}
          activeId={activeId}
          onNavigate={(_id, href) => navigate(modulePath(href))}
          ariaLabel="Navegación de Gestión de Capacidad"
          topOffset={topOffset}
        >
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-neutral-default bg-neutral-canvas px-6 py-2">
            <CapacityBreadcrumb activeId={activeId} />
            <CapacityBreadcrumbActions />
          </div>
          <main id="capacity-content" className="flex-1 px-6 py-3">
            <Outlet />
          </main>
        </ModuleShell>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
};
