## 1. Scaffold y herramientas

- [x] 1.1 Crear `host/` con `package.json` (`name: "plataforma-host"`, scripts `dev`, `dev:auth`, `build:dev|test|prod`, `test`, `lint`, `format`, `preview` con la misma forma que `frontend/package.json`), React 19.2, Vite 8, TypeScript, `react-router-dom`, Vitest 4 + Testing Library + jsdom, ESLint flat config, Prettier, y copiar `.npmrc`, `.prettierrc`, `.gitignore`, `tsconfig.json`/`tsconfig.node.json` (alias `@app/@features/@layouts/@pages/@shared`) y `eslint.config.js` de `frontend/` ajustando rutas. Verificar: `pnpm install` termina y `pnpm lint` corre sobre un `src/main.tsx` vacío.
- [x] 1.2 `vite.config.ts` y `vitest.config.ts` espejando los del front (alias, `dedupe` de react, `server.deps.inline` para `@tuya-ui`/`@radix-ui`, cobertura, junit) y `vitest-setup.ts` con los stubs de `matchMedia`, `ResizeObserver` y `localStorage`. Verificar: `pnpm test` pasa con un test trivial.
- [x] 1.3 Variables de entorno: `.env.development` (`VITE_BASE_PUBLIC_URL=/`, `VITE_ENTRA_*` vacíos), `.env.production`, y `.env.example` documentando `VITE_ENTRA_CLIENT_ID`, `VITE_ENTRA_TENANT_ID`, `VITE_ENTRA_API_SCOPES`, `VITE_ENTRA_REDIRECT_URI`, `VITE_AUTH_SIMULATOR`. Verificar: los archivos existen y ninguno contiene un secreto real.

## 2. Tuip

- [x] 2.1 Dependencias `@tuya-ui/components` y `@tuya-ui/tokens` por tarball **0.2.3** (tokens 0.1.17; lo que publicó `add-module-shell`) (`file:../tuip/.local-packages/…`), `@fontsource/ibm-plex-sans` (400–700) y `@fontsource/ibm-plex-mono` (400, 500); `src/styles/styles.css` con `@import "tailwindcss"`, las fuentes, `@tuya-ui/components/styles.css` y `body { font-family: var(--font-sans); background: var(--color-bg-neutral-canvas) }`; `index.html` con `<html lang="es" data-theme="light">`, `<div id="root">` y `<div id="modal">`. Verificar: `pnpm dev` muestra un `Button` de tuip con IBM Plex y sin errores de consola.

## 3. Sesión

- [x] 3.1 Copiar `frontend/src/features/auth-session/{types,deriveAuthSession,filterNavByRole}.ts` a `host/src/features/auth-session/` y agregar `HostSessionActions` (`login(returnTo?)`, `logout()`, `acquireToken(scopes)`) y el contexto `HostAuthContext` + `useAuth()` que expone `AuthSession & HostSessionActions`. Verificar: tests de `deriveAuthSession` copiados pasan.
- [x] 3.2 `createSessionStore()` en `features/auth-session/sessionStore.ts`: `getSession` con referencia estable, `set(session)` que notifica, `subscribe` con baja; expone un `HostSessionSource`. Verificar con test: dos `getSession()` seguidos devuelven el mismo objeto; `set` con un objeto nuevo notifica una vez a cada suscriptor; tras `unsubscribe` no notifica.
- [x] 3.3 Copiar `frontend/src/dev/auth-simulator/` a `host/src/dev/auth-simulator/` (perfiles con claims `Plataforma.Admin` / `Plataforma.ChapterLead`, panel, contexto de control) y adaptarlo: escribe en el `sessionStore`, implementa `login()` (perfil por defecto) y `logout()` (anónimo), `acquireToken` devuelve el token simulado. Verificar con test: elegir "Admin" produce roles `["admin"]`; "Cerrar sesión" deja la sesión anónima y notifica al store.
- [x] 3.4 `features/entra/entraConfig.ts` (lee `VITE_ENTRA_*`, lanza `EntraConfigError` nombrando la variable faltante) y `EntraAuthProvider` sobre `@azure/msal-browser` + `@azure/msal-react`: `initialize` → `handleRedirectPromise` con `isLoading`, cuenta activa → `AuthenticatedSession` (user desde `name`/`preferred_username`/`oid`, roles vía `ENTRA_ROLE_MAP`, claims crudos, `accessToken` vía `acquireTokenSilent` de `VITE_ENTRA_API_SCOPES` o `null`), `login` = `loginRedirect` con `state: returnTo`, `logout` = `logoutRedirect`, cache `localStorage`. Verificar con tests (msal mockeado): sin cuenta → anónima; con cuenta y `roles: ["Plataforma.ChapterLead"]` → `["chapter-lead"]`; claim desconocido ignorado; `acquireTokenSilent` que falla → `accessToken: null`.
- [x] 3.5 `main.tsx` como composition root: `VITE_AUTH_SIMULATOR === "true"` → import dinámico de `SimulatedAuthProvider` + `SimulatorPanel`; si no → `EntraAuthProvider`; `define` en `vite.config.ts` fuerza `"false"` en producción. Página `ConfigErrorPage` cuando `entraConfig` lanza. Verificar: `pnpm build:prod` no emite ningún chunk de `src/dev/`; `pnpm dev` sin `VITE_ENTRA_CLIENT_ID` muestra el error nombrando la variable.

## 4. Módulos

- [x] 4.1 `features/modules/registry.ts` con `ModuleDefinition` y la entrada `capacidad` (`"Gestión de Capacidad"`, `/capacidad`, roles `admin`, `chapter-lead`, color propio) y `visibleModules(hasRole)`. Verificar con test: admin y chapter-lead ven `capacidad`; un usuario sin roles no ve ninguno; un módulo sin `roles` lo ven todos.
- [x] 4.2 `pages/PortalPage` con una tarjeta por módulo visible (`Card` de tuip, nombre, descripción, acción "Entrar") y estado vacío ("No tenés módulos disponibles") cuando no hay ninguno. Verificar con test: con rol admin se ve "Gestión de Capacidad"; sin roles se ve el estado vacío.
- [x] 4.3 `pages/ModulePlaceholderPage` (`EmptyState` de tuip: "<nombre> está pendiente de integrar") montada en `/<basePath>/*` de cada módulo del registro. Verificar con test: `/capacidad/personas` muestra el aviso con "Gestión de Capacidad".

## 5. Layout y barra

- [x] 5.1 `layouts/HostLayout.tsx`: `ToastProvider` + `Navbar variant="light" product="Dimensionamiento TI"` con `apps` desde `visibleModules` (`current` por prefijo de ruta, `href` = `basePath`), `onNavigate` → `navigate`, `user` desde la sesión (iniciales derivadas del nombre), `userMenu=[{ label: "Cerrar sesión", destructive: true, onSelect: logout }]`, `showNotifications={false}`, sin `onSearch`/`onMenuToggle`; `<main id="main-content">` con `Outlet`. Verificar con tests: no existe botón "Notificaciones" ni "Buscar"; el selector lista sólo los módulos permitidos y marca el actual; "Cerrar sesión" llama a `logout`.

## 6. Router y guards

- [x] 6.1 `app/router`: `/auth/login` (`LoginPage` con "Iniciar sesión con Tuya" → `login(returnTo)`), `/` portal, `/<basePath>/*` por módulo, `/sin-permisos`, `*` no encontrada — todo salvo login bajo `HostLayout`; `AuthGuard({ roles })` con `isLoading → null`, sin sesión → `/auth/login?returnTo=`, sin rol → `/sin-permisos`. Verificar con tests (simulador): anónimo en `/` → login; chapter-lead en `/capacidad` → placeholder; usuario sin roles en `/capacidad` → "Sin permisos" con la barra visible; `/lo-que-sea` → "No encontrada" con enlace al portal.

## 7. Verificación

- [x] 7.1 `pnpm test` (cobertura ≥ 80 % como en el front), `pnpm lint` y `pnpm build:prod` sin errores. Verificar: los tres comandos terminan en 0.
- [x] 7.2 Smoke manual con `pnpm dev:auth`: entrar como Admin → portal con "Gestión de Capacidad" → entrar → placeholder bajo la barra con el módulo marcado en el selector; cambiar a "Restricted User" → portal vacío y `/capacidad` → "Sin permisos"; "Cerrar sesión" → login. Verificar: cada paso se ve como se describe, sin campana ni sidebar.
- [x] 7.3 (Condicional: sólo si ya existen Client ID y Tenant ID) Smoke con `pnpm dev` y `.env.development.local`: login redirect real, regreso a la ruta pedida, nombre y rol en la cuenta. Si no existen, dejarlo anotado como verificación pendiente en `host/README.md`.

## 8. Documentación

- [x] 8.1 `host/README.md`: qué es el host, cómo correrlo con simulador y con Entra, variables de entorno, cómo declarar un módulo en el registro, y qué queda para el change de Module Federation (montaje real, `ModuleShell` en los módulos, contrato compartido). Verificar: el README cubre esos cinco puntos.
