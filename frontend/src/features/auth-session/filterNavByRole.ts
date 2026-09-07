import type { CapacityPermission } from "./capacityPermissions";
import type { AppRole } from "./types";

/**
 * Lo mínimo que una entrada de navegación necesita para poder filtrarse.
 *
 * `roles` y `permission` son opcionales, así que este tipo solo tiene
 * propiedades opcionales — lo que TypeScript trata como *weak type* y rechaza
 * contra tipos que no compartan ninguna propiedad. Por eso las entradas de
 * cada shell declaran los campos explícitamente en vez de ignorarlos: es
 * también lo que hace que la restricción sea una opción visible al escribir
 * una entrada nueva.
 */
export interface RoleRestrictedEntry {
  /** Omitido, la entrada es visible para cualquiera que haya entrado al shell. */
  roles?: AppRole[];
  /**
   * Permiso de sección del módulo que la entrada exige. Omitido, la entrada
   * no depende de sub-claims (p. ej. "Inicio").
   */
  permission?: CapacityPermission;
}

export interface NavPredicates {
  hasRole: (...roles: AppRole[]) => boolean;
  hasPermission: (...permissions: CapacityPermission[]) => boolean;
}

/**
 * Deja fuera del menú las entradas cuyo rol o cuyo permiso de sección el
 * usuario no tiene, y los grupos que quedan vacíos: el menú no debe ofrecer
 * pantallas que el guard va a negar. Rol y permiso se evalúan por separado —
 * el rol dice a qué shell se entra; el permiso, qué secciones ofrece — y una
 * entrada se muestra sólo si pasa ambos.
 */
export function filterNav<TGroup extends { items: RoleRestrictedEntry[] }>(
  groups: TGroup[],
  { hasRole, hasPermission }: NavPredicates
): TGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (!item.roles?.length || hasRole(...item.roles)) &&
          (!item.permission || hasPermission(item.permission))
      ),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * @deprecated Filtra sólo por rol; usar `filterNav` con los dos predicados.
 * Queda como alias hasta que la conversión a módulo toque estos imports.
 */
export function filterNavByRole<
  TGroup extends { items: RoleRestrictedEntry[] },
>(groups: TGroup[], hasRole: (...roles: AppRole[]) => boolean): TGroup[] {
  return filterNav(groups, { hasRole, hasPermission: () => true });
}
