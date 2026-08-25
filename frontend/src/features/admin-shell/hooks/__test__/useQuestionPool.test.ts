import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useQuestionPool } from "../useQuestionPool";
import { resetQuestionPoolMock } from "../../../../mocks/handlers/question-pool.handlers";
import { server } from "../../../../mocks/server";

async function renderLoaded() {
  const view = renderHook(() => useQuestionPool());
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe("useQuestionPool", () => {
  beforeEach(() => {
    resetQuestionPoolMock();
  });

  it("loads the 30 seeded questions", async () => {
    const { result } = await renderLoaded();
    expect(result.current.values).toHaveLength(30);
    expect(result.current.canSave).toBe(false);
  });

  it("becomes saveable once a question's text changes", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowTexto(0, "¿Texto reformulado?"));

    expect(result.current.values![0].texto).toBe("¿Texto reformulado?");
    expect(result.current.canSave).toBe(true);
  });

  it("becomes saveable once a question's weight changes", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowPeso(0, "5"));

    expect(result.current.values![0].peso).toBe(5);
    expect(result.current.canSave).toBe(true);
  });

  it("adds a question to the given dimension, empty and with the default weight", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.addRow("Integraciones"));

    expect(result.current.values).toHaveLength(31);
    const added = result.current.values![30];
    expect(added.dimension).toBe("Integraciones");
    expect(added.texto).toBe("");
    // Nace sin texto, así que todavía no se puede guardar.
    expect(result.current.errors[30].texto).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("gives every added question an id of its own", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.addRow("Integraciones"));
    act(() => result.current.addRow("Integraciones"));

    const ids = result.current.values!.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("removes a question", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.removeRow(0));

    expect(result.current.values).toHaveLength(29);
    expect(result.current.canSave).toBe(true);
  });

  it("blocks saving while a question's text is empty", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowTexto(0, "   "));

    expect(result.current.errors[0].texto).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("blocks saving while a question's weight is not a positive integer", async () => {
    const { result } = await renderLoaded();

    act(() => result.current.setRowPeso(0, "0"));

    expect(result.current.errors[0].peso).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });

  it("saves and clears the dirty state", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setRowPeso(0, "5"));

    let outcome: { success: boolean } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });

    expect(outcome?.success).toBe(true);
    expect(result.current.canSave).toBe(false);
    expect(result.current.values![0].peso).toBe(5);
  });

  it("reports a save failure through the return value and keeps the edit", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setRowPeso(0, "5"));

    // El hook valida texto y peso igual que el handler, así que no hay un
    // valor que el hook deje pasar y el handler rechace por su cuenta — se
    // fuerza el error desde el endpoint para probar el contrato de `save`.
    server.use(
      http.put("/admin/question-pool", () =>
        HttpResponse.json({ message: "Error simulado" }, { status: 500 })
      )
    );

    let outcome: { success: boolean; error?: string } | undefined;
    await act(async () => {
      outcome = await result.current.save();
    });

    expect(outcome?.success).toBe(false);
    expect(outcome?.error).toBeDefined();
    expect(result.current.values![0].peso).toBe(5);
  });

  it("discards edits, additions and removals back to the last saved pool", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setRowTexto(0, "Cambiado"));
    act(() => result.current.removeRow(1));
    act(() => result.current.addRow("Integraciones"));

    act(() => result.current.discard());

    expect(result.current.values).toHaveLength(30);
    expect(result.current.values![0].texto).not.toBe("Cambiado");
    expect(result.current.canSave).toBe(false);
  });
});
