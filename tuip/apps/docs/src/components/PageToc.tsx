import { useEffect, useState } from "react";
import { cn } from "@tuya-ui/components";

export interface TocSection {
  id: string;
  label: string;
}

/**
 * Sections are passed in rather than scraped from the DOM: the page that owns
 * them renders both this index and its own headings from the same array, so an
 * entry can never point at an anchor that does not exist.
 */
export function PageToc({ sections }: { sections: readonly TocSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Bias the observation band toward the top of the viewport so the
      // highlighted entry matches what the reader is actually looking at.
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Contenido de la página" className="w-56 shrink-0 py-8 pr-6">
      <p className="mb-2 text-label font-semibold uppercase tracking-wide text-neutral-subtle">
        En esta página
      </p>
      <ul className="flex flex-col gap-1 border-l border-neutral-default">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={section.id === activeId ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 px-3 py-0.5 text-body-sm",
                section.id === activeId
                  ? "border-brand-default font-medium text-brand-default"
                  : "border-transparent text-neutral-subtle hover:text-neutral-default",
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
