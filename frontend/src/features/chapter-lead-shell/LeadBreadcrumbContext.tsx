import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface LeadBreadcrumbState {
  /** Último nivel del breadcrumb, publicado por una pantalla de detalle. */
  trailing: string | null;
  /**
   * Acciones de la pantalla activa, pintadas a la derecha de la franja del
   * breadcrumb (el botón de "Nueva …" de un listado, por ejemplo).
   */
  actions: React.ReactNode | null;
}

interface LeadBreadcrumbSetters {
  setTrailing: (value: string | null) => void;
  setActions: (value: React.ReactNode | null) => void;
}

type LeadBreadcrumbContextValue = LeadBreadcrumbState & LeadBreadcrumbSetters;

// Dos contextos, no uno: quien publica sólo consume los setters, que no
// cambian de identidad, así que publicar no lo re-renderiza. Importa para
// `actions`: un ReactNode es un objeto nuevo en cada render, y si la pantalla
// leyera el valor que ella misma acaba de publicar, volvería a renderizar y a
// publicar sin fin. Sólo la franja del layout lee el estado.
const LeadBreadcrumbStateContext = createContext<LeadBreadcrumbState | null>(
  null
);
const LeadBreadcrumbSettersContext =
  createContext<LeadBreadcrumbSetters | null>(null);

const EMPTY_STATE: LeadBreadcrumbState = { trailing: null, actions: null };
// Fuera del shell (tests de componentes sueltos) no hay breadcrumb que
// alimentar: se devuelve un no-op para que la pantalla no dependa del layout.
const NOOP_SETTERS: LeadBreadcrumbSetters = {
  setTrailing: () => {},
  setActions: () => {},
};

export const LeadBreadcrumbProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [trailing, setTrailing] = useState<string | null>(null);
  const [actions, setActions] = useState<React.ReactNode | null>(null);
  const state = useMemo(() => ({ trailing, actions }), [trailing, actions]);
  const setters = useMemo(
    () => ({ setTrailing, setActions }),
    [setTrailing, setActions]
  );
  return (
    <LeadBreadcrumbSettersContext.Provider value={setters}>
      <LeadBreadcrumbStateContext.Provider value={state}>
        {children}
      </LeadBreadcrumbStateContext.Provider>
    </LeadBreadcrumbSettersContext.Provider>
  );
};

export function useLeadBreadcrumb(): LeadBreadcrumbContextValue {
  const state = useContext(LeadBreadcrumbStateContext) ?? EMPTY_STATE;
  const setters = useContext(LeadBreadcrumbSettersContext) ?? NOOP_SETTERS;
  return { ...state, ...setters };
}

function useLeadBreadcrumbSetters(): LeadBreadcrumbSetters {
  return useContext(LeadBreadcrumbSettersContext) ?? NOOP_SETTERS;
}

/**
 * Publica `label` como último nivel del breadcrumb mientras el componente
 * esté montado, y lo limpia al desmontar o cuando `label` vuelve a null.
 */
export function useLeadBreadcrumbTrailing(label: string | null) {
  const { setTrailing } = useLeadBreadcrumbSetters();
  useEffect(() => {
    setTrailing(label);
    return () => setTrailing(null);
  }, [label, setTrailing]);
}

/**
 * Publica `node` como acciones de la franja del breadcrumb mientras el
 * componente esté montado, y las retira al desmontar. No hace falta
 * memoizar `node`: el efecto vuelve a correr en cada render de quien publica,
 * pero sólo re-renderiza la franja (ver la nota sobre los dos contextos).
 */
export function useLeadBreadcrumbActions(node: React.ReactNode) {
  const { setActions } = useLeadBreadcrumbSetters();
  useEffect(() => {
    setActions(node);
    return () => setActions(null);
  }, [node, setActions]);
}
