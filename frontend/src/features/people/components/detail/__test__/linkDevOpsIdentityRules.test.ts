import { describe, it, expect } from "vitest";
import { canLink, hasEmailShape, initialsOf } from "../linkDevOpsIdentityRules";
import type { DevOpsUserDto } from "../../../services/personDetailService";

const user: DevOpsUserDto = {
  id: "u-1",
  displayName: "Camila Restrepo",
  email: "camila.restrepo@tuya.com",
  avatarUrl: null,
  projects: [],
  teams: [],
  boards: [],
};

describe("hasEmailShape", () => {
  it("acepta algo@algo.algo, con espacios alrededor", () => {
    expect(hasEmailShape("camila.restrepo@tuya.com")).toBe(true);
    expect(hasEmailShape("  c@t.co  ")).toBe(true);
  });

  it("rechaza vacío, sin arroba, sin dominio o con espacios adentro", () => {
    expect(hasEmailShape("")).toBe(false);
    expect(hasEmailShape("   ")).toBe(false);
    expect(hasEmailShape("camila.restrepo")).toBe(false);
    expect(hasEmailShape("camila@tuya")).toBe(false);
    expect(hasEmailShape("camila restrepo@tuya.com")).toBe(false);
  });
});

describe("canLink", () => {
  it("sólo con un usuario encontrado para el correo que se ve", () => {
    const found = {
      status: "found" as const,
      user,
      searchedEmail: "camila.restrepo@tuya.com",
    };
    expect(canLink(found, "camila.restrepo@tuya.com")).toBe(true);
    // Mayúsculas y espacios no son otro correo.
    expect(canLink(found, "  Camila.Restrepo@Tuya.com ")).toBe(true);
  });

  it("editar el correo después de buscar deshabilita vincular", () => {
    const found = {
      status: "found" as const,
      user,
      searchedEmail: "camila.restrepo@tuya.com",
    };
    expect(canLink(found, "camila.restrepo@tuya.com.co")).toBe(false);
  });

  it("sin coincidencia, con error, buscando o en reposo no se vincula", () => {
    const email = "camila.restrepo@tuya.com";
    expect(
      canLink({ status: "notFound", user: null, searchedEmail: email }, email)
    ).toBe(false);
    expect(
      canLink({ status: "error", user: null, searchedEmail: email }, email)
    ).toBe(false);
    expect(
      canLink({ status: "searching", user: null, searchedEmail: email }, email)
    ).toBe(false);
    expect(
      canLink({ status: "idle", user: null, searchedEmail: null }, email)
    ).toBe(false);
  });
});

describe("initialsOf", () => {
  it("primera letra del primer y del último nombre, en mayúscula", () => {
    expect(initialsOf("Camila Restrepo")).toBe("CR");
    expect(initialsOf("laura mejía restrepo")).toBe("LR");
    expect(initialsOf("Camila")).toBe("C");
    expect(initialsOf("   ")).toBe("?");
  });
});
