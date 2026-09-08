import { http, HttpResponse } from "msw";
import type {
  CreateTeamRequest,
  TeamDto,
} from "@features/teams/services/teamService";
import { clampPagination, paginate } from "@shared/services/pagination";
import { teamSeeds } from "./teams.seeds";
// Única dirección de dependencia con squads: teams necesita el conteo de
// células por equipo para el guard de eliminación y la columna "N células".
// squads, a su vez, resuelve el nombre del equipo contra este mock (ver
// squads.handlers.ts) — las dos lecturas son de sólo lectura sobre el estado
// del otro, sin ciclo de escritura.
import { getSquadsSnapshot } from "./squads.handlers";

const TEAMS_URL = "/teams";

export type StoredTeam = Omit<TeamDto, "squadCount">;

const initialTeams: StoredTeam[] = teamSeeds.map((seed) => {
  const now = new Date().toISOString();
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    createdAtUtc: now,
    updatedAtUtc: now,
  };
});

let teams: StoredTeam[] = initialTeams.map((t) => ({ ...t }));

function squadCountOf(teamId: string): number {
  return getSquadsSnapshot().filter((s) => s.teamId === teamId).length;
}

function enrich(team: StoredTeam): TeamDto {
  return { ...team, squadCount: squadCountOf(team.id) };
}

function filterTeams(
  source: StoredTeam[],
  search: string | null
): StoredTeam[] {
  if (!search) return source;
  const term = search.toLowerCase();
  return source.filter((t) => t.name.toLowerCase().includes(term));
}

/** Lectura del estado vigente para otros handlers (squads.handlers resuelve teamName). */
export function getTeamsSnapshot(): StoredTeam[] {
  return teams;
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan mutaciones. */
export function resetTeamsMock() {
  teams = initialTeams.map((t) => ({ ...t }));
}

function isValidCreateRequest(value: unknown): value is CreateTeamRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<CreateTeamRequest>;
  return (
    typeof v.name === "string" &&
    v.name.trim().length > 0 &&
    v.name.length <= 100 &&
    (v.description === undefined ||
      (typeof v.description === "string" && v.description.length <= 500))
  );
}

function existsByName(name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return teams.some(
    (t) => t.id !== excludeId && t.name.trim().toLowerCase() === normalized
  );
}

export const teamsHandlers = [
  http.get(TEAMS_URL, ({ request }) => {
    const url = new URL(request.url);
    const { page, pageSize } = clampPagination(
      Number(url.searchParams.get("page")) || null,
      Number(url.searchParams.get("pageSize")) || null
    );
    const search = url.searchParams.get("search");
    const filtered = filterTeams(teams, search);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({
      ...result,
      items: result.items.map(enrich),
    });
  }),

  http.get(`${TEAMS_URL}/:id`, ({ params }) => {
    const existing = teams.find((t) => t.id === params.id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Equipo no encontrado" },
        { status: 404 }
      );
    }
    return HttpResponse.json(enrich(existing));
  }),

  http.post(TEAMS_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de equipo inválidos" },
        { status: 400 }
      );
    }
    if (existsByName(body.name)) {
      return HttpResponse.json(
        { message: `Ya existe un equipo con el nombre "${body.name}"` },
        { status: 400 }
      );
    }
    const nowIso = new Date().toISOString();
    const created: StoredTeam = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      description: body.description ?? null,
      createdAtUtc: nowIso,
      updatedAtUtc: nowIso,
    };
    teams = [...teams, created];
    return HttpResponse.json(enrich(created), { status: 201 });
  }),

  http.put(`${TEAMS_URL}/:id`, async ({ request, params }) => {
    const { id } = params;
    const existing = teams.find((t) => t.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Equipo no encontrado" },
        { status: 404 }
      );
    }
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de equipo inválidos" },
        { status: 400 }
      );
    }
    if (existsByName(body.name, existing.id)) {
      return HttpResponse.json(
        { message: `Ya existe un equipo con el nombre "${body.name}"` },
        { status: 400 }
      );
    }
    const updated: StoredTeam = {
      ...existing,
      name: body.name.trim(),
      description: body.description ?? null,
      updatedAtUtc: new Date().toISOString(),
    };
    teams = teams.map((t) => (t.id === id ? updated : t));
    return HttpResponse.json(enrich(updated));
  }),

  http.delete(`${TEAMS_URL}/:id`, ({ params }) => {
    const { id } = params;
    const existing = teams.find((t) => t.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Equipo no encontrado" },
        { status: 404 }
      );
    }
    const count = squadCountOf(existing.id);
    if (count > 0) {
      return HttpResponse.json(
        {
          message: `${count} ${count === 1 ? "célula pertenece" : "células pertenecen"} a este equipo; reasignalas o eliminalas antes de eliminar el equipo.`,
        },
        { status: 409 }
      );
    }
    teams = teams.filter((t) => t.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
