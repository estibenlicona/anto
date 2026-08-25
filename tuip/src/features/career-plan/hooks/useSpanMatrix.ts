import { useCallback, useEffect, useMemo, useState } from "react";
import {
  careerPlanService,
  type SpanMatrixDto,
} from "../services/careerPlanService";
import {
  toSpanView,
  type SpanMatrixView,
  type SpanOptions,
} from "../adapters/SpanMatrixAdapter";

/**
 * El span se pide entero una vez; acotar y ordenar son de la pantalla y no
 * vuelven a pedir nada — es lo que permite que los totales se recalculen al
 * instante sobre lo visible.
 */
export const useSpanMatrix = (options: SpanOptions) => {
  const [dto, setDto] = useState<SpanMatrixDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    careerPlanService.getSpan().then(
      (data) => {
        if (cancelled) return;
        setDto(data);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el span"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const { groups, skillIds, sort } = options;
  const span: SpanMatrixView | null = useMemo(
    () => (dto ? toSpanView(dto, { groups, skillIds, sort }) : null),
    [dto, groups, skillIds, sort]
  );

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  return { span, loading, error, refetch };
};
