import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import { personService } from "@features/people/services/personService";
import { dedicationService } from "@features/dedication/services/dedicationService";
import { absenceService } from "@features/absences/services/absenceService";
import { CHAPTERS } from "../chapters";
import { resetPeopleMock } from "../people.handlers";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetAbsencesMock } from "../absences.handlers";
import { resetDedicationMock } from "../dedication.handlers";

/**
 * El recorte de "Mi Línea": explícito y sólo cuando la pantalla lo pide.
 *
 * Es la contracara de lo que se quitó en `quitar-acotamiento-por-lider`. Aquel
 * acotamiento era invisible —el servidor recortaba mirando el token, sin que
 * la pantalla dijera nada— y por eso pantallas que se leían como generales
 * mostraban una porción. Éste sólo actúa con `scope=mine` en la petición, así
 * que lo que estas pruebas fijan es justamente la diferencia: con el mismo
 * token, la misma pantalla responde una cosa u otra según lo que pida.
 */
const CORE = CHAPTERS.find((c) => c.name === "Core y Datos")!;
const CANALES = CHAPTERS.find((c) => c.name === "Canales Digitales")!;
/** Paula lidera "Datos Avanzados", que no tiene gente. */
const SIN_GENTE = CHAPTERS.find((c) => c.name === "Datos Avanzados")!;

const comoLeadDe = (chapter: { leadEntraObjectId: string }) =>
  setAccessTokenProvider(() => `simulated.${chapter.leadEntraObjectId}.token`);

const TODOS = 18;

describe("Mi Línea · recorte explícito por titular", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSquadsMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetDedicationMock();
  });

  afterEach(() => {
    setAccessTokenProvider(() => null);
  });

  it("Colaboradores: con scope trae los del titular; sin scope, todos", async () => {
    comoLeadDe(CORE);

    const mios = await personService.list(1, 50, undefined, [], [], [], "mine");
    expect(mios.totalCount).toBe(13);
    const nombres = mios.items.map((p) => p.name);
    expect(nombres).toContain("Carlos López");
    expect(nombres).not.toContain("Valentina Ospina");

    // El mismo token, sin pedir recorte: la pantalla de Organización.
    const todos = await personService.list(1, 50);
    expect(todos.totalCount).toBe(TODOS);
    expect(todos.items.map((p) => p.name)).toContain("Valentina Ospina");
  });

  it("el resumen de Colaboradores acompaña al alcance de su listado", async () => {
    comoLeadDe(CANALES);

    const mio = await personService.getStats("mine");
    const todo = await personService.getStats();

    expect(mio.activeCount).toBe(5);
    expect(todo.activeCount).toBe(TODOS);
    // Si el resumen no acompañara, la card diría 18 sobre una tabla de 5.
    expect(mio.fteAvailable).toBeLessThan(todo.fteAvailable);
  });

  it("Dedicación: una fila por colaborador del titular, y el resumen sobre ese mismo conjunto", async () => {
    comoLeadDe(CORE);

    const mias = await dedicationService.listCollaborators(
      {},
      { page: 1, pageSize: 50 },
      undefined,
      "mine"
    );
    expect(mias.totalCount).toBe(13);
    expect(mias.summary.total).toBe(13);
    expect(mias.items.map((r) => r.person.name)).not.toContain(
      "Valentina Ospina"
    );

    const todas = await dedicationService.listCollaborators(
      {},
      { page: 1, pageSize: 50 }
    );
    expect(todas.totalCount).toBe(TODOS);
    expect(todas.summary.total).toBe(TODOS);
  });

  it("Ausencias: se acotan las dos puntas — sólo las de la gente visible", async () => {
    comoLeadDe(CANALES);
    const mes = "2026-03";

    const mias = await absenceService.getByMonth(mes, "mine");
    const todas = await absenceService.getByMonth(mes);

    // El recorte no puede dejar entrar una ausencia de alguien que no está en
    // la lista: sería una fila sin persona a la que atribuirla.
    const deCanales = new Set(
      (
        await personService.list(1, 50, undefined, [], [], [], "mine")
      ).items.map((p) => p.id)
    );
    expect(mias.items.every((a) => deCanales.has(a.personId))).toBe(true);
    expect(mias.items.length).toBeLessThanOrEqual(todas.items.length);
  });

  it("sin token no hay titular: pedir recorte responde vacío, no todo", async () => {
    setAccessTokenProvider(() => null);

    const mios = await personService.list(1, 50, undefined, [], [], [], "mine");
    expect(mios.totalCount).toBe(0);

    // La misma petición sin pedir recorte sigue trayendo todo: no hay
    // acotamiento implícito por no tener token.
    expect((await personService.list(1, 50)).totalCount).toBe(TODOS);
  });

  it("un lead sin gente a cargo ve su listado vacío, no el de la organización", async () => {
    comoLeadDe(SIN_GENTE);

    const mios = await personService.list(1, 50, undefined, [], [], [], "mine");
    expect(mios.totalCount).toBe(0);
    expect((await personService.getStats("mine")).activeCount).toBe(0);
  });
});
