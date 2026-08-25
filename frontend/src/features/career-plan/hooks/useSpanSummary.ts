import { useEffect, useState } from "react";
import {
  careerPlanService,
  type SpanSummaryDto,
} from "../services/careerPlanService";

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

  useEffect(() => {
    let cancelled = false;
    careerPlanService.getSpanSummary().then(
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
  }, []);

  return { summary, loading, error };
};
