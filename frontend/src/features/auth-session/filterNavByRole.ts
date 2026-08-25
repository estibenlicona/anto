import type { AppRole } from "./types";

/**
 * Lo mínimo que una entrada de navegación necesita para poder filtrarse.
 *
 * `roles` es opcional, así que este tipo solo tiene propiedades opcionales —
 * lo que TypeScript trata como *weak type* y rechaza contra tipos que no
 * compartan ninguna propiedad. Por eso las entradas de cada shell declaran
 * `roles?: AppRole[]` explícitamente en vez de ignorarlo: es también lo que
 * hace que la restricción por rol sea una opción visible al escribir una
 * entrada nueva.
 */
export interface RoleRestrictedEntry {
  /** Omitido, la entrada es visible para cualquiera que haya entrado al shell. */
  roles?: AppRole[];
}

/**
 * Deja fuera del menú las entradas cuyo rol el usuario no tiene, y los grupos
 * que quedan vacíos.
 *
 * Hoy no filtra nada: cada shell está entero detrás de un único rol, así que
 * quien llegó a ver el menú ya tiene el rol de todas sus entradas. Existe
 * igual porque la alternativa es que el requisito —no ofrecer pantallas que
 * el guard va a negar— se cumpla por accidente de cómo están armadas las
 * rutas hoy. La primera entrada que necesite un rol distinto al de su shell
 * lo rompería en silencio: el menú la ofrecería y el guard la rechazaría.
 */
export function filterNavByRole<
  TGroup extends { items: RoleRestrictedEntry[] },
>(groups: TGroup[], hasRole: (...roles: AppRole[]) => boolean): TGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles?.length || hasRole(...item.roles)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
