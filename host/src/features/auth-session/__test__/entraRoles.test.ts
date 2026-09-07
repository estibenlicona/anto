import { describe, expect, it } from "vitest";
import { mapEntraRoles, splitScopes } from "../entraRoles";

describe("mapEntraRoles", () => {
  it("traduce los app roles de Entra a roles de negocio", () => {
    expect(mapEntraRoles(["Plataforma.Admin"])).toEqual(["admin"]);
    expect(mapEntraRoles(["Plataforma.ChapterLead"])).toEqual(["chapter-lead"]);
  });

  it("ignora los roles desconocidos y lo que no es una lista de strings", () => {
    expect(mapEntraRoles(["Plataforma.Admin", "OtraApp.Rol", 42])).toEqual([
      "admin",
    ]);
    expect(mapEntraRoles(undefined)).toEqual([]);
    expect(mapEntraRoles("Plataforma.Admin")).toEqual([]);
  });
});

describe("splitScopes", () => {
  it("parte el claim scp por espacio y descarta vacíos", () => {
    expect(splitScopes("capacidad.read  capacidad.write ")).toEqual([
      "capacidad.read",
      "capacidad.write",
    ]);
    expect(splitScopes(undefined)).toEqual([]);
  });
});

describe("mapEntraRoles — líder técnico", () => {
  it("traduce Plataforma.TechLead a tech-lead", () => {
    expect(mapEntraRoles(["Plataforma.TechLead"])).toEqual(["tech-lead"]);
    expect(
      mapEntraRoles(["Plataforma.ChapterLead", "Plataforma.TechLead"])
    ).toEqual(["chapter-lead", "tech-lead"]);
  });
});
