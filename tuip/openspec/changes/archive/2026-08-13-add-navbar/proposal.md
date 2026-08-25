## Why

Cada app interna de Tuya arma su propia barra superior desde cero, así que quien salta de una app a otra reaprende dónde está la marca, la búsqueda y el menú de cuenta cada vez. El mockup `design-system/Navbar Tuya.dc.html` fija esa barra como pieza única e idéntica en todas las pantallas de todas las apps: identifica dónde está la persona, hacia dónde puede ir y quién es, en un componente de 56px de alto que nunca compite con el contenido.

## What Changes

- Agregar el componente `Navbar` a `packages/components/src`: barra superior con tres zonas fijas (marca de producto + selector de apps a la izquierda, búsqueda global al centro, utilidades + notificaciones + cuenta a la derecha), variantes `dark`/`light`, y un breakpoint compacto (< 960px) con altura reducida y búsqueda colapsada a ícono.
- Componer, no reimplementar: el panel de notificaciones reutiliza `NotificationMenu`/`NotificationMenuHeader`/`NotificationMenuList`/`NotificationMenuItem`/`NotificationMenuFooter`, y el panel de cuenta reutiliza `Menu`/`MenuItem`/`MenuSeparator`, ambos ya publicados.
- **Extender `Menu` y `NotificationMenu`** con un modo controlado opcional (`open`/`onOpenChange`, backward-compatible — sin esas props, ambos siguen no controlados exactamente como hoy). Navbar los necesita para la regla "un solo panel abierto a la vez" del mockup (abrir el selector de apps, las notificaciones o el menú de cuenta cierra cualquier otro que estuviera abierto), que ningún componente existente resuelve por sí solo.
- El selector de apps interno (marca de producto → lista de apps del usuario) es una pieza nueva, propia de Navbar — no hay un componente publicado cuya forma (ícono cuadrado de color + nombre + descripción + etiqueta "actual") se le parezca lo suficiente para reutilizar.
- Documentación: página de contenido, ejemplos en vivo (variantes dark/dark con notificaciones/light/compact) y entrada en el registro (categoría `layout`).

**Fuera de alcance** (explícito en las reglas "No" del mockup): el menú lateral que el botón hamburguesa de la variante compacta abre — es un componente aparte (`design-system/Sidebar Tuya.dc.html` existe como mockup independiente, no cubierto por este change); la UI del command palette que dispara `onSearch`; navegación de secciones y botones de acción primaria, que el propio mockup dice que no viven en la barra.

## Capabilities

### New Capabilities
(ninguna — Navbar se agrega al catálogo ya existente)

### Modified Capabilities
- `component-library`: agrega Navbar al catálogo de componentes instalables y sus requisitos propios de comportamiento (zonas fijas, coordinación de paneles, accesibilidad, comportamiento responsive). También amplía el contrato de `Menu` y `NotificationMenu` para admitir apertura controlada — ninguno de los dos cambia su comportamiento por defecto.

## Impact

- Código nuevo: `packages/components/src/navbar.tsx`.
- Código modificado: `packages/components/src/menu.tsx` y `packages/components/src/notification-menu.tsx` (prop `open`/`onOpenChange` opcional, aditiva).
- Registro: nueva entrada `navbar` (categoría `layout`), dependencias `utils`, `icon`, `avatar`, `menu`, `notification-menu`.
- Documentación: `apps/docs/src/content/navbar.tsx`, ejemplos en `apps/docs/src/examples/navbar/*.tsx`, entrada en `apps/docs/src/content/index.ts`.
- Sin cambios en `apps/docs/src/data/navigation.ts` ni `registry.ts` (derivan del registry regenerado).
