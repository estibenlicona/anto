import { describe, it, expect, beforeEach } from "vitest";
import { teamService } from "@features/teams/services/teamService";
import { squadService } from "@features/squads/services/squadService";
import { resetTeamsMock } from "../teams.handlers";
import { resetSquadsMock } from "../squads.handlers";
import { TEAM_ECOSISTEMA_DIGITAL_ID, TEAM_PAGOS_ID } from "../teams.seeds";

async function fetchAllTeams() {
  return (await teamService.list(1, 1000)).items;
}

describe("GET /teams", () => {
  beforeEach(() => {
    resetTeamsMock();
    resetSquadsMock();
  });

  it("devuelve los 4 equipos sembrados con su squadCount calculado contra las células", async () => {
    const teams = await fetchAllTeams();
    expect(teams).toHaveLength(4);
    const ecosistema = teams.find((t) => t.id === TEAM_ECOSISTEMA_DIGITAL_ID)!;
    const squads = (await squadService.list(1, 1000)).items;
    const expectedCount = squads.filter(
      (s) => s.teamId === TEAM_ECOSISTEMA_DIGITAL_ID
    ).length;
    expect(ecosistema.squadCount).toBe(expectedCount);
    expect(ecosistema.squadCount).toBeGreaterThan(0);
  });

  it("busca por nombre sin distinguir mayúsculas", async () => {
    const result = await teamService.list(1, 10, "PAGOS");
    expect(result.items.map((t) => t.name)).toEqual(["Pagos"]);
  });
});

describe("POST /teams", () => {
  beforeEach(() => {
    resetTeamsMock();
    resetSquadsMock();
  });

  it("crea un equipo válido, sin células", async () => {
    const created = await teamService.create({
      name: "Nuevo Equipo",
      description: "Descripción del equipo",
    });
    expect(created.name).toBe("Nuevo Equipo");
    expect(created.squadCount).toBe(0);
  });

  it("rechaza un nombre vacío o mayor a 100 caracteres", async () => {
    await expect(teamService.create({ name: "" })).rejects.toBeDefined();
    await expect(
      teamService.create({ name: "a".repeat(101) })
    ).rejects.toBeDefined();
  });

  it("rechaza una descripción mayor a 500 caracteres", async () => {
    await expect(
      teamService.create({ name: "Válido", description: "a".repeat(501) })
    ).rejects.toBeDefined();
  });

  it("rechaza un nombre duplicado sin distinguir mayúsculas", async () => {
    await expect(
      teamService.create({ name: "ecosistema digital" })
    ).rejects.toBeDefined();
  });
});

describe("PUT /teams/:id", () => {
  beforeEach(() => {
    resetTeamsMock();
    resetSquadsMock();
  });

  it("edita un equipo existente", async () => {
    const created = await teamService.create({ name: "Original" });
    const updated = await teamService.update(created.id, {
      name: "Editado",
      description: "Nueva",
    });
    expect(updated.name).toBe("Editado");
    expect(updated.description).toBe("Nueva");
  });

  it("no rechaza reenviar el mismo nombre del equipo que se está editando", async () => {
    const teams = await fetchAllTeams();
    const pagos = teams.find((t) => t.id === TEAM_PAGOS_ID)!;
    await expect(
      teamService.update(pagos.id, { name: pagos.name })
    ).resolves.toMatchObject({ name: "Pagos" });
  });

  it("rechaza renombrar a un nombre que ya usa otro equipo", async () => {
    await expect(
      teamService.update(TEAM_PAGOS_ID, { name: "Ecosistema Digital" })
    ).rejects.toBeDefined();
  });
});

describe("DELETE /teams/:id", () => {
  beforeEach(() => {
    resetTeamsMock();
    resetSquadsMock();
  });

  it("elimina un equipo sin células", async () => {
    const created = await teamService.create({ name: "Temporal" });
    await teamService.remove(created.id);
    const teams = await fetchAllTeams();
    expect(teams.map((t) => t.id)).not.toContain(created.id);
  });

  it("bloquea con 409 la eliminación de un equipo con células, informando la cantidad", async () => {
    const squads = await squadService.list(1, 1000);
    const count = squads.items.filter(
      (s) => s.teamId === TEAM_ECOSISTEMA_DIGITAL_ID
    ).length;
    expect(count).toBeGreaterThan(0);

    await expect(
      teamService.remove(TEAM_ECOSISTEMA_DIGITAL_ID)
    ).rejects.toMatchObject({
      response: {
        status: 409,
        data: { message: expect.stringContaining(String(count)) },
      },
    });

    const teams = await fetchAllTeams();
    expect(teams.map((t) => t.id)).toContain(TEAM_ECOSISTEMA_DIGITAL_ID);
  });
});
