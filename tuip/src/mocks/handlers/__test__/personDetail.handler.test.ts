import { describe, it, expect, beforeEach } from "vitest";
import { personDetailService } from "@features/people/services/personDetailService";
import { allocationService } from "@features/allocations/services/allocationService";
import { httpClient } from "@shared/services/httpClient";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetPeopleMock } from "../people.handlers";
import { resetPersonDetailMock } from "../personDetail.handlers";
import { resetExpertiseLinesMock } from "../expertise-lines.handlers";
import { expertiseLinesService } from "@features/expertise-lines/services/expertiseLinesService";
import { CAMILA, DIEGO, MARIA } from "../personDetail.seeds";

const BACKEND = "11111111-1111-1111-1111-111111111111";
const PAGOS = "44444444-4444-4444-4444-444444444444";
const QA = "e2222222-2222-2222-2222-222222222222";
const FRONTEND = "e3333333-3333-3333-3333-333333333333";
/** Valentina Ospina — sembrada sin línea a propósito. */
const VALENTINA = "pddddddd-dddd-dddd-dddd-dddddddddddd";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

describe("GET /people/:id/detail", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
    resetPersonDetailMock();
    resetExpertiseLinesMock();
  });

  it("persona con célula: asignación derivada de los mocks, horas, DevOps, capacidades", async () => {
    const d = await personDetailService.getDetail(MARIA);
    expect(d.person.name).toBe("María González");
    expect(d.allocation).toMatchObject({
      squadId: BACKEND,
      squadName: "Backend Platform",
      squadCriticality: "High",
      squadTribe: "Ecosistema Digital",
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
      requiredSfia: 3,
    });
    // Compañeros de célula: los de su chapter. Andrés e Isabella también están
    // asignados a Backend Platform, pero son de Canales Digitales y nombrarlos
    // acá sería mostrarle a un lead gente que no tiene a cargo — la misma
    // fuga, por otra puerta, que el acotado del listado cierra.
    expect(d.allocation!.teammates).toEqual(["Carlos López"]);
    expect(d.allocation!.teammates).not.toContain("María González");
    expect(d.currentReport).toMatchObject({
      sprint: "S16",
      status: "Submitted",
      sprintHours: 80,
    });
    expect(d.sprints).toHaveLength(6);
    // Último validado: S15 → (40 + 32) / 80
    expect(d.realFte).toBe(0.9);
    expect(d.devOpsIdentity).toMatchObject({
      userName: "mgonzalez@tuya",
      pendingCuration: 2,
    });
    expect(d.devOpsCandidates).toEqual([]);
    // AS400 sólo lo tiene María: bus factor 1 derivado de los stacks del mock de personas.
    expect(d.stacks.find((s) => s.name === "AS400")?.otherCoverers).toBe(0);
    expect(d.stacks.find((s) => s.name === ".NET")?.coverers.length).toBe(3);
    expect(d.stacks[0].isPrimary).toBe(true);
    expect(d.suggestedSquads).toEqual([]);
    expect(d.providerName).toBeNull();
    // Del maestro de líneas: María está en Backend y además la lidera.
    expect(d.expertiseLineName).toBe("Backend");
    expect(d.expertiseLineLeadName).toBe("María González");
    // Y su chapter es otra relación, con otro responsable: lidera su línea
    // pero no su chapter. Que las dos digan nombres distintos es justamente
    // lo que hace que importe cuál de las dos decide el alcance.
    expect(d.chapterName).toBe("Core y Datos");
    expect(d.chapterLeadName).toBe("Tomás Giraldo");
  });

  it("la línea y su lead salen del maestro, no de una constante", async () => {
    // Valentina está sembrada sin línea a propósito.
    const before = await personDetailService.getDetail(VALENTINA);
    expect(before.expertiseLineName).toBeNull();
    expect(before.expertiseLineLeadName).toBeNull();

    await expertiseLinesService.addPeople(QA, [VALENTINA]);

    const after = await personDetailService.getDetail(VALENTINA);
    expect(after.expertiseLineName).toBe("QA");
    expect(after.expertiseLineLeadName).toBe("Laura Ruiz");
    // Cambiar de línea no cambia de chapter: son dos relaciones distintas y
    // sólo una decide qué ve un lead.
    expect(after.chapterName).toBe(before.chapterName);
    expect(after.chapterLeadName).toBe(before.chapterLeadName);
  });

  it("una línea sin lead deja el lead en null, no inventa un nombre", async () => {
    // Frontend está sembrada activa y sin lead.
    await expertiseLinesService.addPeople(FRONTEND, [VALENTINA]);

    const d = await personDetailService.getDetail(VALENTINA);
    expect(d.expertiseLineName).toBe("Frontend");
    expect(d.expertiseLineLeadName).toBeNull();
  });

  it("persona sin célula: sin asignación ni reporte, con sugerencias y candidatas DevOps", async () => {
    const d = await personDetailService.getDetail(CAMILA);
    expect(d.allocation).toBeNull();
    expect(d.currentReport).toBeNull();
    expect(d.realFte).toBeNull();
    expect(d.providerName).toBe("QVision");
    expect(d.devOpsIdentity).toBeNull();
    expect(d.devOpsCandidates.length).toBeGreaterThan(0);
    const pagos = d.suggestedSquads.find((s) => s.id === PAGOS);
    expect(pagos).toMatchObject({
      reason: "Sin equipo",
      requiredSfia: 3,
      allocatedFte: 0,
    });
    expect(d.suggestedSquads.every((s) => s.requiredSfia >= 1)).toBe(true);
  });

  it("sigue a los cambios de asignación de la sesión", async () => {
    await allocationService.create(PAGOS, {
      personId: CAMILA,
      dedicationPercentage: 100,
      bauPercentage: 60,
      transformationPercentage: 40,
    });
    const d = await personDetailService.getDetail(CAMILA);
    expect(d.allocation?.squadId).toBe(PAGOS);
    expect(d.suggestedSquads).toEqual([]);
    expect(d.currentReport?.status).toBe("NotReported");
  });

  it("validar: 200 sobre Submitted y recalcula el FTE real; 409 si no está enviado", async () => {
    await personDetailService.validateHours(MARIA, "S16");
    const d = await personDetailService.getDetail(MARIA);
    expect(d.currentReport?.status).toBe("Validated");
    // (42 + 32) / 80
    expect(d.realFte).toBe(0.93);
    expect(
      await status(() => personDetailService.validateHours(MARIA, "S16"))
    ).toBe(409);
  });

  it("vincular identidad: 200 con candidata, 404 con desconocida", async () => {
    const before = await personDetailService.getDetail(DIEGO);
    const candidate = before.devOpsCandidates[0];
    await personDetailService.linkDevOpsIdentity(DIEGO, candidate.id);
    const after = await personDetailService.getDetail(DIEGO);
    expect(after.devOpsIdentity?.userName).toBe(candidate.userName);
    expect(after.devOpsCandidates).toEqual([]);
    expect(
      await status(() => personDetailService.linkDevOpsIdentity(CAMILA, "nope"))
    ).toBe(404);
  });

  it("404 para una persona inexistente", async () => {
    expect(await status(() => httpClient.get("/people/no-existe/detail"))).toBe(
      404
    );
  });
});
