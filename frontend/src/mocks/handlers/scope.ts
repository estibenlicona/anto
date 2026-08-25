/**
 * Lo que alcanza a ver quien pidió.
 *
 * El acotado por chapter es una regla del rol, no de cada pantalla, y por eso
 * se escribe una sola vez acá: los handlers que cruzan personas con algo
 * indexado por persona —asignaciones, ausencias, prefacturas, historias—
 * arman su vista con `vistaDe(request)` y trabajan sobre ella.
 *
 * Lo que hace falta recordar al usarla: **filtrar las dos puntas**. Acotar las
 * personas y dejar entrar las asignaciones de todo el mundo no esconde nada;
 * convierte a la gente de otro chapter en personas de 0 FTE disponible, y
 * entonces la célula aparece al tope, el FTE libre da negativo y los
 * porcentajes pasan de 100. Por eso la vista trae las dos cosas ya acotadas y
 * `ve()` para lo demás.
 *
 * Quién queda fuera del acotado y por qué está en chapters.ts.
 */
import { getAllocationsSnapshot } from "./allocations.handlers";
import { peopleFor } from "./people.handlers";

export interface Vista {
  /** Las personas del chapter de quien pidió; todas, si no lidera ninguno. */
  people: ReturnType<typeof peopleFor>;
  /** Sólo las asignaciones de esas personas. */
  allocations: ReturnType<typeof getAllocationsSnapshot>;
  /** Si esa persona entra en lo que se puede ver. */
  ve: (personId: string) => boolean;
}

export function vistaDe(request: Request): Vista {
  const people = peopleFor(request);
  const visibles = new Set(people.map((p) => p.id));
  const ve = (personId: string) => visibles.has(personId);
  return {
    people,
    allocations: getAllocationsSnapshot().filter((a) => ve(a.personId)),
    ve,
  };
}
