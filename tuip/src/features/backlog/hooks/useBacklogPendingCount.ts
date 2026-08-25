import { useEffect, useState } from "react";
import { backlogService } from "../services/backlogService";
import { BACKLOG_CHANGED, backlogEvents } from "./backlogEvents";

/**
 * Cuántas historias quedan por clasificar, para el badge de "Backlog" en el
 * sidebar. Se refresca al montar, al volver a la pestaña y cuando la pantalla
 * de Backlog avisa un cambio. Si falla, no hay badge: nunca bloquea el shell.
 */
export const useBacklogPendingCount = (): number | undefined => {
  const [count, setCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      backlogService.getQueue().then(
        (dto) => {
          if (!cancelled) setCount(dto.summary.pending);
        },
        () => {
          if (!cancelled) setCount(undefined);
        }
      );
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    load();
    backlogEvents.addEventListener(BACKLOG_CHANGED, load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      backlogEvents.removeEventListener(BACKLOG_CHANGED, load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return count;
};
