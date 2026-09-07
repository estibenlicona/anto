## Context

Ver `proposal.md` — Why. Estado que condiciona el diseño:

- **Modelo vigente** (`platform-host` + doc de roles): `Plataforma.*` en el ID token del host decide qué módulos se ven; "los roles internos de cada módulo viven en la app registration de su API y viajan en el token que el módulo pide con `acquireToken(scopes)`". Este change materializa ese segundo nivel.
- **entra-local** ya soporta app roles de usuario, asignaciones y el claim `roles` en el access token **de la app recurso** (decisión del change anterior: ID token → roles de la app cliente; access token delegado → roles de la API destino). No hace falta tocar el emulador: sólo sembrar la app de la API con sus sub-roles.
- **frontend/** standalone: sesión del simulador propio (`src/dev/auth-simulator`, perfiles con claims `Plataforma.*`), `deriveAuthSession` → `hasRole`, `filterNavByRole` (hoy no filtra nada real), navegación declarada en `features/{admin-shell,chapter-lead-shell}/navigation.ts`, guard `RequireRole`. No usa MSAL ni pide tokens (API mockeada con MSW). **No correr `pnpm install` limpio en `frontend/`**: sigue pineado al tarball 0.1.14 de tuip que ya no existe; `node_modules` actual funciona.
- Secciones reales del sidebar: Admin → Sprints, Parámetros, Habilidades, Líneas, Ingesta(DevOps); Líder de Expertise → Iniciativas, Células, Personas, Ausencias, Dedicación, Facturación(Prefacturación), Competencias. "Inicio" en ambos.

## Goals / Non-Goals

**Goals:**
- Los permisos de sección tienen la misma forma en desarrollo y en producción: valores `Capacidad.*` en el claim `roles` de un token dirigido a la API del módulo.
- El menú y los guards deciden con el mismo predicado; imposible ofrecer una sección que el guard negará.
- Directorio local completo con un solo `pnpm entra:seed`.

**Non-Goals:**
- Cablear `acquireToken` real en `frontend/` (llega con la conversión a módulo del host; acá el simulador emite los sub-claims).
- Autorización en el backend .NET por estos claims (la API real validará el token de su app registration en su propio change).
- Permiso por acción (leer/editar dentro de una sección): la granularidad es por sección, como pidió el modelo.
- Tocar `entra-local` o `host/`.

## Decisions

1. **Un app role por sección, prefijo `Capacidad.`, en la app registration "Gestión de Capacidad API".** Valores: `Capacidad.{Iniciativas,Celulas,Personas,Ausencias,Dedicacion,Prefacturacion,Competencias,Sprints,Parametros,Habilidades,Lineas,DevOps}` — sin tildes ni eñes para viajar limpios en JWT. Es el mecanismo Entra para permisos **por persona** (las alternativas no lo son: `scp` es por aplicación cliente; grupos exigen mapear GUIDs). "Prefacturacion" y no "Facturacion": el nombre de negocio de la sección (la etiqueta corta del menú es aparte).

2. **La API del módulo es una app registration separada de la del host**, con `appIdUri` `api://capacidad` y scope delegado `access_as_user`. Así el access token que el módulo pida con `acquireToken(["api://capacidad/access_as_user"])` tendrá `aud` la API y `roles` los sub-claims de la persona — exactamente lo que emite el emulador desde el change anterior y lo que hará Entra real. Alternativa rechazada: sub-roles en la app del host (mezcla niveles y en el ID token viajarían siempre, para todos los módulos).

3. **Semilla: extensión del script existente** (`host/scripts/entra-local-seed.mjs`), mismas garantías (idempotente por nombre/valor/UPN, TLS relajado sólo en el proceso). Asignaciones: Ana los 12; Tomás los 7 de su shell; Lucía `Iniciativas`, `Celulas`, `Dedicacion`, `Competencias` (su shell `/app/tech` reutiliza esas vistas según el doc de roles, R-03/R-07); Rita ninguno. Imprime `VITE_ENTRA_API_SCOPES=api://capacidad/access_as_user` como línea sugerida.

4. **En `frontend/`, `Session` gana `permissions: CapacityPermission[]`** con `CAPACITY_PERMISSIONS` como catálogo tipado y `hasPermission(...permissions)` en el contrato derivado, espejo de `hasRole`. La derivación vive en `auth-session` (`mapCapacityRoles(roles: unknown)`: filtra por prefijo `Capacidad.`, ignora desconocidos) — la misma función servirá cuando los valores lleguen del token real. Alternativa rechazada: un `Record<string, boolean>` sin catálogo (typos silenciosos, sin autocompletado).

5. **El simulador del front declara los permisos en el perfil** (`capacityRoles: string[]` junto a `roles`), y `SimulatedAuthProvider` los pasa por `mapCapacityRoles` — misma vía que la real, como exige la spec. Perfiles: admin → 12; chapter-lead → 7; nuevo perfil **"Chapter Lead acotado"** (mismo rol de plataforma, permisos sin `Prefacturacion` ni `Ausencias`) para ver el filtrado sin inventar roles; restricted → ninguno. El panel muestra los permisos del perfil activo.

6. **`filterNavByRole` se generaliza a `filterNav(groups, { hasRole, hasPermission })`**: una entrada puede declarar `roles?` y/o `permission?`; se muestra si pasa ambas; grupo vacío desaparece. Se mantiene el nombre exportado viejo como alias deprecado hasta la conversión, para no tocar todos los imports en este change. `navigation.ts` de cada shell agrega `permission` por entrada ("Inicio" sin permiso).

7. **Guard por permiso**: `RequireRole` gana prop opcional `permission`; con rol pero sin permiso muestra la misma pantalla de "sin permisos" que el caso de rol (mensaje distinguible de la falta de sesión, como ya exige la spec). Las rutas de sección de ambos shells lo declaran. Alternativa rechazada: sólo ocultar en el menú (URL directa entraría igual).

## Risks / Trade-offs

- [Deriva entre `navigation.ts` y las rutas: menú filtra pero la ruta no exige, o al revés] → el permiso se declara una vez por sección en un mapa compartido del shell y tanto la entrada como la ruta lo leen de ahí; test que recorre las entradas y verifica que su ruta exige el mismo permiso.
- [El front standalone simula permisos que en producción vendrán de un token que aún nadie pide] → el contrato (`permissions` + `mapCapacityRoles`) es exactamente el del token real; la conversión a módulo sólo cambia la fuente. Documentado en README del front.
- [`frontend/` no puede reinstalar dependencias] → cambios sólo de código fuente; CI/local usan el `node_modules` existente.
- [Badge/estado de secciones ocultas (p. ej. Dedicación con badge)] → el badge se calcula sólo si la entrada es visible; sin permiso no se consulta.

## Migration Plan

1. Semilla: re-ejecutar `pnpm entra:seed` sobre el directorio actual (crea sólo lo nuevo). Rollback: borrar la app "Gestión de Capacidad API" desde el portal del emulador.
2. Front: cambios de código puros; rollback = revertir commits. Sin migración de datos.

## Open Questions

- Qué permisos exactos tendrá el Product Owner cuando se agregue su rol (no bloquea: el catálogo y las asignaciones son datos de la semilla).
