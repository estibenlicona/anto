import type {
  AnonymousSession,
  AuthenticatedSession,
} from "@features/auth-session";

/**
 * El contrato de montaje que el host entrega al módulo, por props del
 * componente federado. Tipado acá y en el host por duplicado deliberado:
 * TypeScript compara estructuras, y un paquete compartido para cuatro campos
 * es más ceremonia que valor.
 */

/** La sesión como la entrega el host: sin los permisos del módulo, que son nuestros. */
export type HostProvidedSession =
  Omit<AuthenticatedSession, "permissions"> | AnonymousSession;

export interface HostProvidedSource {
  /** Misma referencia mientras la sesión no cambie (se lee con `useSyncExternalStore`). */
  getSession: () => HostProvidedSession;
  subscribe: (onChange: () => void) => () => void;
}

export interface CapacityModuleProps {
  /** Fuente de sesión del host. */
  source: HostProvidedSource;
  /** Token de acceso por scopes, en silencio; `null` si no se puede. */
  acquireToken: (scopes: string[]) => Promise<string | null>;
  /** Ruta base bajo la que el host montó el módulo (p. ej. `/capacidad`). */
  basePath: string;
  /** Alto de la barra del host en px, para que el shell ocupe el resto. */
  topOffset: number;
}

/** El scope de la API propia: su token trae los sub-claims `Capacidad.*`. */
export const CAPACITY_API_SCOPES = ["api://capacidad/access_as_user"];

/**
 * Lee el payload de un JWT sin validar la firma. Es sólo para que la interfaz
 * sepa qué ofrecer — la autorización real la hace el backend validando el
 * token completo. Ante cualquier malformación devuelve un objeto vacío.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed: unknown = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
