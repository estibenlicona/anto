import { useEffect, useState } from "react";
import { squadService, type Criticality } from "../services/squadService";

export const useCriticalities = () => {
  const [criticalities, setCriticalities] = useState<Criticality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    squadService
      .getCriticalities()
      .then((values) => {
        if (cancelled) return;
        setCriticalities(values);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar el catálogo de criticidades"
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { criticalities, loading, error };
};
