import type { IconName } from "@tuya-ui/components";
import type { AppRole, CapacityPermission } from "@features/auth-session";

export interface LeadNavEntry {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  /**
   * Roles que puede tener quien ve esta entrada. Omitido, la ve cualquiera
   * que haya entrado al shell. Hoy ninguna entrada lo usa —el shell entero
   * está detrás de un rol único— pero declararlo es lo que evita que una
   * entrada futura con otro rol se ofrezca y después el guard la rechace.
   */
  roles?: AppRole[];
  /** Permiso de sección del módulo que la entrada exige. "Inicio" no lleva. */
  permission?: CapacityPermission;
}

export interface LeadNavGroupConfig {
  /** Empty string renders no visible group heading, matching the mockup's ungrouped "Inicio" entry. */
  label: string;
  items: LeadNavEntry[];
}

export const LEAD_HOME_ID = "lead-home";

/**
 * El permiso de sección que cada pantalla del Líder de Expertise exige. Menú
 * y rutas leen de acá: si divergieran, el menú ofrecería pantallas que el
 * guard niega.
 */
export const LEAD_SECTION_PERMISSION = {
  "lead-iniciativas": "Iniciativas",
  "lead-celulas": "Celulas",
  "lead-personas": "Personas",
  "lead-ausencias": "Ausencias",
  "lead-dedicacion": "Dedicacion",
  "lead-facturacion": "Prefacturacion",
  "lead-competencias": "Competencias",
} as const satisfies Record<string, CapacityPermission>;

/**
 * Subconjunto de `NAV.lead` de context/mvps/plataforma_dimensionamiento_v7_unificado.html
 * construido hasta el momento: "Inicio" (ungrouped) y "Gestionar Células" /
 * "Gestionar Personas" bajo "Gestión de Capacidad". "Capacidades" se retiró:
 * la gestión del equipo vive en el detalle de cada célula. El resto de NAV.lead
 * (Evaluar iniciativa, Portafolio, etc.) no tiene pantalla todavía — ver
 * proposal.md de cada change.
 */
export const leadNavGroups: LeadNavGroupConfig[] = [
  {
    label: "",
    items: [
      {
        id: LEAD_HOME_ID,
        label: "Inicio",
        href: "/app/lead",
        icon: "home",
      },
    ],
  },
  {
    label: "Iniciativas",
    items: [
      {
        id: "lead-iniciativas",
        permission: LEAD_SECTION_PERMISSION["lead-iniciativas"],
        label: "Iniciativas",
        href: "/app/lead/iniciativas",
        icon: "initiative",
      },
    ],
  },
  {
    label: "Capacidad",
    items: [
      {
        id: "lead-celulas",
        permission: LEAD_SECTION_PERMISSION["lead-celulas"],
        label: "Células",
        href: "/app/lead/celulas",
        icon: "cell",
      },
      {
        id: "lead-personas",
        permission: LEAD_SECTION_PERMISSION["lead-personas"],
        label: "Personas",
        href: "/app/lead/personas",
        icon: "user",
      },
      {
        id: "lead-ausencias",
        permission: LEAD_SECTION_PERMISSION["lead-ausencias"],
        label: "Ausencias",
        href: "/app/lead/ausencias",
        icon: "calendar",
      },
      {
        // "Capacidad": el módulo se llama por lo que mide. Conserva su id y su
        // ruta (/dedicacion) para no mover enlaces ya compartidos. Ocupa el
        // lugar de la antigua entrada Backlog.
        id: "lead-dedicacion",
        permission: LEAD_SECTION_PERMISSION["lead-dedicacion"],
        label: "Capacidad",
        href: "/app/lead/dedicacion",
        icon: "backlog",
      },
      {
        id: "lead-facturacion",
        permission: LEAD_SECTION_PERMISSION["lead-facturacion"],
        label: "Prefacturación",
        href: "/app/lead/facturacion",
        icon: "document",
      },
      {
        id: "lead-competencias",
        permission: LEAD_SECTION_PERMISSION["lead-competencias"],
        label: "Competencias",
        href: "/app/lead/competencias",
        icon: "expertise",
      },
    ],
  },
];

/**
 * Used for the breadcrumb's current-page label — the long form, deliberately,
 * now that the menu carries only the short one.
 */
export const leadRouteTitles: Record<string, string> = {
  // "Torre de control" y no "Inicio": con la entrada del menú acortada a
  // "Inicio", este es el único lugar donde esta pantalla se nombra. Su par de
  // Admin ya funcionaba así ("Estado de la plataforma"); acá el título repetía
  // al menú, y acortar uno sin corregir el otro habría borrado el nombre.
  [LEAD_HOME_ID]: "Torre de control",
  "lead-celulas": "Gestionar Células",
  "lead-personas": "Gestionar Personas",
  "lead-ausencias": "Gestionar Ausencias",
  "lead-dedicacion": "Capacidad",
  "lead-iniciativas": "Gestionar Iniciativas",
  "lead-facturacion": "Prefacturación",
  // La entrada del menú y el nombre de la pantalla coinciden acá:
  // "Competencias" ya es el término más corto que la distingue.
  "lead-competencias": "Competencias",
};

/**
 * La entrada activa es la de la ruta exacta o la del prefijo más largo
 * (`href + "/"`): el detalle de una célula (`/app/lead/celulas/:id`) mantiene
 * "Células" activa. "Inicio" (`/app/lead`) es prefijo de todo, por eso gana el
 * más largo y no el primero.
 */
export function resolveLeadNavId(pathname: string): string {
  let best: { id: string; length: number } | null = null;
  for (const group of leadNavGroups) {
    for (const item of group.items) {
      const matches =
        item.href === pathname || pathname.startsWith(item.href + "/");
      if (matches && (!best || item.href.length > best.length)) {
        best = { id: item.id, length: item.href.length };
      }
    }
  }
  return best?.id ?? LEAD_HOME_ID;
}
