import { describe, it, expect } from "vitest";
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
  it("reports no session as not authenticated, without erroring", () => {
    const port = deriveAuthSession(ANONYMOUS_SESSION, false);
    expect(port.isAuthenticated).toBe(false);
    expect(port.hasRole("admin")).toBe(false);
    expect(port.hasScope("capacidad.read")).toBe(false);
  });

  it("reports an authenticated session", () => {
    const port = deriveAuthSession(authenticated, false);
    expect(port.isAuthenticated).toBe(true);
    expect(port.session).toBe(authenticated);
  });

  it("matches a role the session has", () => {
    expect(
      deriveAuthSession(authenticated, false).hasRole("chapter-lead")
    ).toBe(true);
  });

  it("does not match a role the session lacks", () => {
    expect(deriveAuthSession(authenticated, false).hasRole("admin")).toBe(
      false
    );
  });

  it("matches when any of the requested roles is present", () => {
    // Una ruta que admite varios perfiles es lo normal; exigir todos a la vez
    // no tiene caso de uso acá.
    expect(
      deriveAuthSession(authenticated, false).hasRole("admin", "chapter-lead")
    ).toBe(true);
  });

  it("does not match when no role is requested", () => {
    expect(deriveAuthSession(authenticated, false).hasRole()).toBe(false);
  });

  it("matches scopes exactly", () => {
    const port = deriveAuthSession(authenticated, false);
    expect(port.hasScope("capacidad.write")).toBe(true);
    expect(port.hasScope("parametros.write")).toBe(false);
  });

  it("carries isLoading through", () => {
    expect(deriveAuthSession(ANONYMOUS_SESSION, true).isLoading).toBe(true);
  });
});
