import type { IconName } from "@tuya-ui/components";
import type { AppRole } from "@features/auth-session";

export interface AdminNavEntry {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  /** Ver la nota equivalente en `LeadNavEntry`. */
  roles?: AppRole[];
}

export interface AdminNavGroupConfig {
  /** Empty string renders no visible group heading, matching the mockup's ungrouped "Inicio" entry. */
  label: string;
  items: AdminNavEntry[];
}

export const ADMIN_HOME_ID = "admin-home";

/**
 * Takes its structure and order from `NAV.admin` in
 * context/mvps/plataforma_dimensionamiento_v7_unificado.html — one ungrouped
 * "Inicio" entry, then two groups — but not its wording: each label is the
 * shortest term that tells its screen apart, because a menu is scanned for
 * where to go rather than read. The full name lives in `adminRouteTitles`,
 * which is what feeds the breadcrumb.
 */
export const adminNavGroups: AdminNavGroupConfig[] = [
  {
    label: "",
    items: [
      {
        id: ADMIN_HOME_ID,
        label: "Inicio",
        href: "/app/admin",
        icon: "home",
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      {
        id: "admin-sprints",
        label: "Sprints",
        href: "/app/admin/sprints",
        icon: "calendar",
      },
      {
        id: "admin-parametros",
        label: "Parámetros",
        href: "/app/admin/parametros",
        icon: "settings",
      },
      {
        id: "admin-habilidades",
        label: "Habilidades",
        href: "/app/admin/habilidades",
        icon: "expertise",
      },
      {
        id: "admin-lineas",
        label: "Líneas",
        href: "/app/admin/lineas",
        // `team` y no `expertise`: ese ya es el de Habilidades, y dos entradas
        // del mismo grupo con el mismo icono se vuelven una sola al escanear.
        icon: "team",
      },
    ],
  },
  {
    label: "DevOps",
    items: [
      {
        id: "admin-devops",
        label: "Ingesta",
        href: "/app/admin/devops",
        icon: "integration",
      },
    ],
  },
];

/** Mirrors `TITLES` from the mockup — used for the breadcrumb's current-page label. */
export const adminRouteTitles: Record<string, string> = {
  [ADMIN_HOME_ID]: "Estado de la plataforma",
  "admin-sprints": "Calendario de sprints",
  "admin-parametros": "Parámetros del modelo",
  "admin-habilidades": "Habilidades",
  // El menú dice "Líneas"; el término corto por sí solo no dice de qué
  // líneas se habla, así que el breadcrumb lleva el nombre completo.
  "admin-lineas": "Líneas de expertise",
  "admin-devops": "Integración DevOps",
};

export function resolveAdminNavId(pathname: string): string {
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return item.id;
    }
  }
  return ADMIN_HOME_ID;
}
