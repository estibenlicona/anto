import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  /** Omit for a level with nowhere to link, e.g. one collapsed into an ellipsis' neighbor. */
  href?: string;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "aria-label"> {
  /** Levels of the current path, in order. The last one renders as the current page, not a link. */
  items: BreadcrumbItem[];
  /** Accessible label for the navigation landmark. */
  "aria-label"?: string;
  /** The background it's placed on. Defaults to "light". */
  variant?: "light" | "dark";
}

/**
 * Beyond three levels, the middle collapses into a single non-interactive
 * ellipsis — the first and last level stay visible, since those are the ones
 * that orient a reader ("where am I" and "what's the top of the tree").
 */

/**
 * No semantic text token reads legibly on a dark surface besides "inverse"
 * (every other neutral text step is dark-toned, meant for a light page) —
 * same simplification Navbar's `getNavbarTone` documents. So on dark, both
 * the muted and current-page tones collapse to the same `-inverse` token,
 * and the link's hover affordance switches to an underline instead of a
 * (nonexistent) bolder dark-surface color step.
 */
function getBreadcrumbTone(variant: "light" | "dark") {
  const dark = variant === "dark";
  return {
    mutedText: dark ? "text-neutral-inverse" : "text-neutral-subtle",
    currentText: dark ? "text-neutral-inverse" : "text-neutral-default",
    linkHover: dark ? "hover:underline" : "hover:text-neutral-default",
  };
}

export function Breadcrumb({
  items,
  className,
  "aria-label": ariaLabel = "Ruta de navegación",
  variant = "light",
  ...props
}: BreadcrumbProps) {
  const nodes: (BreadcrumbItem | null)[] =
    items.length > 3 ? [items[0], null, items[items.length - 1]] : items;
  const { mutedText, currentText, linkHover } = getBreadcrumbTone(variant);

  return (
    <nav aria-label={ariaLabel} className={className} {...props}>
      <ol className="flex flex-wrap items-center gap-2 text-body-sm">
        {nodes.map((item, index) => {
          const isLast = index === nodes.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {item === null ? (
                <span aria-hidden="true" className={mutedText}>
                  …
                </span>
              ) : isLast ? (
                <span aria-current="page" className={cn("font-medium", currentText)}>
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={cn(mutedText, linkHover)}>
                  {item.label}
                </a>
              )}
              {!isLast && (
                <span aria-hidden="true" className={mutedText}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
