import { useEffect, useState } from "react";
import {
  careerPlanService,
  type SpanSummaryDto,
} from "../services/careerPlanService";
import {
  scopeParam,
  useCapacityScope,
} from "@features/capacity-shell/CapacityScopeContext";

/**
 * El resumen del span: una sola petición, y no vuelve a pedirse al acotar o
 * reordenar la matriz.
 *
 * Va aparte de `useSpanMatrix` justamente por eso: son cifras del chapter
 * entero y no de lo que está a la vista, así que no comparten ni la carga ni
 * las opciones de la pantalla.
 */
export const useSpanSummary = () => {
  const [summary, setSummary] = useState<SpanSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // El alcance lo declara la ruta: "Mi Línea" pide recorte, el resto no.
  const scope = scopeParam(useCapacityScope());

  useEffect(() => {
    let cancelled = false;
    careerPlanService.getSpanSummary(scope).then(
      (data) => {
        if (cancelled) return;
        setSummary(data);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el resumen"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [scope]);

  return { summary, loading, error };
};
