import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface LeadBreadcrumbContextValue {
  /** Último nivel del breadcrumb, publicado por una pantalla de detalle. */
  trailing: string | null;
  setTrailing: (value: string | null) => void;
}

const LeadBreadcrumbContext = createContext<LeadBreadcrumbContextValue | null>(
  null
);

export const LeadBreadcrumbProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [trailing, setTrailing] = useState<string | null>(null);
  const value = useMemo(() => ({ trailing, setTrailing }), [trailing]);
  return (
    <LeadBreadcrumbContext.Provider value={value}>
      {children}
    </LeadBreadcrumbContext.Provider>
  );
};

export function useLeadBreadcrumb(): LeadBreadcrumbContextValue {
  const ctx = useContext(LeadBreadcrumbContext);
  // Fuera del shell (tests de componentes sueltos) no hay breadcrumb que
  // alimentar: se devuelve un no-op para que la pantalla no dependa del layout.
  return ctx ?? { trailing: null, setTrailing: () => {} };
}

/**
 * Publica `label` como último nivel del breadcrumb mientras el componente
 * esté montado, y lo limpia al desmontar o cuando `label` vuelve a null.
 */
export function useLeadBreadcrumbTrailing(label: string | null) {
  const { setTrailing } = useLeadBreadcrumb();
  useEffect(() => {
    setTrailing(label);
    return () => setTrailing(null);
  }, [label, setTrailing]);
}
