import type { IconName } from "@tuya-ui/components";
import type { CapacityPermission } from "@features/auth-session";
import { ADMIN_SECTION_PERMISSION } from "@features/admin-shell/navigation";
import { LEAD_SECTION_PERMISSION } from "@features/chapter-lead-shell/navigation";

/**
 * La navegación única del módulo de Gestión de Capacidad.
 *
 * Fusiona las de los dos shells que existían cuando la app era standalone
 * (Admin y Líder de Expertise): ya no hay un menú por rol — hay un menú por
 * **permisos de sección** (`Capacidad.*`), así que las secciones de ambos
 * conviven y cada persona ve las suyas. Los ids, etiquetas cortas y títulos
 * de breadcrumb se conservan de los shells originales.
 *
 * Los `href` son **relativos a la base del módulo**: el host decide bajo qué
 * ruta monta el módulo, y el shell navega en relativo.
 */
export interface CapacityNavEntry {
  id: string;
  label: string;
  /** Relativo a la base del módulo. `""` es el inicio. */
  href: string;
  icon: IconName;
  /** Permiso de sección que la entrada exige. "Inicio" no lleva. */
  permission?: CapacityPermission;
}

export interface CapacityNavGroupConfig {
  /** Vacío: sin encabezado visible (la entrada "Inicio" suelta). */
  label: string;
  items: CapacityNavEntry[];
}

export const CAPACITY_HOME_ID = "cap-home";

/**
 * Sección → permiso, unificado desde los mapas de los dos shells. Menú y
 * rutas leen de acá: si divergieran, el menú ofrecería pantallas que el
 * guard niega.
 */
export const CAPACITY_SECTION_PERMISSION = {
  "lead-iniciativas": LEAD_SECTION_PERMISSION["lead-iniciativas"],
  // Literal y no `LEAD_SECTION_PERMISSION`: Equipos nació después de que los
  // dos shells se fusionaran, así que no tiene id heredado de ninguno.
  "lead-equipos": "Equipos",
  "lead-celulas": LEAD_SECTION_PERMISSION["lead-celulas"],
  "lead-personas": LEAD_SECTION_PERMISSION["lead-personas"],
  "lead-ausencias": LEAD_SECTION_PERMISSION["lead-ausencias"],
  "lead-dedicacion": LEAD_SECTION_PERMISSION["lead-dedicacion"],
  "lead-facturacion": LEAD_SECTION_PERMISSION["lead-facturacion"],
  "lead-competencias": LEAD_SECTION_PERMISSION["lead-competencias"],
  "admin-sprints": ADMIN_SECTION_PERMISSION["admin-sprints"],
  "admin-parametros": ADMIN_SECTION_PERMISSION["admin-parametros"],
  "admin-habilidades": ADMIN_SECTION_PERMISSION["admin-habilidades"],
  "admin-lineas": ADMIN_SECTION_PERMISSION["admin-lineas"],
  "admin-devops": ADMIN_SECTION_PERMISSION["admin-devops"],
} as const satisfies Record<string, CapacityPermission>;

export const capacityNavGroups: CapacityNavGroupConfig[] = [
  {
    label: "",
    items: [{ id: CAPACITY_HOME_ID, label: "Inicio", href: "", icon: "home" }],
  },
  {
    label: "Iniciativas",
    items: [
      {
        id: "lead-iniciativas",
        label: "Iniciativas",
        href: "iniciativas",
        icon: "initiative",
        permission: CAPACITY_SECTION_PERMISSION["lead-iniciativas"],
      },
    ],
  },
  {
    label: "Capacidad",
    items: [
      {
        id: "lead-equipos",
        label: "Equipos",
        href: "equipos",
        // `folder`: agrupa células, no es el mismo concepto que `team`
        // (el equipo de expertise de una persona, en Líneas).
        icon: "folder",
        permission: CAPACITY_SECTION_PERMISSION["lead-equipos"],
      },
      {
        id: "lead-celulas",
        label: "Células",
        href: "celulas",
        icon: "cell",
        permission: CAPACITY_SECTION_PERMISSION["lead-celulas"],
      },
      {
        id: "lead-personas",
        label: "Personas",
        href: "personas",
        icon: "user",
        permission: CAPACITY_SECTION_PERMISSION["lead-personas"],
      },
      {
        id: "lead-ausencias",
        label: "Ausencias",
        href: "ausencias",
        icon: "calendar",
        permission: CAPACITY_SECTION_PERMISSION["lead-ausencias"],
      },
      {
        id: "lead-dedicacion",
        label: "Dedicación",
        href: "dedicacion",
        icon: "backlog",
        permission: CAPACITY_SECTION_PERMISSION["lead-dedicacion"],
      },
      {
        id: "lead-facturacion",
        label: "Facturación",
        href: "facturacion",
        icon: "document",
        permission: CAPACITY_SECTION_PERMISSION["lead-facturacion"],
      },
      {
        id: "lead-competencias",
        label: "Competencias",
        href: "competencias",
        icon: "expertise",
        permission: CAPACITY_SECTION_PERMISSION["lead-competencias"],
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      {
        id: "admin-sprints",
        label: "Sprints",
        href: "sprints",
        icon: "calendar",
        permission: CAPACITY_SECTION_PERMISSION["admin-sprints"],
      },
      {
        id: "admin-parametros",
        label: "Parámetros",
        href: "parametros",
        icon: "settings",
        permission: CAPACITY_SECTION_PERMISSION["admin-parametros"],
      },
      {
        id: "admin-habilidades",
        label: "Habilidades",
        href: "habilidades",
        icon: "expertise",
        permission: CAPACITY_SECTION_PERMISSION["admin-habilidades"],
      },
      {
        id: "admin-lineas",
        label: "Líneas",
        href: "lineas",
        // `team` y no `expertise`: ese es el de Habilidades en el mismo menú.
        icon: "team",
        permission: CAPACITY_SECTION_PERMISSION["admin-lineas"],
      },
    ],
  },
  {
    label: "DevOps",
    items: [
      {
        id: "admin-devops",
        label: "Ingesta",
        href: "devops",
        icon: "integration",
        permission: CAPACITY_SECTION_PERMISSION["admin-devops"],
      },
    ],
  },
];

/** Título largo por entrada — alimenta el breadcrumb, como en los shells originales. */
export const capacityRouteTitles: Record<string, string> = {
  [CAPACITY_HOME_ID]: "Gestión de Capacidad",
  "lead-iniciativas": "Gestionar Iniciativas",
  "lead-equipos": "Equipos",
  "lead-celulas": "Gestionar Células",
  "lead-personas": "Gestionar Personas",
  "lead-ausencias": "Gestionar Ausencias",
  "lead-dedicacion": "Capacidad",
  "lead-facturacion": "Prefacturación",
  "lead-competencias": "Competencias",
  "admin-sprints": "Calendario de sprints",
  "admin-parametros": "Parámetros del modelo",
  "admin-habilidades": "Habilidades",
  "admin-lineas": "Líneas de expertise",
  "admin-devops": "Integración DevOps",
};

/**
 * La entrada activa por prefijo más largo sobre la ruta relativa a la base:
 * `celulas/7` mantiene "Células" activa; `""` (inicio) es prefijo de todo y
 * por eso gana el más largo.
 */
export function resolveCapacityNavId(relativePath: string): string {
  const path = relativePath.replace(/^\/+/, "");
  let best: { id: string; length: number } | null = null;
  for (const group of capacityNavGroups) {
    for (const item of group.items) {
      if (item.href === "") continue;
      const matches = path === item.href || path.startsWith(item.href + "/");
      if (matches && (!best || item.href.length > best.length)) {
        best = { id: item.id, length: item.href.length };
      }
    }
  }
  return best?.id ?? CAPACITY_HOME_ID;
}
