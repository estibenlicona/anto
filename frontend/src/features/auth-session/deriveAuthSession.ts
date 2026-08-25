import { type AppRole, type AuthSession, type Session } from "./types";

/**
 * Deriva los predicados que consumen las pantallas a partir de la sesión.
 *
 * Vive aparte del provider para que las dos implementaciones —host y
 * simulador— no puedan divergir en qué significa "tiene este rol". Es también
 * lo que permite probar los predicados sin montar React.
 */
export function deriveAuthSession(
  session: Session,
  isLoading: boolean
): AuthSession {
  const isAuthenticated = session.status === "authenticated";

  return {
    session,
    isLoading,
    isAuthenticated,
    // Cualquiera de los roles pedidos alcanza: una ruta que admite varios
    // perfiles es lo normal, y exigir todos a la vez no tiene caso de uso acá.
    hasRole: (...roles: AppRole[]) =>
      session.status === "authenticated" &&
      roles.some((role) => session.roles.includes(role)),
    hasScope: (scope: string) =>
      session.status === "authenticated" && session.scopes.includes(scope),
  };
}
