## Context

Ver proposal.md - Why. Hoy el frontend solo tiene el `MainLayout` scaffold de la plantilla (`Header`, `Sidebar`, `Footer` con markup y CSS propios, sin componentes de `@tuya-ui/components`) y ninguna navegación real. El mockup de referencia (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`) define en JS puro (`NAV.admin`, `TITLES`, `ROLE_META`) la estructura de navegación y el markup/CSS de cada pantalla de Admin (líneas ~1117-1290 del mockup: `v-admin-home`, `v-admin-sprints`, `v-admin-parametros`, `v-admin-devops`). El paquete `@tuya-ui/components` (linkeado en `frontend/package.json` desde `tuip/packages/components`) ya expone primitivas de layout y contenido relevantes: `sidebar.tsx`, `navbar.tsx`, `breadcrumb.tsx`, `avatar.tsx`, `card.tsx`, `badge.tsx`, `table.tsx`, `progress.tsx`, `empty-state.tsx`, `alert.tsx`.

`AuthGuard`, `RoleGuard`, `LoginPage` y la feature `authentication` ya existen como scaffold de plantilla pero no están conectados a un backend de identidad real — por eso este change no los usa ni los modifica.

## Goals / Non-Goals

**Goals:**
- Definir un layout de Admin (sidebar + topbar + contenido) construido sobre `@tuya-ui/components`, reemplazando el `MainLayout` scaffold solo para las rutas `/app/admin/*`.
- Definir la fuente de verdad de la navegación de Admin (lista estática de 4 entradas) y cómo se resalta la entrada activa según la ruta.
- Definir las 4 páginas placeholder y qué partes del markup del mockup se traducen a componentes de tuip vs. queda como estructura estática sin datos.
- Definir el punto de montaje de las rutas `/app/admin/*` en el router sin pasar por `AuthGuard`.

**Non-Goals:**
- No se decide el layout final para los roles Chapter Lead / Colaborador ni el selector de rol — quedan para changes posteriores que podrán reutilizar o ajustar este mismo layout.
- No se diseña ningún formulario funcional, validación ni llamada a API — las 4 pantallas son estructura estática.
- No se decide el mecanismo real de autenticación/autorización — fuera de alcance (ver proposal.md).
- No se toca `MainLayout` existente ni las rutas que ya lo usan (`/app/dashboard`) — quedan intactas para no interferir con `add-squads-screen`, que sigue asumiendo `AuthGuard` en su propio alcance.

## Decisions

**1. Layout nuevo y aislado (`AdminLayout`), no una modificación de `MainLayout`.**
`MainLayout` scaffold ya está referenciado por rutas existentes (`/app/dashboard`) y por el diseño de `add-squads-screen` (que asume `AuthGuard` + `MainLayout`). Reescribirlo in-place arriesgaría romper ese change ya planificado. Se crea `frontend/src/layouts/AdminLayout/AdminLayout.tsx`, construido desde cero con `Sidebar` y `Navbar`/`Breadcrumb` de `@tuya-ui/components`, sin heredar del `MainLayout` actual. Alternativa descartada: adaptar `MainLayout` para aceptar una navegación por rol vía props — se pospone hasta que exista un segundo rol real que lo justifique (evita abstraer prematuramente para un caso de uso único).

**1.1 Estructura de columnas: `Navbar` a todo el ancho arriba, `Sidebar` debajo de él (no lado a lado).**
El mockup v7 posiciona su `.topbar` únicamente en la columna de contenido (al lado del `.side`, no arriba de él) y aloja la marca dentro del propio sidebar. Se decidió apartarse de esa estructura por pedido explícito: `Navbar` (con la marca "Dimensionamiento TI") ocupa una fila completa en la parte superior, y debajo de ella una fila con `Sidebar` a la izquierda y el contenido (breadcrumb + página) a la derecha. Se prefirió este orden porque el `Sidebar` de tuip no expone un slot de marca/header propio — colocar el `Navbar` (que sí lo tiene) arriba de todo evita una marca "flotando" al lado del sidebar sin conexión visual clara con él.

**2. Navegación como configuración estática en código, no datos de backend.**
La lista de 4 entradas (`ruta`, `título`, `ícono`, `grupo`) se define como un arreglo TypeScript en el propio layout o en un módulo `admin-shell/navigation.ts`, replicando `NAV.admin` del mockup. No hay endpoint de navegación ni de permisos que la genere dinámicamente — no existe ese backend y no es necesario para un solo rol fijo.

**3. Resaltado de entrada activa vía `react-router-dom` (`useLocation`/`NavLink`), no estado propio.**
Se usa el mecanismo estándar de coincidencia de ruta de React Router (ya es dependencia del proyecto) en vez de mantener un `activeView` en estado local — evita duplicar lo que la URL ya representa como fuente de verdad, y hace que la navegación por URL directa (deep link) funcione igual que el clic en el menú.

**4. Cada pantalla es un componente de página independiente con estructura estática (cards/grids/tablas con datos hardcodeados de ejemplo), no una sola pantalla parametrizada.**
Se crean 4 componentes (`AdminHomePage`, `AdminSprintsPage`, `AdminParametersPage`, `AdminDevOpsPage`) bajo `frontend/src/pages/`, cada uno traduciendo la sección correspondiente del mockup (`v-admin-home`, `v-admin-sprints`, `v-admin-parametros`, `v-admin-devops`) a JSX con componentes de tuip (`Card`, `Table`, `Badge`/`pill`, `Progress` donde aplique) y valores estáticos de ejemplo iguales o equivalentes a los del mockup. Alternativa descartada: una sola pantalla genérica configurada por datos — innecesario para 4 pantallas con estructuras visuales distintas entre sí (tablas vs. formulario vs. pipeline).

**5. Rutas `/app/admin/*` montadas fuera de `AuthGuard`, en un nuevo grupo del router.**
En `frontend/src/app/router/routes.tsx` se agrega un grupo `/app/admin` con `AdminLayout` como elemento padre y las 4 páginas como hijas, **sin** envolver con `AuthGuard` (a diferencia del grupo `/app` existente). El grupo `/app` existente y `AuthGuard` no se modifican. Cuando la autenticación real exista, un change posterior decidirá cómo proteger estas rutas.

**6. Mapeo de nombres de ruta.**
Se usan slugs en español legibles, alineados a los `id` de vista del mockup: `/app/admin` (home), `/app/admin/sprints`, `/app/admin/parametros`, `/app/admin/devops`.

**7. Sin bloque de encabezado por página (kicker/título/descripción) — la orientación viene del sidebar y el breadcrumb.**
El mockup repite el título y la categoría de cada pantalla en un encabezado propio (kicker + `<h1>` + descripción), útil para explicar la pantalla durante la etapa de MVP pero redundante en un producto terminado: la entrada activa del `Sidebar` ya nombra la pantalla y su grupo, y el `Breadcrumb` del `AdminLayout` ya muestra "Administración / <título de la pantalla>". Se retira `AdminPageHeader` de las 4 páginas. Para no perder el landmark de encabezado para lectores de pantalla (cada página seguía necesitando un `<h1>` accesible, aunque no se muestre visualmente), cada página conserva un `<h1>` con clase `sr-only` con el mismo texto que el breadcrumb.

## Risks / Trade-offs

- **[Riesgo] Duplicar estructura de layout entre `AdminLayout` y `MainLayout`** (sidebar/topbar similares pero no compartidos) → Mitigación: aceptado como trade-off explícito (Decisión 1) para no acoplar este change a `add-squads-screen`; si un change futuro consolida ambos layouts, se hace como refactor explícito con su propio design.md.
- **[Riesgo] Rutas de Admin sin ningún guard** quedan abiertas a cualquiera que conozca la URL mientras no exista autenticación real → Mitigación: aceptado explícitamente por el alcance del change (ver proposal.md "Why"); no hay datos reales ni acciones destructivas detrás de estas pantallas todavía.
- **[Trade-off] Datos de ejemplo hardcodeados en cada página** quedarán obsoletos frente al mockup si este cambia → aceptable porque el objetivo es la estructura visual, no mantener paridad continua con el mockup.
- **[Riesgo, ya corregido] El reset global de `styles.css` anulaba las utilidades de margin/padding de Tailwind en toda la app** — `* { margin: 0; padding: 0 }` estaba fuera de cualquier `@layer`, y por las reglas de cascade layers un selector sin capa le gana a cualquier regla en capa sin importar su especificidad o valor. Solo "sobrevivían" por accidente las utilidades que también aparecían en el CSS pre-compilado de tuya-ui (unas también sin capa, con mayor especificidad que `*`); el resto — como `mt-8` en `AdminSprintsPage` — quedaba en 0 en silencio. Corregido moviendo el reset a `@layer base` (tarea 7.4). Pre-existía en el scaffold del frontend, no es específico de este change, pero recién se hizo visible al ser esta la primera pantalla que depende de utilidades de margin de Tailwind.
