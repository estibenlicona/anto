/* eslint-disable react-refresh/only-export-components -- helpers junto al componente, patrón previo del módulo (mismo criterio que routes.tsx y LeadBreadcrumbContext) */
import React, { createContext, useContext } from "react";

/**
 * Con qué alcance se lee una pantalla de gente.
 *
 * - `all`: todo lo registrado. Es el default y el comportamiento de siempre —
 *   ninguna pantalla recorta por quién mira (change `quitar-acotamiento-por-lider`).
 * - `mine`: sólo los colaboradores de quien tiene la sesión. Es lo que pide el
 *   grupo "Mi Línea" del menú.
 *
 * El alcance lo declara la **ruta**, una sola vez, y lo leen los hooks para
 * mandarlo explícito en la petición (`?scope=mine`). No es estado global ni se
 * infiere del token en el servidor: una pantalla sin declarar nada sigue
 * mostrando todo, que es justamente lo que se ganó al quitar el acotamiento
 * implícito. Lo único que cambia entre `mi-linea/colaboradores` y `personas`
 * es este valor; el componente de pantalla es el mismo.
 */
export type CapacityScope = "all" | "mine";

const CapacityScopeContext = createContext<CapacityScope>("all");

export const CapacityScopeProvider: React.FC<{
  scope: CapacityScope;
  children: React.ReactNode;
}> = ({ scope, children }) => (
  <CapacityScopeContext.Provider value={scope}>
    {children}
  </CapacityScopeContext.Provider>
);

/**
 * El alcance de la pantalla actual. Fuera de un proveedor —una pantalla
 * montada suelta en un test— devuelve `all`, que es el comportamiento sin
 * recorte.
 */
export function useCapacityScope(): CapacityScope {
  return useContext(CapacityScopeContext);
}

/**
 * El valor que viaja en la petición, o `undefined` cuando no hay nada que
 * pedir. Que `all` no mande parámetro es deliberado: la petición sin acotar
 * queda byte por byte como antes de que existiera "Mi Línea".
 */
export function scopeParam(scope: CapacityScope): "mine" | undefined {
  return scope === "mine" ? "mine" : undefined;
}
