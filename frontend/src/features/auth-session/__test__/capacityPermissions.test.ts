import { describe, expect, it } from "vitest";
import {
  ANONYMOUS_SESSION,
  CAPACITY_PERMISSIONS,
  deriveAuthSession,
  mapCapacityRoles,
} from "..";

describe("mapCapacityRoles", () => {
  it("traduce los sub-claims Capacidad.* a permisos de sección", () => {
    expect(
      mapCapacityRoles(["Capacidad.Celulas", "Capacidad.Dedicacion"])
    ).toEqual(["Celulas", "Dedicacion"]);
  });

  it("ignora valores desconocidos, sin prefijo o no textuales, sin fallar", () => {
    expect(
      mapCapacityRoles([
        "Capacidad.Inexistente",
        "Plataforma.Admin",
        "Celulas",
        42,
        null,
        "Capacidad.Personas",
      ])
    ).toEqual(["Personas"]);
  });

  it("con cualquier cosa que no sea un arreglo devuelve vacío", () => {
    expect(mapCapacityRoles(undefined)).toEqual([]);
    expect(mapCapacityRoles("Capacidad.Celulas")).toEqual([]);
  });

  it("el catálogo cubre las doce secciones del módulo", () => {
    expect(CAPACITY_PERMISSIONS).toHaveLength(12);
  });
});

describe("hasPermission", () => {
  it("en sesión anónima siempre es falso", () => {
    const port = deriveAuthSession(ANONYMOUS_SESSION, false);
    expect(port.hasPermission("Celulas")).toBe(false);
  });

  it("cualquiera de los permisos pedidos alcanza", () => {
    const port = deriveAuthSession(
      {
        status: "authenticated",
        user: { id: "u1", name: "Ana", username: "ana@tuya.com" },
        roles: ["chapter-lead"],
        permissions: ["Celulas"],
        scopes: [],
        claims: {},
        accessToken: "t",
      },
      false
    );
    expect(port.hasPermission("Celulas")).toBe(true);
    expect(port.hasPermission("Personas", "Celulas")).toBe(true);
    expect(port.hasPermission("Personas")).toBe(false);
  });
});
