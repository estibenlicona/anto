## Why

La plataforma pasa a un host que es dueño de la barra superior (marca, selector de módulos, cuenta) y a módulos que son dueños de su navegación lateral. Ese reparto no lo puede expresar hoy ninguna pieza de tuip: `AppShell` fusiona barra y sidebar y pone la hamburguesa **en la barra**, así que un módulo que sólo tiene sidebar se queda sin control de colapso arriba; y `Navbar` siempre pinta la campana de notificaciones, que el host no va a ofrecer mientras no exista un servicio de notificaciones de plataforma.

## What Changes

- **`ModuleShell`** (nuevo, beta): la mitad "módulo" de `AppShell` — columna lateral a toda la altura disponible con la navegación de `Sidebar` en modo controlado, **sin cabecera de marca** (el título del producto y del módulo son de la barra del host; la columna empieza por la navegación y el módulo se nombra en `ariaLabel`), y **el control de colapso al pie de la columna**: la franja de borde a borde con chevron y rótulo que `Sidebar` ya trae suelto (sin hamburguesa: no hay barra propia donde ponerla). Se apoya debajo de la barra del host, con un desplazamiento superior configurable para que la columna quede pegada bajo esa barra y no debajo de la ventana. Mismo colapso persistente (misma clave que `Sidebar`/`AppShell`) y mismo colapso automático por ancho.
- **`Navbar`, `NavbarUtilities` y `AppShell` ganan `showNotifications`** (por defecto `true`): en `false` la campana y su panel no se renderizan. Sin cambio de comportamiento para quien no la pasa.
- **`AppShell` no cambia de contrato**: comparte con `ModuleShell` la lógica interna de colapso (persistencia y auto-colapso), extraída a un helper privado.
- Documentación: contenido y ejemplos de `ModuleShell`, ejemplo de `Navbar` sin campana, y la guía de elección actualizada: barra sola → `Navbar`; navegación lateral bajo la barra de otro (host) → `ModuleShell`; aplicación completa con ambas → `AppShell`; sólo navegación → `Sidebar`.
- Publicación **MINOR** (`0.2.0`): componente y prop nuevos sin romper lo existente. `publish:local` sube sólo PATCH, así que el MINOR se fija a mano antes.

## Capabilities

### New Capabilities

_(ninguna — `ModuleShell` entra al catálogo existente)_

### Modified Capabilities

- `component-library`: se agrega el requisito de `ModuleShell`; se modifica "Notificaciones en Navbar" para permitir omitir la campana; se modifica "Distinción de uso entre AppShell y Navbar con Sidebar sueltos" para incluir `ModuleShell` en el criterio de elección.

## Impact

- `packages/components/src/module-shell.tsx` (+ test), `src/app-shell.tsx` (refactor interno), `src/navbar.tsx` (`showNotifications` en `NavbarProps` y `NavbarUtilitiesProps`), `src/index.ts`, `registry/definitions.ts`.
- `apps/docs/src/content/module-shell.tsx`, `apps/docs/src/examples/module-shell/*`, `apps/docs/src/examples/navbar/NN-sin-notificaciones.tsx`, `content/navbar.tsx` y `content/app-shell.tsx` (guía de elección).
- `.changeset/add-module-shell.md` (minor), versión `0.2.0` de `@tuya-ui/components` (y el bump PATCH de `@tuya-ui/tokens` que `publish:local` hace de todos modos), tarballs nuevos en `.local-packages/`.
- Consumidores: el host nuevo (`host/`, change `add-platform-host` del openspec raíz) adopta `0.2.0`; `frontend/` sigue en `0.1.14` hasta su propio change de conversión a módulo.
