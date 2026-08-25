import { useMemo } from "react";
import type { DocBlock, DocPage } from "../content/page";
import { usePublishToc } from "./TocContext";
import { PageHeader } from "./PageHeader";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { ReferenceTable } from "./ReferenceTable";

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case "prose":
      return (
        <p className="max-w-[68ch] leading-relaxed text-neutral-default">{block.text}</p>
      );
    case "code":
      return <CodeBlock code={block.code} label={block.label} />;
    case "callout":
      return (
        <Callout tone={block.tone} title={block.title}>
          {block.text}
        </Callout>
      );
    case "table":
      return <ReferenceTable columns={block.columns} rows={block.rows} />;
    case "split":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {block.items.map((item) => (
            <div
              key={item.title}
              className="rounded-control border border-neutral-default px-5 py-4"
            >
              <p
                className={
                  item.tone === "danger"
                    ? "text-label font-semibold uppercase tracking-wider text-danger-default"
                    : item.tone === "warning"
                      ? "text-label font-semibold uppercase tracking-wider text-warning-bold"
                      : "text-label font-semibold uppercase tracking-wider text-success-default"
                }
              >
                {item.title}
              </p>
              <p className="mt-2 text-body-sm leading-relaxed text-neutral-default">{item.text}</p>
            </div>
          ))}
        </div>
      );
    case "custom":
      return <>{block.render()}</>;
  }
}

/**
 * Renders any `DocPage` and publishes its sections as the page index, so the
 * headings on the page and the entries in the rail come from one array and
 * cannot disagree.
 */
export function DocPageView({ page }: { page: DocPage }) {
  const sections = useMemo(
    () => page.sections.map((section) => ({ id: section.id, label: section.label })),
    [page],
  );
  usePublishToc(sections);

  return (
    <div>
      <PageHeader title={page.title} lede={page.lede} />

      {page.sections.map((section) => (
        <section key={section.id} id={section.id} className="mt-[52px] scroll-mt-20">
          <h2 className="mb-3.5 text-heading-lg font-semibold tracking-[-0.02em] text-neutral-default">
            {section.label}
          </h2>
          <div className="flex flex-col gap-4">
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
