import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TocSection } from "./PageToc";

interface TocContextValue {
  sections: readonly TocSection[];
  setSections: (sections: readonly TocSection[]) => void;
}

const TocContext = createContext<TocContextValue | null>(null);

const NO_SECTIONS: readonly TocSection[] = [];

export function TocProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<readonly TocSection[]>(NO_SECTIONS);
  const value = useMemo(() => ({ sections, setSections }), [sections]);
  return <TocContext.Provider value={value}>{children}</TocContext.Provider>;
}

export function useTocSections(): readonly TocSection[] {
  return useContext(TocContext)?.sections ?? NO_SECTIONS;
}

/**
 * Pages call this to publish their sections to the layout. Clearing on unmount
 * is what keeps a stale index from lingering after navigating to a page that
 * has none.
 */
export function usePublishToc(sections: readonly TocSection[]) {
  const context = useContext(TocContext);
  const setSections = context?.setSections;

  useEffect(() => {
    if (!setSections) return;
    setSections(sections);
    return () => setSections(NO_SECTIONS);
  }, [setSections, sections]);
}
