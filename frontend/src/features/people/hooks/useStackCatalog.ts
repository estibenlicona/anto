import { useEffect, useState } from "react";
import { personService } from "../services/personService";

/** El catálogo de stacks del chapter: estático durante la sesión. */
export const useStackCatalog = () => {
  const [catalog, setCatalog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    personService.getStackCatalog().then(
      (names) => {
        if (cancelled) return;
        setCatalog(names);
        setLoading(false);
      },
      () => {
        if (!cancelled) setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loading };
};
