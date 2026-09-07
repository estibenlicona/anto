import type { DevOpsUserSearchState } from "../../hooks/useDevOpsUserSearch";

/**
 * Las reglas del drawer de vinculación que no dependen de haberlo montado.
 * Viven acá, y no dentro del componente, por la misma razón que
 * `personFormOptions`: lo que decide cuándo se busca y cuándo se puede
 * vincular se prueba de verdad, y en el navegador queda por verificar sólo
 * que se vea.
 */

/**
 * Sólo la forma: algo, una arroba, algo, un punto, algo. No valida dominios
 * ni existencia — eso lo dice Azure DevOps al buscar. Su única función es no
 * consultar con un texto vacío o que no puede ser un correo.
 */
export function hasEmailShape(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

/**
 * Se puede vincular sólo cuando hay un usuario encontrado **para el correo
 * que se ve en el campo**: si el lead editó el correo después de buscar, el
 * resultado ya no corresponde a lo que está mirando y vincularlo sería
 * guardar una identidad distinta a la que cree estar guardando.
 */
export function canLink(
  search: Pick<DevOpsUserSearchState, "status" | "user" | "searchedEmail">,
  currentEmail: string
): boolean {
  return (
    search.status === "found" &&
    search.user !== null &&
    search.searchedEmail !== null &&
    search.searchedEmail.trim().toLowerCase() ===
      currentEmail.trim().toLowerCase()
  );
}

/** Las iniciales para el avatar cuando DevOps no trae imagen: dos como máximo. */
export function initialsOf(displayName: string): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}
