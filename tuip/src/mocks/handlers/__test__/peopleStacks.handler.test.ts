import { describe, it, expect, beforeEach } from "vitest";
import { personService } from "@features/people/services/personService";
import { personDetailService } from "@features/people/services/personDetailService";
import { resetPeopleMock, STACK_CATALOG } from "../people.handlers";
import { resetPersonDetailMock } from "../personDetail.handlers";
import { MARIA } from "../personDetail.seeds";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

describe("stacks en el mock de personas", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetPersonDetailMock();
  });

  it("cada persona trae sus stacks con el principal primero", async () => {
    const { items } = await personService.list(1, 100);
    const maria = items.find((p) => p.id === MARIA)!;
    expect(maria.stacks[0]).toMatchObject({ name: ".NET", isPrimary: true });
    expect(maria.stacks.filter((s) => s.isPrimary)).toHaveLength(1);
    expect(
      items.every((p) => p.stacks.every((s) => STACK_CATALOG.includes(s.name)))
    ).toBe(true);
  });

  it("filtra por stack (cualquiera de los elegidos) y cuenta el subconjunto", async () => {
    const all = await personService.list(1, 100);
    const azure = await personService.list(1, 100, undefined, undefined, [
      "Azure",
    ]);
    expect(azure.totalCount).toBeLessThan(all.totalCount);
    expect(
      azure.items.every((p) => p.stacks.some((s) => s.name === "Azure"))
    ).toBe(true);
    const both = await personService.list(1, 100, undefined, undefined, [
      "AS400",
      "MuleSoft",
    ]);
    expect(both.totalCount).toBe(2);
  });

  it("catálogo ordenado y sin duplicados", async () => {
    const catalog = await personService.getStackCatalog();
    expect(catalog).toEqual(
      [...new Set(catalog)].sort((a, b) => a.localeCompare(b))
    );
    expect(catalog).toContain("React Native");
  });

  it("stats: cobertura por stack con los de riesgo", async () => {
    const stats = await personService.getStats();
    expect(stats.stackCoverage.distinct).toBeGreaterThan(5);
    expect(stats.stackCoverage.atRisk).toEqual(["AS400", "MuleSoft"]);
  });

  it("PUT reemplaza la lista y exige catálogo y un único principal", async () => {
    const updated = await personService.replaceStacks(MARIA, [
      { name: "Azure", level: 3, isPrimary: false },
      { name: "React Native", level: 2, isPrimary: true },
    ]);
    expect(updated.stacks.map((s) => s.name)).toEqual([
      "React Native",
      "Azure",
    ]);
    const stats = await personService.getStats();
    // María soltó AS400: ya nadie lo tiene, deja de estar "en riesgo" y de contar.
    expect(stats.stackCoverage.atRisk).toEqual(["MuleSoft"]);
    expect(
      await status(() =>
        personService.replaceStacks(MARIA, [
          { name: "COBOL", level: 2, isPrimary: true },
        ])
      )
    ).toBe(400);
    expect(
      await status(() =>
        personService.replaceStacks(MARIA, [
          { name: "Azure", level: 2, isPrimary: false },
        ])
      )
    ).toBe(400);
    expect(
      await status(() =>
        personService.replaceStacks(MARIA, [
          { name: "Azure", level: 2, isPrimary: true },
          { name: "Kafka", level: 2, isPrimary: true },
        ])
      )
    ).toBe(400);
    expect(await status(() => personService.replaceStacks("nope", []))).toBe(
      404
    );
  });

  it("el detalle deriva los stacks y su cobertura, y sigue al PUT", async () => {
    const before = await personDetailService.getDetail(MARIA);
    const as400 = before.stacks.find((s) => s.name === "AS400")!;
    expect(as400.otherCoverers).toBe(0);
    const net = before.stacks.find((s) => s.name === ".NET")!;
    expect(net.otherCoverers).toBeGreaterThan(3);
    expect(net.coverers).toHaveLength(3);
    await personService.replaceStacks(MARIA, [
      { name: "MuleSoft", level: 1, isPrimary: true },
    ]);
    const after = await personDetailService.getDetail(MARIA);
    expect(after.stacks).toHaveLength(1);
    expect(after.stacks[0]).toMatchObject({
      name: "MuleSoft",
      otherCoverers: 1,
    });
    expect(after.stacks[0].coverers[0].name).toBe("Tomás Giraldo");
  });
});
