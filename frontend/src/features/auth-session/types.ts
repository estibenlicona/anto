/**
 * El contrato de sesión que consume esta aplicación.
 *
 * Está escrito desde lo que las pantallas necesitan saber, no con la forma de
 * MSAL ni con la del host. Esa es la razón de que exista: el host es dueño de
 * la autenticación y todavía no definió cómo entrega la sesión, así que si el
 * negocio hablara la forma del host, el día que el host cambie habría que
 * tocar cada pantalla en vez de un adaptador.
 *
 * Los roles se nombran por dominio y no con los identificadores de Entra: un
 * cambio de nomenclatura en el directorio no debe llegar al código de negocio.
 * Traducir de claims a estos nombres es trabajo del adaptador del host.
 */

/** Los roles de negocio de la plataforma. */
export const APP_ROLES = ["admin", "chapter-lead"] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** Quién es el usuario, para mostrarlo. No para decidir permisos. */
export interface SessionUser {
  id: string;
  name: string;
  /** Usuario corporativo (UPN). */
  username: string;
}

/**
 * Una sesión activa. Los roles y scopes llegan resueltos: la autorización de
 * negocio se maneja con Entra ID, así que viajan como claims del token y no
 * hay tabla local ni endpoint de permisos que consultar.
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
   * enlace lo valide. `null` cuando la sesión existe pero su token venció:
   * la llamada sale sin token y la puerta de enlace responde 401, que es
   * justo el caso que se quiere poder ejercitar.
   */
  accessToken: string | null;
}

/** Sin sesión: el host no entregó ninguna, o se cerró. No es un error. */
export interface AnonymousSession {
  status: "anonymous";
}

export type Session = AuthenticatedSession | AnonymousSession;

export const ANONYMOUS_SESSION: AnonymousSession = { status: "anonymous" };

/**
 * Lo que la aplicación consume. Ninguna pantalla, guard o servicio debe saber
 * de dónde sale — si viene del host o de un simulador se decide una sola vez,
 * en el composition root.
 */
export interface AuthSession {
  session: Session;
  /** Mientras se resuelve si hay sesión, para no parpadear entre estados. */
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: AppRole[]) => boolean;
  hasScope: (scope: string) => boolean;
}
