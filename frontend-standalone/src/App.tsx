import React, { useMemo, useSyncExternalStore } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Navbar, type NavbarUser } from "@tuya-ui/components";
import CapacityModule from "@front/module/CapacityModule";
import { LoginPage } from "./pages/LoginPage";
import { acquireToken, logout, sessionSource } from "./session/store";

/** Igual que el host: el módulo se monta bajo una ruta base y debajo de una barra de 56 px. */
const BASE_PATH = "/app";
const BAR_HEIGHT = 56;
const PRODUCT_NAME = "Gestión de Capacidad";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador de plataforma",
  "chapter-lead": "Líder de Expertise",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useSession() {
  return useSyncExternalStore(
    sessionSource.subscribe,
    sessionSource.getSession,
    sessionSource.getSession
  );
}

/** Sin sesión, a elegir perfil — guardando a dónde se quería ir. */
const RequireSession: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const session = useSession();
  const location = useLocation();
  if (session.status !== "authenticated") {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }
  return <>{children}</>;
};

/**
 * Lo que el host aporta y acá se reemplaza: la barra con la cuenta y "Cerrar
 * sesión", y el montaje del módulo con el contrato (fuente de sesión,
 * `acquireToken`, ruta base, alto de la barra).
 */
const Shell: React.FC = () => {
  const session = useSession();
  const navigate = useNavigate();

  const user = useMemo<NavbarUser>(() => {
    if (session.status !== "authenticated") return { name: "—", initials: "?" };
    const { name } = session.user;
    return {
      name,
      role:
        session.roles.length > 0
          ? ROLE_LABELS[session.roles[0]]
          : "Sin rol asignado",
      initials: initialsOf(name),
    };
  }, [session]);

  return (
    <>
      <Navbar
        product={PRODUCT_NAME}
        variant="light"
        apps={[]}
        user={user}
        userMenu={[
          {
            label: "Cerrar sesión",
            destructive: true,
            onSelect: () => {
              logout();
              navigate("/auth/login", { replace: true });
            },
          },
        ]}
        // Espejo del host: sin "Ayuda" y con la campana vacía, que todavía no
        // tiene servicio de notificaciones que la alimente.
        utilities={[]}
        showUserName={false}
        notifications={[]}
        onNavigate={(href) => navigate(href)}
      />
      <CapacityModule
        source={sessionSource}
        acquireToken={acquireToken}
        basePath={BASE_PATH}
        topOffset={BAR_HEIGHT}
      />
    </>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route
        path={`${BASE_PATH}/*`}
        element={
          <RequireSession>
            <Shell />
          </RequireSession>
        }
      />
      <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
    </Routes>
  </BrowserRouter>
);
