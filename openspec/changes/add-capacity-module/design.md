## Context

Ver `proposal.md` — Why. Lo relevante para el cómo:

- **Versiones alineadas**: `react` 19.2.8, `react-dom` 19.2.8, `react-router-dom` 7.18.2 y `vite` 8.2.1 idénticos en `frontend/` y `host/`; `@module-federation/vite` 1.20.4 ya es dependencia del front. tuip: host 0.2.3 (con `ModuleShell`), front pineado al tarball 0.1.14 **que ya no existe** en `.local-packages` — subirlo es prerequisito de instalar.
- **Contratos ya construidos**: front `HostAuthProvider` + `HostSessionSource` (getSession con referencia estable + subscribe, leído con `useSyncExternalStore`); host `SessionStore` (misma forma) + `acquireToken(scopes)` en `HostAuth`; `mapCapacityRoles` y los guards por permiso del change anterior; `ModuleShell` de tuip (sidebar controlado, `topOffset`, colapso al pie, sin barra).
- **Front hoy**: router propio con `/auth/login`, `/app/admin/*` (AuthGuard rol admin + AppShell) y `/app/lead/*` (rol chapter-lead + AppShell); breadcrumb en la topbar (`LeadBreadcrumbProvider`); datos 100 % MSW (`VITE_USE_MOCKS`), worker en `public/mockServiceWorker.js`; simulador de sesión propio.
- **Host hoy**: `AuthGuard roles` por módulo → `ModulePlaceholderPage` en `/<basePath>/*`; barra de 56 px (`--tuya-ui-shell-top` esperado por `ModuleShell` vía `topOffset`).

## Goals / Non-Goals

**Goals:**
- Un solo navbar (del host), un solo origen de sesión, un solo sidebar del módulo decidido por permisos.
- El remote carga en runtime: deployar el módulo no rebuildea el host.
- Ciclo de desarrollo: emulador + host dev + remote dev, con HMR del módulo.

**Non-Goals:**
- Cablear el backend .NET real (los datos siguen en MSW; es su propio change).
- Convertir "Iniciativas y Células" (sigue placeholder).
- Colaborador/Product Owner, notificaciones, búsqueda.
- Federar tuip (cada lado trae el suyo por tarball; sólo react/router son singletons).

## Decisions

1. **`@module-federation/vite` en ambos lados; el front expone `./module`, el host lo consume como `capacidad/module`.** El expose es un componente (`CapacityModule`) y no un `mount()` imperativo: ambos lados son React con versiones idénticas y router compartible; un componente conserva el árbol de contexto del host (router incluido) y evita el doble bootstrap. `shared`: `react`, `react-dom`, `react-router-dom` como singletons con versión requerida estricta; tuip NO se comparte (los estilos ya vienen inyectados por cada bundle y las versiones difieren).
2. **Contrato de montaje = props del componente expuesto**: `{ source: HostSessionSource; acquireToken(scopes): Promise<string | null>; basePath: string; topOffset: number }`. Tipado duplicado a ambos lados del borde (interfaz estructural, sin paquete compartido — un paquete de contrato es más ceremonia que dos interfaces iguales que TypeScript compara estructuralmente). El módulo monta `HostAuthProvider source={source}` — el provider que esperaba este día.
3. **Router: el módulo usa `<Routes>` anidadas bajo el router del host.** El host ya tiene `<BrowserRouter>` (createBrowserRouter); el remote, al compartir `react-router-dom`, define `<Routes>` relativas dentro de la splat route `/<basePath>/*`. Se elimina el `createBrowserRouter` propio del front. `basePath` llega por prop para links absolutos donde hagan falta (breadcrumb, redirecciones).
4. **Shell interno con `ModuleShell`**: un layout nuevo del módulo (`CapacityShell`) con la navegación unificada — Inicio, Iniciativas, grupo Capacidad (Células, Personas, Ausencias, Dedicación, Facturación, Competencias), grupo Configuración (Sprints, Parámetros, Habilidades, Líneas), grupo DevOps (Ingesta) — construida fusionando los dos `navigation.ts` en `features/capacity-shell/navigation.ts` (mapa sección→permiso reutilizado; ids y etiquetas conservados). `topOffset` desde la prop. Breadcrumb: componente en el encabezado del contenido alimentado por el mismo `LeadBreadcrumbProvider` generalizado (renombrado del ámbito lead al módulo). Badge de Dedicación igual que hoy (condicionado a su permiso).
5. **Inicio único con contenido por permisos**: `/capacidad` renderiza la torre de control si `hasPermission("Celulas", "Personas", "Dedicacion")` (la home del lead) y, si no, el estado de la plataforma si tiene algún permiso de configuración; sin ningún permiso, el aviso de permisos. Evita dos "homes" en el menú y respeta el shell único.
6. **Permisos en runtime**: un provider del módulo (`CapacityPermissionsProvider`) pide `acquireToken(["api://capacidad/access_as_user"])` al montar y en cada cambio de sesión (suscripto a `source`), decodifica el payload del JWT (base64url, sin validar firma — lectura informativa; la autorización real es del backend) y publica `permissions = mapCapacityRoles(claims.roles)` dentro del contrato de sesión existente. Token ausente ⇒ permisos vacíos. En tests se fabrica la sesión con permisos directos, como hasta ahora.
7. **Rutas planas nuevas, redirecciones desde las viejas**: `/capacidad/{iniciativas,celulas,personas,ausencias,dedicacion,facturacion,competencias,sprints,parametros,habilidades,lineas,devops}` (+hijas actuales). Los guards reutilizan `RequirePermission`. Sin `/auth/login` ni AuthGuard de sesión: sin sesión el host nunca monta el módulo; el módulo igual muestra su aviso si el contrato reporta anónimo (estado transitorio).
8. **Mocks bajo el host en dev**: el worker de MSW se registra sólo cuando el build del remote es de desarrollo (misma condición `VITE_USE_MOCKS` del módulo, resuelta en su build) y el **host** sirve `public/mockServiceWorker.js` (copiado; el SW debe vivir en el origen del host). El registro pasa `serviceWorker.url` absoluto al origen actual. En producción la rama muere por `define`, como hoy.
9. **Host: carga perezosa con estados**: `RemoteModulePage` hace `React.lazy(() => import("capacidad/module"))` dentro de un error boundary con reintento (re-`lazy` al reintentar) y `Suspense` con un esqueleto bajo la barra; recibe el módulo del registro (`remoteEntry` desde `VITE_MF_CAPACIDAD_URL`; vacío ⇒ placeholder actual). El guard de rol del host no cambia.
10. **Scripts**: front pierde `dev:auth` y gana `dev` (servidor del remote con federation, puerto 4300) y `build:prod` del remote; el host documenta el trío emulador+host+remote. Los tests del front siguen corriendo standalone con jsdom (montan componentes, no el remote).

## Risks / Trade-offs

- [Singleton de React roto (dos copias → hooks rotos)] → `shared` con `singleton: true` y `requiredVersion` exacta en ambos configs; smoke verifica que no haya warning de MF en consola.
- [El dev server del front congela las capturas de Chrome (conocido)] → el smoke integrado usa builds + preview para verificación visual; el ciclo HMR se verifica aparte a mano.
- [Decodificar el access token en el cliente] → sólo informa el menú; el backend validará firma y roles. Documentado en el código del provider.
- [Rutas viejas guardadas por usuarios (`/app/lead/...`)] → redirecciones de `/app/admin/*` y `/app/lead/*` a sus equivalentes en `/capacidad/*` dentro del... el host no conoce esas rutas: se agregan al catch-all del host como redirecciones estáticas hacia el módulo. Riesgo bajo (app aún sin usuarios); si estorba, se retira.
- [Tests del front que montaban login/AppShell] → se reescriben contra `CapacityShell` + puerto falso; el volumen está acotado a routes/layouts/guards (las pantallas no cambian).
- [MSW interceptando chunks del remote en el origen del host] → el filtro del gateway ya excluye `destination !== ""` y `/assets/`; se añade el prefijo del remote si su URL de dev difiere.

## Migration Plan

1. tuip 0.2.3 en el front + `pnpm install` (destraba el pin roto) antes de tocar código.
2. Convertir el front a remote (borrando standalone) con sus tests en verde standalone (jsdom).
3. Consumir desde el host detrás de `VITE_MF_CAPACIDAD_URL` (sin la variable, placeholder — el host nunca queda roto).
4. Smoke integrado; recién entonces borrar los restos (pantallas de login, simulador) si algo se había dejado como puente.
5. Rollback: quitar la variable del remote en el host (vuelve el placeholder); el front conserva historia git para restaurar el standalone si hiciera falta.

## Open Questions

- URL de despliegue real del remote (CDN/ruta) — no bloquea: es un valor de `VITE_MF_CAPACIDAD_URL` por entorno.
