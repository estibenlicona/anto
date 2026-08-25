import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { findPosition } from "../data/navigation";

/**
 * The breadcrumb reads its section from the navigation rather than taking it as
 * a prop: a page cannot then claim to live somewhere the sidebar disagrees with.
 * A route outside the navigation (a component's detail page) passes its own.
 */
export function PageHeader({
  title,
  lede,
  section,
  children,
}: {
  title: string;
  lede: string;
  /** Overrides the section derived from the route. */
  section?: string;
  /** Metadata shown under the lede, e.g. a component's install command and chips. */
  children?: ReactNode;
}) {
  const { pathname } = useLocation();
  const sectionLabel = section ?? findPosition(pathname)?.section.label;

  return (
    <header>
      {sectionLabel && (
        <nav aria-label="Ubicación" className="mb-4 flex items-center gap-2 text-body-sm">
          <span className="text-neutral-subtle">{sectionLabel}</span>
          <span aria-hidden className="text-neutral-subtle">
            /
          </span>
          <span className="text-neutral-subtle">{title}</span>
        </nav>
      )}

      <h1 className="text-display font-semibold leading-[1.1] tracking-[-0.03em] text-neutral-default">
        {title}
      </h1>
      <p className="mt-3.5 max-w-[62ch] text-body leading-relaxed text-neutral-subtle">
        {lede}
      </p>

      {children}
    </header>
  );
}
