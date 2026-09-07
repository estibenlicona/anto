import { type AppRole, type AuthSession, type Session } from "./types";

/**
 * Deriva los predicados que consumen las pantallas a partir de la sesión.
 *
 * Vive aparte de los providers para que las dos implementaciones —Entra y
 * emulador local— no puedan divergir en qué significa "tiene este rol". Es también
 * lo que permite probar los predicados sin montar React. Idéntica a la del
 * módulo `frontend/`, a propósito.
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
