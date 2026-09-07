/**
 * Bajo qué ruta base está montado el módulo, y cómo armar enlaces internos
 * a partir de ella.
 *
 * Es un registro y no una lectura de contexto a propósito, como
 * `accessToken.ts`: los enlaces se arman también fuera de componentes
 * (adapters, redirecciones, helpers de ruta) y ninguno debe saber quién
 * montó el módulo ni bajo qué ruta. Quien lo monta —el host real por el
 * contrato, o el host falso de `pnpm dev:mock`— registra la base al montar;
 * el resto sólo pregunta.
 *
 * Todo enlace interno pasa por acá. Una ruta absoluta escrita a mano
 * (`/app/lead/...`, `/capacidad/...`) es un enlace roto en potencia: la base
 * la decide el host y el día que cambie no debe tocarse ninguna pantalla.
 */

/** La base con la que el host monta el módulo hoy; sirve de default para tests. */
const DEFAULT_BASE_PATH = "/capacidad";

let basePath = DEFAULT_BASE_PATH;

/** Sin barra final: `modulePath` la agrega al unir. */
export function setModuleBasePath(next: string): void {
  const clean = next.replace(/\/+$/, "");
  basePath = clean || "/";
}

export function getModuleBasePath(): string {
  return basePath;
}

/**
 * Ruta absoluta dentro del módulo a partir de un camino relativo a su base:
 * `modulePath("celulas/7")` → `/capacidad/celulas/7`; `modulePath()` es el
 * inicio del módulo. Acepta la barra inicial de sobra sin duplicarla.
 */
export function modulePath(relative = ""): string {
  const clean = relative.replace(/^\/+/, "");
  if (!clean) return basePath;
  return basePath === "/" ? `/${clean}` : `${basePath}/${clean}`;
}
