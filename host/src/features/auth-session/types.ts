/**
 * El contrato de sesión de la plataforma.
 *
 * Es el mismo que consume `frontend/src/features/auth-session` — se escribió
 * desde el lado del módulo para que el host lo implementara, y este host lo
 * implementa. Lo que acá se agrega es lo que un módulo no tiene y un host sí:
 * iniciar y cerrar sesión, obtener un token para otros scopes, y la fuente
 * con la que la sesión se entrega a los módulos (`HostSessionSource`).
 *
 * Los roles se nombran por dominio y no con los identificadores de Entra: un
 * cambio de nomenclatura en el directorio no debe llegar al código de negocio.
 * Traducir de claims a estos nombres es trabajo del adaptador (`entraRoles`).
 */

/** Los roles de negocio de la plataforma. */
export const APP_ROLES = ["admin", "chapter-lead", "tech-lead"] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** Quién es el usuario, para mostrarlo. No para decidir permisos. */
export interface SessionUser {
  id: string;
  name: string;
  /** Usuario corporativo (UPN). */
  username: string;
}

/**
 * Una sesión activa. Los roles y scopes llegan resueltos desde los claims del
 * token: no hay tabla local ni endpoint de permisos que consultar.
 */
export interface AuthenticatedSession {
  status: "authenticated";
  user: SessionUser;
  roles: AppRole[];
  scopes: string[];
  /** Claims crudos, por si alguna pantalla necesita uno que el puerto no modela. */
  claims: Record<string, unknown>;
  /**
   * El token que se adjunta a las llamadas salientes para que la puerta de
   * enlace lo valide. `null` cuando la sesión existe pero no hay token (scopes
   * no configurados, o el token venció y no pudo renovarse en silencio).
   */
  accessToken: string | null;
}

/** Sin sesión: nadie inició, o se cerró. No es un error. */
export interface AnonymousSession {
  status: "anonymous";
}

export type Session = AuthenticatedSession | AnonymousSession;

export const ANONYMOUS_SESSION: AnonymousSession = { status: "anonymous" };

/** Lo que las pantallas consumen para decidir qué muestran y qué permiten. */
export interface AuthSession {
  session: Session;
  /** Mientras se resuelve si hay sesión, para no parpadear entre estados. */
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: AppRole[]) => boolean;
  hasScope: (scope: string) => boolean;
}

/**
 * La fuente con la que el host entrega su sesión a un módulo. Dos operaciones
 * y nada más: leer la sesión actual y suscribirse a sus cambios. Es lo que
 * `frontend/` ya espera recibir como `source` de su `HostAuthProvider`.
 *
 * `getSession` SHALL devolver la misma referencia mientras la sesión no
 * cambie: del otro lado se lee con `useSyncExternalStore`, que compara por
 * identidad para decidir si re-renderiza.
 */
export interface HostSessionSource {
  getSession: () => Session;
  subscribe: (onChange: () => void) => () => void;
}

/** Las acciones que sólo el host puede ejecutar. */
export interface HostSessionActions {
  /** Lleva a iniciar sesión; al volver, la persona queda en `returnTo`. */
  login: (returnTo?: string) => void;
  logout: () => void;
  /**
   * Un token de acceso para scopes distintos de los del host — lo que un
   * módulo pide para su propia API. `null` si no pudo obtenerse en silencio.
   */
  acquireToken: (scopes: string[]) => Promise<string | null>;
}

/** Lo que el host consume en sus propias pantallas: el puerto, sus acciones y la fuente para los módulos. */
export interface HostAuth extends AuthSession, HostSessionActions {
  source: HostSessionSource;
}
