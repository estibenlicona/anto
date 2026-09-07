import React, { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar, ToastProvider, type NavbarAppRef } from "@tuya-ui/components";
import { useAuth } from "@app/providers/useAuth";
import { consumeReturnTo } from "@features/auth-session";
import { currentModule, visibleModules } from "@features/modules/registry";
import { PRODUCT_NAME, navbarUserOf } from "./hostIdentity";

/**
 * La barra común de la plataforma y, debajo, lo que la ruta ponga. Sin
 * navegación lateral: el sidebar es de cada módulo. Sin campana ni búsqueda:
 * no hay servicio de notificaciones ni buscador global todavía, y un control
 * sin función es peor que ninguno.
 */
export const HostLayout: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Al volver del proveedor, la ruta pedida quedó guardada por el provider;
  // se aplica una sola vez, acá, que es donde ya hay router.
  useEffect(() => {
    const pending = consumeReturnTo();
    if (pending && pending !== `${location.pathname}${location.search}`) {
      navigate(pending, { replace: true });
    }
    // Sólo al montar: es el retorno de una redirección, no una suscripción.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modules = useMemo(() => visibleModules(auth.hasRole), [auth.hasRole]);
  const current = currentModule(location.pathname);

  const apps = useMemo<NavbarAppRef[]>(
    () =>
      modules.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description,
        color: module.color,
        href: module.basePath,
        current: module.id === current?.id,
      })),
    [modules, current?.id]
  );

  const user = useMemo(() => navbarUserOf(auth.session), [auth.session]);

  return (
    <ToastProvider>
      <Navbar
        product={PRODUCT_NAME}
        variant="light"
        apps={apps}
        user={user}
        userMenu={[
          { label: "Cerrar sesión", destructive: true, onSelect: auth.logout },
        ]}
        showNotifications={false}
        onNavigate={(href) => navigate(href)}
      />
      <main id="main-content" className="flex-1 px-6 py-3">
        <Outlet />
      </main>
    </ToastProvider>
  );
};
