import { http, HttpResponse } from "msw";
import {
  SPRINT_CLOSE_TIME_PATTERN,
  type SprintConfig,
} from "@features/admin-shell/services/sprintConfigService";

const SPRINT_CONFIG_URL = "/admin/sprint-config";

const defaultSprintConfig: SprintConfig = {
  weeks: 2,
  sprintsPerQuarter: 6,
  hoursPerSprint: 80,
  sprintCloseTime: "23:00",
  historyWindowSprints: 6,
  minHistorySprints: 3,
};

let sprintConfig: SprintConfig = { ...defaultSprintConfig };

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan el guardado. */
export function resetSprintConfigMock() {
  sprintConfig = { ...defaultSprintConfig };
}

/**
 * Lo que el mock de balance de carga necesita del calendario: sobre cuántos
 * sprints mira el histórico, cuántos exige para evaluar, y a qué hora se sella
 * el snapshot. Lectura en un solo sentido, como los demás snapshots; función y
 * no constante porque el `PUT` reasigna la configuración.
 */
export function getDedicationSettings(): {
  hoursPerSprint: number;
  sprintCloseTime: string;
  historyWindowSprints: number;
  minHistorySprints: number;
} {
  return {
    hoursPerSprint: sprintConfig.hoursPerSprint,
    sprintCloseTime: sprintConfig.sprintCloseTime,
    historyWindowSprints: sprintConfig.historyWindowSprints,
    minHistorySprints: sprintConfig.minHistorySprints,
  };
}

function inRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && value >= min && value <= max;
}

function isValidSprintConfig(value: unknown): value is SprintConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SprintConfig>;
  // Ni horas ni puntos por FTE: no están en el contrato y no se aceptan.
  if (!inRange(v.weeks, 1, 4)) return false;
  if (!inRange(v.sprintsPerQuarter, 4, 8)) return false;
  if (!inRange(v.hoursPerSprint, 20, 400)) return false;
  if (!inRange(v.historyWindowSprints, 3, 12)) return false;
  if (!inRange(v.minHistorySprints, 2, 6)) return false;
  if (
    typeof v.sprintCloseTime !== "string" ||
    !SPRINT_CLOSE_TIME_PATTERN.test(v.sprintCloseTime)
  ) {
    return false;
  }
  // Exigir más sprints sellados de los que la ventana mira no tiene sentido.
  return v.minHistorySprints <= v.historyWindowSprints;
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
    // Sólo los cinco campos del contrato: un cliente viejo que mande horas,
    // tolerancia o puntos por FTE no las cuela al estado.
    sprintConfig = {
      weeks: body.weeks,
      sprintsPerQuarter: body.sprintsPerQuarter,
      hoursPerSprint: body.hoursPerSprint,
      sprintCloseTime: body.sprintCloseTime,
      historyWindowSprints: body.historyWindowSprints,
      minHistorySprints: body.minHistorySprints,
    };
    return HttpResponse.json(sprintConfig);
  }),
];
