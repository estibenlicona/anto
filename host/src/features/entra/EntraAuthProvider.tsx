import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { IPublicClientApplication } from "@azure/msal-browser";
import { AuthContext } from "@app/providers/AuthContext";
import {
  ANONYMOUS_SESSION,
  deriveAuthSession,
  rememberReturnTo,
  type HostAuth,
  type SessionStore,
} from "@features/auth-session";
import type { EntraConfig } from "./entraConfig";
import {
  accountToSession,
  acquireSilently,
  createMsalInstance,
} from "./msalSession";

/**
 * Sesión con Entra ID vía MSAL, en redirect flow.
 *
 * El host es el único que inicia y cierra sesión. Al arrancar, `initialize` +
 * `handleRedirectPromise` resuelven si venimos de vuelta del proveedor o si
 * ya había una cuenta en el cache; hasta entonces `isLoading` es `true`, para
 * que el guard no expulse a nadie durante ese instante. La sesión resultante
 * se escribe en el `SessionStore` — el mismo objeto que los módulos van a
 * leer — y este provider la lee de ahí como cualquier otro consumidor.
 */
export interface EntraAuthProviderProps {
  config: EntraConfig;
  store: SessionStore;
  /** Inyectable para pruebas; por defecto se construye desde `config`. */
  msal?: IPublicClientApplication;
  children: React.ReactNode;
}

export const EntraAuthProvider: React.FC<EntraAuthProviderProps> = ({
  config,
  store,
  msal: injected,
  children,
}) => {
  const [msal] = useState(() => injected ?? createMsalInstance(config));
  const [isLoading, setLoading] = useState(true);
  const session = useSyncExternalStore(
    store.subscribe,
    store.getSession,
    store.getSession
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await msal.initialize();
      const result = await msal.handleRedirectPromise();
      if (result?.state) rememberReturnTo(result.state);

      const account =
        result?.account ??
        msal.getActiveAccount() ??
        msal.getAllAccounts()[0] ??
        null;

      if (!account) {
        store.set(ANONYMOUS_SESSION);
        return;
      }
      msal.setActiveAccount(account);
      const token = await acquireSilently(msal, account, config.apiScopes);
      if (!cancelled) store.set(accountToSession(account, token));
    })()
      .catch((error: unknown) => {
        console.error("No se pudo resolver la sesión con Entra ID", error);
        store.set(ANONYMOUS_SESSION);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [msal, store, config.apiScopes]);

  const login = useCallback(
    (returnTo?: string) => {
      void msal.loginRedirect({ scopes: config.apiScopes, state: returnTo });
    },
    [msal, config.apiScopes]
  );

  const logout = useCallback(() => {
    store.set(ANONYMOUS_SESSION);
    void msal.logoutRedirect({ account: msal.getActiveAccount() ?? undefined });
  }, [msal, store]);

  const acquireToken = useCallback(
    async (scopes: string[]) => {
      const account = msal.getActiveAccount();
      if (!account) return null;
      return acquireSilently(msal, account, scopes);
    },
    [msal]
  );

  const value = useMemo<HostAuth>(
    () => ({
      ...deriveAuthSession(session, isLoading),
      login,
      logout,
      acquireToken,
      source: store,
    }),
    [session, isLoading, login, logout, acquireToken, store]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
