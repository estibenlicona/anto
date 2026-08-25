## 1. Navegación de Admin

- [x] 1.1 Crear `frontend/src/features/admin-shell/navigation.ts` (o equivalente) con las 4 entradas de `NAV.admin` (ruta, título, ícono, grupo), replicando el orden y agrupación del mockup.
- [x] 1.2 Crear el mapa de títulos/breadcrumb por ruta (equivalente a `TITLES` del mockup) para las 4 pantallas de Admin.

## 2. Layout de Admin

- [x] 2.1 Crear `frontend/src/layouts/AdminLayout/AdminLayout.tsx` con sidebar (`Sidebar` de `@tuya-ui/components`) que renderiza las entradas de navegación agrupadas y resalta la entrada activa según la ruta actual.
- [x] 2.2 Agregar topbar del `AdminLayout` con breadcrumb (`Breadcrumb` de `@tuya-ui/components`) que refleja el título de la pantalla activa, y avatar fijo del rol Admin — sin selector de rol.
- [x] 2.3 Montar `<Outlet />` en el área de contenido del `AdminLayout` para las 4 páginas.
- [x] 2.4 Escribir tests de `AdminLayout` cubriendo: render de las 4 entradas de navegación, resaltado de la entrada activa, y actualización del breadcrumb al cambiar de ruta.

## 3. Páginas placeholder de Admin

- [x] 3.1 Crear `frontend/src/pages/AdminHomePage/AdminHomePage.tsx` traduciendo `v-admin-home` del mockup (KPIs, tabla de configuración vigente, tarjeta de autenticación/autorización) con datos de ejemplo estáticos.
- [x] 3.2 Crear `frontend/src/pages/AdminSprintsPage/AdminSprintsPage.tsx` traduciendo `v-admin-sprints` (estructura de formulario de parámetros del sprint + tarjeta "¿Qué usa este calendario?"), sin lógica de guardado.
- [x] 3.3 Crear `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx` traduciendo `v-admin-parametros` (tablas de bandas de talla, mix de capacidades, pool de preguntas, versionado) con datos de ejemplo estáticos.
- [x] 3.4 Crear `frontend/src/pages/AdminDevOpsPage/AdminDevOpsPage.tsx` traduciendo `v-admin-devops` (pipeline de ingesta y tarjetas de conexión), con datos de ejemplo estáticos.
- [x] 3.5 Escribir tests de cada página verificando que el encabezado (kicker/título/descripción) y las secciones principales del mockup se renderizan.

## 4. Enrutamiento

- [x] 4.1 Agregar el grupo de rutas `/app/admin` en `frontend/src/app/router/routes.tsx` con `AdminLayout` como elemento padre (sin `AuthGuard`) y las 4 páginas como hijas (`lazy` igual que las páginas existentes), sin modificar el grupo `/app` ni las rutas de `add-squads-screen`.
- [x] 4.2 Verificar que navegar directamente a cada una de las 4 URLs (deep link) renderiza la pantalla correspondiente sin redirigir a `/auth/login`.
- [x] 4.3 Actualizar/crear tests de `routes.tsx` para cubrir el nuevo grupo `/app/admin`.

## 5. Verificación

- [x] 5.1 Ejecutar la suite de tests del frontend y confirmar que no hay regresiones en rutas, `MainLayout` ni la feature `authentication`.
- [x] 5.2 Recorrer manualmente las 4 pantallas en el navegador comparando contra el mockup (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`, rol Admin) para verificar fidelidad visual y de navegación.

## 6. Quitar el encabezado redundante por página

- [x] 6.1 Quitar el bloque kicker/título/descripción (`AdminPageHeader`) de las 4 páginas de Admin (`AdminHomePage`, `AdminSprintsPage`, `AdminParametersPage`, `AdminDevOpsPage`), dejando un `<h1>` `sr-only` con el título de la pantalla para accesibilidad.
- [x] 6.2 Actualizar los tests de las 4 páginas (y de `AdminPageHeader` si aplica) que verificaban el encabezado visible, para reflejar que el título ya no se muestra visualmente.

## 7. Espaciado del botón de acción en Calendario de sprints

- [x] 7.1 En `AdminSprintsPage`, separar el botón "Guardar configuración" del grid de inputs con un salto mayor al que separa los inputs entre sí (`gap-4`), siguiendo la regla de `foundations.md` del design system de tuip ("el salto dentro de un grupo va siempre por debajo del salto entre grupos").
- [x] 7.2 En `AdminSprintsPage`, quitar `disabled` de los 4 inputs de "Parámetros del sprint" para que queden editables (sin lógica de guardado real detrás, per spec).
- [x] 7.3 En `AdminSprintsPage`, alinear el botón "Guardar configuración" a la derecha del card (en vez de quedar pegado a la columna izquierda del grid de 2 columnas).
- [x] 7.4 Corregir `frontend/src/styles/styles.css`: el reset global `* { margin: 0; padding: 0; box-sizing: border-box; }` estaba sin envolver en `@layer`, por lo que — según las reglas de cascade layers de CSS — le ganaba a cualquier utilidad de margin/padding de Tailwind (que sí está en capas), sin importar su valor. Se movió dentro de `@layer base` para que la capa "utilities" (posterior a "base" en el orden de Tailwind) pueda sobrescribirlo como corresponde. Afectaba a toda la app, no solo a esta pantalla: verificado que ahora `mt-8` (7.1), `mb-4`, `mt-1` y el resto de utilidades de margin usadas en las 4 páginas de Admin y en `AdminLayout` se aplican correctamente.
- [x] 7.5 Cargar `AdminLayout` con `lazy()` en `frontend/src/app/router/routes.tsx` (igual que las 4 páginas de Admin), para que `@tuya-ui/components` y sus dependencias de Radix UI queden en un chunk aparte que solo se descarga al entrar a `/app/admin/*`, en vez de sumarse al bundle principal de toda la app. Bajó el chunk principal de 570 KB a 336 KB minificados.
