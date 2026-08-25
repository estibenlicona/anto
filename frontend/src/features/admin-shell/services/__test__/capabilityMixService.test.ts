import { describe, it, expect, beforeEach } from "vitest";
import {
  capabilityMixService,
  mixAmount,
  type CapabilityMix,
} from "../capabilityMixService";
import { resetCapabilityMixMock } from "../../../../mocks/handlers/capability-mix.handlers";

describe("mixAmount", () => {
  const row = { id: "x", capacidad: "Backend Dev", porTalla: { XS: 1, S: 2 } };

  it("returns the amount recorded for a talla", () => {
    expect(mixAmount(row, "S")).toBe(2);
  });

  it("reads a missing talla as zero", () => {
    // Una talla nueva deja una celda por completar, no rompe el render.
    expect(mixAmount(row, "XXL")).toBe(0);
  });
});

describe("capabilityMixService against the mock", () => {
  beforeEach(() => {
    resetCapabilityMixMock();
  });

  it("loads the seeded mix", async () => {
    const mix = await capabilityMixService.getMix();
    expect(mix.map((row) => row.capacidad)).toEqual([
      "Backend Dev",
      "QA Engineer",
      "Arquitecto",
    ]);
    expect(mixAmount(mix[0], "XL")).toBe(8);
  });

  it("persists a save so the next load reflects it", async () => {
    const mix = await capabilityMixService.getMix();
    await capabilityMixService.saveMix([
      { ...mix[0], porTalla: { ...mix[0].porTalla, M: 4 } },
      ...mix.slice(1),
    ]);

    const reloaded = await capabilityMixService.getMix();
    expect(mixAmount(reloaded[0], "M")).toBe(4);
  });

  it("rejects an empty capability name", async () => {
    const mix = await capabilityMixService.getMix();

    await expect(
      capabilityMixService.saveMix([
        { ...mix[0], capacidad: "  " },
        ...mix.slice(1),
      ])
    ).rejects.toBeDefined();

    const reloaded = await capabilityMixService.getMix();
    expect(reloaded[0].capacidad).toBe("Backend Dev");
  });

  it("rejects a name that repeats another, ignoring case and padding", async () => {
    const mix = await capabilityMixService.getMix();

    await expect(
      capabilityMixService.saveMix([
        { ...mix[0], capacidad: " qa engineer " },
        ...mix.slice(1),
      ])
    ).rejects.toBeDefined();

    const reloaded = await capabilityMixService.getMix();
    expect(reloaded[0].capacidad).toBe("Backend Dev");
  });

  it("rejects a negative amount", async () => {
    const mix = await capabilityMixService.getMix();

    await expect(
      capabilityMixService.saveMix([
        { ...mix[0], porTalla: { ...mix[0].porTalla, S: -1 } },
        ...mix.slice(1),
      ])
    ).rejects.toBeDefined();

    const reloaded = await capabilityMixService.getMix();
    expect(mixAmount(reloaded[0], "S")).toBe(2);
  });

  it("rejects a fractional amount — the mix counts people", async () => {
    const mix = await capabilityMixService.getMix();

    await expect(
      capabilityMixService.saveMix([
        { ...mix[0], porTalla: { ...mix[0].porTalla, S: 1.5 } },
        ...mix.slice(1),
      ] as CapabilityMix)
    ).rejects.toBeDefined();
  });
});
