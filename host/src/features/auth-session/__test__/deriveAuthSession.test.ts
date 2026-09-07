import { describe, expect, it } from "vitest";
import { deriveAuthSession } from "../deriveAuthSession";
import { ANONYMOUS_SESSION, type Session } from "../types";

const authenticated: Session = {
  status: "authenticated",
  user: { id: "u1", name: "Ana", username: "ana@tuya.com" },
  roles: ["chapter-lead"],
  scopes: ["capacidad.read", "capacidad.write"],
  claims: { oid: "u1" },
  accessToken: "token",
};

describe("deriveAuthSession", () => {
  it("reporta la ausencia de sesión sin fallar", () => {
    const port = deriveAuthSession(ANONYMOUS_SESSION, false);
    expect(port.isAuthenticated).toBe(false);
    expect(port.hasRole("admin")).toBe(false);
    expect(port.hasScope("capacidad.read")).toBe(false);
  });

  it("reporta una sesión autenticada con la misma referencia", () => {
    const port = deriveAuthSession(authenticated, false);
    expect(port.isAuthenticated).toBe(true);
    expect(port.session).toBe(authenticated);
  });

  it("acepta cualquiera de los roles pedidos, y ninguno si no se pide ninguno", () => {
    const port = deriveAuthSession(authenticated, false);
    expect(port.hasRole("chapter-lead")).toBe(true);
    expect(port.hasRole("admin")).toBe(false);
    expect(port.hasRole("admin", "chapter-lead")).toBe(true);
    expect(port.hasRole()).toBe(false);
  });

  it("compara scopes exactos y propaga isLoading", () => {
    const port = deriveAuthSession(authenticated, true);
    expect(port.hasScope("capacidad.write")).toBe(true);
    expect(port.hasScope("parametros.write")).toBe(false);
    expect(port.isLoading).toBe(true);
  });
});
