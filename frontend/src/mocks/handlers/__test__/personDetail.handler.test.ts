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

  it("persona con célula: asignación derivada de los mocks, DevOps, capacidades", async () => {
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
      requiredLevel: 3,
    });
    // Compañeros de célula: todos los asignados a Backend Platform, sin
    // recortar por a qué chapter pertenece cada uno. Andrés e Isabella son de
    // Canales Digitales y aparecen igual, porque comparten la célula.
    expect(d.allocation!.teammates).toEqual([
      "Carlos López",
      "Andrés Martínez",
      "Isabella Moreno",
    ]);
    expect(d.allocation!.teammates).not.toContain("María González");
    // La identidad trae la señal del sprint en curso que calcula el mock de
    // balance de carga: 18 SP contra sus 22 habituales, con 0.80 FTE
    // disponible de 1.0 tras el festivo y su día de ausencia.
    expect(d.devOpsIdentity).toMatchObject({
      userName: "maria.gonzalez@tuya.com",
      currentSprint: {
        sprint: { name: "S18", snapshotStatus: "Provisional" },
        committedPoints: 18,
        ownMedianPoints: 22,
        capacity: { contractualFte: 1, availableFte: 0.8 },
        signal: "Usual",
        notEvaluableReason: null,
      },
    });
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

  it("persona sin célula: sin asignación, con sugerencias y sin identidad DevOps", async () => {
    const d = await personDetailService.getDetail(CAMILA);
    expect(d.allocation).toBeNull();
    expect(d.providerName).toBe("QVision");
    expect(d.devOpsIdentity).toBeNull();
    // Ya no viajan candidatas: la identidad se busca por correo.
    expect(d).not.toHaveProperty("devOpsCandidates");
    const pagos = d.suggestedSquads.find((s) => s.id === PAGOS);
    expect(pagos).toMatchObject({
      reason: "Sin equipo",
      requiredLevel: 3,
      allocatedFte: 0,
    });
    expect(d.suggestedSquads.every((s) => s.requiredLevel >= 1)).toBe(true);
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
  });

  it("la señal del sprint en curso no depende de lo que la célula declara", async () => {
    const before = await personDetailService.getDetail(MARIA);
    expect(before.devOpsIdentity?.currentSprint).toMatchObject({
      signal: "Usual",
      committedPoints: 18,
      ownMedianPoints: 22,
    });
    await allocationService.update(before.allocation!.id, {
      dedicationPercentage: 50,
      bauPercentage: 20,
      transformationPercentage: 30,
    });
    const after = await personDetailService.getDetail(MARIA);
    // Bajar la dedicación declarada de 80 % a 50 % no mueve la señal: ese dato
    // es un reporte de la célula y no participa en ninguna evidencia.
    expect(after.devOpsIdentity?.currentSprint).toMatchObject({
      signal: "Usual",
      committedPoints: 18,
      ownMedianPoints: 22,
    });
    expect(after.devOpsIdentity?.currentSprint?.capacity).toMatchObject({
      contractualFte: 1,
      availableFte: 0.8,
    });
  });

  it("sin datos de horas: el detalle no trae reporte, sprints ni FTE real, y no existe el POST de validación", async () => {
    const d = await personDetailService.getDetail(MARIA);
    expect(d).not.toHaveProperty("realFte");
    expect(d).not.toHaveProperty("currentReport");
    expect(d).not.toHaveProperty("sprints");
    // Ningún handler lo atiende: la petición no llega a un 2xx.
    expect(
      await status(() => httpClient.post(`/people/${MARIA}/hours/S16/validate`))
    ).not.toBe(200);
  });

  it("buscar en DevOps por correo: encuentra sin distinguir mayúsculas, 404 sin usuario, 400 sin correo", async () => {
    const user = await personDetailService.searchDevOpsUser(
      "Camila.Restrepo@TUYA.com"
    );
    expect(user).toMatchObject({
      displayName: "Camila Restrepo",
      email: "camila.restrepo@tuya.com",
      projects: ["Core Bancario", "Canales Digitales"],
      teams: ["Pagos Instantáneos", "Fraude Tarjetas"],
      boards: ["Pagos · Stories", "Fraude · Backlog"],
    });
    expect(user.id).toBeTruthy();
    expect(
      await status(() => personDetailService.searchDevOpsUser("nadie@tuya.com"))
    ).toBe(404);
    expect(await status(() => httpClient.get("/devops/users"))).toBe(400);
  });

  it("vincular por id de usuario: 200 y la identidad queda con el correo, la fecha de hoy y su lectura del sprint; 404 con id desconocido", async () => {
    const user = await personDetailService.searchDevOpsUser(
      "camila.restrepo@tuya.com"
    );
    await personDetailService.linkDevOpsIdentity(CAMILA, user.id);
    const after = await personDetailService.getDetail(CAMILA);
    expect(after.devOpsIdentity).toMatchObject({
      id: user.id,
      userName: "camila.restrepo@tuya.com",
      linkedAt: new Date().toISOString().slice(0, 10),
      // Recién vinculada: DevOps ya le devuelve el sprint en curso, pero con
      // un solo sprint sellado no hay contra qué comparar y la señal es
      // "No evaluable · histórico insuficiente".
      currentSprint: {
        sprint: { name: "S18", snapshotStatus: "Provisional" },
        committedPoints: 10,
        ownMedianPoints: 12,
        signal: "NotEvaluable",
        notEvaluableReason: "InsufficientHistory",
      },
    });
    expect(after.devOpsIdentity).not.toHaveProperty("activeItems");
    expect(
      await status(() => personDetailService.linkDevOpsIdentity(DIEGO, "nope"))
    ).toBe(404);
  });

  it("vincular un usuario que ya es de otra persona responde 409 nombrándola y no cambia nada", async () => {
    const maria = await personDetailService.searchDevOpsUser(
      "maria.gonzalez@tuya.com"
    );
    let message = "";
    try {
      await personDetailService.linkDevOpsIdentity(CAMILA, maria.id);
    } catch (e) {
      const err = e as {
        response?: { status: number; data?: { message?: string } };
      };
      expect(err.response?.status).toBe(409);
      message = err.response?.data?.message ?? "";
    }
    expect(message).toContain("María González");
    expect(
      (await personDetailService.getDetail(CAMILA)).devOpsIdentity
    ).toBeNull();
    expect(
      (await personDetailService.getDetail(MARIA)).devOpsIdentity?.id
    ).toBe(maria.id);
  });

  it("404 para una persona inexistente", async () => {
    expect(await status(() => httpClient.get("/people/no-existe/detail"))).toBe(
      404
    );
  });
});
