## Why

Gestión de Capacidad (`frontend/`) sigue siendo una SPA standalone con navbar, login y simulador propios, mientras el host ya autentica contra el proveedor, decide qué módulos se ven y muestra un placeholder en `/capacidad`. Todo el contrato está preparado de changes anteriores — `HostSessionSource` en el front, `SessionStore` + `acquireToken` en el host, `ModuleShell` en tuip, sub-claims `Capacidad.*` — pero nadie los conecta: hay dos navbars, dos sesiones y un módulo que no se monta. Este change hace la conversión: el front pasa a ser un **remote de Module Federation** que el host carga bajo `/capacidad`, sin navbar ni login propios, con **un único sidebar** filtrado por permisos de sección.

## What Changes

- **BREAKING: el front deja de ser una app standalone.** Se eliminan su navbar (los dos AppShell), su LoginPage/AuthLayout, su `AuthGuard` de redirección a login, el simulador de sesión (`src/dev/auth-simulator`) y los arranques `dev`/`dev:auth` como app propia. El único modo de desarrollo es dentro del host (host + emulador entra-local + este remote).
- **El front se publica como remote de Module Federation** (`@module-federation/vite`, ya en sus dependencias): expone un componente de módulo que recibe del host el contrato — fuente de sesión (`HostSessionSource`), `acquireToken`, ruta base y alto de la barra — y monta sus rutas bajo esa base. React, ReactDOM y react-router-dom compartidos como singletons (versiones idénticas en ambos lados).
- **Sidebar único por permisos** con `ModuleShell` de tuip: las secciones de los dos shells actuales conviven en un solo menú — Inicio, Iniciativas, grupo Capacidad (Células, Personas, Ausencias, Dedicación, Facturación, Competencias), grupo Configuración (Sprints, Parámetros, Habilidades, Líneas), grupo DevOps (Ingesta) — filtradas por los sub-claims `Capacidad.*` que ya existen. Rutas planas `/capacidad/<sección>`; las rutas viejas `/app/admin/*` y `/app/lead/*` desaparecen. El breadcrumb pasa de la topbar (que ya no existe) al encabezado del contenido. El Inicio muestra la torre de control a quien tiene permisos de lead y el estado de la plataforma al resto con permisos de configuración.
- **Permisos desde el token real**: como módulo, `permissions` se derivan del claim `roles` del access token que el módulo pide con `acquireToken` para su API (`api://capacidad/access_as_user`), leyendo el payload del JWT sin validar firma (la validación es del backend); el mapeo `mapCapacityRoles` es el ya existente.
- **El host monta el remote**: el registro de módulos gana `remoteEntry` (URL por variable de entorno), la ruta del módulo carga el remote con estado de carga y de error (sin romper la barra), y le entrega el contrato; el módulo sin `remoteEntry` declarado sigue mostrando el placeholder ("Iniciativas y Células" queda así). En desarrollo el host sirve también el service worker de mocks del módulo, que sigue proveyendo los datos hasta que se cablee el backend real.
- **tuip del front sube a 0.2.3** (el tarball 0.1.14 ya no existe): habilita `ModuleShell` y destraba el `pnpm install` roto del front.
- La semilla y el emulador no cambian; el host no cambia de autenticación.

## Capabilities

### New Capabilities
- `capacity-module`: Gestión de Capacidad como módulo federado — el contrato que recibe del host, su shell interno único por permisos, y sus modos de build (remote y desarrollo bajo el host).

### Modified Capabilities
- `platform-host`: el requisito del selector/portal incorpora el montaje real de módulos federados (carga del remote, entrega del contrato, error sin romper la barra; placeholder sólo para módulos sin remote).
- `auth-session`: la sesión proviene únicamente del host (se retiran el simulador de sesión y la selección de implementación en el arranque); las rutas protegidas dejan de redirigir a un login propio.
- `admin-shell`: se retiran la navegación lateral propia, la navegación entre pantallas y el acceso autenticado del esqueleto (los absorbe el módulo único); las pantallas (Parámetros, pool de scoring, etc.) permanecen.
- `chapter-lead-shell`: ídem — se retiran navegación lateral, navegación entre pantallas y acceso autenticado del shell; las pantallas y el ámbito del Chapter Lead permanecen.

## Impact

- **`frontend/`**: `package.json` (tuip 0.2.3, scripts de remote, sin `dev:auth`), `vite.config.ts` (plugin de federation, exposes, shared), `src/main.tsx` → entrada de remote (se elimina el arranque standalone), `src/app` (App del módulo con props del contrato, router bajo basePath), nuevo layout con `ModuleShell` + breadcrumb en contenido (reemplaza `AdminLayout`/`ChapterLeadLayout`), navegación unificada (`features/*-shell/navigation.ts` → navegación del módulo), guards sin login, permisos vía `acquireToken`, borrado de `src/dev/auth-simulator`, `pages/Login*`, `AuthLayout`, `MainLayout`, y ajuste masivo de tests de rutas/layouts.
- **`host/`**: dependencia `@module-federation/vite` (consumer), `registry.ts` (`remoteEntry` por env `VITE_MF_CAPACIDAD_URL`), componente de carga del remote con error boundary, `HostLayout`/rutas pasando el contrato, `public/` sirviendo el worker de mocks del módulo en dev, `.env.*` y README.
- **tuip**: sin cambios de código; el front consume el tarball 0.2.3 ya publicado.
- Los tests existentes del front que montaban shells con navbar y login se reescriben contra el módulo; los de pantallas no cambian.
