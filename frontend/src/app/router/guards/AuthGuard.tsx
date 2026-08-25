import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@features/authentication/index";
import type { AppRole } from "@features/auth-session";

export interface AuthGuardProps {
  /**
   * Roles admitidos. Cualquiera de ellos alcanza. Omitido, basta con tener
   * sesión.
   */
  roles?: AppRole[];
}

/**
 * Distingue dos situaciones que no son la misma:
 *
 * - **Sin sesión** → a iniciar sesión, porque el usuario todavía no se
 *   identificó y ahí puede resolverlo.
 * - **Con sesión pero sin el rol** → aviso de permisos. Mandarlo a iniciar
 *   sesión sería engañoso: ya lo hizo, y volver a hacerlo no le va a dar el
 *   rol que le falta.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ roles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Sin esto se redirige a login durante el instante en que la sesión todavía
  // no se resolvió, expulsando a un usuario que sí la tiene.
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/app/sin-permisos" replace />;
  }

  return <Outlet />;
};
