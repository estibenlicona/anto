import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAbsencesFilters } from "../useAbsencesFilters";
import type { Absence } from "../../adapters/AbsenceAdapter";
import type { AbsenceStatus, AbsenceType } from "../../services/absenceService";

/**
 * Filas mínimas: al hook sólo le importan nombre, tipo y estado. El resto del
 * `Absence` lo rellena `base` para no repetir campos que no se leen acá.
 */
function absence(
  id: string,
  personName: string,
  type: AbsenceType,
  status: AbsenceStatus
): Absence {
  return {
    id,
    personId: `p-${id}`,
    personName,
    providerName: null,
    type,
    startDate: "2026-08-10",
    endDate: "2026-08-12",
    businessDays: 3,
    status,
    rejectReason: null,
    businessDaysInMonth: 3,
    typeLabel: type,
    statusLabel: status,
    statusVariant: "neutral",
    rangeLabel: "10 – 12 ago",
    initials: "XX",
    originLabel: "Planta",
    mainSquadName: null,
    monthFteImpact: 0,
  } as Absence;
}

const items: Absence[] = [
  absence("1", "María González", "Vacation", "Approved"),
  absence("2", "Paula Ramírez", "Leave", "Requested"),
  absence("3", "Carlos López", "SickLeave", "Approved"),
  absence("4", "Laura Ruiz", "Vacation", "Requested"),
  absence("5", "María González", "Leave", "Rejected"),
];

const names = (rows: Absence[]) => rows.map((r) => r.id);

describe("useAbsencesFilters", () => {
  it("busca por parte del nombre, sin distinguir acentos ni mayúsculas", () => {
    const { result } = renderHook(() => useAbsencesFilters(items, "2026-08"));

    act(() => result.current.onSearchChange("maria"));
    expect(names(result.current.visible)).toEqual(["1", "5"]);
    expect(result.current.total).toBe(2);

    act(() => result.current.onSearchChange("LOPEZ"));
    expect(names(result.current.visible)).toEqual(["3"]);

    act(() => result.current.onSearchChange(""));
    expect(result.current.total).toBe(items.length);
  });

  it("filtra por tipo y por estado, sumando dentro de cada filtro", () => {
    const { result } = renderHook(() => useAbsencesFilters(items, "2026-08"));

    act(() => result.current.onStatusesChange(["Requested"]));
    expect(names(result.current.visible)).toEqual(["2", "4"]);

    act(() => result.current.onStatusesChange([]));
    act(() => result.current.onTypesChange(["Vacation", "SickLeave"]));
    expect(names(result.current.visible)).toEqual(["1", "3", "4"]);
  });

  it("combina búsqueda y filtros con AND", () => {
    const { result } = renderHook(() => useAbsencesFilters(items, "2026-08"));

    act(() => result.current.onSearchChange("maría"));
    act(() => result.current.onStatusesChange(["Approved"]));
    expect(names(result.current.visible)).toEqual(["1"]);
  });

  it("pagina el resultado y respeta el tamaño de página", () => {
    const { result } = renderHook(() => useAbsencesFilters(items, "2026-08"));
    // Arranca en 10 por página: las cinco filas caben en una sola.
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(1);

    act(() => result.current.onPageSizeChange(2));
    expect(result.current.totalPages).toBe(3);
    expect(names(result.current.visible)).toEqual(["1", "2"]);

    act(() => result.current.onPageChange(2));
    expect(names(result.current.visible)).toEqual(["3", "4"]);

    act(() => result.current.onPageChange(3));
    expect(names(result.current.visible)).toEqual(["5"]);
  });

  it("vuelve a la primera página al acotar desde una posterior", () => {
    const { result } = renderHook(() => useAbsencesFilters(items, "2026-08"));

    act(() => result.current.onPageSizeChange(2));
    act(() => result.current.onPageChange(3));
    expect(result.current.page).toBe(3);

    act(() => result.current.onStatusesChange(["Approved"]));
    expect(result.current.page).toBe(1);
    expect(names(result.current.visible)).toEqual(["1", "3"]);
  });

  it("no deja la página fuera de rango cuando el conjunto se encoge solo", () => {
    // Aprobar o rechazar una ausencia recarga el mes sin pasar por un setter:
    // si la última página se queda sin filas, la tabla no puede quedar vacía.
    const { result, rerender } = renderHook(
      ({ rows }: { rows: Absence[] }) => useAbsencesFilters(rows, "2026-08"),
      { initialProps: { rows: items } }
    );

    act(() => result.current.onPageSizeChange(2));
    act(() => result.current.onPageChange(3));
    rerender({ rows: items.slice(0, 2) });

    expect(result.current.page).toBe(1);
    expect(names(result.current.visible)).toEqual(["1", "2"]);
  });

  it("reinicia búsqueda, filtros y página al cambiar de mes", () => {
    const { result, rerender } = renderHook(
      ({ month }: { month: string }) => useAbsencesFilters(items, month),
      { initialProps: { month: "2026-08" } }
    );

    act(() => result.current.onSearchChange("maria"));
    act(() => result.current.onTypesChange(["Vacation"]));
    act(() => result.current.onPageSizeChange(2));
    expect(result.current.hasActiveFilter).toBe(true);

    rerender({ month: "2026-07" });

    expect(result.current.search).toBe("");
    expect(result.current.types).toEqual([]);
    expect(result.current.statuses).toEqual([]);
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.hasActiveFilter).toBe(false);
  });
});
