/**
 * Los permisos de sección del módulo de Gestión de Capacidad.
 *
 * En el directorio son app roles de la app registration de la **API del
 * módulo** (no de la app del host): sub-claims que viajan en el claim `roles`
 * del access token dirigido a esa API. Acá se nombran por dominio, sin el
 * prefijo del directorio, por la misma razón que los roles de plataforma: un
 * cambio de nomenclatura en Entra no debe llegar al código de negocio.
 */
export const CAPACITY_PERMISSIONS = [
  "Iniciativas",
  "Celulas",
  "Personas",
  "Ausencias",
  "Dedicacion",
  "Prefacturacion",
  "Competencias",
  "Sprints",
  "Parametros",
  "Habilidades",
  "Lineas",
  "DevOps",
] as const;

export type CapacityPermission = (typeof CAPACITY_PERMISSIONS)[number];

/** El prefijo con el que estos permisos viajan como app roles del directorio. */
const CLAIM_PREFIX = "Capacidad.";

/**
 * Traduce el claim `roles` del token de la API del módulo a permisos de
 * sección. Un valor sin el prefijo o que no corresponde a una sección
 * conocida se ignora sin fallar — igual que los roles de plataforma
 * desconocidos.
 */
export function mapCapacityRoles(roles: unknown): CapacityPermission[] {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) =>
      typeof role === "string" && role.startsWith(CLAIM_PREFIX)
        ? role.slice(CLAIM_PREFIX.length)
        : undefined
    )
    .filter((section): section is CapacityPermission =>
      (CAPACITY_PERMISSIONS as readonly string[]).includes(section ?? "")
    );
}
