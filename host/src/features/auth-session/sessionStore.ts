import {
  ANONYMOUS_SESSION,
  type HostSessionSource,
  type Session,
} from "./types";

/**
 * La sesión como store externo: es lo que el host escribe (desde Entra o
 * desde el emulador local) y lo que los módulos van a leer con
 * `useSyncExternalStore` a través de `HostSessionSource`.
 *
 * Dos garantías que el contrato del módulo exige y que acá se prueban:
 * `getSession` devuelve la misma referencia mientras nadie llame a `set`, y
 * cada `set` con una sesión distinta notifica una vez a cada suscriptor.
 */
export interface SessionStore extends HostSessionSource {
  set: (next: Session) => void;
}

export function createSessionStore(
  initial: Session = ANONYMOUS_SESSION
): SessionStore {
  let current = initial;
  const listeners = new Set<() => void>();

  return {
    getSession: () => current,
    set: (next) => {
      // Misma referencia = nada cambió: no se notifica, para no provocar
      // renders que no aportan.
      if (next === current) return;
      current = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (onChange) => {
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
      };
    },
  };
}
