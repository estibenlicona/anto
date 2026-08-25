import { useRef, type ReactNode } from "react";
import { cn } from "@tuya-ui/components";

export interface TabDefinition {
  id: string;
  label: string;
  render: () => ReactNode;
}

interface TabsProps {
  tabs: TabDefinition[];
  activeId: string;
  onChange: (id: string) => void;
  /** Distinguishes ids when more than one tab set could exist on a page. */
  idPrefix: string;
}

export function Tabs({ tabs, activeId, onChange, idPrefix }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  );
  const active = tabs[activeIndex];

  function focusTab(index: number) {
    const wrapped = (index + tabs.length) % tabs.length;
    onChange(tabs[wrapped].id);
    tabRefs.current[wrapped]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Secciones del componente"
        onKeyDown={handleKeyDown}
        className="flex gap-1 border-b border-neutral-default"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              // Roving tabindex: only the active tab is reachable with Tab,
              // the rest are reached with arrow keys.
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-body-sm font-medium",
                isActive
                  ? "border-brand-default text-brand-default"
                  : "border-transparent text-neutral-subtle hover:text-neutral-default",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${idPrefix}-panel-${active.id}`}
        aria-labelledby={`${idPrefix}-tab-${active.id}`}
        tabIndex={0}
        className="pt-6 focus-visible:outline-none"
      >
        {active.render()}
      </div>
    </div>
  );
}
