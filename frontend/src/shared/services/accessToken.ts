/**
 * De dónde saca `httpClient` el token que adjunta a cada llamada.
 *
 * Es un registro y no una lectura directa de la sesión a propósito:
 * `httpClient` no es un componente de React y no puede leer contexto, y
 * además no debe saber si la sesión la provee el host o el simulador. Quien
 * provee la sesión registra su accessor al montarse; `httpClient` sólo
 * pregunta.
 *
 * El token viaja para que la puerta de enlace lo valide — el backend, por
 * diseño, no procesa identidad.
 */
type AccessTokenProvider = () => string | null;

let provider: AccessTokenProvider | null = null;

/** Devuelve cómo darlo de baja, para que un provider no se pise con otro. */
export function setAccessTokenProvider(next: AccessTokenProvider): () => void {
  provider = next;
  return () => {
    if (provider === next) provider = null;
  };
}

/**
 * `null` cuando no hay sesión, o cuando la hay pero su token venció. En los
 * dos casos la llamada sale sin cabecera y la puerta de enlace responde 401,
 * que es exactamente lo que se quiere poder ejercitar. No se inventa un token
 * ni se bloquea la llamada desde el cliente.
 */
export function getAccessToken(): string | null {
  return provider?.() ?? null;
}
