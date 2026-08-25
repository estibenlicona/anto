import { absencesHandlers } from "./absences.handlers";
import { allocationsHandlers } from "./allocations.handlers";
import { assessmentsHandlers } from "./assessments.handlers";
import { authHandlers } from "./auth.handlers";
import { backlogHandlers } from "./backlog.handlers";
import { billingHandlers } from "./billing.handlers";
import { capabilityMixHandlers } from "./capability-mix.handlers";
import { careerPlanHandlers } from "./career-plan.handlers";
import { chapterHandlers } from "./chapter.handlers";
import { expertiseLinesHandlers } from "./expertise-lines.handlers";
import { gatewayHandlers } from "./gateway.handlers";
import { initiativesHandlers } from "./initiatives.handlers";
import { peopleHandlers } from "./people.handlers";
import { personDetailHandlers } from "./personDetail.handlers";
import { questionPoolHandlers } from "./question-pool.handlers";
import { sprintConfigHandlers } from "./sprint-config.handlers";
import { skillsHandlers } from "./skills.handlers";
import { squadsHandlers } from "./squads.handlers";
import { tallaBandsHandlers } from "./talla-bands.handlers";

// Punto único de extensión: cuando se agregue una feature nueva con
// llamadas HTTP, sumar su archivo de handlers acá.
export const handlers = [
  // Primero: la puerta de enlace se evalúa antes que el servicio, igual que en
  // producción. Va inerte salvo que se la encienda (ver gateway.handlers.ts).
  ...gatewayHandlers,
  ...absencesHandlers,
  ...allocationsHandlers,
  ...assessmentsHandlers,
  ...authHandlers,
  ...backlogHandlers,
  ...billingHandlers,
  ...capabilityMixHandlers,
  ...careerPlanHandlers,
  ...chapterHandlers,
  ...expertiseLinesHandlers,
  ...initiativesHandlers,
  ...peopleHandlers,
  ...personDetailHandlers,
  ...questionPoolHandlers,
  ...sprintConfigHandlers,
  ...skillsHandlers,
  ...squadsHandlers,
  ...tallaBandsHandlers,
];
