import type { Session } from "@features/auth-session";

/**
 * Perfiles del simulador de autenticación.
 *
 * **Sólo desarrollo.** Este directorio queda fuera del build de producción
 * (ver `vite.config.ts`); nada de negocio debe importar desde acá.
 *
 * Los perfiles se definen **con forma de claims de Entra**, no como objetos de
 * usuario inventados. La autorización de negocio se maneja con Entra ID, así
 * que en producción el adaptador del host va a leer claims del token — un
 * simulador que entregara los roles por otra vía ejercitaría un camino que no
 * existe, y daría falsa confianza.
 */

/** Los claims que interesan, con los nombres que usa Entra. */
export interface EntraClaims {
  /** Object ID del usuario en el directorio. */
  oid: string;
  /** User Principal Name. */
  upn: string;
  name: string;
  /** Roles de aplicación asignados en Entra. */
  roles: string[];
  /** Scopes concedidos, separados por espacio, como los emite Entra. */
  scp: string;
}

export interface SimulatorProfile {
  id: string;
  /** Cómo se lista en el panel. */
  label: string;
  /** Qué probar con él, para que el panel no sea una lista de nombres sueltos. */
  description: string;
  /** `null` = sin sesión. */
  claims: EntraClaims | null;
}

/**
 * El mapeo de rol de Entra a rol de dominio. En producción vive en el
 * adaptador del host; acá se replica para que el simulador produzca sesiones
 * con la misma forma que producirá aquél.
 */
const ENTRA_ROLE_TO_APP_ROLE: Record<string, "admin" | "chapter-lead"> = {
  "Plataforma.Admin": "admin",
  "Plataforma.ChapterLead": "chapter-lead",
};

export const SIMULATOR_PROFILES: SimulatorProfile[] = [
  {
    id: "anonymous",
    label: "Anonymous",
    description: "Sin sesión. Para probar que las rutas protegidas redirigen.",
    claims: null,
  },
  {
    id: "admin",
    label: "Admin",
    description:
      "Administrador de la plataforma. Acceso a los parámetros del modelo.",
    claims: {
      oid: "11111111-1111-1111-1111-111111111111",
      upn: "admin.plataforma@tuya.com",
      name: "Ana Administradora",
      roles: ["Plataforma.Admin"],
      scp: "capacidad.read capacidad.write parametros.write",
    },
  },
  // Los tres chapter leads son personas sembradas, y su `oid` es el mismo que
  // declara `CHAPTERS` en mocks/handlers/chapters.ts: con esa llave el servidor
  // resuelve a quién tiene a cargo el titular del token. Entrar como alguien
  // que no existe en los datos —lo que hacía este perfil antes— deja la
  // pregunta sin respuesta posible. Hay una prueba que verifica que las dos
  // listas sigan coincidiendo.
  {
    id: "chapter-lead",
    label: "Chapter Lead · Core y Datos",
    description:
      "Tomás Giraldo, con trece personas a cargo. El chapter con volumen.",
    claims: {
      oid: "22222222-2222-2222-2222-222222222222",
      upn: "tomas.giraldo@tuya.com",
      name: "Tomás Giraldo",
      roles: ["Plataforma.ChapterLead"],
      scp: "capacidad.read capacidad.write",
    },
  },
  {
    id: "chapter-lead-canales",
    label: "Chapter Lead · Canales Digitales",
    description:
      "Isabella Moreno, con cinco personas. Para ver que el conjunto cambia entero al cambiar de lead.",
    claims: {
      oid: "44444444-4444-4444-4444-444444444444",
      upn: "isabella.moreno@tuya.com",
      name: "Isabella Moreno",
      roles: ["Plataforma.ChapterLead"],
      scp: "capacidad.read capacidad.write",
    },
  },
  {
    id: "chapter-lead-sin-gente",
    label: "Chapter Lead · sin personas",
    description:
      "Paula Ramírez lidera un chapter recién creado y todavía vacío. Para ver el estado vacío de las pantallas del rol, que no es un error.",
    claims: {
      oid: "55555555-5555-5555-5555-555555555555",
      upn: "paula.ramirez@tuya.com",
      name: "Paula Ramírez",
      roles: ["Plataforma.ChapterLead"],
      scp: "capacidad.read capacidad.write",
    },
  },
  {
    id: "restricted",
    label: "Restricted User",
    description:
      "Con sesión pero sin roles de la plataforma. Para probar el 403 y el aviso de permisos.",
    claims: {
      oid: "33333333-3333-3333-3333-333333333333",
      upn: "usuario.restringido@tuya.com",
      name: "Rita Restringida",
      roles: [],
      scp: "capacidad.read",
    },
  },
];

/**
 * El perfil por defecto tiene sesión y permisos amplios a propósito: el caso
 * normal al desarrollar es "quiero ver la pantalla", no "quiero probar el
 * guard". Arrancar en Anonymous dejaría la aplicación inaccesible de entrada.
 */
export const DEFAULT_PROFILE_ID = "admin";

/**
 * Traduce un perfil a una sesión del puerto, con el mismo mapeo de claims que
 * hará el adaptador del host.
 */
export function profileToSession(
  profile: SimulatorProfile,
  tokenExpired: boolean
): Session {
  if (!profile.claims) return { status: "anonymous" };

  const { oid, upn, name, roles, scp } = profile.claims;

  return {
    status: "authenticated",
    user: { id: oid, name, username: upn },
    roles: roles
      .map((role) => ENTRA_ROLE_TO_APP_ROLE[role])
      .filter((role): role is "admin" | "chapter-lead" => Boolean(role)),
    scopes: scp.split(" ").filter(Boolean),
    claims: { ...profile.claims },
    // Un token vencido se representa como ausencia de token: la llamada sale
    // sin cabecera y la puerta de enlace responde 401, igual que en producción.
    //
    // El token lleva el `oid` y no el id del perfil: es lo que un token de
    // verdad trae, y es de ahí que el servidor saca a quién tiene a cargo
    // quien pide. El id del perfil es cosa del panel, no de la sesión.
    accessToken: tokenExpired ? null : `simulated.${oid}.token`,
  };
}
