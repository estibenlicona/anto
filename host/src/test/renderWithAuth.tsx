import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext } from "@app/providers/AuthContext";
import { routes } from "@app/router/routes";
import {
  ANONYMOUS_SESSION,
  createSessionStore,
  deriveAuthSession,
  type AppRole,
  type HostAuth,
  type Session,
} from "@features/auth-session";

export function sessionWith(
  roles: AppRole[],
  name = "Ana Administradora"
): Session {
  return {
    status: "authenticated",
    user: { id: "u1", name, username: "ana@tuya.com" },
    roles,
    scopes: [],
    claims: {},
    accessToken: "t",
  };
}

/**
 * Un puerto de sesión de mentira para probar pantallas y guards contra la
 * sesión directamente, sin pasar por MSAL: lo que
 * interesa es su decisión dada una sesión, no de dónde salió.
 */
export function fakeAuth(
  session: Session = ANONYMOUS_SESSION,
  { isLoading = false }: { isLoading?: boolean } = {}
): HostAuth {
  const store = createSessionStore(session);
  return {
    ...deriveAuthSession(session, isLoading),
    login: vi.fn(),
    logout: vi.fn(),
    acquireToken: vi.fn(async () => null),
    source: store,
  };
}

/** Monta las rutas reales del host bajo un puerto de sesión dado. */
export function renderApp(auth: HostAuth, initialEntries: string[] = ["/"]) {
  const router = createMemoryRouter(routes, { initialEntries });
  const view = render(
    <AuthContext.Provider value={auth}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
  return { ...view, router };
}
