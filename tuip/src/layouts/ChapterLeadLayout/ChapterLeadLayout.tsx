import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@features/authentication/index";
import { filterNavByRole } from "@features/auth-session";
import { useBacklogPendingCount } from "@features/backlog/hooks/useBacklogPendingCount";
import {
  AppShell,
  Breadcrumb,
  Icon,
  ToastProvider,
  type SidebarNavGroup,
} from "@tuya-ui/components";
import {
  leadNavGroups,
  leadRouteTitles,
  resolveLeadNavId,
} from "@features/chapter-lead-shell/navigation";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";

/**
 * El breadcrumb vive en un componente propio para leer el contexto que el
 * provider de abajo crea: una pantalla de detalle publica su nombre como
 * tercer nivel y la pantalla padre pasa a ser enlace.
 */
const LeadBreadcrumb: React.FC<{ activeId: string }> = ({ activeId }) => {
  const { trailing } = useLeadBreadcrumb();
  const pageTitle = leadRouteTitles[activeId];
  const parentHref = leadNavHref(activeId);
  return (
    <Breadcrumb
      items={
        trailing
          ? [
              { label: "Plataforma", href: "/app/lead" },
              { label: pageTitle, href: parentHref },
              { label: trailing },
            ]
          : [{ label: "Plataforma", href: "/app/lead" }, { label: pageTitle }]
      }
    />
  );
};

function leadNavHref(id: string): string {
  for (const group of leadNavGroups) {
    const item = group.items.find((entry) => entry.id === id);
    if (item) return item.href;
  }
  return "/app/lead";
}

export const ChapterLeadLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  // Pendientes del backlog, como badge de su entrada; sin dato, sin badge.
  const backlogPending = useBacklogPendingCount();

  // Se arma dentro del componente, y no a nivel de módulo, porque depende de
  // los roles de la sesión: el menú no debe ofrecer pantallas que el guard
  // vaya a rechazar.
  const sidebarGroups: SidebarNavGroup[] = useMemo(
    () =>
      filterNavByRole(leadNavGroups, hasRole).map((group) => ({
        label: group.label,
        items: group.items.map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
          icon: <Icon name={item.icon} size={20} />,
          badge: item.id === "lead-backlog" ? backlogPending : undefined,
        })),
      })),
    [hasRole, backlogPending]
  );
  const activeId = resolveLeadNavId(location.pathname);

  return (
    <ToastProvider>
      <LeadBreadcrumbProvider>
        {/* AppShell pone la geometría (sidebar a toda altura con la marca en
            su cabecera, barra al lado con la hamburguesa, colapso
            persistente); acá sólo van los datos y la columna de contenido. */}
        <AppShell
          product="Dimensionamiento TI"
          groups={sidebarGroups}
          activeId={activeId}
          onNavigate={(_id, href) => navigate(href)}
          ariaLabel="Navegación de Chapter Lead"
          user={{
            name: "Chapter Lead",
            role: "Tu chapter",
            initials: "CL",
          }}
          userMenu={[{ label: "Cerrar sesión", destructive: true }]}
        >
          <div className="bg-neutral-canvas px-6 py-3">
            <LeadBreadcrumb activeId={activeId} />
          </div>
          {/* Ancla del enlace "Saltar al contenido" (AppShell aún no lo trae). */}
          <main id="main-content" className="flex-1 px-6 py-6">
            <Outlet />
          </main>
        </AppShell>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
};
