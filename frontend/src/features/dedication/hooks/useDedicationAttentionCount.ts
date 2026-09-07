import { useEffect, useState } from "react";
import { dedicationService } from "../services/dedicationService";
import { DEDICATION_CHANGED, dedicationEvents } from "./dedicationEvents";

/**
 * Cuántos colaboradores dan señal de posible sobreasignación o de posible
 * subasignación en el sprint en curso, para el badge de "Dedicación" en el
 * sidebar. Sólo esas dos de las cuatro: son las que piden una decisión de
 * carga. "Carga habitual" y "No evaluable" no piden nada, y un badge que las
 * contara le pediría al lead entrar cada sprint a mirar algo que no hay que
 * mover. Se
 * refresca al montar, al volver a la pestaña y cuando una pantalla del módulo
 * avisa un cambio. Si falla, no hay badge: nunca bloquea el shell. En cero
 * tampoco hay badge: la entrada sólo llama cuando hay algo que mirar.
 */
export const useDedicationAttentionCount = (
  enabled: boolean = true
): number | undefined => {
  const [count, setCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Entrada oculta por permisos: ni badge ni consulta.
    if (!enabled) return;
    let cancelled = false;
    const load = () => {
      // Sólo el resumen importa: una página de una fila basta.
      dedicationService.listCollaborators({}, { page: 1, pageSize: 1 }).then(
        (dto) => {
          if (cancelled) return;
          const total =
            dto.summary.possibleOverload + dto.summary.possibleUnderload;
          setCount(total > 0 ? total : undefined);
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
    dedicationEvents.addEventListener(DEDICATION_CHANGED, load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      dedicationEvents.removeEventListener(DEDICATION_CHANGED, load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  // Si el permiso se apagó después de haber contado, el número guardado ya no
  // representa nada visible: se reporta ausencia sin re-renderizar de más.
  return enabled ? count : undefined;
};
