import { describe, expect, it } from "vitest";
import {
  MODULES,
  buildModules,
  currentModule,
  visibleModules,
  type ModuleDefinition,
} from "../registry";
import type { AppRole } from "@features/auth-session";

const hasRoleOf =
  (mine: AppRole[]) =>
  (...roles: AppRole[]) =>
    roles.some((role) => mine.includes(role));

describe("visibleModules", () => {
  it("cada rol ve sus módulos; sin roles no ve ninguno", () => {
    expect(visibleModules(hasRoleOf(["admin"])).map((m) => m.id)).toEqual([
      "capacidad",
      "iniciativas",
    ]);
    expect(
      visibleModules(hasRoleOf(["chapter-lead"])).map((m) => m.id)
    ).toEqual(["capacidad", "iniciativas"]);
    expect(visibleModules(hasRoleOf(["tech-lead"])).map((m) => m.id)).toEqual([
      "iniciativas",
    ]);
    expect(visibleModules(hasRoleOf([]))).toEqual([]);
  });

  it("un módulo sin roles declarados lo ve cualquiera con sesión", () => {
    const open: ModuleDefinition = {
      id: "abierto",
      name: "Abierto",
      description: "",
      color: "#000",
      basePath: "/abierto",
    };
    expect(visibleModules(hasRoleOf([]), [...MODULES, open])).toEqual([open]);
  });
});

describe("currentModule", () => {
  it("resuelve el módulo por prefijo de ruta, sin confundir prefijos parciales", () => {
    expect(currentModule("/capacidad")?.id).toBe("capacidad");
    expect(currentModule("/capacidad/personas/1")?.id).toBe("capacidad");
    expect(currentModule("/capacidades")).toBeUndefined();
    expect(currentModule("/")).toBeUndefined();
  });
});

describe("buildModules · remote federado", () => {
  it("con la variable, capacidad declara su remoteEntry; sin ella, no", () => {
    const withRemote = buildModules({
      VITE_MF_CAPACIDAD_URL: "http://localhost:4300/remoteEntry.js",
    });
    expect(withRemote.find((m) => m.id === "capacidad")?.remoteEntry).toBe(
      "http://localhost:4300/remoteEntry.js"
    );
    const without = buildModules({});
    expect(
      without.find((m) => m.id === "capacidad")?.remoteEntry
    ).toBeUndefined();
    // Iniciativas sigue sin remote: su ruta muestra el placeholder.
    expect(
      withRemote.find((m) => m.id === "iniciativas")?.remoteEntry
    ).toBeUndefined();
  });
});
