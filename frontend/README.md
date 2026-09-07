# Gestión de Capacidad — módulo de la plataforma

Gestión de Capacidad es un **remote de Module Federation**: no es una aplicación que se abra sola. El **host de la plataforma** (`../host`, Dimensionamiento TI) lo carga en tiempo de ejecución bajo `/capacidad`, le entrega la sesión y monta su contenido debajo de la barra común. Este paquete no trae barra superior, pantalla de inicio de sesión ni sesión propia: todo eso es del host.

Stack: React 19 + Vite + TypeScript, `@module-federation/vite`, React Router 7, Redux Toolkit, Axios, Vitest + Testing Library, MSW, Storybook; design system **tuip** (`@tuya-ui/components` y `@tuya-ui/tokens` instalados por tarball desde `../tuip/.local-packages/`).

## Qué expone el remote

`vite.config.ts` publica el remote con nombre `capacidad`, un solo expose y tres dependencias compartidas como singletons:

| Expose | Archivo | Qué es |
|---|---|---|
| `capacidad/module` | `src/module/CapacityModule.tsx` | El componente que el host monta bajo su ruta base. **Importa la hoja de estilos** (`src/styles/styles.css`): el CSS viaja con el expose y el host lo inyecta al cargarlo. Si sólo lo importara `main.tsx` (arranque standalone), el módulo correría bajo el host sin sus utilidades propias y las diferencias sólo se verían donde tuip o el host no traen la misma clase |

| Compartida | Versión exigida | Por qué |
|---|---|---|
| `react`, `react-dom` | 19.2.8 | Una sola copia de React: con dos, los hooks y el contexto se rompen |
| `react-router-dom` | 7.18.2 | El módulo define `<Routes>` relativas dentro del router del host |

tuip **no** se comparte: cada lado trae el suyo por tarball (las versiones pueden diferir). Las versiones exigidas son exactamente las del host; si se sube React o el router en un lado, hay que subirlo en el otro y en el `shared` de ambos `vite.config.ts`.

## Contrato de montaje

El host renderiza `CapacityModule` con estas props (`src/module/contract.ts`; el host tiene la interfaz equivalente, comparada estructuralmente por TypeScript — no hay paquete compartido):

| Prop | Tipo | Qué hace el módulo con ella |
|---|---|---|
| `source` | `{ getSession(): sesión; subscribe(onChange): () => void }` | Fuente de sesión del host, leída con `useSyncExternalStore`. `getSession` devuelve la misma referencia mientras la sesión no cambie. `HostAuthProvider` la adapta al contrato de sesión que consumen las pantallas |
| `acquireToken` | `(scopes: string[]) => Promise<string \| null>` | Token de acceso en silencio. El módulo lo pide para su API (`api://capacidad/access_as_user`) y lo adjunta en `httpClient` |
| `basePath` | `string` | Ruta bajo la que el host montó el módulo (`/capacidad`). Toda la navegación es relativa a ella |
| `topOffset` | `number` | Alto de la barra del host en px; `ModuleShell` de tuip coloca el sidebar debajo |

Con eso el módulo arma, en orden (`src/module/`):

1. **`CapacitySessionBridge`** — une la sesión del host con los permisos de sección: pide `acquireToken` al montar y en cada cambio de sesión, lee el claim `roles` del access token (payload del JWT sin validar firma: sólo informa la interfaz, la autorización real es del backend) y publica `permissions = mapCapacityRoles(roles)`. Sin token, permisos vacíos y ninguna pantalla en blanco. Mientras el primer token está en vuelo el contrato reporta `isLoading`.
2. **`CapacityShell`** — el único shell: sidebar con `ModuleShell` filtrado por permisos (`filterNav` + `features/capacity-shell/navigation.ts`), grupos vacíos ocultos, entrada activa por prefijo de ruta, breadcrumb en el encabezado del contenido. Sin barra superior, buscador ni campana.
3. **`CapacityRoutes`** — rutas planas relativas a `basePath` (`iniciativas`, `celulas`, `personas`, `ausencias`, `dedicacion`, `facturacion`, `competencias`, `sprints`, `parametros`, `habilidades`, `lineas`, `devops` y sus hijas), cada una detrás de `RequirePermission` con el permiso del mismo mapa que usa el menú. La raíz muestra la torre de control a quien tiene permisos de capacidad, el estado de la plataforma a quien sólo tiene permisos de configuración y el aviso de permisos al resto.

### Sesión, roles y permisos

- **Roles de plataforma** (`Plataforma.*`, ID token del host) deciden si el host muestra el módulo. El host sólo lo ofrece a `admin` y `chapter-lead`.
- **Permisos de sección** (`Capacidad.*`) son app roles de la app registration de la **API de Gestión de Capacidad**: viajan como sub-claims en el claim `roles` del access token de esa API. Catálogo y mapeo en `src/features/auth-session/capacityPermissions.ts`; una entrada del sidebar = un permiso ("Inicio" no exige ninguno).
- En desarrollo los siembra `pnpm entra:seed` del host en el emulador: Ana (administradora) los 12, Tomás (líder de expertise) los 7 de capacidad, Lucía (líder técnica) 4 — aunque hoy el host no le ofrece el módulo —, Rita ninguno.
- En tests se fabrica la sesión directamente con `deriveAuthSession` sobre `Session` (con `permissions`), sin token ni host.

## Correrlo: emulador + host + remote

El módulo se desarrolla **dentro del host**. Hacen falta tres procesos:

```bash
# 1. Emulador de identidad (una vez por máquina: confiar el certificado y sembrar; ver ../host/README.md)
cd C:\Repos\entra-local && pnpm dev              # https://localhost:8443

# 2. Este remote
cd C:\Repos\anto\frontend
pnpm install
pnpm dev                                         # http://localhost:4300/remoteEntry.js — con VITE_USE_MOCKS=true

# 3. El host, que carga el remote desde VITE_MF_CAPACIDAD_URL (.env.development ya apunta a 4300)
cd C:\Repos\anto\host && pnpm dev                # http://localhost:4400 → entrar a Gestión de Capacidad
```

Abrir `http://localhost:4300` directo sólo muestra una página que remite al host: el módulo real se ve en `http://localhost:4400/capacidad`. Para probar el módulo **solo, sin el trío**, hay dos caminos: `pnpm dev:mock` lo monta acá mismo con un host falso (sesión fija con todos los permisos + datos de MSW) en `http://localhost:4300/capacidad`, y **`../frontend-standalone`** es la versión independiente completa —login simulado con varios perfiles, barra propia, sin Module Federation— que corre en `http://localhost:4500` importando este mismo `src/` (ver su README). Los cambios de código del módulo se reflejan sin reiniciar el host (HMR del remote). El dev server anuncia sus assets con origen `http://localhost:4300` y acepta CORS, porque el host es otro origen.

Para verificar sobre un build (por ejemplo cuando el dev server hace pesadas las capturas del navegador): `VITE_USE_MOCKS=true vite build --mode development --outDir dist-smoke` y `vite preview --outDir dist-smoke` (mismo puerto 4300 y CORS, por `preview` en `vite.config.ts`).

```bash
pnpm test          # Vitest + cobertura (umbral 80 % en ramas, funciones, líneas y sentencias)
pnpm lint          # ESLint, 0 warnings — `pnpm format` corrige prettier + eslint
pnpm typecheck
pnpm build:prod    # emite dist/remoteEntry.js + mf-manifest.json; sin mocks ni mockServiceWorker.js
pnpm storybook     # http://localhost:6006
```

Los tests corren en jsdom y montan componentes y pantallas con un puerto de sesión falso (no cargan el remote); `src/module/__test__/` cubre el montaje del componente expuesto, el puente de sesión y las rutas por permiso.

## Mocks: dónde viven y cómo llegan al host

Mientras el backend no está cableado, los datos salen de **MSW** (`src/mocks/`, guía en `src/mocks/README.md`):

- **Tests**: `src/mocks/server.ts` arranca para toda la suite desde `vitest-setup.ts`.
- **Navegador, bajo el host**: `pnpm dev` fija `VITE_USE_MOCKS=true`; `CapacityModule` registra el worker (`src/mocks/browser.ts`) **contra el origen del host** — los service workers son por origen, así que el host sirve una copia de `public/mockServiceWorker.js` en su `public/` y el registro usa `${window.location.origin}/mockServiceWorker.js`. Los handlers usan paths relativos y funcionan igual en ambos modos.
- **Producción**: la condición `import.meta.env.VITE_USE_MOCKS === "true"` se resuelve en el build, la rama muere y ningún chunk de `src/mocks` entra al remote; `vite.config.ts` además borra `mockServiceWorker.js` del `dist` de producción.

## Estructura

```
src/
├── module/                 # Lo que el host monta: CapacityModule, contrato, puente de sesión, shell y rutas
├── main.tsx                # Arranque mínimo del dev server del remote (sólo remite al host)
├── app/providers/          # AuthContext (contrato de sesión) y tema
├── features/
│   ├── auth-session/       # Session, HostAuthProvider, deriveAuthSession, permisos de sección, filterNav
│   ├── capacity-shell/     # Navegación unificada del módulo (grupos, permisos por sección, títulos)
│   ├── chapter-lead-shell/ # LeadBreadcrumbContext (breadcrumb del contenido) y componentes del lead
│   ├── admin-shell/        # Componentes y mapa de permisos de las secciones de configuración
│   └── <feature>/          # adapters · components · hooks · models · services · index.ts
├── pages/                  # Una carpeta por pantalla; se cargan con lazy desde src/module/routes.tsx
├── shared/                 # httpClient (token por acquireToken), utilidades, componentes comunes
├── mocks/                  # MSW: handlers, server (tests) y browser (dev bajo el host)
└── styles/                 # Estilos globales (IBM Plex desde @fontsource, tokens de tuip)
```

Aliases: `@app`, `@features`, `@layouts`, `@pages`, `@shared` (`tsconfig.json` y `vite.config.ts`).

## Convenciones

- Una feature es autocontenida (`adapters/`, `components/`, `hooks/`, `models/`, `services/`) y expone sólo lo necesario en su `index.ts`.
- Pantalla nueva = carpeta en `src/pages/`, `lazy` en `src/module/routes.tsx` detrás de `RequirePermission`, y entrada en `features/capacity-shell/navigation.ts` con el permiso del mapa `CAPACITY_SECTION_PERMISSION`. Menú y guard leen del mismo mapa: si divergen, el menú ofrece pantallas que el guard niega.
- Endpoint nuevo = handler en `src/mocks/handlers/<feature>.handlers.ts` con el mismo path relativo que llama el `service`.
- **Enlace interno = `modulePath("celulas/7")`** (`src/shared/services/modulePath.ts`), nunca una ruta absoluta escrita a mano: la base (`/capacidad`) la decide el host y la registra el módulo al montarse. Un `"/capacidad/..."` o `"/app/lead/..."` literal es un enlace roto en potencia; los tests usan la base por defecto `/capacidad`.
- Commits con Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`…); Husky + Commitlint los validan.
- tuip se consume por tarball versionado: para tomar un cambio del design system hay que republicarlo con versión nueva (`pnpm run publish:local` en `../tuip`) y subir las dos rutas `file:` de `package.json`.

Los cambios de producto se planifican con OpenSpec desde la raíz del repo (`../openspec`); `frontend/openspec/` conserva las especificaciones de pantallas anteriores a la plataforma.
