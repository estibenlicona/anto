/**
 * Canal mínimo entre la pantalla de Backlog y el badge del sidebar: tras
 * cada mutación la pantalla avisa y el contador se refresca, sin estado
 * global nuevo (design.md D7).
 */
export const BACKLOG_CHANGED = "backlog:changed";

export const backlogEvents = new EventTarget();

export function notifyBacklogChanged() {
  backlogEvents.dispatchEvent(new Event(BACKLOG_CHANGED));
}
