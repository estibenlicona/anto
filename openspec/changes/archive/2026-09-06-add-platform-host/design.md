## Context

No hay host: `frontend/` es una SPA standalone con su propio `AppShell` (barra + sidebar), un login legacy de plantilla apuntando a URLs vacías, y un puerto de sesión (`features/auth-session`) que espera un `HostSessionSource` que nadie implementó. Ver proposal.md — Why.

Lo que sí existe y este diseño reutiliza tal cual:
- El **contrato de sesión** del front (`Session`, `AuthenticatedSession { user, roles, scopes, claims, accessToken }`, `AppRole = "admin" | "chapter-lead"`, `HostSessionSource { getSession, subscribe }`, `deriveAuthSession`): fue escrito desde el lado del módulo precisamente para que el host lo implementara.
- El **simulador** (`frontend/src/dev/auth-simulator`), con perfiles que ya tienen forma de claims de Entra (`oid`, `preferred_username`, `roles: ["Plataforma.Admin" | "Plataforma.ChapterLead"]`, `scp`).
- La **cadena de herramientas** de `frontend/` (Vite 8, Vitest 4, ESLint flat, Prettier, alias `@app/@features/@layouts/@pages/@shared`, `.npmrc`) y su forma de consumir tuip (tarball `file:`, `styles.css` con fuentes + `@tuya-ui/components/styles.css`, stubs de `matchMedia`/`localStorage` en tests, `server.deps.inline` para `@tuya-ui`/`@radix-ui`).
- `Navbar` de tuip ya trae selector de apps (`apps: NavbarAppRef[]` con `current`), menú de cuenta (`user`, `userMenu`) y enlaces de utilidad; con `0.2.0` gana `showNotifications`.

Restricciones: no existen todavía app registrations de Entra; Module Federation queda para el change de conversión de `frontend/`; el sidebar es de cada módulo.

## Goals / Non-Goals

**Goals:**
- Un host que arranque, autentique contra Entra (o el simulador), muestre la barra común y lleve a cada módulo permitido — sin ningún módulo real todavía.
- Que el contrato host↔módulo quede implementado y probado del lado del host, para que la conversión de `frontend/` sea mecánica.
- Paridad de herramientas y convenciones con `frontend/` para que el equipo no aprenda dos formas de trabajar.

**Non-Goals:**
- Cablear `@module-federation/vite`, `remotes`, `shared` o un remote de prueba.
- Barra global fuera de lo que `Navbar` ya ofrece (nada de extension points para que los módulos inserten ítems).
- Notificaciones, búsqueda global, tema oscuro, i18n.
- Tocar `frontend/` o `backend/`.

## Decisions

1. **Proyecto independiente en `host/`, no un workspace compartido con `frontend/`.** Alternativa: convertir la raíz en un workspace pnpm con `frontend/` y `host/`. Se descarta porque `frontend/` tiene su propio `prepare` con husky corporativo y su `.npmrc` estricto, y compartir `node_modules` entre dos apps que van a evolucionar a distinto ritmo (una se va a desarmar) complica más de lo que ahorra. Se copia la configuración, no se comparte. Tuip se consume igual que en `frontend/`: `"@tuya-ui/components": "file:../tuip/.local-packages/tuya-ui-components-0.2.0.tgz"` y tokens.

2. **El puerto de sesión se copia a `host/src/features/auth-session/` y se extiende con acciones, no se importa de `frontend/`.** Importar cruzado (`../frontend/src/...`) acoplaría el host a un proyecto que va a desarmarse. El host agrega lo que un módulo no tiene: `HostSessionActions { login(returnTo?): void; logout(): void; acquireToken(scopes: string[]): Promise<string | null> }`. Cuando exista un paquete de contrato compartido (decisión del change de conversión), los dos lados lo adoptan; los tipos son idénticos a propósito.

3. **Dos proveedores de sesión elegidos en el composition root por build, igual que el front.** `main.tsx`: si `import.meta.env.VITE_AUTH_SIMULATOR === "true"` → `SimulatedAuthProvider` + panel (import dinámico, `define` fuerza `"false"` en producción); si no → `EntraAuthProvider`. `App` recibe el provider por props. Ningún componente de negocio sabe cuál está activo. El simulador se copia de `frontend/src/dev/auth-simulator` y gana `login()` (perfil por defecto) y `logout()` (anónimo).

4. **`EntraAuthProvider` sobre `@azure/msal-browser` (5.20) + `@azure/msal-react` (5.7), redirect flow, cache en `localStorage`.** `PublicClientApplication` se construye una sola vez desde `entraConfig` (`clientId`, `authority = https://login.microsoftonline.com/{tenantId}`, `redirectUri` = `VITE_ENTRA_REDIRECT_URI` o `window.location.origin + import.meta.env.BASE_URL`, `postLogoutRedirectUri` igual). Flujo: `initialize()` → `handleRedirectPromise()` → `isLoading` en `true` hasta resolver; cuenta activa → sesión; sin cuenta → anónima (el guard redirige a `/auth/login`). `login(returnTo)` = `loginRedirect({ scopes, state: returnTo })`, y al volver se navega a `state`. `logout()` = `logoutRedirect`. Cache `localStorage` en vez del `sessionStorage` por defecto: sobrevive a pestañas nuevas y lo comparten SPAs hermanas del mismo origen. Alternativa popup flow: se descarta por bloqueadores y por UX en escritorio corporativo.

5. **Roles de negocio desde el claim `roles` del ID token del host, con mapeo explícito.** `ENTRA_ROLE_MAP = { "Plataforma.Admin": "admin", "Plataforma.ChapterLead": "chapter-lead" }` (mismos nombres que usan los perfiles del simulador); claims desconocidos se ignoran. Los app roles que decidan **qué módulos se ven** son del host; los roles internos de cada módulo (p. ej. `Capacidad.Admin`) vivirán en la app registration de la API de ese módulo y viajarán en el access token que el módulo pida vía `acquireToken(scopes)`. Así el host no acumula los roles de todos los módulos. `accessToken` de la sesión = token para `VITE_ENTRA_API_SCOPES` (si está vacío, `null`, con aviso en consola en desarrollo).

6. **`HostSessionSource` como store externo, implementado en el host desde el primer día.** `createSessionStore()` guarda la sesión actual, expone `getSession` (misma referencia hasta el próximo `set`) y `subscribe`; ambos providers escriben en él y `HostAuthContext` lo lee con `useSyncExternalStore`. Es el objeto que el change de conversión pasará al módulo como `source`. Se prueba la estabilidad de referencia y la notificación — son los dos requisitos que el front documentó como condición para no entrar en bucle de renders.

7. **Registro de módulos por configuración estática, no por endpoint.** `src/features/modules/registry.ts`: `ModuleDefinition { id, name, description, color, basePath, roles?: AppRole[] }`, con `capacidad` (`/capacidad`, roles `admin` y `chapter-lead`) como única entrada real. `visibleModules(session)` filtra por `hasRole`. Alternativa: cargar el registro de un JSON remoto para desplegar módulos sin rebuild; se difiere al change de MF, donde el registro también tendrá `remoteEntry`, y es ahí donde importa que sea remoto.

8. **Rutas del host.** `/` portal (guard: sesión) · `/auth/login` (pantalla mínima con "Iniciar sesión con Tuya" → `login(returnTo)`; la pantalla real de credenciales es la de Entra) · `/<basePath>/*` por cada módulo (guard: sesión + roles del módulo) → `ModulePlaceholderPage` hasta que exista el remote · `/sin-permisos` · `*` no encontrada. Guard con `isLoading → null` para no expulsar durante la reconstrucción de sesión. `createBrowserRouter` sin `basename` propio (el host es dueño de la raíz); `import.meta.env.BASE_URL` sólo para el `redirectUri`.

9. **Layout único `HostLayout`**: `Navbar variant="light"` (la misma variante que el `AppShell` del front, y constante por producto según la guía de tuip), `product="Dimensionamiento TI"`, `apps` derivado de `visibleModules` con `current` = módulo cuyo `basePath` prefija la ruta actual, `onNavigate` → router, `user` = `{ name, role: etiqueta del primer rol, initials }`, `userMenu = [{ label: "Cerrar sesión", destructive: true, onSelect: logout }]`, `utilities` por defecto ("Ayuda", sin destino, como hoy en el front), `showNotifications={false}`, sin `onSearch` ni `onMenuToggle`. `<main id="main-content">` con `Outlet`. `ToastProvider` en el layout como hace el front.

10. **Tema fijo claro vía `<html data-theme="light">`.** Tuip lee `data-theme`, no clases; el `ThemeProvider` del front (clases `light`/`dark` + CSS legado) no se copia: el host no trae CSS legado, sólo `tailwindcss` (para sus utilidades propias), las fuentes y `@tuya-ui/components/styles.css`.

## Risks / Trade-offs

- [Sin app registrations no se puede probar el flujo real con Entra] → El simulador cubre todo el comportamiento observable salvo la redirección; `EntraAuthProvider` se prueba unitariamente con `@azure/msal-browser` mockeado (cuenta presente/ausente, mapeo de roles, token silencioso fallido). El primer login real es una verificación pendiente explícita, no un trámite.
- [Roles del ID token del host vs. roles por API] → Decisión 5 los separa a propósito; si al crear las registrations se opta por una sola app combinada, el mapeo sigue valiendo y sólo cambian los nombres del `ENTRA_ROLE_MAP`.
- [Copiar `auth-session` y el simulador desde el front crea dos copias hasta la conversión] → Aceptado: es temporal y los tipos son idénticos; el change de conversión decide dónde vive el contrato compartido.
- [`redirectUri` distinto por ambiente] → `VITE_ENTRA_REDIRECT_URI` opcional por `.env.<modo>`; por defecto se deriva del origen, que cubre desarrollo y cualquier despliegue en la raíz del dominio.
- [`localStorage` para el cache de MSAL] → Tokens en almacenamiento persistente del navegador; es el compromiso estándar de SPAs con SSO y el mismo que necesitarán módulos hermanos. Se documenta.

## Migration Plan

Nuevo proyecto, sin migración de datos ni de usuarios. Orden: tuip `0.2.3` publicado → scaffold y herramientas → tuip integrado → puerto de sesión + store + simulador → MSAL → registro, portal y placeholder → layout con Navbar → router y guards → tests, build y smoke con simulador (y con Entra cuando existan los IDs). Rollback: borrar `host/`; nada más depende de él.

## Open Questions

- Nombres definitivos de los app roles en Entra (`Plataforma.Admin`/`Plataforma.ChapterLead` son los del simulador): se fijan en `ENTRA_ROLE_MAP` cuando se creen las registrations, sin tocar specs ni tareas.
- Destino del enlace "Ayuda": hoy no tiene (como en el front); cuando exista una URL se pasa en `utilities`.
