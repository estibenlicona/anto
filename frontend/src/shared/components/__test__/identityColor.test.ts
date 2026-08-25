import { describe, it, expect } from "vitest";
import { identityColorFor, identityColorNames } from "@tuya-ui/components";

// tuip no tiene suite de tests propia (su script `test` es `tsc --noEmit`), así
// que el reparto se prueba desde acá, como cualquier consumidor — mismo
// criterio que `Input.adornments.test.tsx`.
describe("identityColorFor", () => {
  it("returns the same color for the same id, every time", () => {
    const first = identityColorFor("p-001");
    for (let i = 0; i < 50; i++) {
      expect(identityColorFor("p-001")).toBe(first);
    }
  });

  it("always returns a color from the vocabulary", () => {
    for (let i = 0; i < 200; i++) {
      expect(identityColorNames).toContain(identityColorFor(`person-${i}`));
    }
  });

  it("covers every color across a large set of ids", () => {
    const seen = new Set(
      Array.from({ length: 2000 }, (_, i) => identityColorFor(`person-${i}`))
    );
    expect(seen.size).toBe(identityColorNames.length);
  });

  it("spreads ids reasonably evenly across the colors", () => {
    const counts = new Map<string, number>();
    const total = 12000;
    for (let i = 0; i < total; i++) {
      const color = identityColorFor(`person-${i}`);
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
    // Un reparto perfecto daría total/12 por color. Se admite hasta el doble o
    // la mitad: alcanza para detectar un hash que agrupe, sin volver el test
    // frágil ante la variación normal de un hash real.
    const ideal = total / identityColorNames.length;
    for (const name of identityColorNames) {
      const count = counts.get(name) ?? 0;
      expect(count).toBeGreaterThan(ideal / 2);
      expect(count).toBeLessThan(ideal * 2);
    }
  });

  it("does not throw on an empty id", () => {
    expect(() => identityColorFor("")).not.toThrow();
    expect(identityColorNames).toContain(identityColorFor(""));
  });

  it("gives different colors to ids that differ only in the last character", () => {
    // No es una garantía del contrato — con 12 colores hay colisiones — pero
    // ids consecutivos cayendo todos en el mismo color delataría un hash que
    // ignora el final de la cadena.
    const colors = new Set(["p-1", "p-2", "p-3", "p-4"].map(identityColorFor));
    expect(colors.size).toBeGreaterThan(1);
  });
});
