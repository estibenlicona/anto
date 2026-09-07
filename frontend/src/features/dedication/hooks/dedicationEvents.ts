/**
 * Canal mínimo entre las pantallas de Dedicación real y el badge de la
 * navegación: tras actualizar desde DevOps o reasignar, la pantalla avisa y
 * el contador de capacidades fuera de lo asignado se refresca, sin estado
 * global nuevo.
 */
export const DEDICATION_CHANGED = "dedication:changed";

export const dedicationEvents = new EventTarget();

export function notifyDedicationChanged() {
  dedicationEvents.dispatchEvent(new Event(DEDICATION_CHANGED));
}
