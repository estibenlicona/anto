## Why

La plataforma va a componerse de un host y módulos independientes, cada uno dueño de su navegación lateral. Hoy no existe ese host: `frontend/` es una SPA standalone que trae su propia barra, su login legacy de plantilla y una sesión que espera de un host que nadie construyó — en producción nadie puede entrar. Este change crea el host: la barra superior común, la entrada a los módulos y la sesión con Entra ID, para que el change siguiente pueda convertir `frontend/` en un módulo que se monte debajo.

## What Changes

- **Proyecto nuevo `host/`** (hermano de `frontend/`, `backend/` y `tuip/`): React 19 + Vite + TypeScript con la misma cadena de herramientas que `frontend/` (Vitest, ESLint flat config, Prettier, alias de rutas, `.npmrc`), consumiendo tuip **`0.2.3`** por tarball (`file:../tuip/.local-packages/…`), con IBM Plex y `data-theme` fijo en claro.
- **Barra superior de la plataforma** con `Navbar` de tuip (variante clara, la misma que usa hoy el shell del front): marca "Dimensionamiento TI", **selector de módulos** (los que el rol de la persona permite, con el actual marcado), enlace "Ayuda" y **menú de cuenta** con nombre, rol y "Cerrar sesión". **Sin campana de notificaciones** (`showNotifications={false}`, prop nueva de tuip), sin búsqueda, sin hamburguesa y **sin navegación lateral**: el sidebar es de cada módulo.
- **Portal de módulos** en `/`: tarjetas con los módulos disponibles para el rol; entrar navega a la ruta base del módulo. Cada módulo se declara en un registro por configuración (id, nombre, descripción, color, ruta base, roles). Mientras un módulo no esté integrado, su ruta muestra un marcador "pendiente de integrar" — Module Federation **no** se cablea en este change.
- **Sesión con Entra ID** vía MSAL (redirect flow), parametrizada por variables de entorno (`VITE_ENTRA_CLIENT_ID`, `VITE_ENTRA_TENANT_ID`, `VITE_ENTRA_API_SCOPES`, `VITE_ENTRA_REDIRECT_URI`); roles desde los claims del token mapeados a los roles de negocio; sin configuración, error explícito en vez de pantalla en blanco. El host adopta el **mismo contrato de sesión** que `frontend/src/features/auth-session` (`Session`, `AppRole`, `HostSessionSource`) y le agrega las acciones que un host sí tiene: iniciar y cerrar sesión, y obtener un token para un conjunto de scopes.
- **Simulador de sesión** sólo en desarrollo (`VITE_AUTH_SIMULATOR=true`), copiado del front con sus perfiles con forma de claims de Entra, excluido del build de producción con el mismo mecanismo.
- **Fuente de sesión para módulos** (`HostSessionSource` con referencia estable y suscripción) implementada y probada ya, aunque ningún módulo la consuma todavía: es la mitad del contrato host↔módulo que no depende de Module Federation.
- Protección de rutas: sin sesión → inicio de sesión; con sesión pero sin rol para un módulo → aviso de permisos.

## Capabilities

### New Capabilities
- `platform-host`: la barra superior común de la plataforma, el portal y el registro de módulos, la sesión con Entra ID (con simulador en desarrollo), el contrato de sesión que el host entrega a los módulos, y la protección de acceso por sesión y rol.

### Modified Capabilities
_(ninguna — `frontend/` y sus capabilities no se tocan en este change)_

## Impact

- Nuevo directorio `host/` con `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc`, `.npmrc`, `.env.development`/`.env.example`, `index.html`, `src/` (app, features/auth-session, features/entra, features/modules, dev/auth-simulator, layouts, pages, shared) y tests.
- Dependencias nuevas: `@azure/msal-browser`, `@azure/msal-react`, `@tuya-ui/components@0.2.3`, `@tuya-ui/tokens`, `@fontsource/ibm-plex-*`, `react-router-dom`.
- Depende de que `tuip` publique `0.2.3` (partió como 0.2.0; `publish:local` sube PATCH en cada publicación) (change `add-module-shell` en `tuip/openspec`) por `showNotifications`; `ModuleShell` lo consumirá el change de conversión de `frontend/`, no este.
- `frontend/` y `backend/` no cambian. Las app registrations de Entra (Client ID, Tenant ID, app roles, scopes) no existen todavía: el host queda listo para configurarse y se prueba con el simulador hasta que existan.
