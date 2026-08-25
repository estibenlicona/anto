import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCapabilityMix } from "../useCapabilityMix";
import { mixAmount } from "../../services/capabilityMixService";
import { resetCapabilityMixMock } from "../../../../mocks/handlers/capability-mix.handlers";

const TALLAS = ["XS", "S", "M", "L", "XL"];

async function renderLoaded() {
  const view = renderHook(() => useCapabilityMix());
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe("useCapabilityMix", () => {
  beforeEach(() => {
    resetCapabilityMixMock();
  });

  it("loads the saved mix", async () => {
    const { result } = await renderLoaded();
    expect(result.current.values?.map((row) => row.capacidad)).toEqual([
      "Backend Dev",
      "QA Engineer",
      "Arquitecto",
    ]);
    expect(result.current.canSave).toBe(false);
  });

  it("becomes saveable once an amount changes", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowAmount(0, "M", "4"));

    expect(mixAmount(result.current.values![0], "M")).toBe(4);
    expect(result.current.canSave).toBe(true);
  });

  it("adds a row with a zero for every talla", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.addRow(TALLAS));

    expect(result.current.values).toHaveLength(4);
    const added = result.current.values![3];
    expect(TALLAS.map((talla) => mixAmount(added, talla))).toEqual([
      0, 0, 0, 0, 0,
    ]);
    // Nace sin nombre, así que todavía no se puede guardar.
    expect(result.current.errors[3].capacidad).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("gives every added row an id of its own", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.addRow(TALLAS));
    act(() => result.current.addRow(TALLAS));

    const ids = result.current.values!.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("removes a row", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.removeRow(1));

    expect(result.current.values?.map((row) => row.capacidad)).toEqual([
      "Backend Dev",
      "Arquitecto",
    ]);
    expect(result.current.canSave).toBe(true);
  });

  it("blocks saving while a name is empty", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowName(0, "   "));

    expect(result.current.errors[0].capacidad).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("flags a duplicate name on both rows, ignoring case and padding", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowName(0, " qa engineer "));

    // "QA" y "qa " son la misma capacidad para quien lee la tabla.
    expect(result.current.errors[0].capacidad).toBeDefined();
    expect(result.current.errors[1].capacidad).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("keeps a renamed row's amounts — the reason each row carries an id", async () => {
    const { result } = await renderLoaded();
    const before = TALLAS.map((talla) =>
      mixAmount(result.current.values![0], talla)
    );

    act(() => result.current.setRowName(0, "Backend"));
    await act(async () => {
      await result.current.save();
    });

    const after = result.current.values!.find(
      (row) => row.capacidad === "Backend"
    );
    expect(after).toBeDefined();
    expect(TALLAS.map((talla) => mixAmount(after!, talla))).toEqual(before);
  });

  it("saves and clears the dirty state", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setRowAmount(2, "XL", "3"));

    let outcome: { success: boolean } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });

    expect(outcome?.success).toBe(true);
    expect(result.current.canSave).toBe(false);
    expect(mixAmount(result.current.values![2], "XL")).toBe(3);
  });

  it("reports a save failure through the return value and keeps the edit", async () => {
    const { result } = await renderLoaded();
    // El hook no valida las cantidades, así que una negativa llega al handler.
    act(() => result.current.setRowAmount(0, "S", "-1"));

    let outcome: { success: boolean; error?: string } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });

    expect(outcome?.success).toBe(false);
    expect(outcome?.error).toBeDefined();
    expect(mixAmount(result.current.values![0], "S")).toBe(-1);
  });

  it("discards edits, additions and removals back to the last saved mix", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setRowName(0, "Backend"));
    act(() => result.current.removeRow(2));
    act(() => result.current.addRow(TALLAS));

    act(() => result.current.discard());

    expect(result.current.values?.map((row) => row.capacidad)).toEqual([
      "Backend Dev",
      "QA Engineer",
      "Arquitecto",
    ]);
    expect(result.current.canSave).toBe(false);
  });
});
