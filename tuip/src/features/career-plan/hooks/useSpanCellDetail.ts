import { useEffect, useRef, useState } from "react";
import { careerPlanService } from "../services/careerPlanService";
import {
  toPersonPlanView,
  type PersonPlanView,
} from "../adapters/PersonPlanAdapter";

/**
 * El plan de la persona cuya celda está abierta. El span no trae criterios ni
 * acciones —son de la persona, no de la matriz—, así que el detalle los pide
 * al abrirse, y una sola vez por persona: con catorce filas y nueve columnas,
 * recorrer el mapa haría ciento veintiséis pedidos si cada celda pidiera lo
 * suyo. Lo que se cachea es la respuesta, no el panel: quien vuelva a una
 * celda de la misma persona lo ve sin espera.
 */
export const useSpanCellDetail = (personId: string | null) => {
  const [plans, setPlans] = useState<Record<string, PersonPlanView>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requested = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (personId === null || requested.current.has(personId)) return;
    requested.current.add(personId);

    let cancelled = false;
    setLoading(true);
    setError(null);
    careerPlanService.getPlan(personId).then(
      (dto) => {
        if (cancelled) return;
        setPlans((current) => ({
          ...current,
          [personId]: toPersonPlanView(dto),
        }));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        // Se olvida el intento fallido para que reabrir la celda reintente,
        // en vez de dejar a esa persona sin detalle por lo que resta de sesión.
        requested.current.delete(personId);
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el detalle"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [personId]);

  const plan = personId === null ? null : (plans[personId] ?? null);

  return { plan, loading: loading && plan === null, error };
};
