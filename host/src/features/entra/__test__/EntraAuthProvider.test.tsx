import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import type {
  AccountInfo,
  AuthenticationResult,
  IPublicClientApplication,
} from "@azure/msal-browser";
import { useAuth } from "@app/providers/useAuth";
import { createSessionStore } from "@features/auth-session";
import { EntraAuthProvider } from "../EntraAuthProvider";
import type { EntraConfig } from "../entraConfig";
import { accountToSession } from "../msalSession";

const config: EntraConfig = {
  knownAuthorities: [],
  clientId: "client",
  tenantId: "tenant",
  authority: "https://login.microsoftonline.com/tenant",
  redirectUri: "http://localhost/",
  postLogoutRedirectUri: "http://localhost/",
  apiScopes: ["api://client/.default"],
};

function account(claims: Record<string, unknown>): AccountInfo {
  return {
    homeAccountId: "h",
    environment: "login.microsoftonline.com",
    tenantId: "tenant",
    username: "tomas.giraldo@tuya.com",
    localAccountId: "local-1",
    name: "Tomás Giraldo",
    idTokenClaims: claims,
  } as AccountInfo;
}

/** Un MSAL de mentira: sólo lo que el provider usa. */
function fakeMsal(
  overrides: Partial<{
    redirect: AuthenticationResult | null;
    accounts: AccountInfo[];
    token: string | null;
  }> = {}
) {
  const { redirect = null, accounts = [], token = "access-1" } = overrides;
  let active: AccountInfo | null = null;
  const msal = {
    initialize: vi.fn(async () => {}),
    handleRedirectPromise: vi.fn(async () => redirect),
    getActiveAccount: vi.fn(() => active),
    setActiveAccount: vi.fn((a: AccountInfo | null) => {
      active = a;
    }),
    getAllAccounts: vi.fn(() => accounts),
    acquireTokenSilent: vi.fn(async () => {
      if (token === null) throw new Error("interaction_required");
      return { accessToken: token } as AuthenticationResult;
    }),
    loginRedirect: vi.fn(async () => {}),
    logoutRedirect: vi.fn(async () => {}),
  };
  return msal as unknown as IPublicClientApplication & typeof msal;
}

const Probe: React.FC = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="status">{auth.session.status}</span>
      <span data-testid="roles">
        {auth.session.status === "authenticated"
          ? auth.session.roles.join(",")
          : ""}
      </span>
      <span data-testid="token">
        {auth.session.status === "authenticated"
          ? String(auth.session.accessToken)
          : ""}
      </span>
      <button onClick={() => auth.login("/capacidad")}>login</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
};

function renderProvider(msal: IPublicClientApplication) {
  const store = createSessionStore();
  render(
    <EntraAuthProvider config={config} store={store} msal={msal}>
      <Probe />
    </EntraAuthProvider>
  );
  return store;
}

describe("EntraAuthProvider", () => {
  it("sin cuenta queda anónimo, y carga mientras resuelve", async () => {
    const msal = fakeMsal();
    renderProvider(msal);

    expect(screen.getByTestId("loading").textContent).toBe("true");
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );
    expect(screen.getByTestId("status").textContent).toBe("anonymous");
    expect(msal.initialize).toHaveBeenCalled();
  });

  it("con cuenta en cache arma la sesión con roles mapeados y token silencioso", async () => {
    const msal = fakeMsal({
      accounts: [
        account({
          oid: "oid-1",
          roles: ["Plataforma.ChapterLead", "Otra.Rol"],
        }),
      ],
    });
    const store = renderProvider(msal);

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("authenticated")
    );
    expect(screen.getByTestId("roles").textContent).toBe("chapter-lead");
    expect(screen.getByTestId("token").textContent).toBe("access-1");
    expect(msal.setActiveAccount).toHaveBeenCalled();
    // La fuente para módulos ve lo mismo que la pantalla.
    expect(store.getSession().status).toBe("authenticated");
  });

  it("si la renovación silenciosa falla, la sesión sigue sin token", async () => {
    const msal = fakeMsal({
      accounts: [account({ oid: "oid-1", roles: ["Plataforma.Admin"] })],
      token: null,
    });
    renderProvider(msal);

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("authenticated")
    );
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("al volver del proveedor recuerda la ruta pedida", async () => {
    const acc = account({ oid: "oid-1", roles: ["Plataforma.Admin"] });
    const msal = fakeMsal({
      redirect: {
        account: acc,
        state: "/capacidad/personas",
      } as AuthenticationResult,
    });
    renderProvider(msal);

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("authenticated")
    );
    expect(window.sessionStorage.getItem("host:returnTo")).toBe(
      "/capacidad/personas"
    );
  });

  it("login redirige con los scopes y la ruta de retorno; logout limpia y redirige", async () => {
    const msal = fakeMsal({
      accounts: [account({ oid: "oid-1", roles: ["Plataforma.Admin"] })],
    });
    const store = renderProvider(msal);
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    await act(async () => {
      screen.getByText("login").click();
    });
    expect(msal.loginRedirect).toHaveBeenCalledWith({
      scopes: config.apiScopes,
      state: "/capacidad",
    });

    await act(async () => {
      screen.getByText("logout").click();
    });
    expect(store.getSession().status).toBe("anonymous");
    expect(msal.logoutRedirect).toHaveBeenCalled();
  });
});

describe("accountToSession", () => {
  it("usa oid, name y username de la cuenta, y mapea roles y scopes", () => {
    const session = accountToSession(
      account({ oid: "oid-1", roles: ["Plataforma.Admin"], scp: "a b" }),
      "tok"
    );
    expect(session).toMatchObject({
      status: "authenticated",
      user: {
        id: "oid-1",
        name: "Tomás Giraldo",
        username: "tomas.giraldo@tuya.com",
      },
      roles: ["admin"],
      scopes: ["a", "b"],
      accessToken: "tok",
    });
  });

  it("sin oid usa el id local; sin name usa el username", () => {
    const acc = { ...account({}), name: undefined } as AccountInfo;
    const session = accountToSession(acc, null);
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    expect(session.user.id).toBe("local-1");
    expect(session.user.name).toBe("tomas.giraldo@tuya.com");
    expect(session.roles).toEqual([]);
  });
});
