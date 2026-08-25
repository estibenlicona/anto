import { describe, it, expect, beforeEach } from "vitest";
import { backlogService } from "@features/backlog/services/backlogService";
import { personDetailService } from "@features/people/services/personDetailService";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetPeopleMock } from "../people.handlers";
import { resetPersonDetailMock } from "../personDetail.handlers";
import { resetBacklogMock } from "../backlog.handlers";
import { CAMILA, DIEGO, MARIA } from "../personDetail.seeds";

const BACKEND = "11111111-1111-1111-1111-111111111111";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

describe("mock del backlog", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
    resetPersonDetailMock();
    resetBacklogMock();
  });

  it("cola y resumen coherentes, con cambio de asignado primero y excluidas por identidad", async () => {
    const { items, summary } = await backlogService.getQueue();
    expect(
      items.every((s) => s.status === "Pending" && s.personId !== null)
    ).toBe(true);
    expect(summary.pending).toBe(items.length);
    expect(summary.pendingBySquad.reduce((acc, s) => acc + s.pending, 0)).toBe(
      summary.pending
    );
    // Diego (dsalazar@tuya) no está vinculado: sus 3 historias quedan fuera.
    expect(summary.excludedWithoutIdentity).toBe(3);
    expect(items[0].previousAssignedTo).not.toBeNull();
    expect(items[1].previousAssignedTo).not.toBeNull();
    expect(items.slice(2).every((s) => s.previousAssignedTo === null)).toBe(
      true
    );
    expect(summary.classifiedToday).toBe(1);
    const first = items.find((s) => s.number === 12401)!;
    expect(first).toMatchObject({
      personName: "Carlos López",
      squadId: BACKEND,
      epicInitiativeId: "ini-kafka",
    });
  });

  it("filtra por célula, persona y estado", async () => {
    const bySquad = await backlogService.getQueue({ squadId: BACKEND });
    expect(bySquad.items.every((s) => s.squadId === BACKEND)).toBe(true);
    const byPerson = await backlogService.getQueue({ personId: MARIA });
    expect(byPerson.items.every((s) => s.personId === MARIA)).toBe(true);
    const classified = await backlogService.getQueue({ status: "Classified" });
    expect(classified.items.length).toBeGreaterThan(0);
    expect(classified.items.every((s) => s.status !== "Pending")).toBe(true);
  });

  it("clasificar saca la historia de pendientes, suma a hoy y exige lo que el tipo pide", async () => {
    const before = await backlogService.getQueue();
    const story = before.items.find((s) => s.number === 12401)!;
    await backlogService.classify(story.id, {
      kind: "Initiative",
      initiativeId: "ini-kafka",
    });
    const after = await backlogService.getQueue();
    expect(after.items.some((s) => s.id === story.id)).toBe(false);
    expect(after.summary.classifiedToday).toBe(
      before.summary.classifiedToday + 1
    );
    const other = after.items[0];
    expect(
      await status(() => backlogService.classify(other.id, { kind: "Bau" }))
    ).toBe(400);
    expect(
      await status(() =>
        backlogService.classify(other.id, {
          kind: "Initiative",
          initiativeId: "nope",
        })
      )
    ).toBe(400);
    await backlogService.classify(other.id, { kind: "Discard" });
    const done = await backlogService.getQueue({ status: "Classified" });
    expect(
      done.items.find((s) => s.id === other.id)?.classification?.kind
    ).toBe("Discard");
  });

  it("saltar manda al final; deshacer vuelve a pendiente (409 si no estaba clasificada)", async () => {
    const before = await backlogService.getQueue();
    const first = before.items[0];
    await backlogService.skip(first.id);
    const after = await backlogService.getQueue();
    expect(after.items[after.items.length - 1].id).toBe(first.id);
    expect(await status(() => backlogService.undo(first.id))).toBe(409);
    const classified = (await backlogService.getQueue({ status: "Classified" }))
      .items[0];
    await backlogService.undo(classified.id);
    const pending = await backlogService.getQueue();
    expect(
      pending.items.some(
        (s) => s.id === classified.id && s.classification === null
      )
    ).toBe(true);
  });

  it("rechazar exige motivo, traza y crea la pendiente a nombre de la otra persona", async () => {
    const { items } = await backlogService.getQueue();
    const story = items.find((s) => s.number === 12318)!;
    expect(
      await status(() =>
        backlogService.reject(story.id, { reason: "" as never })
      )
    ).toBe(400);
    await backlogService.reject(story.id, {
      reason: "OtherPerson",
      reassignToPersonId: MARIA,
      detail: "Error al cerrar el sprint",
    });
    const rejected = (
      await backlogService.getQueue({ status: "Rejected" })
    ).items.find((s) => s.id === story.id)!;
    expect(rejected).toMatchObject({
      status: "Rejected",
      rejectReason: "OtherPerson",
      rejectDetail: "Error al cerrar el sprint",
    });
    const pending = await backlogService.getQueue({ personId: MARIA });
    const copy = pending.items.find(
      (s) => s.title === story.title && s.id !== story.id
    )!;
    expect(copy).toMatchObject({
      status: "Pending",
      personId: MARIA,
      previousAssignedTo: "clopez@tuya",
    });
    // Camila no tiene identidad: no se puede reasignar a ella.
    const another = pending.items[0];
    expect(
      await status(() =>
        backlogService.reject(another.id, {
          reason: "Other",
          reassignToPersonId: CAMILA,
        })
      )
    ).toBe(400);
  });

  it("vincular una identidad hace aparecer sus historias", async () => {
    const before = await backlogService.getQueue();
    const detail = await personDetailService.getDetail(DIEGO);
    await personDetailService.linkDevOpsIdentity(
      DIEGO,
      detail.devOpsCandidates[0].id
    );
    const after = await backlogService.getQueue();
    expect(after.summary.excludedWithoutIdentity).toBe(0);
    expect(after.items.length).toBe(before.items.length + 3);
    expect(after.items.filter((s) => s.personId === DIEGO)).toHaveLength(3);
  });

  it("catálogos", async () => {
    const c = await backlogService.getCatalogs();
    expect(c.bauCategories).toHaveLength(9);
    expect(c.initiatives.some((i) => i.squadId === BACKEND)).toBe(true);
    expect(c.rejectReasons.map((r) => r.value)).toContain("OtherPerson");
  });
});
