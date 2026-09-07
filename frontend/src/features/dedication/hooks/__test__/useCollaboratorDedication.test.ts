import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetDedicationMock } from "../../../../mocks/handlers/dedication.handlers";
import { resetPersonDetailMock } from "../../../../mocks/handlers/personDetail.handlers";
import { useCollaboratorDedication } from "../useCollaboratorDedication";

const DATOS = "55555555-5555-5555-5555-555555555555";

describe("useCollaboratorDedication", () => {
  afterEach(() => {
    resetDedicationMock();
    resetPersonDetailMock();
  });

  it("carga la primera página con el resumen y el calendario, por señal accionable", async () => {
    const { result } = renderHook(() => useCollaboratorDedication());
    expect(result.current.loading).toBe(true);
    expect(result.current.loaded).toBe(false);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.loaded).toBe(true);
    // Las accionables primero, y dentro de ellas quien más se desvía.
    expect(
      result.current.rows.slice(0, 5).map((r) => r.balance.signal)
    ).toEqual([
      "PossibleOverload",
      "PossibleOverload",
      "PossibleUnderload",
      "PossibleUnderload",
      "PossibleUnderload",
    ]);
    expect(result.current.total).toBe(18);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.historyWindowSprints).toBe(6);
    expect(result.current.minHistorySprints).toBe(3);
    expect(result.current.hoursPerSprint).toBe(80);
    expect(result.current.summary).toMatchObject({
      possibleOverload: 5,
      possibleUnderload: 3,
      usual: 2,
    });
    expect(result.current.lastSyncedAt).not.toBeNull();
  });

  it("filtra por célula, y cada cambio vuelve a la primera página", async () => {
    const { result } = renderHook(() => useCollaboratorDedication());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.onPageChange(2));
    await waitFor(() => expect(result.current.page).toBe(2));

    act(() => result.current.onSquadIdsChange([DATOS]));
    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    expect(result.current.page).toBe(1);
    expect(result.current.rows.map((r) => r.name).sort()).toEqual([
      "Paula Ramírez",
      "Sebastián Cárdenas",
    ]);
    // El resumen describe el chapter, no el filtro.
    expect(result.current.summary?.total).toBe(18);
  });

  it("el navegador de sprint mueve el listado entero y publica el sprint", async () => {
    const published: Array<string | null> = [];
    const { result } = renderHook(() =>
      useCollaboratorDedication(null, (name) => published.push(name))
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Arranca en el sprint en curso y no deja avanzar más allá.
    expect(result.current.sprint).toMatchObject({
      name: "S18",
      isCurrent: true,
      nextName: null,
    });

    act(() => result.current.onSprintStep("previous"));
    await waitFor(() => expect(result.current.sprint?.name).toBe("S17"));
    expect(published).toEqual(["S17"]);
    expect(result.current.page).toBe(1);
    expect(
      result.current.rows
        .filter((r) => r.sprintName)
        .every((r) => r.sprintName === "S17")
    ).toBe(true);
  });

  it("abre en el sprint que venga en la URL", async () => {
    const { result } = renderHook(() => useCollaboratorDedication("S16"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sprint).toMatchObject({
      name: "S16",
      isCurrent: false,
    });
  });

  it("busca por nombre o cargo con debounce", async () => {
    const { result } = renderHook(() => useCollaboratorDedication());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.onSearchChange("arquitect"));
    await waitFor(
      () =>
        expect(result.current.rows.map((r) => r.name).sort()).toEqual([
          "Carlos López",
          "Tomás Giraldo",
        ]),
      { timeout: 2000 }
    );
  });
});
