import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { cn } from "@tuya-ui/components";
import { buildNavigation, type NavGroup, type NavItem, type NavSection } from "../data/navigation";

/**
 * One step of indentation per level of the tree. The section heading sits at
 * the column's outer margin; everything below it steps in, and a component
 * inside a category steps in again. The hierarchy is carried by this ladder and
 * by the typography, with no guide lines or dividers.
 */
const INDENT = {
  section: "px-2.5",
  item: "ml-3 px-2.5",
  group: "ml-3 px-2.5",
  groupItem: "ml-6 px-2.5",
} as const;

function itemClasses({ isActive }: { isActive: boolean }) {
  return cn(
    "relative flex items-center gap-2 rounded-control py-1.5 text-body-sm",
    isActive
      ? // Active row: the brand rail runs down the row's own left edge, not the
        // column's, so the mark stays attached to what it marks once rows are
        // indented. It is the only brand color in the sidebar.
        "bg-neutral-selected font-semibold text-neutral-default shadow-[inset_2px_0_0_var(--color-bg-brand-bold)]"
      : "text-neutral-subtle hover:bg-neutral-subtle-hover hover:text-neutral-default",
  );
}

function Item({ item, nested }: { item: NavItem; nested?: boolean }) {
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        cn(itemClasses({ isActive }), nested ? INDENT.groupItem : INDENT.item)
      }
    >
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-control bg-warning-subtle px-1.5 font-mono text-label uppercase tracking-wide text-warning-bold">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 transition-transform", open ? "rotate-90" : "")}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/**
 * A category of components. It opens because it holds the current page, or
 * because the reader opened it — never because it was open last visit. See the
 * navigation decision in the change's design notes.
 */
function Group({ group, containsCurrent }: { group: NavGroup; containsCurrent: boolean }) {
  const [open, setOpen] = useState(containsCurrent);

  // Navigating into this group opens it, including when the reader arrives by
  // a direct link rather than through the sidebar.
  useEffect(() => {
    if (containsCurrent) setOpen(true);
  }, [containsCurrent]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-control py-1.5 text-body-sm font-medium text-neutral-default hover:bg-neutral-subtle-hover",
          INDENT.group,
        )}
      >
        <Chevron open={open} />
        <span>{group.label}</span>
      </button>

      {open && (
        <div className="mt-px flex flex-col gap-px">
          {group.items.map((item) => (
            <Item key={item.to} item={item} nested />
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ section, currentPath }: { section: NavSection; currentPath: string }) {
  return (
    <div className="mb-6">
      {/* Labels what is below it without being a link or a control. Small caps
          and the widest tracking in the sidebar: the outermost level reads as a
          rubric, not as something you can click. */}
      <p
        className={cn(
          "mb-2 text-label font-semibold uppercase tracking-[0.11em] text-neutral-subtle",
          INDENT.section,
        )}
      >
        {section.label}
      </p>

      <div className="flex flex-col gap-px">
        {section.items.map((item) => (
          <Item key={item.to} item={item} />
        ))}
      </div>

      {section.groups.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {section.groups.map((group) => (
            <Group
              key={group.id}
              group={group}
              containsCurrent={group.items.some((item) => item.to === currentPath)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const sections = useMemo(buildNavigation, []);
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Navegación de la documentación"
      className="sticky top-[60px] h-[calc(100vh-60px)] w-[260px] shrink-0 overflow-y-auto border-r border-neutral-default py-7 pl-6 pr-4"
    >
      {sections.map((section) => (
        <Section key={section.id} section={section} currentPath={pathname} />
      ))}
    </nav>
  );
}
