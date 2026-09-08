import type { AppRole } from "@features/auth-session";

/**
 * Perfiles del login simulado.
 *
 * Con forma de claims de Entra, como los que emite el emulador que usa el
 * host: el `oid` es la llave con la que los mocks resuelven a quién tiene a
 * cargo el titular (ver `frontend/src/mocks/handlers/chapters.ts`), y los
 * sub-claims `Capacidad.*` son los permisos de sección con los que el módulo
 * arma su menú. Mismas personas y permisos que siembra `pnpm entra:seed` del
 * host, más los dos leads adicionales que viven en los mocks.
 */
export interface SimulatedProfile {
  id: string;
  label: string;
  description: string;
  oid: string;
  upn: string;
  name: string;
  roles: AppRole[];
  /** Secciones del módulo (sub-claims sin el prefijo `Capacidad.`). */
  sections: string[];
}

const ALL_SECTIONS = [
  "Iniciativas",
  "Celulas",
  "Personas",
  "Ausencias",
  "Dedicacion",
  "Prefacturacion",
  "Competencias",
  "Sprints",
  "Parametros",
  "Habilidades",
  "Lineas",
  "Equipos",
  "DevOps",
];

const LEAD_SECTIONS = [
  "Iniciativas",
  "Celulas",
  "Personas",
  "Ausencias",
  "Dedicacion",
  "Prefacturacion",
  "Competencias",
];

export const PROFILES: SimulatedProfile[] = [
  {
    id: "admin",
    label: "Ana Administradora",
    description:
      "Administradora de la plataforma: las 13 secciones, incluida Configuración y DevOps. Ve a todas las personas.",
    oid: "11111111-1111-1111-1111-111111111111",
    upn: "ana.admin@tuya.local",
    name: "Ana Administradora",
    roles: ["admin"],
    sections: ALL_SECTIONS,
  },
  {
    id: "lead-core",
    label: "Tomás Giraldo · Core y Datos",
    description:
      "Líder de Expertise con trece personas a cargo. Las 7 secciones de capacidad; sin Configuración.",
    oid: "22222222-2222-2222-2222-222222222222",
    upn: "tomas.giraldo@tuya.local",
    name: "Tomás Giraldo",
    roles: ["chapter-lead"],
    sections: LEAD_SECTIONS,
  },
  {
    id: "lead-canales",
    label: "Isabella Moreno · Canales Digitales",
    description:
      "Líder de Expertise con cinco personas. Para ver que el conjunto cambia entero al cambiar de lead.",
    oid: "44444444-4444-4444-4444-444444444444",
    upn: "isabella.moreno@tuya.local",
    name: "Isabella Moreno",
    roles: ["chapter-lead"],
    sections: LEAD_SECTIONS,
  },
  {
    id: "lead-vacio",
    label: "Paula Ramírez · chapter vacío",
    description:
      "Líder de Expertise de un chapter recién creado y sin personas: los estados vacíos, que no son errores.",
    oid: "55555555-5555-5555-5555-555555555555",
    upn: "paula.ramirez@tuya.local",
    name: "Paula Ramírez",
    roles: ["chapter-lead"],
    sections: LEAD_SECTIONS,
  },
  {
    id: "restricted",
    label: "Rita Restringida",
    description:
      "Con sesión pero sin ningún permiso de sección: el aviso de permisos del módulo.",
    oid: "33333333-3333-3333-3333-333333333333",
    upn: "rita.restringida@tuya.local",
    name: "Rita Restringida",
    roles: [],
    sections: [],
  },
];

export const findProfile = (id: string | null): SimulatedProfile | null =>
  PROFILES.find((p) => p.id === id) ?? null;
