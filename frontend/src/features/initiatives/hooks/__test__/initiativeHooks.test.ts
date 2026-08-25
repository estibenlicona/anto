import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetInitiativesMock } from "../../../../mocks/handlers/initiatives.handlers";
import { useInitiatives } from "../useInitiatives";
import { useEvaluation } from "../useEvaluation";
import { initiativeAdapter } from "../../adapters/InitiativeAdapter";
import {
  evaluationSteps,
  heaviestDimension,
} from "../../adapters/EvaluationAdapter";
import { initiativeService } from "../../services/initiativeService";

describe("initiativeAdapter", () => {
  it("deriva etiquetas, talla y permisos de estado", async () => {
    resetInitiativesMock();
    const kafka = initiativeAdapter.toEntity(
      await initiativeService.get("ini-kafka")
    );
    expect(kafka).toMatchObject({
      statusLabel: "Activa",
      canActivate: false,
      canClose: true,
      plazoText: "6 m",
    });
    expect(kafka.talla).not.toBeNull();
    expect(kafka.fteText).toMatch(/^\d+,\d{2}$/);
    const qr = initiativeAdapter.toEntity(
      await initiativeService.get("ini-qr")
    );
    expect(qr).toMatchObject({
      statusLabel: "En evaluación",
      talla: null,
      fteText: "—",
      canActivate: false,
      canClose: false,
    });
  });

  it("no deja activar si la célula ya tiene una activa", async () => {
    resetInitiativesMock();
    // Evaluada, con talla, pero Backend ya sostiene a Kafka: no alcanza con
    // tener talla.
    const payments = initiativeAdapter.toEntity(
      await initiativeService.get("ini-payments")
    );
    expect(payments.canActivate).toBe(false);
    expect(payments.talla).not.toBeNull();

    // Liberada la célula, la misma iniciativa sí se puede activar.
    await initiativeService.setStatus("ini-kafka", "Closed");
    const libre = initiativeAdapter.toEntity(
      await initiativeService.get("ini-payments")
    );
    expect(libre.canActivate).toBe(true);
  });
});

describe("useInitiatives", () => {
  beforeEach(() => resetInitiativesMock());

  it("carga, y cambiar un filtro vuelve a página 1 con el subconjunto", async () => {
    const { result } = renderHook(() => useInitiatives());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.total).toBe(7);
    act(() => result.current.onPageSizeChange(5));
    await waitFor(() => expect(result.current.totalPages).toBe(2));
    act(() => result.current.onPageChange(2));
    await waitFor(() => expect(result.current.page).toBe(2));
    act(() => result.current.onStatusesChange(["Active"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.page).toBe(1);
    expect(result.current.total).toBe(3);
    expect(result.current.initiatives.every((i) => i.status === "Active")).toBe(
      true
    );
  });
});

describe("useEvaluation", () => {
  beforeEach(() => resetInitiativesMock());

  it("arranca desde lo guardado; cambiar el plazo no cambia la talla; guardar persiste", async () => {
    const { result } = renderHook(() => useEvaluation("ini-kafka"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const saved = result.current.initiative?.evaluation;
    expect(result.current.draft?.answers).toEqual(saved?.answers);
    expect(result.current.result?.talla).toBe(saved?.talla);
    expect(evaluationSteps(result.current.result!).map((s) => s.code)).toEqual([
      "T",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "R",
    ]);
    expect(heaviestDimension(result.current.result!).dimension).toBeTruthy();

    const before = result.current.result!;
    act(() => result.current.setTargetMonths(3));
    expect(result.current.result?.talla).toBe(before.talla);
    expect(result.current.result?.fteExpected).toBeCloseTo(
      before.fteExpected * 2
    );

    act(() => result.current.setAnswer("N1", 0));
    expect(result.current.draft?.answers.N1).toBe(0);
    act(() => result.current.setTriage(1, true));
    expect(result.current.result?.triageVerdict).toBe("Required");

    let outcome;
    await act(async () => {
      outcome = await result.current.save();
    });
    expect(outcome).toEqual({ success: true });
    const persisted = await initiativeService.get("ini-kafka");
    expect(persisted.evaluation?.targetMonths).toBe(3);
    expect(persisted.evaluation?.answers.N1).toBe(0);
  });

  it("arranca vacío para una iniciativa sin evaluación y marca 404", async () => {
    const fresh = renderHook(() => useEvaluation("ini-qr"));
    await waitFor(() => expect(fresh.result.current.loading).toBe(false));
    expect(fresh.result.current.draft).toEqual({
      triage: [false, false, false, false, false, false],
      answers: {},
      targetMonths: 6,
    });
    expect(fresh.result.current.result?.pct).toBe(0);
    const missing = renderHook(() => useEvaluation("nope"));
    await waitFor(() => expect(missing.result.current.loading).toBe(false));
    expect(missing.result.current.notFound).toBe(true);
  });
});
