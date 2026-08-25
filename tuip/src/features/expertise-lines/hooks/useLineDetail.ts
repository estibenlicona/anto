import { useCallback, useEffect, useState } from "react";
import { expertiseLinesService } from "../services/expertiseLinesService";
import {
  toLineDetail,
  type LineDetailView,
} from "../adapters/ExpertiseLinesAdapter";

/** El detalle de la línea abierta. Trae su gente y su capacidad en una sola petición. */
export const useLineDetail = (lineId: string | null) => {
  // Lo cargado se guarda junto a la línea que lo trajo, y no suelto. Así, al
  // cambiar de línea, el detalle viejo se descarta derivándolo en vez de
  // borrándolo desde el efecto: un `setState` síncrono en el cuerpo de un
  // efecto encadena renders. Por lo mismo, `loading` y `error` se derivan.
  const [loaded, setLoaded] = useState<{
    lineId: string;
    view: LineDetailView;
  } | null>(null);
  const [failure, setFailure] = useState<{
    lineId: string;
    message: string;
  } | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!lineId) return;
    let cancelled = false;
    expertiseLinesService.get(lineId).then(
      (dto) => {
        if (cancelled) return;
        setLoaded({ lineId, view: toLineDetail(dto) });
        setFailure(null);
      },
      (err) => {
        if (cancelled) return;
        setFailure({
          lineId,
          message:
            err instanceof Error ? err.message : "Error al cargar la línea",
        });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [lineId, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  // El detalle de otra línea no es el de esta.
  const detail = loaded?.lineId === lineId ? loaded.view : null;
  const error = failure?.lineId === lineId ? failure.message : null;
  const loading = lineId !== null && detail === null && error === null;

  return { detail, loading, error, refetch };
};
