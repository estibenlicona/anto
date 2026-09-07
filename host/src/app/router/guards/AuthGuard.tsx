import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@app/providers/useAuth";
import type { AppRole } from "@features/auth-session";

export interface AuthGuardProps {
  /** Roles admitidos. Cualquiera de ellos alcanza. Omitido, basta con tener sesión. */
  roles?: AppRole[];
}

/**
 * Distingue dos situaciones que no son la misma:
 *
 * - **Sin sesión** → a iniciar sesión, guardando la ruta pedida para volver.
 * - **Con sesión pero sin el rol** → aviso de permisos. Mandarlo a iniciar
 *   sesión sería engañoso: ya lo hizo, y repetirlo no le da el rol que falta.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ roles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Sin esto se redirige a login durante el instante en que la sesión todavía
  // no se resolvió, expulsando a un usuario que sí la tiene.
  if (isLoading) return null;

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/sin-permisos" replace />;
  }

  return <Outlet />;
};
