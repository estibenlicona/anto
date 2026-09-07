import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const runtime = vi.hoisted(() => ({
  loadRemote: vi.fn<(id: string) => Promise<unknown>>(),
  registerRemotes: vi.fn(),
}));
vi.mock("@module-federation/runtime", () => runtime);

import { AuthContext } from "@app/providers/AuthContext";
import {
  createSessionStore,
  deriveAuthSession,
  ANONYMOUS_SESSION,
  type HostAuth,
} from "@features/auth-session";
import type { ModuleDefinition } from "@features/modules/registry";
import { RemoteModulePage, HOST_BAR_HEIGHT } from "../RemoteModulePage";

const MODULE: ModuleDefinition = {
  id: "capacidad",
  name: "Gestión de Capacidad",
  description: "",
  color: "#C9151F",
  basePath: "/capacidad",
  roles: ["admin"],
  remoteEntry: "http://localhost:4300/remoteEntry.js",
};

function hostAuth(): HostAuth {
  const store = createSessionStore(ANONYMOUS_SESSION);
  return {
    ...deriveAuthSession(ANONYMOUS_SESSION, false),
    login: vi.fn(),
    logout: vi.fn(),
    acquireToken: vi.fn(async () => "token"),
    source: store,
  };
}

function renderPage(auth = hostAuth()) {
  return render(
    <AuthContext.Provider value={auth}>
      <RemoteModulePage module={MODULE} />
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  runtime.loadRemote.mockReset();
  runtime.registerRemotes.mockClear();
});

describe("RemoteModulePage", () => {
  it("carga el remote y le entrega el contrato de montaje", async () => {
    const seen: Record<string, unknown> = {};
    runtime.loadRemote.mockResolvedValue({
      default: (props: Record<string, unknown>) => {
        Object.assign(seen, props);
        return <div>Módulo remoto montado</div>;
      },
    });
    const auth = hostAuth();
    renderPage(auth);

    expect(
      await screen.findByText("Módulo remoto montado")
    ).toBeInTheDocument();
    expect(runtime.loadRemote).toHaveBeenCalledWith("capacidad/module");
    expect(runtime.registerRemotes).toHaveBeenCalledWith([
      { name: "capacidad", entry: MODULE.remoteEntry, type: "module" },
    ]);
    expect(seen.basePath).toBe("/capacidad");
    expect(seen.topOffset).toBe(HOST_BAR_HEIGHT);
    expect(seen.source).toBe(auth.source);
    expect(seen.acquireToken).toBe(auth.acquireToken);
  });

  it("si el remote no carga muestra el aviso y reintenta al pedirlo", async () => {
    runtime.loadRemote.mockRejectedValueOnce(new Error("red caída"));
    runtime.loadRemote.mockResolvedValueOnce({
      default: () => <div>Módulo remoto montado</div>,
    });
    // El error del lazy llega a la consola de React; acá es esperado.
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage();

    expect(
      await screen.findByText("Gestión de Capacidad no pudo cargarse")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByText("Módulo remoto montado")
    ).toBeInTheDocument();
    expect(runtime.loadRemote).toHaveBeenCalledTimes(2);
    silence.mockRestore();
  });
});
