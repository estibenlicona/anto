## Context

Ver `proposal.md` — Why. Estado actual que condiciona el diseño:

- **Host** (`host/`, MSAL 5.x en redirect flow): `readEntraConfig` fija `authority` a `https://login.microsoftonline.com/<tenant>`; `createMsalInstance` no declara `knownAuthorities`; `accountToSession` mapea sólo `claims.roles` con `ENTRA_ROLE_TO_APP_ROLE`; `APP_ROLES = ["admin", "chapter-lead"]`; el registro tiene un solo módulo; `main.tsx` elige simulador o Entra según `VITE_AUTH_SIMULATOR`. Los tests de rutas y layout usan `fakeAuth` (contexto directo), no el simulador.
- **entra-local** (`C:\Repos\entra-local`, clon de `cmaneu/entra-local`, rama `main`, sin cambios locales): Fastify + SQLite; app roles en `app_roles` con `allowed_member_types` texto (`'Application'` por defecto) y `roles` sólo en tokens app-only (`autoGrantedRoles`); los claims de usuario se arman en `tokens/claims.ts` (`buildIdTokenClaims`, `buildDelegatedAccessClaims`) y los opcionales/grupos en `tokens/tokenConfig.ts::resolveAppTokenClaims`, compartido por emisión (`tokens/response.ts`) y vista previa (`tokens/service.ts`). Migraciones numeradas en `store/migrations`; admin API en `admin/routes.*.ts` con esquemas zod; portal React con sección "App roles" en `AppDetail`. Convenciones propias: spec numerada en `specs/`, decisiones en `memory/decisions.md`, tests en `test/unit` y `test/e2e` (MSAL real).
- **Máquina**: el emulador corre con `pnpm dev` (tsx watch) en `https://localhost:8443`, `originMode: subdomains` (discovery anuncia `login.entra.localhost:8443`), `requirePassword: false` (selector de cuenta, sin contraseña), `hosts` ya resuelve `*.entra.localhost`; el certificado autofirmado no está en el almacén raíz del usuario. Seed por defecto: tenant `11111111-1111-1111-1111-111111111111`, usuarios alice/bob, sin app del host.
- Los docs de MSAL del emulador piden autoridad con GUID de tenant, `knownAuthorities: ['<host:port>']` y `protocolMode` por defecto (AAD).

## Goals / Non-Goals

**Goals:**
- Un solo camino de sesión en el host: MSAL contra la autoridad que diga el entorno; el emulador es sólo configuración.
- Los roles llegan por el mismo claim y con los mismos valores que en producción; el adaptador del host no distingue emulador de nube.
- Cambios en `entra-local` pequeños, aislados en una rama y con la forma de un feature upstream (spec, decisión, tests), para poder proponerlos como PR.
- Directorio de prueba reproducible con un comando; sin datos versionados que dependan de una base concreta.

**Non-Goals:**
- Tocar `frontend/` (conserva su simulador y su `APP_ROLES` hasta su change de conversión).
- Roles internos de los módulos (viven en la app registration de cada API) y scopes de API del host: `VITE_ENTRA_API_SCOPES` puede quedar vacío contra el emulador.
- Asignaciones vía Graph (`/me/appRoleAssignments`), asignaciones a service principals, o UI de asignación desde la ficha del usuario en el portal: sólo desde la ficha de la app.
- Contraseñas para las personas de prueba: el emulador corre en modo selector de cuenta.

## Decisions

1. **App roles de usuario + asignaciones como tabla propia en el emulador (`app_role_assignments`), no como atributo del usuario.** Migración 003: `id`, `app_id`, `role_id`, `principal_type` (`user` | `group`), `principal_id`, `created_at`, con índice único `(role_id, principal_type, principal_id)` y borrado en cascada al borrar rol, usuario o grupo. Refleja el modelo de Entra (asignaciones en la enterprise application, a usuarios o grupos) y deja el usuario y los grupos como están. Alternativa: lista de roles en el usuario (más simple, pero no modela grupos ni la pertenencia a una app concreta).

2. **Resolución de `roles` en `resolveAppTokenClaims`, no en `buildIdTokenClaims`.** Es el único punto compartido por emisión y vista previa, así el portal muestra exactamente lo que se emite (misma razón que sostuvo la decisión de optional claims del propio proyecto). El repositorio de apps expone `rolesForUser(appId, userId)`: unión de asignaciones directas y por grupos de la persona, filtrada por `is_enabled`, sin duplicados, ordenada por valor. Alternativa: un módulo aparte llamado desde `response.ts` y `service.ts` (dos llamadas que pueden divergir).

3. **App cuyos roles se emiten: la cliente en el ID token, la recurso en el access token delegado.** Así lo hace Entra: el ID token describe a la persona frente a la app que inició sesión; el access token lleva los roles que la persona tiene en la API destino. Cuando el recurso es Graph o no es una app registrada, no se emite `roles`. `resolveAppTokenClaims` recibe la app cuyos roles se resuelven según `kind`; los optional claims siguen resolviéndose como hoy. Alternativa: siempre la app cliente (más simple, pero un módulo que pida token para su API recibiría los roles del host).

4. **Admin API mínimo y con la forma del resto de rutas de apps.** `GET/POST /api/apps/:id/roles/:roleId/assignments` (`{ principalType: "user" | "group", principalId }`), `DELETE /api/apps/:id/roles/:roleId/assignments/:assignmentId`, y `GET /api/apps/:id/assignments` (todas las de la app, con `roleValue` y `principalDisplayName`, para el portal y la herramienta de semilla). Errores con la convención existente: 404 principal/rol inexistente, 400 rol sin tipo `User`, 409 duplicado. `roleCreateSchema` acepta `allowedMemberTypes` con `User`, `Application` o ambos; el valor por defecto sigue siendo `['Application']` para no alterar a los clientes actuales.

5. **Portal: una tabla de asignaciones dentro de la sección "App roles" de `AppDetail`,** con un selector de principal (usuarios y grupos listados por la API existente) y borrado por fila. Suficiente para operar a mano; la semilla de la plataforma usa la API. Alternativa: sección nueva "Assignments" (más navegación para lo mismo).

6. **Autoridad configurable en el host con dos variables opcionales.** `VITE_ENTRA_AUTHORITY` (URL completa con el tenant; por defecto `https://login.microsoftonline.com/<tenant>`) y `VITE_ENTRA_KNOWN_AUTHORITIES` (hosts separados por espacio; si falta y la autoridad es explícita, se deriva el host de la URL). Se pasan a MSAL como `auth.authority` y `auth.knownAuthorities`; `protocolMode` queda por defecto. `readEntraConfig` sigue exigiendo `VITE_ENTRA_CLIENT_ID` y `VITE_ENTRA_TENANT_ID`. Contra el emulador: autoridad `https://login.entra.localhost:8443/11111111-1111-1111-1111-111111111111`, conocida `login.entra.localhost:8443`, redirect `http://localhost:4400/`. Alternativa: `VITE_ENTRA_LOCAL=true` que arme todo (menos explícito y ata el host a un emulador concreto).

7. **Tercer rol como extensión del mapeo existente, no como excepción.** `APP_ROLES` pasa a `["admin", "chapter-lead", "tech-lead"]`, `ENTRA_ROLE_TO_APP_ROLE` suma `"Plataforma.TechLead": "tech-lead"`, `ROLE_LABELS` suma "Líder técnica/o" (etiqueta "Líder Técnico" como en el doc de roles). Registro: `capacidad` (`admin`, `chapter-lead`) e `iniciativas` ("Iniciativas y Células", `/iniciativas`, `admin`, `chapter-lead`, `tech-lead`, color propio). La conversión del front a módulo decidirá después qué remote monta cada entrada.

8. **Retirar el simulador por completo.** Se borra `src/dev/`, `dev:auth`, `VITE_AUTH_SIMULATOR` (tipos, `define`, `.env.example`, README); `main.tsx` queda con un solo camino: `readEntraConfig` → `EntraAuthProvider`, y `ConfigErrorPage` cuando falta configuración. `App` conserva la inyección de `AuthProvider` (es barata y la usan los tests de arranque); desaparece `DevPanel`. Alternativa: dejarlo como respaldo (rechazada por el usuario: un solo camino, verificado con los tres roles).

9. **Herramienta de semilla en `host/scripts/entra-local-seed.mjs` (`pnpm entra:seed`), Node ESM sin dependencias.** Lee `ENTRA_LOCAL_URL` (por defecto `https://localhost:8443`, el origen compat que sirve todas las rutas), busca por nombre/valor/UPN antes de crear (idempotente), y al final imprime el bloque para `.env.development.local`. Para hablar con el certificado autofirmado desde Node, el script desactiva la verificación TLS **sólo en su propio proceso** y sólo para orígenes loopback, y lo dice en su cabecera; alternativa `NODE_EXTRA_CA_CERTS` con el PEM del emulador, que exige un paso previo y una ruta por máquina. Personas: `ana.admin@tuya.local` (Ana Administradora, `Plataforma.Admin`), `tomas.giraldo@tuya.local` (Tomás Giraldo, `Plataforma.ChapterLead`), `lucia.tecnica@tuya.local` (Lucía Técnica, `Plataforma.TechLead`), `rita.restringida@tuya.local` (Rita Restringida, sin rol); coinciden con los perfiles que tenía el simulador para que el smoke sea el mismo. Las asignaciones de la semilla son directas; la asignación por grupo queda cubierta por los tests del emulador.

10. **Confianza del certificado como tarea explícita de la máquina, no del código.** `pnpm start -- trust --apply` en `entra-local` (instala el PEM en el almacén raíz del usuario con `certutil`); sin eso Chrome bloquea el `fetch` de MSAL al endpoint de token aunque la persona acepte el aviso en la página de inicio de sesión. Se documenta en el README del host junto con `hosts --apply`.

## Risks / Trade-offs

- [MSAL 5.x contra una autoridad no Microsoft] → seguir la receta del emulador (autoridad con GUID, `knownAuthorities`, `protocolMode` por defecto) que su e2e valida con MSAL real; verificar en el smoke el regreso del redirect y `acquireTokenSilent`.
- [Deriva respecto a upstream de `entra-local`] → cambios en rama propia, pequeños y con spec + decisión + tests al estilo del proyecto; si upstream agrega roles de usuario, se reemplaza la rama.
- [Vista previa y emisión divergen] → un único resolutor (`resolveAppTokenClaims`) y un test que compara preview con token emitido para la misma persona.
- [Borrar el simulador deja al host inutilizable sin emulador] → `ConfigErrorPage` sigue nombrando la variable faltante; el README abre con los tres comandos (emulador, semilla, `pnpm dev`).
- [La semilla desactiva la verificación TLS en Node] → sólo dentro del proceso del script, sólo si el origen es loopback o `*.entra.localhost`, y anunciado en la salida; nunca en el host ni en tests.
- [Refresh tokens con scopes estrictos en el emulador] → el host ya pide los scopes de API en el `loginRedirect`, así `acquireTokenSilent` no pide más de lo concedido.

## Migration Plan

1. `entra-local`: rama `feature/user-app-roles`, migración 003 (aditiva; bases existentes siguen funcionando), tests, `pnpm dev` reinicia solo con tsx watch.
2. Máquina: `trust --apply` una vez; `hosts` ya aplicado.
3. Host: `pnpm entra:seed` → copiar el bloque impreso a `host/.env.development.local` → `pnpm dev`.
4. Rollback: volver a `main` en `entra-local` (la migración es aditiva, la base sigue abriendo) y quitar `VITE_ENTRA_AUTHORITY`/`KNOWN_AUTHORITIES` del `.env.development.local`; el simulador no vuelve — está en el historial de git si hiciera falta.

## Open Questions

- Si conviene proponer los app roles de usuario a `cmaneu/entra-local` como PR una vez estabilizados (no cambia specs ni tareas de este change).
