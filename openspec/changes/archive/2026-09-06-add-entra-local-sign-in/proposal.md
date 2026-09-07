## Why

El host sólo sabe autenticar contra Entra ID en la nube (`login.microsoftonline.com`) o con un simulador de sesión que no ejercita MSAL: hoy nadie ha visto el redirect flow real funcionar. `entra-local` (emulador MSAL-compatible de Entra ID, corriendo en `https://localhost:8443` desde `C:\Repos\entra-local`) permite recorrer ese flujo completo sin tenant, pero **no emite el claim `roles` para usuarios** — sólo para tokens de aplicación — y el host no admite otra autoridad. Queremos iniciar sesión contra el emulador **exactamente como se hará contra Entra en producción** (app roles asignados → claim `roles` → módulos visibles) con usuarios de prueba para cada rol, y retirar el simulador.

## What Changes

- **`entra-local` gana app roles de usuario** (rama nueva en el clon local, siguiendo sus convenciones: spec numerada en `specs/`, decisión en `memory/decisions.md`, tests unitarios y e2e):
  - App roles con `allowedMemberTypes` que incluya `User` (hoy el esquema sólo contempla `Application`).
  - **Asignaciones de rol** (usuario → rol, grupo → rol) persistidas, con endpoints del admin API y una sección en el detalle de la app del portal.
  - El **ID token y el access token delegado** llevan `roles` con los valores de los roles habilitados asignados a la persona, directamente o por sus grupos, sin duplicados; la vista previa de token del portal los muestra. El flujo app-only no cambia.
- **Host apunta a una autoridad configurable**: `VITE_ENTRA_AUTHORITY` y `VITE_ENTRA_KNOWN_AUTHORITIES` (opcionales; por defecto la nube con el tenant), para que el mismo build sirva contra el emulador y contra Entra real sin tocar código.
- **Tercer rol de negocio: Líder Técnico** — `Plataforma.TechLead` → `tech-lead` en `APP_ROLES` y en el mapeo de claims, con etiqueta en la cuenta. Nuevo módulo en el registro, **"Iniciativas y Células"** (`/iniciativas`), visible para admin, líder de expertise (`chapter-lead`) y líder técnico; **Gestión de Capacidad** sigue siendo para admin y líder de expertise (supuesto: el admin ve todo y el líder de expertise también gestiona iniciativas; el líder técnico sólo ve el módulo nuevo).
- **Semilla reproducible del directorio local**: `pnpm entra:seed` en `host/` crea de forma idempotente, contra el admin API del emulador, la app registration del host (SPA, redirect `http://localhost:4400/`), sus tres app roles, y usuarios de prueba — administradora, líder de expertise, líder técnico y una persona sin rol — con sus asignaciones; imprime los valores para `.env.development.local` (nunca los versiona).
- **BREAKING (sólo desarrollo): se elimina el simulador de sesión** (`src/dev/auth-simulator`, `pnpm dev:auth`, `VITE_AUTH_SIMULATOR` y su `define`). `pnpm dev` pasa a usar el emulador; los tests del host siguen usando el puerto de sesión falso (`fakeAuth`), que no dependía del simulador.
- Confianza del certificado autofirmado del emulador en la máquina de desarrollo (`pnpm start -- trust --apply`) y verificación manual de los tres roles en el navegador, documentadas en el README del host.
- `frontend/` no se toca: su `APP_ROLES` y su simulador siguen igual hasta el change que lo convierte en módulo del host.

## Capabilities

### New Capabilities
- `dev-identity-emulator`: lo que el emulador de identidad local debe ofrecer a la plataforma para reemplazar a Entra ID en desarrollo — app roles de usuario, asignaciones a usuarios y grupos, y el claim `roles` en los tokens de usuario, gestionables por su admin API.

### Modified Capabilities
- `platform-host`: la sesión con el proveedor admite una autoridad configurable (emulador o nube) manteniendo el mismo flujo; el requisito del simulador de sesión se retira; los roles de negocio incorporan al líder técnico y el registro de módulos distingue qué módulo ve cada rol.

## Impact

- **`host/`**: `features/entra/{entraConfig,msalSession}` (autoridad, `knownAuthorities`), `features/auth-session/{types,entraRoles}` y `layouts/hostIdentity` (rol `tech-lead`), `features/modules/registry` (módulo nuevo), `main.tsx`/`App.tsx`/`vite.config.ts`/`vite-env.d.ts`/`package.json` (sin simulador, script `entra:seed`), `scripts/entra-local-seed.mjs` (nuevo), `.env.example`, `README.md`; se borran `src/dev/` y sus tests.
- **`C:\Repos\entra-local`** (clon de `cmaneu/entra-local`, rama nueva): migración 003 (`app_role_assignments`), repositorio de apps, esquemas/DTO/rutas del admin API, `tokens/claims.ts` + resolución de claims de usuario, portal (`AppDetail`), spec y decisión propias, tests. Los cambios quedan en el clon; llevarlos a upstream es una decisión aparte.
- **Máquina de desarrollo**: certificado del emulador en el almacén raíz del usuario (el archivo `hosts` ya resuelve `*.entra.localhost`); `.env.development.local` del host con los IDs locales (no son secretos, pero tampoco se versionan).
- Dependencias: ninguna nueva en el host (`@azure/msal-browser` ya soporta `knownAuthorities`).
