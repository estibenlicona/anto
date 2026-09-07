import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { useAuth } from "@features/authentication/index";
import { CapacitySessionBridge } from "../CapacitySessionBridge";
import type { HostProvidedSession, HostProvidedSource } from "../contract";

const authenticated = (name: string): HostProvidedSession => ({
  status: "authenticated",
  user: { id: "u1", name, username: "ana@tuya.com" },
  roles: ["chapter-lead"],
  scopes: [],
  claims: {},
  accessToken: "host-token",
});

/** Fuente controlable, con la misma referencia de sesión hasta `set`. */
function fakeSource(initial: HostProvidedSession) {
  let session = initial;
  const listeners = new Set<() => void>();
  const source: HostProvidedSource = {
    getSession: () => session,
    subscribe: (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
  };
  return {
    source,
    set(next: HostProvidedSession) {
      session = next;
      listeners.forEach((l) => l());
    },
  };
}

/** Un JWT de utilería: header.payload.firma — sólo el payload importa. */
const jwtWith = (claims: Record<string, unknown>) =>
  `x.${btoa(JSON.stringify(claims))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")}.y`;

const Probe: React.FC = () => {
  const { session, isLoading } = useAuth();
  if (isLoading) return <div>cargando</div>;
  return (
    <div>
      {session.status === "authenticated"
        ? `permisos:${session.permissions.join(",")}`
        : "anonimo"}
    </div>
  );
};

describe("CapacitySessionBridge", () => {
  it("deriva los permisos del claim roles del token de la API", async () => {
    const { source } = fakeSource(authenticated("Ana"));
    const acquireToken = vi.fn(async () =>
      jwtWith({ roles: ["Capacidad.Celulas", "Capacidad.Dedicacion", "otro"] })
    );
    render(
      <CapacitySessionBridge source={source} acquireToken={acquireToken}>
        <Probe />
      </CapacitySessionBridge>
    );
    expect(
      await screen.findByText("permisos:Celulas,Dedicacion")
    ).toBeInTheDocument();
    expect(acquireToken).toHaveBeenCalledWith([
      "api://capacidad/access_as_user",
    ]);
  });

  it("sin token la sesión queda sin permisos, sin fallar", async () => {
    const { source } = fakeSource(authenticated("Ana"));
    render(
      <CapacitySessionBridge source={source} acquireToken={async () => null}>
        <Probe />
      </CapacitySessionBridge>
    );
    expect(await screen.findByText("permisos:")).toBeInTheDocument();
  });

  it("re-deriva al cambiar la sesión del host", async () => {
    const fake = fakeSource(authenticated("Ana"));
    let call = 0;
    const acquireToken = vi.fn(async () =>
      jwtWith({
        roles: call++ === 0 ? ["Capacidad.Celulas"] : ["Capacidad.Sprints"],
      })
    );
    render(
      <CapacitySessionBridge source={fake.source} acquireToken={acquireToken}>
        <Probe />
      </CapacitySessionBridge>
    );
    expect(await screen.findByText("permisos:Celulas")).toBeInTheDocument();

    fake.set(authenticated("Otra"));
    expect(await screen.findByText("permisos:Sprints")).toBeInTheDocument();
    await waitFor(() => expect(acquireToken).toHaveBeenCalledTimes(2));
  });

  it("anónimo pasa tal cual, sin pedir token", async () => {
    const { source } = fakeSource({ status: "anonymous" });
    const acquireToken = vi.fn(async () => null);
    render(
      <CapacitySessionBridge source={source} acquireToken={acquireToken}>
        <Probe />
      </CapacitySessionBridge>
    );
    expect(await screen.findByText("anonimo")).toBeInTheDocument();
    expect(acquireToken).not.toHaveBeenCalled();
  });
});
