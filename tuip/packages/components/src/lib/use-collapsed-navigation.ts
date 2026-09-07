import { useEffect, useState } from "react";

/**
 * Contrato compartido con `sidebar.tsx`, a propósito: es la misma preferencia
 * de la misma persona, y las piezas que la usan nunca conviven en una vista
 * (AppShell y ModuleShell usan Sidebar controlado, que no persiste por su
 * cuenta). Compartir la clave hace que migrar una app de Sidebar suelto a un
 * shell — o de AppShell a ModuleShell — conserve el estado que la persona ya
 * eligió. Si el formato de esta clave cambia, cambia en `sidebar.tsx` también.
 */
export const COLLAPSED_NAVIGATION_STORAGE_KEY = "tuya-ui:sidebar-collapsed";

/** Umbral compartido con Sidebar: por debajo, la navegación se colapsa sola. */
const AUTO_COLLAPSE_QUERY = "(max-width: 1119px)";

export function readPersistedCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COLLAPSED_NAVIGATION_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writePersistedCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(COLLAPSED_NAVIGATION_STORAGE_KEY, String(value));
  } catch {
    // Storage deshabilitado — el colapso funciona esta sesión, sin recordarse.
  }
}

/**
 * El estado de colapso de una navegación lateral controlada por un shell:
 * arranca de `defaultCollapsed` o de la preferencia guardada, se auto-colapsa
 * al cruzar el umbral de ancho, y cada toggle persiste la elección.
 *
 * Vive aparte para que AppShell y ModuleShell no puedan divergir en cómo
 * persisten ni en cuándo se colapsan solos: es la misma persona con la misma
 * preferencia, sólo que con la hamburguesa en distinto lugar.
 *
 * El auto-colapso reacciona al cruce (evento `change`), no a un chequeo
 * continuo, así re-expandir con la hamburguesa no es peleado por el siguiente
 * render — la misma técnica de Sidebar. El guard de `matchMedia` cubre SSR y
 * jsdom.
 */
export function useCollapsedNavigation(defaultCollapsed?: boolean) {
  const [collapsed, setCollapsed] = useState(() => defaultCollapsed ?? readPersistedCollapsed());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(AUTO_COLLAPSE_QUERY);
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setCollapsed(true);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    writePersistedCollapsed(next);
  }

  return { collapsed, toggle };
}
