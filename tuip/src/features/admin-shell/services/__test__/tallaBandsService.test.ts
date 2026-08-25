import { describe, it, expect, beforeEach } from "vitest";
import {
  bandRange,
  replaceBand,
  tallaBandsService,
  type TallaBandSet,
  type TallaBands,
} from "../tallaBandsService";
import { resetTallaBandsMock } from "../../../../mocks/handlers/talla-bands.handlers";

describe("bandRange", () => {
  const boundaries: TallaBands["boundaries"] = [20, 40, 60, 80];

  it("starts the first band at the range floor", () => {
    expect(bandRange(boundaries, 0)).toEqual({ from: 0, to: 20 });
  });

  it("starts every other band one past the shared boundary", () => {
    // El límite pertenece a la banda de abajo: XS llega a 20, S arranca en 21.
    expect(bandRange(boundaries, 1)).toEqual({ from: 21, to: 40 });
    expect(bandRange(boundaries, 2)).toEqual({ from: 41, to: 60 });
  });

  it("closes the last band at the range ceiling", () => {
    expect(bandRange(boundaries, 4)).toEqual({ from: 81, to: 100 });
  });

  it("leaves no gap between one band and the next", () => {
    for (let i = 0; i < 4; i++) {
      expect(bandRange(boundaries, i + 1).from).toBe(
        bandRange(boundaries, i).to + 1
      );
    }
  });
});

describe("replaceBand", () => {
  it("swaps one band and leaves the rest alone", () => {
    const bands = [
      { talla: "XS", pmMin: 0.5, pmMax: 1, lectura: "a" },
      { talla: "S", pmMin: 1, pmMax: 3, lectura: "b" },
      { talla: "M", pmMin: 3, pmMax: 6, lectura: "c" },
      { talla: "L", pmMin: 6, pmMax: 10, lectura: "d" },
      { talla: "XL", pmMin: 10, pmMax: 18, lectura: "e" },
    ] as TallaBandSet;

    const next = replaceBand(bands, 2, { ...bands[2], lectura: "cambiada" });

    expect(next).toHaveLength(5);
    expect(next[2].lectura).toBe("cambiada");
    expect(next[1]).toEqual(bands[1]);
    expect(bands[2].lectura).toBe("c");
  });
});

describe("tallaBandsService against the mock", () => {
  beforeEach(() => {
    resetTallaBandsMock();
  });

  it("loads the seeded bands", async () => {
    const bands = await tallaBandsService.getBands();
    expect(bands.boundaries).toEqual([20, 40, 60, 80]);
    expect(bands.bands.map((b) => b.talla)).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
    ]);
  });

  it("persists a save so the next load reflects it", async () => {
    const bands = await tallaBandsService.getBands();
    await tallaBandsService.saveBands({
      ...bands,
      boundaries: [30, 45, 60, 80],
    });

    const reloaded = await tallaBandsService.getBands();
    expect(reloaded.boundaries).toEqual([30, 45, 60, 80]);
  });

  it("rejects boundaries that would leave a band with no width", async () => {
    const bands = await tallaBandsService.getBands();

    await expect(
      tallaBandsService.saveBands({ ...bands, boundaries: [20, 22, 60, 80] })
    ).rejects.toBeDefined();

    const reloaded = await tallaBandsService.getBands();
    expect(reloaded.boundaries).toEqual([20, 40, 60, 80]);
  });

  it("rejects a band whose person-month minimum exceeds its maximum", async () => {
    const bands = await tallaBandsService.getBands();
    const broken = replaceBand(bands.bands, 0, {
      ...bands.bands[0],
      pmMin: 9,
      pmMax: 1,
    });

    await expect(
      tallaBandsService.saveBands({ ...bands, bands: broken })
    ).rejects.toBeDefined();

    const reloaded = await tallaBandsService.getBands();
    expect(reloaded.bands[0].pmMin).toBe(0.5);
  });
});
