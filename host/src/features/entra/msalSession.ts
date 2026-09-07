import {
  PublicClientApplication,
  type AccountInfo,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import {
  mapEntraRoles,
  splitScopes,
  type Session,
} from "@features/auth-session";
import type { EntraConfig } from "./entraConfig";

/**
 * Lo que no es React del adaptador de Entra: construir la instancia de MSAL,
 * traducir la cuenta al contrato de sesión y pedir tokens en silencio. Vive
 * aparte del provider para poder probarlo sin montar nada.
 *
 * Cache en `localStorage` en vez del `sessionStorage` por defecto: sobrevive
 * a pestañas nuevas y lo comparten apps hermanas del mismo origen.
 */
export function createMsalInstance(
  config: EntraConfig
): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: config.clientId,
      authority: config.authority,
      knownAuthorities: config.knownAuthorities,
      redirectUri: config.redirectUri,
      postLogoutRedirectUri: config.postLogoutRedirectUri,
    },
    cache: { cacheLocation: "localStorage" },
  });
}

/** Traduce la cuenta de MSAL (claims del ID token) al contrato de sesión. */
export function accountToSession(
  account: AccountInfo,
  accessToken: string | null
): Session {
  const claims = (account.idTokenClaims ?? {}) as Record<string, unknown>;
  const oid =
    typeof claims.oid === "string" ? claims.oid : account.localAccountId;
  const name =
    account.name ??
    (typeof claims.name === "string" ? claims.name : account.username);

  return {
    status: "authenticated",
    user: { id: oid, name, username: account.username },
    roles: mapEntraRoles(claims.roles),
    scopes: splitScopes(claims.scp),
    claims,
    accessToken,
  };
}

/** Un token en silencio; `null` si no hay scopes o si la renovación falla. */
export async function acquireSilently(
  msal: IPublicClientApplication,
  account: AccountInfo,
  scopes: string[]
): Promise<string | null> {
  if (scopes.length === 0) return null;
  try {
    const result = await msal.acquireTokenSilent({ scopes, account });
    return result.accessToken || null;
  } catch {
    // Vencido y sin renovación silenciosa posible: la sesión sigue, sin token.
    // La siguiente navegación protegida volverá a pedir inicio de sesión.
    return null;
  }
}
