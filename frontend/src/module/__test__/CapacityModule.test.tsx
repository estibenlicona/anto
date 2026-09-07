import { describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  CAPACITY_PERMISSIONS,
  type CapacityPermission,
} from "@features/auth-session";
import { capacityNavGroups } from "@features/capacity-shell/navigation";
import CapacityModule from "../CapacityModule";
import type { HostProvidedSession, HostProvidedSource } from "../contract";

const BASE = "/capacidad";

const session = (name = "Ana Administradora"): HostProvidedSession => ({
  status: "authenticated",
  user: { id: "u1", name, username: "ana@tuya.com" },
  roles: ["admin"],
  scopes: [],
  claims: {},
  accessToken: "host-token",
});

const sourceOf = (s: HostProvidedSession): HostProvidedSource => ({
  getSession: () => s,
  subscribe: () => () => {},
});

const jwtWith = (roles: string[]) =>
  `x.${btoa(JSON.stringify({ roles }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")}.y`;

const tokenFor = (permissions: readonly CapacityPermission[]) => async () =>
  jwtWith(permissions.map((p) => `Capacidad.${p}`));

function renderModule(
  initialPath: string,
  {
    permissions = CAPACITY_PERMISSIONS,
    hostSession = session(),
  }: {
    permissions?: readonly CapacityPermission[];
    hostSession?: HostProvidedSession;
  } = {}
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path={`${BASE}/*`}
          element={
            <CapacityModule
              source={sourceOf(hostSession)}
              acquireToken={vi.fn(tokenFor(permissions))}
              basePath={BASE}
              topOffset={56}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("CapacityModule (entrada federada)", () => {
  it("monta el shell sin barra propia y con el menú filtrado por permisos", async () => {
    renderModule(BASE, { permissions: ["Celulas", "Personas", "Sprints"] });
    expect(
      await screen.findByRole("link", { name: /Células/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sprints/i })).toBeInTheDocument();
    // Secciones sin permiso y grupos vacíos, fuera.
    expect(
      screen.queryByRole("link", { name: /Ingesta/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("DevOps")).not.toBeInTheDocument();
    // Sin barra propia: ni banner ni menú de cuenta del módulo.
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Cerrar sesión/i })
    ).not.toBeInTheDocument();
  });

  it("deep link a una sección con permiso resuelve la pantalla", async () => {
    renderModule(`${BASE}/celulas`, { permissions: ["Celulas"] });
    expect(
      await screen.findByRole("link", { name: /Células/i })
    ).toBeInTheDocument();
    // La entrada activa del sidebar marca la sección.
    expect(
      (await screen.findByRole("link", { name: /Células/i })).getAttribute(
        "aria-current"
      )
    ).toBeTruthy();
  });

  it("sin el permiso de la sección muestra el aviso en el lugar, sin login", async () => {
    renderModule(`${BASE}/facturacion`, {
      permissions: ["Celulas", "Personas"],
    });
    expect(
      await screen.findByText("No tienes permisos para esta pantalla")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Iniciar sesión/i)).not.toBeInTheDocument();
  });

  it("con el contrato anónimo muestra el aviso, sin pantalla de login propia", async () => {
    renderModule(BASE, { hostSession: { status: "anonymous" } });
    expect(
      await screen.findByText("No tienes permisos para esta pantalla")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Iniciar sesión/i)).not.toBeInTheDocument();
  });
});

describe("coherencia menú ↔ rutas del módulo", () => {
  const entradas = capacityNavGroups.flatMap((group) =>
    group.items
      .filter((item) => item.permission)
      .map((item) => ({
        id: item.id,
        href: item.href,
        permission: item.permission!,
      }))
  );

  it("hay doce entradas con permiso", () => {
    expect(entradas).toHaveLength(12);
  });

  it.each(entradas)(
    "$id: sin $permission su ruta muestra el aviso",
    async ({ href, permission }) => {
      renderModule(`${BASE}/${href}`, {
        permissions: CAPACITY_PERMISSIONS.filter((p) => p !== permission),
      });
      expect(
        await screen.findByText(
          "No tienes permisos para esta pantalla",
          {},
          { timeout: 20_000 }
        )
      ).toBeInTheDocument();
      cleanup();
    },
    30_000
  );
});
