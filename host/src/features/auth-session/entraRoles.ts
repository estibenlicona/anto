import type { AppRole } from "./types";

/**
 * El mapeo de app role de Entra a rol de negocio. Es el único lugar donde el
 * host conoce los identificadores del directorio; las pantallas hablan de
 * `admin` y `chapter-lead`. Los nombres coinciden con los app roles que
 * siembra `pnpm entra:seed` en el emulador local, así ambas autoridades
 * producen la misma sesión.
 *
 * Los roles del host deciden qué módulos se ven. Los roles internos de cada
 * módulo viven en la app registration de su propia API y viajan en el token
 * que ese módulo pide con `acquireToken(scopes)` — el host no los acumula.
 */
export const ENTRA_ROLE_TO_APP_ROLE: Record<string, AppRole> = {
  "Plataforma.Admin": "admin",
  "Plataforma.ChapterLead": "chapter-lead",
  "Plataforma.TechLead": "tech-lead",
};

/** Traduce el claim `roles` (desconocidos se ignoran, sin fallar). */
export function mapEntraRoles(roles: unknown): AppRole[] {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) =>
      typeof role === "string" ? ENTRA_ROLE_TO_APP_ROLE[role] : undefined
    )
    .filter((role): role is AppRole => Boolean(role));
}

/** El claim `scp` viene separado por espacio, como lo emite Entra. */
export function splitScopes(scp: unknown): string[] {
  return typeof scp === "string" ? scp.split(" ").filter(Boolean) : [];
}
