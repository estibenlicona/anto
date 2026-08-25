## Why

La plataforma solo tiene hoy las páginas scaffold de la plantilla (login, dashboard vacío, home) y ningún layout ni navegación que reflejen el producto real. El mockup de referencia (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`) ya define la estructura visual completa por rol — sidebar, topbar, navegación agrupada por módulo, patrón de contenido por pantalla — pero aún no hay cuentas de usuario ni autenticación real en la plataforma (el login y el `AuthGuard` existentes son scaffold de plantilla, sin backend de identidad detrás). Antes de construir pantallas de negocio funcionales (p. ej. `add-squads-screen`), hace falta dejar el esqueleto de navegación y layout — para un solo rol, Admin de plataforma — construido con los componentes de `@tuya-ui/components` (skill tuip) y fiel al mockup, para que las pantallas de negocio se agreguen después sobre una base consistente.

## What Changes

- Nuevo layout de aplicación (sidebar + topbar + área de contenido) migrado de los componentes scaffold actuales de `MainLayout` a los componentes de `@tuya-ui/components`, replicando la estructura visual del mockup (marca, bloque de contexto, navegación agrupada por secciones, topbar con breadcrumb y avatar).
- Nueva navegación lateral para el rol **Admin de plataforma** con las 4 entradas del mockup: Inicio (Estado de la plataforma), Calendario de sprints, Parámetros del modelo, Conexión y job de ingesta — agrupadas igual que en `NAV.admin` del mockup.
- 4 páginas nuevas bajo `/app/admin/*`, cada una como **esqueleto**: encabezado (kicker + título + descripción) y estructura de layout (grids, cards) fiel al mockup, sin datos reales ni llamadas a backend — placeholders donde el mockup muestra datos moqueados.
- Sin selector de rol en la topbar: el rol Admin queda fijo para este alcance; el selector de rol (`lead` / `colab` / `admin`) del mockup queda fuera de este change.
- Rutas `/app/admin/*` **sin** `AuthGuard`: como todavía no hay cuentas de usuario ni autenticación real, este esqueleto no depende del guard existente. `AuthGuard`, `RoleGuard`, `LoginPage` y el resto del scaffold de autenticación no se tocan ni se eliminan — quedan intactos para cuando la autenticación real se implemente en un change posterior.
- Sin lógica de negocio, validaciones ni consumo de API en este change: las 4 páginas son estructura visual navegable, no funcionalidad.

**Fuera de alcance de este change:**
- Los roles Chapter Lead y Colaborador y sus navegaciones/pantallas — quedan para changes posteriores.
- El selector de rol de la topbar y cualquier mecanismo de cambio de rol.
- Autenticación y autorización reales (login funcional, `AuthGuard` con backend de identidad, autorización por rol) — punto abierto de dominio, no bloquea este esqueleto.
- Datos reales, formularios funcionales o integración con backend en las 4 pantallas de Admin (calendario de sprints, parámetros del modelo, conexión DevOps) — hoy el backend no expone esos endpoints.
- La pantalla de Células y cualquier otra pantalla de negocio — cubiertas por `add-squads-screen` y changes futuros, que seguirán su propio alcance de autenticación cuando corresponda.

## Capabilities

### New Capabilities
- `admin-shell`: esqueleto de layout, navegación y páginas placeholder para el rol Admin de plataforma, construido con componentes de `@tuya-ui/components` y fiel a la estructura visual del mockup v7.

### Modified Capabilities
(ninguna — no existen specs previas de layout/navegación en este repo)

## Impact

- **Frontend**: nuevo layout `frontend/src/layouts/AdminLayout/` (o migración de `MainLayout` a tuip, a decidir en design.md); nueva feature/estructura de navegación para Admin; 4 páginas nuevas bajo `frontend/src/pages/Admin*Page/`; nuevas rutas `/app/admin/*` en `frontend/src/app/router/routes.tsx` (sin `AuthGuard`); posible nuevo componente de sidebar/topbar reutilizable a partir de `@tuya-ui/components`.
- **Backend**: ningún cambio — este change no consume ningún endpoint.
- **Sin cambios de contrato de API.**
- **Sin cambios sobre `add-squads-screen`** ni sobre el scaffold de autenticación existente (`features/authentication`, `AuthGuard`, `RoleGuard`, `LoginPage`).
