/**
 * La ruta a la que volver después de iniciar sesión.
 *
 * Con el proveedor real hay una redirección completa de por medio: la app se
 * descarga y vuelve a arrancar en la URI de retorno. La ruta pedida viaja en
 * el `state` de la redirección y, al regresar, se deja acá para que el layout
 * — que sí está dentro del router — navegue a ella una sola vez.
 */
const KEY = "host:returnTo";

/** Sólo rutas internas: nunca se acepta un destino absoluto (open redirect). */
export function sanitizeReturnTo(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function rememberReturnTo(path: unknown): void {
  const safe = sanitizeReturnTo(path);
  if (!safe || safe === "/") return;
  try {
    window.sessionStorage.setItem(KEY, safe);
  } catch {
    // Almacenamiento bloqueado: se pierde el retorno, no la sesión.
  }
}

/** Devuelve la ruta pendiente y la olvida, para que se aplique una sola vez. */
export function consumeReturnTo(): string | null {
  try {
    const value = window.sessionStorage.getItem(KEY);
    if (value !== null) window.sessionStorage.removeItem(KEY);
    return sanitizeReturnTo(value);
  } catch {
    return null;
  }
}
