import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { usePublishToc } from "../components/TocContext";
import type { TocSection } from "../components/PageToc";
import { componentLabel, findComponent, primaryFile } from "../data/registry";
import { getExamples } from "../examples/load";
import { getContent } from "../content";
import { PageHeader } from "../components/PageHeader";
import { ComponentChips } from "../components/ComponentChips";
import { CodeBlock } from "../components/CodeBlock";
import { ExampleBlock } from "../components/ExampleBlock";
import { PropsTable } from "../components/PropsTable";
import { UsageGuide } from "../components/UsageGuide";
import { AnatomyView } from "../components/AnatomyView";
import { AccessibilityNotesView } from "../components/AccessibilityNotesView";
import { PendingContent } from "../components/PendingContent";
import { Tabs, type TabDefinition } from "../components/Tabs";

const DEFAULT_TAB = "usage";
const TAB_IDS = ["usage", "anatomy", "api", "code", "accessibility"] as const;

export function ComponentDetail() {
  const { name = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const component = findComponent(name);
  const examples = getExamples(name);

  // The active tab lives in the URL so a tab can be linked to or bookmarked.
  // An absent or unknown value falls back to the usage tab.
  const requestedTab = searchParams.get("tab");
  const activeTab = TAB_IDS.some((id) => id === requestedTab) ? requestedTab! : DEFAULT_TAB;

  // Only the usage tab has sub-sections worth indexing; on the others an
  // index would point at anchors that are not rendered.
  const sections: readonly TocSection[] = useMemo(
    () =>
      activeTab === DEFAULT_TAB
        ? examples.map((example) => ({ id: example.id, label: example.meta.title }))
        : [],
    [activeTab, examples],
  );
  usePublishToc(sections);

  if (!component) {
    return (
      <div>
        <p className="text-neutral-subtle">No se encontró el componente "{name}".</p>
        <Link to="/components" className="text-brand-default underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const content = getContent(component.name);
  const file = primaryFile(component);

  const tabs: TabDefinition[] = [
    {
      id: "usage",
      label: "Uso",
      render: () => (
        <div className="flex flex-col gap-12">
          {examples.length === 0 ? (
            <PendingContent what="ejemplos de uso" componentName={component.name} />
          ) : (
            <div className="flex flex-col gap-10">
              {examples.map((example) => (
                <ExampleBlock key={example.id} example={example} />
              ))}
            </div>
          )}

          {content ? (
            <UsageGuide usage={content.usage} />
          ) : (
            <PendingContent what="guías de uso" componentName={component.name} />
          )}
        </div>
      ),
    },
    {
      id: "anatomy",
      label: "Anatomía",
      render: () =>
        content?.anatomy ? (
          <AnatomyView anatomy={content.anatomy} />
        ) : (
          <PendingContent what="la anatomía" componentName={component.name} />
        ),
    },
    {
      id: "api",
      label: "API",
      render: () => <PropsTable api={component.api} extendsElement={component.extendsElement} />,
    },
    {
      id: "code",
      label: "Código",
      render: () => (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-neutral-subtle">
            Código fuente de referencia: así está implementado dentro de{" "}
            <code>@tuya-ui/components</code>. No se copia a tu proyecto al instalar el paquete.
          </p>
          <CodeBlock code={file.content} label={file.target} />
        </div>
      ),
    },
    {
      id: "accessibility",
      label: "Accesibilidad",
      render: () =>
        content ? (
          <AccessibilityNotesView rows={content.accessibility} />
        ) : (
          <PendingContent what="notas de accesibilidad" componentName={component.name} />
        ),
    },
  ];

  function selectTab(id: string) {
    const next = new URLSearchParams(searchParams);
    if (id === DEFAULT_TAB) {
      next.delete("tab");
    } else {
      next.set("tab", id);
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={componentLabel(component.name)}
        lede={component.description}
        section="Componentes"
      >
        <ComponentChips
          command={`npm install @tuya-ui/components\nimport { ${component.api[0]?.displayName ?? componentLabel(component.name)} } from "@tuya-ui/components";`}
          status={component.status}
        />
      </PageHeader>

      <Tabs tabs={tabs} activeId={activeTab} onChange={selectTab} idPrefix={component.name} />
    </div>
  );
}
