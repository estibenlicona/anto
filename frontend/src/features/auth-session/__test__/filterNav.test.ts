import { describe, expect, it } from "vitest";
import type { AppRole, CapacityPermission, RoleRestrictedEntry } from "..";
import { filterNav, filterNavByRole } from "..";

type TestGroup = {
  label: string;
  items: (RoleRestrictedEntry & { id: string })[];
};

const groups: TestGroup[] = [
  {
    label: "",
    items: [{ id: "inicio" }],
  },
  {
    label: "Capacidad",
    items: [
      { id: "celulas", permission: "Celulas" as CapacityPermission },
      { id: "facturacion", permission: "Prefacturacion" as CapacityPermission },
    ],
  },
  {
    label: "Sólo admin",
    items: [
      {
        id: "parametros",
        roles: ["admin"] as AppRole[],
        permission: "Parametros" as CapacityPermission,
      },
    ],
  },
];

const predicates = (roles: AppRole[], permissions: CapacityPermission[]) => ({
  hasRole: (...wanted: AppRole[]) => wanted.some((r) => roles.includes(r)),
  hasPermission: (...wanted: CapacityPermission[]) =>
    wanted.some((p) => permissions.includes(p)),
});

describe("filterNav", () => {
  it("oculta la entrada cuyo permiso falta y conserva las demás", () => {
    const result = filterNav(groups, predicates(["chapter-lead"], ["Celulas"]));
    expect(result.map((g) => g.items.map((i) => i.id))).toEqual([
      ["inicio"],
      ["celulas"],
    ]);
  });

  it("una entrada sin restricciones queda siempre", () => {
    const result = filterNav(groups, predicates([], []));
    expect(result).toEqual([{ label: "", items: [{ id: "inicio" }] }]);
  });

  it("rol y permiso se exigen juntos: con uno solo no alcanza", () => {
    const soloRol = filterNav(groups, predicates(["admin"], []));
    expect(soloRol.flatMap((g) => g.items.map((i) => i.id))).not.toContain(
      "parametros"
    );
    const ambos = filterNav(groups, predicates(["admin"], ["Parametros"]));
    expect(ambos.flatMap((g) => g.items.map((i) => i.id))).toContain(
      "parametros"
    );
  });

  it("un grupo que queda vacío desaparece del menú", () => {
    const result = filterNav(groups, predicates([], ["Celulas"]));
    expect(result.map((g) => g.label)).toEqual(["", "Capacidad"]);
  });
});

describe("filterNavByRole (alias deprecado)", () => {
  it("filtra por rol e ignora los permisos, como antes", () => {
    const result = filterNavByRole(groups, (...wanted) =>
      wanted.includes("admin")
    );
    expect(result.flatMap((g) => g.items.map((i) => i.id))).toEqual([
      "inicio",
      "celulas",
      "facturacion",
      "parametros",
    ]);
  });
});
