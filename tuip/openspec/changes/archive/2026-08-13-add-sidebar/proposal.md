## Why

Navbar identifica en qué producto está la persona; nada en el catálogo dice todavía qué puede hacer dentro de él. Cada app interna arma su propia navegación lateral desde cero, con su propio criterio de qué lleva contador, cuándo colapsar y cómo marcar la sección activa. El mockup `design-system/Sidebar Tuya.dc.html` fija ese componente: un solo nivel de profundidad, contadores solo para trabajo pendiente y ninguna sección que el usuario no pueda abrir.

## What Changes

- Agregar el componente `Sidebar` a `packages/components/src`: navegación lateral de un solo nivel, agrupada, con ítem activo marcado por tres señales a la vez (riel, fondo y peso — nunca solo color), contador opcional por ítem para trabajo pendiente, y un control de colapso (248px ↔ 64px) cuyo estado no controlado persiste en `localStorage` entre sesiones.
- Colapso automático por ancho: por debajo de 1120px, Sidebar se colapsa solo si nadie lo tiene en modo controlado.
- Reutilizar `Tooltip` (ya publicado) para el nombre del ítem al pasar el mouse sobre la variante colapsada — no se reimplementa.
- Documentación: página de contenido, ejemplos en vivo y entrada en el registro (categoría `layout`).

**Fuera de alcance** (explícito en las reglas "No" y en la sección de responsive del mockup): la transformación en drawer por debajo de 960px — el mockup la describe como comportamiento del *app shell* completo ("se convierte en drawer... disparado por el hamburguesa de la navbar"), no como algo que Sidebar deba detectar o renderizar por sí mismo. Sidebar expone su contenido; envolverlo en el `Drawer` ya publicado cuando la app lo decide es responsabilidad de quien arma el app shell, igual que Navbar nunca abrió ese menú lateral por su cuenta (`onMenuToggle` solo avisa). Subsecciones anidadas y botones de acción tampoco — el propio mockup los excluye explícitamente.

## Capabilities

### New Capabilities
(ninguna — Sidebar se agrega al catálogo ya existente)

### Modified Capabilities
- `component-library`: agrega Sidebar al catálogo de componentes instalables y sus requisitos propios (ítem activo con tres señales, reglas del contador, colapso persistente, colapso automático por ancho, accesibilidad, guía de uso).

## Impact

- Código nuevo: `packages/components/src/sidebar.tsx`.
- Sin cambios en componentes existentes — a diferencia de `add-navbar`, este change no necesita extender `Menu`/`NotificationMenu` ni ningún otro componente ya publicado.
- Registro: nueva entrada `sidebar` (categoría `layout`), dependencias `utils`, `icon`, `tooltip`.
- Documentación: `apps/docs/src/content/sidebar.tsx`, ejemplos en `apps/docs/src/examples/sidebar/*.tsx`, entrada en `apps/docs/src/content/index.ts`.
- Primer uso de `localStorage` en `packages/components/src` — sin precedente previo en el repo; el diseño lo documenta con guardas explícitas (sin `window`, almacenamiento deshabilitado).
- Sin cambios en `apps/docs/src/data/navigation.ts` ni `registry.ts` (derivan del registry regenerado).
