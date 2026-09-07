import { describe, expect, it } from "vitest";
import { initialsOf, navbarUserOf, ROLE_LABELS } from "../hostIdentity";
import type { AppRole, Session } from "@features/auth-session";

const sessionWith = (roles: AppRole[]): Session => ({
  status: "authenticated",
  user: {
    id: "u1",
    name: "Lucía Técnica",
    username: "lucia.tecnica@tuya.local",
  },
  roles,
  scopes: [],
  claims: {},
  accessToken: null,
});

describe("navbarUserOf", () => {
  it("muestra la etiqueta del primer rol, incluida la líder técnica", () => {
    expect(navbarUserOf(sessionWith(["tech-lead"])).role).toBe("Líder Técnico");
    expect(navbarUserOf(sessionWith(["chapter-lead"])).role).toBe(
      "Líder de Expertise"
    );
    expect(navbarUserOf(sessionWith([])).role).toBe("Sin rol asignado");
  });

  it("todo rol de negocio tiene etiqueta", () => {
    for (const label of Object.values(ROLE_LABELS)) {
      expect(label.trim().length).toBeGreaterThan(0);
    }
  });

  it("deriva las iniciales del nombre", () => {
    expect(initialsOf("Lucía Técnica")).toBe("LT");
    expect(navbarUserOf(sessionWith(["tech-lead"])).initials).toBe("LT");
  });
});
