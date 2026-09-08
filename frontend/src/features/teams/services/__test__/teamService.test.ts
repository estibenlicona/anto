import { describe, it, expect, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../../mocks/server";
import { resetTeamsMock } from "../../../../mocks/handlers/teams.handlers";
import { teamService } from "../teamService";

/**
 * Test de humo contra el mock de red (MSW), como el resto de los servicios
 * de catálogo: cubre que `teamService` habla el mismo contrato que
 * `teams.handlers.ts`, no la lógica del mock en sí (eso lo cubre
 * `teams.handler.test.ts`).
 */
describe("teamService", () => {
  afterEach(() => {
    resetTeamsMock();
  });

  it("list devuelve los equipos sembrados, paginados", async () => {
    const result = await teamService.list(1, 10);
    expect(result.totalCount).toBe(4);
    expect(result.items.map((t) => t.name)).toContain("Ecosistema Digital");
  });

  it("list filtra por búsqueda", async () => {
    const result = await teamService.list(1, 10, "pagos");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("Pagos");
  });

  it("create persiste el equipo y un list posterior lo refleja", async () => {
    const created = await teamService.create({ name: "Nuevo Equipo" });
    expect(created.name).toBe("Nuevo Equipo");
    expect(created.squadCount).toBe(0);

    const result = await teamService.list(1, 20);
    expect(result.items.map((t) => t.id)).toContain(created.id);
  });

  it("update persiste los cambios", async () => {
    const created = await teamService.create({ name: "Original" });
    const updated = await teamService.update(created.id, {
      name: "Renombrado",
      description: "Nueva descripción",
    });
    expect(updated.name).toBe("Renombrado");
    expect(updated.description).toBe("Nueva descripción");
  });

  it("remove elimina el equipo", async () => {
    const created = await teamService.create({ name: "Temporal" });
    await teamService.remove(created.id);
    const result = await teamService.list(1, 20);
    expect(result.items.map((t) => t.id)).not.toContain(created.id);
  });

  it("propaga el error cuando la petición falla", async () => {
    server.use(
      http.get("/teams", () =>
        HttpResponse.json({ message: "Error de servidor" }, { status: 500 })
      )
    );
    await expect(teamService.list(1, 10)).rejects.toThrow();
  });
});
