/**
 * La configuración de Entra ID, tomada del entorno de build (`VITE_ENTRA_*`).
 *
 * Sin `clientId` o `tenantId` no hay contra qué autenticar: en vez de una
 * pantalla en blanco, `readEntraConfig` lanza un error que nombra la variable
 * que falta, y `main.tsx` lo muestra.
 */
export interface EntraConfig {
  clientId: string;
  tenantId: string;
  /** URL completa de la autoridad, con el tenant. Por defecto, la nube de Entra. */
  authority: string;
  /** Hosts de autoridades no-Microsoft en las que MSAL debe confiar (p. ej. el emulador local). */
  knownAuthorities: string[];
  redirectUri: string;
  postLogoutRedirectUri: string;
  /** Scopes del token de acceso de la sesión. Vacío: la sesión no lleva token. */
  apiScopes: string[];
}

export class EntraConfigError extends Error {
  constructor(public readonly variable: string) {
    super(
      `Falta la variable de entorno ${variable}. Completá .env.development.local ` +
        `(ver .env.example; contra el emulador local, pnpm entra:seed imprime los valores).`
    );
    this.name = "EntraConfigError";
  }
}

function required(env: ImportMetaEnv, name: keyof ImportMetaEnv): string {
  const value = env[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new EntraConfigError(String(name));
  }
  return value.trim();
}

export function readEntraConfig(
  env: ImportMetaEnv = import.meta.env,
  origin: string = window.location.origin
): EntraConfig {
  const clientId = required(env, "VITE_ENTRA_CLIENT_ID");
  const tenantId = required(env, "VITE_ENTRA_TENANT_ID");
  const base = env.VITE_BASE_PUBLIC_URL || "/";
  const redirectUri =
    env.VITE_ENTRA_REDIRECT_URI?.trim() || new URL(base, origin).toString();

  // La autoridad por defecto es la nube de Entra para el tenant. Un despliegue
  // (o el emulador local) puede declarar otra; una autoridad no-Microsoft debe
  // además figurar como conocida para que MSAL confíe en su discovery.
  const explicitAuthority = env.VITE_ENTRA_AUTHORITY?.trim();
  const authority =
    explicitAuthority || `https://login.microsoftonline.com/${tenantId}`;
  const knownAuthorities = (env.VITE_ENTRA_KNOWN_AUTHORITIES ?? "")
    .split(" ")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (knownAuthorities.length === 0 && explicitAuthority) {
    knownAuthorities.push(new URL(authority).host);
  }

  return {
    clientId,
    tenantId,
    authority,
    knownAuthorities,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    apiScopes: (env.VITE_ENTRA_API_SCOPES ?? "").split(" ").filter(Boolean),
  };
}
