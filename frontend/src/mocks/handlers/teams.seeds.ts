/**
 * Los 4 equipos que hoy son el campo de texto libre `team` de las células
 * sembradas (ver `squads.handlers.ts`), migrados a catálogo. Mismos nombres,
 * sin descripción — nadie la había capturado nunca porque el campo no
 * existía.
 */
export const TEAM_ECOSISTEMA_DIGITAL_ID =
  "a1111111-1111-1111-1111-111111111111";
export const TEAM_RIESGO_Y_FRAUDE_ID = "a2222222-2222-2222-2222-222222222222";
export const TEAM_PAGOS_ID = "a3333333-3333-3333-3333-333333333333";
export const TEAM_DATOS_Y_ANALITICA_ID = "a4444444-4444-4444-4444-444444444444";

export interface TeamSeed {
  id: string;
  name: string;
  description: string | null;
}

export const teamSeeds: TeamSeed[] = [
  {
    id: TEAM_ECOSISTEMA_DIGITAL_ID,
    name: "Ecosistema Digital",
    description: null,
  },
  {
    id: TEAM_RIESGO_Y_FRAUDE_ID,
    name: "Riesgo y Fraude",
    description: null,
  },
  {
    id: TEAM_PAGOS_ID,
    name: "Pagos",
    description: null,
  },
  {
    id: TEAM_DATOS_Y_ANALITICA_ID,
    name: "Datos y Analítica",
    description: null,
  },
];
