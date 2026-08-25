import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTallaBands } from "../useTallaBands";
import { resetTallaBandsMock } from "../../../../mocks/handlers/talla-bands.handlers";

async function renderLoaded() {
  const view = renderHook(() => useTallaBands());
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe("useTallaBands", () => {
  beforeEach(() => {
    resetTallaBandsMock();
  });

  it("loads the saved bands", async () => {
    const { result } = await renderLoaded();
    expect(result.current.values?.boundaries).toEqual([20, 40, 60, 80]);
    expect(result.current.canSave).toBe(false);
  });

  it("becomes saveable once something changes", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setBoundaries([25, 40, 60, 80]));

    expect(result.current.values?.boundaries).toEqual([25, 40, 60, 80]);
    expect(result.current.canSave).toBe(true);
  });

  it("blocks saving while a band field is invalid", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setBandField(0, "pmMax", "0"));

    expect(result.current.errors[0].pmMax).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("flags an empty lectura", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setBandField(1, "lectura", "   "));

    expect(result.current.errors[1].lectura).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("does not validate the boundaries, which the slider already constrains", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setBoundaries([10, 30, 50, 70]));

    expect(
      result.current.errors.every((e) => Object.keys(e).length === 0)
    ).toBe(true);
  });

  it("saves and clears the dirty state", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setBoundaries([30, 45, 60, 80]));

    let outcome: { success: boolean } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });

    expect(outcome?.success).toBe(true);
    expect(result.current.canSave).toBe(false);
    expect(result.current.values?.boundaries).toEqual([30, 45, 60, 80]);
  });

  it("reports a save failure through the return value and keeps the edit", async () => {
    const { result } = await renderLoaded();
    // Bandas contiguas para el slider pero rechazadas por el handler: deja una
    // banda más angosta que el mínimo, que es lo que el mock valida.
    act(() => result.current.setBoundaries([20, 22, 60, 80]));

    let outcome: { success: boolean; error?: string } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });

    expect(outcome?.success).toBe(false);
    expect(outcome?.error).toBeDefined();
    expect(result.current.values?.boundaries).toEqual([20, 22, 60, 80]);
  });

  it("discards back to the last saved values", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setBandField(0, "lectura", "otra cosa"));

    act(() => result.current.discard());

    expect(result.current.values?.bands[0].lectura).toBe("Cambio menor");
    expect(result.current.canSave).toBe(false);
  });
});
