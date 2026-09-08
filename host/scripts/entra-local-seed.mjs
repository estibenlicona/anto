#!/usr/bin/env node
/**
 * Semilla del directorio de la plataforma sobre entra-local (el emulador local
 * de Entra ID). Crea, de forma idempotente, la app registration del host, la
 * app registration de la API de Gestión de Capacidad con sus permisos de
 * sección, los app roles de negocio y las personas de prueba con sus
 * asignaciones, y al final imprime el bloque listo para
 * `host/.env.development.local`.
 *
 * Uso:  pnpm entra:seed        (ENTRA_LOCAL_URL para otra URL; por defecto
 *       https://localhost:8443, el origen compat que sirve todas las rutas)
 *
 * TLS: el emulador usa un certificado autofirmado. Este proceso — y sólo este
 * proceso — desactiva la verificación TLS, y únicamente cuando el origen es
 * loopback o *.entra.localhost. Nunca hagas esto en código de la aplicación.
 */

const BASE = (process.env.ENTRA_LOCAL_URL ?? "https://localhost:8443").replace(/\/$/, "");

const { hostname } = new URL(BASE);
const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname.endsWith(".entra.localhost") ||
  hostname === "entra.localhost";
if (!isLocal) {
  console.error(`ENTRA_LOCAL_URL apunta a ${hostname}, que no es local. Me niego a relajar TLS.`);
  process.exit(1);
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
console.log(`⚠ Verificación TLS desactivada sólo en este proceso (origen local: ${hostname}).`);

const REDIRECT_URI = "http://localhost:4400/";
const APP_NAME = "Plataforma Host";
const ROLES = [
  { value: "Plataforma.Admin", displayName: "Administrador de la plataforma" },
  { value: "Plataforma.ChapterLead", displayName: "Líder de expertise" },
  { value: "Plataforma.TechLead", displayName: "Líder técnico" },
];

/**
 * La API de Gestión de Capacidad: app registration propia (recurso) cuyos app
 * roles son los permisos de sección del módulo — los sub-claims que viajan en
 * el claim `roles` del access token dirigido a esta API.
 */
const CAP_API_NAME = "Gestión de Capacidad API";
const CAP_API_URI = "api://capacidad";
const CAP_SCOPE = "access_as_user";
const CAP_SECTIONS = [
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
const capRole = (section) => `Capacidad.${section}`;
/** Secciones del shell del Líder de Expertise. */
const CAP_LEAD = [
  "Iniciativas",
  "Celulas",
  "Personas",
  "Ausencias",
  "Dedicacion",
  "Prefacturacion",
  "Competencias",
];
/** Secciones que el shell del Líder Técnico reutiliza (doc de roles, R-03/R-07). */
const CAP_TECH = ["Iniciativas", "Celulas", "Dedicacion", "Competencias"];

const PEOPLE = [
  {
    userPrincipalName: "ana.admin@tuya.local",
    displayName: "Ana Administradora",
    givenName: "Ana",
    surname: "Administradora",
    mail: "ana.admin@tuya.local",
    roles: ["Plataforma.Admin"],
    capacityRoles: CAP_SECTIONS.map(capRole),
  },
  {
    userPrincipalName: "tomas.giraldo@tuya.local",
    displayName: "Tomás Giraldo",
    givenName: "Tomás",
    surname: "Giraldo",
    mail: "tomas.giraldo@tuya.local",
    roles: ["Plataforma.ChapterLead"],
    capacityRoles: CAP_LEAD.map(capRole),
  },
  {
    userPrincipalName: "lucia.tecnica@tuya.local",
    displayName: "Lucía Técnica",
    givenName: "Lucía",
    surname: "Técnica",
    mail: "lucia.tecnica@tuya.local",
    roles: ["Plataforma.TechLead"],
    capacityRoles: CAP_TECH.map(capRole),
  },
  {
    userPrincipalName: "rita.restringida@tuya.local",
    displayName: "Rita Restringida",
    givenName: "Rita",
    surname: "Restringida",
    mail: "rita.restringida@tuya.local",
    roles: [],
    capacityRoles: [],
  },
];

/** Llama al admin API; lanza con el cuerpo del error si la respuesta no es 2xx. */
async function call(method, path, body) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: body === undefined ? {} : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    console.error(
      `\nNo hay emulador respondiendo en ${BASE} (${error.cause?.code ?? error.message}).\n` +
        `Levantalo con: cd C:\\Repos\\entra-local && pnpm dev\n`
    );
    process.exit(1);
  }
  if (response.status === 204) return undefined;
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const message = parsed?.error?.message ?? `${response.status} en ${method} ${path}`;
    throw new Error(message);
  }
  return parsed;
}

/** Busca una app por nombre exacto, o la crea. Devuelve su detalle completo. */
async function ensureApp(displayName, createBody) {
  const page = await call("GET", `/admin/api/apps?search=${encodeURIComponent(displayName)}`);
  let app = (page.value ?? []).find((candidate) => candidate.displayName === displayName);
  if (app) {
    console.log(`App "${displayName}" ya existe (${app.id}).`);
  } else {
    app = await call("POST", "/admin/api/apps", { displayName, ...createBody });
    console.log(`App "${displayName}" creada (${app.id}).`);
  }
  return call("GET", `/admin/api/apps/${app.id}`);
}

/** Garantiza los roles de usuario `values` en la app; devuelve mapa valor → rol. */
async function ensureUserRoles(appDetail, values, displayNames = {}) {
  const byValue = new Map(appDetail.appRoles.map((role) => [role.value, role]));
  for (const value of values) {
    if (byValue.has(value)) continue;
    const created = await call("POST", `/admin/api/apps/${appDetail.id}/roles`, {
      value,
      ...(displayNames[value] ? { displayName: displayNames[value] } : {}),
      allowedMemberTypes: ["User"],
    });
    byValue.set(created.value, created);
    console.log(`  Rol ${value} creado en "${appDetail.displayName}".`);
  }
  return byValue;
}

/** Asigna a la persona los roles `values` de la app, si no los tiene ya. */
async function ensureAssignments(appDetail, rolesByValue, assignedSet, user, values) {
  for (const value of values) {
    if (assignedSet.has(`${value}→${user.id}`)) continue;
    const role = rolesByValue.get(value);
    await call("POST", `/admin/api/apps/${appDetail.id}/roles/${role.id}/assignments`, {
      principalType: "user",
      principalId: user.id,
    });
    console.log(`  ${value} → ${user.displayName}`);
  }
}

const health = await call("GET", "/admin/api/health");
const tenantId = health.tenantId;
console.log(`Emulador ${health.version} arriba. Tenant ${tenantId}.`);

// --- App registration del host (cliente público SPA) ---------------------------------------------
const hostApp = await ensureApp(APP_NAME, {
  isConfidential: false,
  redirectUris: [{ uri: REDIRECT_URI, type: "spa" }],
});
if (!hostApp.redirectUris.some((entry) => entry.uri === REDIRECT_URI)) {
  await call("POST", `/admin/api/apps/${hostApp.id}/redirectUris`, {
    uri: REDIRECT_URI,
    type: "spa",
  });
  console.log(`Redirect URI ${REDIRECT_URI} agregada.`);
}
const hostRoles = await ensureUserRoles(
  hostApp,
  ROLES.map((role) => role.value),
  Object.fromEntries(ROLES.map((role) => [role.value, role.displayName]))
);

// --- App registration de la API de Gestión de Capacidad ------------------------------------------
const capApp = await ensureApp(CAP_API_NAME, {
  isConfidential: false,
  appIdUri: CAP_API_URI,
});
if (capApp.appIdUri !== CAP_API_URI) {
  await call("PATCH", `/admin/api/apps/${capApp.id}`, { appIdUri: CAP_API_URI });
  console.log(`Identifier URI ${CAP_API_URI} aplicado.`);
}
if (!capApp.exposedScopes?.some((scope) => scope.value === CAP_SCOPE)) {
  await call("POST", `/admin/api/apps/${capApp.id}/scopes`, {
    value: CAP_SCOPE,
    adminConsentDisplayName: "Usar Gestión de Capacidad como la persona",
  });
  console.log(`Scope ${CAP_SCOPE} expuesto.`);
}
const capRoles = await ensureUserRoles(capApp, CAP_SECTIONS.map(capRole));

// --- Personas y asignaciones ---------------------------------------------------------------------
const users = await call("GET", "/admin/api/users?top=200");
const byUpn = new Map((users.value ?? []).map((user) => [user.userPrincipalName, user]));
const hostAssigned = new Set(
  (await call("GET", `/admin/api/apps/${hostApp.id}/assignments`)).map(
    (entry) => `${entry.roleValue}→${entry.principalId}`
  )
);
const capAssigned = new Set(
  (await call("GET", `/admin/api/apps/${capApp.id}/assignments`)).map(
    (entry) => `${entry.roleValue}→${entry.principalId}`
  )
);

for (const person of PEOPLE) {
  let user = byUpn.get(person.userPrincipalName);
  if (!user) {
    const { roles: _roles, capacityRoles: _cap, ...body } = person;
    user = await call("POST", "/admin/api/users", body);
    console.log(`Persona ${person.displayName} creada.`);
  }
  await ensureAssignments(hostApp, hostRoles, hostAssigned, user, person.roles);
  await ensureAssignments(capApp, capRoles, capAssigned, user, person.capacityRoles);
}

// --- Resumen y configuración ---------------------------------------------------------------------
const finalHost = await call("GET", `/admin/api/apps/${hostApp.id}/assignments`);
const finalCap = await call("GET", `/admin/api/apps/${capApp.id}/assignments`);
console.log(
  `\nListo: apps 2, roles ${hostRoles.size + capRoles.size} ` +
    `(host ${hostRoles.size}, API GC ${capRoles.size}), personas ${PEOPLE.length}, ` +
    `asignaciones ${finalHost.length + finalCap.length} ` +
    `(host ${finalHost.length}, API GC ${finalCap.length}).`
);
console.log(`\nPegá esto en host/.env.development.local (git lo ignora):\n`);
console.log(`VITE_ENTRA_CLIENT_ID=${hostApp.id}`);
console.log(`VITE_ENTRA_TENANT_ID=${tenantId}`);
console.log(`VITE_ENTRA_AUTHORITY=https://login.entra.localhost:8443/${tenantId}`);
console.log(`VITE_ENTRA_KNOWN_AUTHORITIES=login.entra.localhost:8443`);
console.log(`VITE_ENTRA_REDIRECT_URI=${REDIRECT_URI}`);
console.log(
  `VITE_ENTRA_API_SCOPES=\n\n` +
    `Cuando el módulo de Gestión de Capacidad pida su token (acquireToken), ` +
    `su scope es: ${CAP_API_URI}/${CAP_SCOPE}`
);
