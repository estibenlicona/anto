import { http, HttpResponse } from "msw";
import type { SprintConfig } from "@features/admin-shell/services/sprintConfigService";

const SPRINT_CONFIG_URL = "/admin/sprint-config";

const defaultSprintConfig: SprintConfig = {
  weeks: 2,
  hoursPerWeek: 40,
  sprintsPerQuarter: 6,
  toleranceHours: 4,
};

let sprintConfig: SprintConfig = { ...defaultSprintConfig };

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan el guardado. */
export function resetSprintConfigMock() {
  sprintConfig = { ...defaultSprintConfig };
}

function isValidSprintConfig(value: unknown): value is SprintConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SprintConfig>;
  return (
    typeof v.weeks === "number" &&
    v.weeks >= 1 &&
    v.weeks <= 4 &&
    typeof v.hoursPerWeek === "number" &&
    v.hoursPerWeek >= 20 &&
    v.hoursPerWeek <= 48 &&
    typeof v.sprintsPerQuarter === "number" &&
    v.sprintsPerQuarter >= 4 &&
    v.sprintsPerQuarter <= 8 &&
    typeof v.toleranceHours === "number" &&
    v.toleranceHours >= 0 &&
    v.toleranceHours <= 16
  );
}

export const sprintConfigHandlers = [
  http.get(SPRINT_CONFIG_URL, () => {
    return HttpResponse.json(sprintConfig);
  }),

  http.put(SPRINT_CONFIG_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidSprintConfig(body)) {
      return HttpResponse.json(
        { message: "Configuración de sprint inválida" },
        { status: 400 }
      );
    }
    sprintConfig = body;
    return HttpResponse.json(sprintConfig);
  }),
];
