import { useEffect, useState } from "react";
import { careerPlanService } from "@features/career-plan/services/careerPlanService";
import {
  toPersonPlanView,
  type PersonPlanView,
} from "@features/career-plan/adapters/PersonPlanAdapter";

/**
 * El plan de la persona para los paneles de competencias de la ficha, en
 * paralelo al detalle (design D1). La ficha degrada por partes (design D3):
 * si el plan falla, `plan` queda `null` y los paneles muestran su estado
 * vacío — no hay estado de error propio, porque la fuente crítica de la
 * página es el detalle.
 */
export const usePersonPlan = (personId: string | undefined) => {
  const [plan, setPlan] = useState<PersonPlanView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    careerPlanService.getPlan(personId).then(
      (dto) => {
        if (cancelled) return;
        setPlan(toPersonPlanView(dto));
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setPlan(null);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [personId]);

  return { plan, loading };
};
