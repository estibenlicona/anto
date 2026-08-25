import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@features/authentication/index";
import { filterNavByRole } from "@features/auth-session";
import {
  AppShell,
  Breadcrumb,
  Icon,
  ToastProvider,
  type SidebarNavGroup,
} from "@tuya-ui/components";
import {
  adminNavGroups,
  adminRouteTitles,
  resolveAdminNavId,
} from "@features/admin-shell/navigation";

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Ver la nota equivalente en ChapterLeadLayout: depende de la sesión, así
  // que no puede armarse a nivel de módulo.
  const sidebarGroups: SidebarNavGroup[] = useMemo(
    () =>
      filterNavByRole(adminNavGroups, hasRole).map((group) => ({
        label: group.label,
        items: group.items.map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
          icon: <Icon name={item.icon} size={20} />,
        })),
      })),
    [hasRole]
  );
  const activeId = resolveAdminNavId(location.pathname);
  const pageTitle = adminRouteTitles[activeId];

  return (
    <ToastProvider>
      {/* Mismo patrón que ChapterLeadLayout: AppShell pone la geometría. */}
      <AppShell
        product="Gestión De Capacidad"
        groups={sidebarGroups}
        activeId={activeId}
        onNavigate={(_id, href) => navigate(href)}
        ariaLabel="Navegación de Administración"
        user={{
          name: "Admin",
          role: "Configuración global",
          initials: "AD",
        }}
        userMenu={[{ label: "Cerrar sesión", destructive: true }]}
      >
        <div className="bg-neutral-canvas px-6 py-3">
          <Breadcrumb
            items={[
              { label: "Plataforma", href: "/app/admin" },
              { label: pageTitle },
            ]}
          />
        </div>
        {/* Ancla del enlace "Saltar al contenido" (AppShell aún no lo trae). */}
        <main id="main-content" className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </AppShell>
    </ToastProvider>
  );
};
