# Host de la plataforma — Dimensionamiento TI

El host es la barra superior común de la plataforma, la entrada a los módulos según el rol de la persona, la sesión con el proveedor de identidad y el **contenedor de los módulos federados**: cada módulo es un remote de Module Federation que el host carga en tiempo de ejecución bajo su ruta base y al que entrega la sesión. **No trae navegación lateral**: el sidebar es de cada módulo (con `ModuleShell` de tuip). **No trae campana de notificaciones**: se incorporará cuando exista un servicio de notificaciones de plataforma.

Stack: React 19 + Vite + TypeScript, `@module-federation/vite` + `@module-federation/runtime`, Vitest, ESLint flat config, Prettier; design system **tuip** (`@tuya-ui/components` por tarball desde `../tuip/.local-packages/`); MSAL (`@azure/msal-browser` + `@azure/msal-react`) contra Entra ID o contra **entra-local**, el emulador local.

## Correrlo

En desarrollo el host inicia sesión contra **entra-local** (`C:\Repos\entra-local`), un emulador MSAL-compatible de Entra ID, y carga el módulo de Gestión de Capacidad desde su dev server. Son tres procesos; los pasos 1 y 2 se hacen una sola vez por máquina.

```bash
# 1. Levantar el emulador y confiar su certificado autofirmado (una vez)
cd C:\Repos\entra-local
pnpm dev                                             # https://localhost:8443, queda corriendo
certutil -user -addstore -f Root data\tls\cert.pem   # aceptar el aviso de Windows
# (equivalente: pnpm start -- trust --apply; hosts ya resuelve *.entra.localhost)
# Levantarlo con `pnpm dev` (código fuente): el `dist` puede estar viejo y sin rutas
# que la semilla necesita (asignaciones de roles).

# 2. Sembrar el directorio de prueba de la plataforma (idempotente)
cd C:\Repos\anto\host
pnpm install
pnpm entra:seed        # crea las apps "Plataforma Host" y "Gestión de Capacidad API",
                       # los roles, los permisos de sección y las personas, e imprime
                       # el bloque para .env.development.local

# 3. Desarrollar: el remote de Gestión de Capacidad y el host
cd C:\Repos\anto\frontend && pnpm dev   # http://localhost:4300/remoteEntry.js (con mocks)
cd C:\Repos\anto\host && pnpm dev       # http://localhost:4400 — inicia sesión contra el emulador
```

`.env.development` ya apunta `VITE_MF_CAPACIDAD_URL` al dev server del remote; sin el remote corriendo, `/capacidad` muestra el aviso "no pudo cargarse" con "Reintentar". Los cambios del módulo se reflejan sin reiniciar el host.

```bash
pnpm test        # Vitest + cobertura (umbral 80 %)
pnpm lint        # ESLint (0 warnings) — `pnpm format` corrige prettier/eslint
pnpm typecheck
pnpm build:prod
```

Para verificar sobre builds en vez del dev server (el dev server de Vite hace pesadas las capturas del navegador): `vite build --mode development --outDir dist-smoke` en `frontend/` (con `VITE_USE_MOCKS=true`) y en `host/`, y `vite preview --outDir dist-smoke` en cada uno — el remote en 4300 y el host en **4400**, que es la redirect URI registrada en el emulador.

Sin `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID`, el host muestra un error que nombra la variable faltante en vez de una pantalla en blanco.

## Variables de entorno

| Variable | Qué es |
|---|---|
| `VITE_BASE_PUBLIC_URL` | Base pública de la app (`/` en la raíz del dominio). |
| `VITE_ENTRA_CLIENT_ID` | Client ID de la app registration del host (cliente SPA). |
| `VITE_ENTRA_TENANT_ID` | Tenant ID o dominio del directorio. |
| `VITE_ENTRA_AUTHORITY` | Autoridad completa (URL con tenant). **Vacía: la nube de Entra** — contra Entra real basta con omitirla. Para el emulador: `https://login.entra.localhost:8443/<tenant>`. |
| `VITE_ENTRA_KNOWN_AUTHORITIES` | Hosts de autoridades no-Microsoft separados por espacio. Vacía con autoridad explícita: se deriva de su URL. |
| `VITE_ENTRA_REDIRECT_URI` | URI de retorno registrada. Vacío: origen + base. |
| `VITE_ENTRA_API_SCOPES` | Scopes del token de acceso, separados por espacio. Vacío: la sesión no lleva token. |
| `VITE_MF_CAPACIDAD_URL` | URL del `remoteEntry.js` de Gestión de Capacidad. **Vacía: la ruta muestra el placeholder** "pendiente de integrar" — el host nunca queda roto por un remote ausente. Desarrollo: `http://localhost:4300/remoteEntry.js`; en cada entorno, la URL donde se despliegue el remote (es un valor por entorno, no de build del host). |

Los valores reales van en `.env.development.local` (ignorado por git) o en el despliegue; `pnpm entra:seed` imprime los del emulador.

## Sesión y roles

- El host es el único que inicia y cierra sesión (redirect flow de MSAL). La autoridad es configurable: la nube de Entra por defecto, el emulador local con las dos variables de arriba — mismo código, mismo flujo. "Cerrar sesión" en la barra sale del módulo que esté montado.
- Los **roles de negocio** salen del claim `roles` del ID token, mapeados en `src/features/auth-session/entraRoles.ts`:

| App role en el directorio | Rol de negocio | Módulos que ve |
|---|---|---|
| `Plataforma.Admin` | `admin` (Administrador de plataforma) | Gestión de Capacidad · Iniciativas y Células |
| `Plataforma.ChapterLead` | `chapter-lead` (Líder de Expertise) | Gestión de Capacidad · Iniciativas y Células |
| `Plataforma.TechLead` | `tech-lead` (Líder Técnico) | Iniciativas y Células |

- Personas de prueba que siembra `pnpm entra:seed` (el emulador pide sólo el correo, sin contraseña): **Ana Administradora** (`ana.admin@tuya.local`, admin), **Tomás Giraldo** (`tomas.giraldo@tuya.local`, líder de expertise), **Lucía Técnica** (`lucia.tecnica@tuya.local`, líder técnica) y **Rita Restringida** (`rita.restringida@tuya.local`, sin rol: portal vacío y "Sin permisos").
- Los permisos internos de cada módulo viven en la app registration de **su** API y viajan en el token que el módulo pide con `acquireToken(scopes)`; el host no los acumula. Para Gestión de Capacidad son los app roles `Capacidad.*` de la app "Gestión de Capacidad API" (`api://capacidad`): Ana los 12, Tomás 7, Lucía 4, Rita ninguno.
- Contrato de sesión (`src/features/auth-session/types.ts`): `Session`, `AppRole`, `HostSessionSource` — el mismo que consume `frontend/` — más las acciones del host (`login`, `logout`, `acquireToken`). La sesión vive en un `SessionStore` con referencia estable y suscripción; es lo que se entrega a cada módulo como `source`.

## Módulos federados

`src/features/modules/registry.ts` es el registro: id, nombre, descripción, color, ruta base, roles admitidos y, opcionalmente, `remoteEntry`. Con `remoteEntry`, la ruta `/<basePath>/*` monta `RemoteModulePage` (`src/pages/RemoteModulePage.tsx`); sin él, `ModulePlaceholderPage` ("pendiente de integrar"). "Iniciativas y Células" sigue en placeholder.

`RemoteModulePage`:

1. registra el remote en el runtime de federation una sola vez (`registerRemotes`, `type: "module"` porque el remote de Vite es un módulo ES) y lo carga perezosamente con `loadRemote("<id>/module")` dentro de `React.lazy`;
2. muestra "Cargando <módulo>…" bajo la barra mientras llega (`Suspense`);
3. si la carga falla, un error boundary muestra bajo la barra intacta un aviso con **Reintentar**, que recrea el `lazy` y vuelve a pedir el remote;
4. renderiza el componente con el **contrato de montaje**:

| Prop | Valor |
|---|---|
| `source` | `auth.source` — `HostSessionSource` del `SessionStore` (`getSession` con referencia estable + `subscribe`) |
| `acquireToken` | `auth.acquireToken` — token de acceso por scopes, en silencio; `null` si no se puede |
| `basePath` | la ruta base del registro (`/capacidad`) |
| `topOffset` | `HOST_BAR_HEIGHT` (56 px), para que el `ModuleShell` del módulo empiece debajo de la barra |

El tipo de esas props (`FederatedModuleProps`) está duplicado a propósito en el host y en cada módulo: cuatro campos no ameritan un paquete compartido y TypeScript los compara estructuralmente.

`vite.config.ts` declara el host como consumidor (`federation({ name: "host", remotes: {} })`) con `react`, `react-dom` y `react-router-dom` compartidos como singletons con versión exigida exacta (19.2.8 / 7.18.2): los remotes deben exigir las mismas. tuip no se comparte (cada lado trae el suyo). El router es el del host: los módulos definen `<Routes>` relativas dentro de `/<basePath>/*`.

Rutas de cortesía: `/app/admin/*` y `/app/lead/*` (la app anterior) redirigen a `/capacidad`.

### Montar un módulo federado nuevo

1. En el módulo: `@module-federation/vite` con un `name` propio, `exposes: { "./module": <componente que recibe las props del contrato> }`, `filename: "remoteEntry.js"`, mismo `shared` que el host; su servidor de desarrollo con `cors: true` y `server.origin` absoluto (el host es otro origen).
2. En el host, agregá la entrada al registro leyendo la URL de una variable de entorno:

```ts
{
  id: "mi-modulo",
  name: "Mi Módulo",
  description: "Qué resuelve, en una frase.",
  color: "#0F62FE",
  basePath: "/mi-modulo",
  roles: ["admin"], // omitido: cualquier persona con sesión
  ...(env.VITE_MF_MI_MODULO_URL?.trim() ? { remoteEntry: env.VITE_MF_MI_MODULO_URL } : {}),
}
```

3. Declará la variable en `src/vite-env.d.ts`, `.env.example` y `.env.development` (URL del dev server del remote). `RemoteModulePage` funciona para cualquier entrada del registro: `loadRemote("<id>/module")` usa el `id` como nombre del remote, así que el `name` del plugin en el módulo debe ser ese mismo `id`.
4. Si el módulo usa mocks de MSW en desarrollo, ver la sección siguiente.

Con eso el módulo aparece en el portal y en el selector de la barra para quien tenga el rol; sin la variable, su ruta muestra el placeholder.

## El worker de mocks en desarrollo

Gestión de Capacidad sirve sus datos con MSW hasta que se cablee el backend. Un service worker sólo puede registrarse desde su propio origen, y el módulo corre en la página del host: por eso `public/mockServiceWorker.js` es una **copia** de `frontend/public/mockServiceWorker.js` (nota de origen al inicio del archivo) y el módulo lo registra como `${window.location.origin}/mockServiceWorker.js`. Si el módulo regenera su worker, hay que volver a copiarlo.

Es cosa de desarrollo: `vite.config.ts` lo borra del build de producción del host, y el módulo sólo intenta registrarlo cuando su propio build es de desarrollo (`VITE_USE_MOCKS=true`, que fija su script `dev`). Un remote de producción no lo pide.

## Pendiente

- Primer inicio de sesión real contra Entra en la nube cuando existan Client/Tenant ID y app roles (contra el emulador el flujo completo se verifica con `pnpm dev`).
- URL de despliegue del remote de Gestión de Capacidad por entorno (`VITE_MF_CAPACIDAD_URL`).
- Convertir "Iniciativas y Células" en remote (hoy placeholder).
