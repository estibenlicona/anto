import { describe, expect, it } from "vitest";
import {
  consumeReturnTo,
  rememberReturnTo,
  sanitizeReturnTo,
} from "../returnTo";

describe("returnTo", () => {
  it("sólo acepta rutas internas", () => {
    expect(sanitizeReturnTo("/capacidad/personas")).toBe("/capacidad/personas");
    expect(sanitizeReturnTo("https://evil.example")).toBeNull();
    expect(sanitizeReturnTo("//evil.example")).toBeNull();
    expect(sanitizeReturnTo(42)).toBeNull();
  });

  it("recuerda la ruta y la entrega una sola vez", () => {
    rememberReturnTo("/capacidad");
    expect(consumeReturnTo()).toBe("/capacidad");
    expect(consumeReturnTo()).toBeNull();
  });

  it("no recuerda la raíz ni destinos inválidos", () => {
    rememberReturnTo("/");
    rememberReturnTo("https://evil.example");
    expect(consumeReturnTo()).toBeNull();
  });
});
