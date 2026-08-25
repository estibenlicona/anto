import { componentLabel, componentsByCategory, displayableComponents } from "./registry";

export interface NavItem {
  label: string;
  to: string;
  /** Short marker shown after the label, e.g. a component that is not settled yet. */
  badge?: string;
}

/**
 * A collapsible group of pages inside a section. It has no `to` of its own: it
 * is a container, not a page, which is why the pager walks past it.
 */
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** A section heading: it labels what is below it but is neither link nor control. */
export interface NavSection {
  id: string;
  label: string;
  /** Pages that hang directly off the section. */
  items: NavItem[];
  /** Category groups. Only the components section uses this level. */
  groups: NavGroup[];
}

/**
 * The registry's categories are single English words. Translating them here
 * rather than in the registry keeps the catalogue language-neutral; an unknown
 * category falls back to its own name instead of disappearing.
 */
const CATEGORY_LABELS: Record<string, string> = {
  actions: "Acciones",
  forms: "Formularios",
  layout: "Estructura",
  feedback: "Feedback",
  navigation: "Navegación",
  overlays: "Superposiciones",
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}

export function buildNavigation(): NavSection[] {
  return [
    {
      id: "empezar",
      label: "Empezar",
      items: [
        { label: "Introducción", to: "/" },
        { label: "Instalación", to: "/instalacion" },
      ],
      groups: [],
    },
    {
      id: "fundamentos",
      label: "Fundamentos",
      items: [
        { label: "Tipografía", to: "/fundamentos/tipografia" },
        { label: "Color y tokens", to: "/fundamentos/color" },
        { label: "Espaciado y layout", to: "/fundamentos/espaciado" },
        { label: "Iconografía", to: "/fundamentos/iconografia" },
      ],
      groups: [],
    },
    {
      id: "componentes",
      label: "Componentes",
      items: [],
      groups: componentsByCategory()
        .map(({ category, components }) => ({
          id: category,
          label: categoryLabel(category),
          items: components.map((component) => ({
            label: componentLabel(component.name),
            to: `/components/${component.name}`,
            // Only an unsettled component is worth marking; "stable" is the
            // expectation, and badging every item would make the badge noise.
            badge: component.status === "beta" ? "beta" : undefined,
          })),
        }))
        // Ordered by the label the reader sees, not by the registry's English
        // key: sorting by key puts Spanish labels in an order nobody can predict.
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    },
  ];
}

export interface NavPosition {
  section: NavSection;
  /** Absent for a page that hangs directly off its section. */
  group?: NavGroup;
  item: NavItem;
  previous?: NavItem;
  next?: NavItem;
}

interface NavEntry {
  section: NavSection;
  group?: NavGroup;
  item: NavItem;
}

/**
 * The sidebar's reading order, flattened depth-first. The pager needs a total
 * order over pages; deriving it here rather than declaring it separately means
 * a page added to the sidebar cannot go missing from the pager. Group nodes are
 * skipped — they are not pages, so the pager never stops on one.
 */
export function navigationOrder(): NavEntry[] {
  return buildNavigation().flatMap((section) => [
    ...section.items.map((item) => ({ section, item })),
    ...section.groups.flatMap((group) =>
      group.items.map((item) => ({ section, group, item })),
    ),
  ]);
}

export function findPosition(pathname: string): NavPosition | undefined {
  const order = navigationOrder();
  const index = order.findIndex((entry) => entry.item.to === pathname);
  if (index === -1) return undefined;

  return {
    ...order[index],
    previous: order[index - 1]?.item,
    next: order[index + 1]?.item,
  };
}

/**
 * Where "Componentes" points from the header and the home page. Derived from
 * the registry rather than written down, so retiring a component cannot leave
 * either link aimed at a page that no longer exists.
 */
export function firstComponentPath(): string {
  const first = componentsByCategory()[0]?.components[0] ?? displayableComponents[0];
  return first ? `/components/${first.name}` : "/";
}
