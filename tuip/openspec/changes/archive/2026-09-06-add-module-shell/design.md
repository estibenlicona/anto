## Context

`AppShell` (`packages/components/src/app-shell.tsx`) ya resuelve todo lo que un módulo necesita — columna lateral a toda altura con cabecera de marca, `Sidebar` controlado con `collapsible={false}`, persistencia bajo `tuya-ui:sidebar-collapsed`, auto-colapso bajo 1120px — salvo por una decisión: su hamburguesa es el primer elemento de **su** `<header>`. En la plataforma que viene, esa barra es del host (`Navbar`) y el módulo no tiene ninguna, así que la hamburguesa se queda sin dónde vivir.

`Sidebar` suelto sí tiene un control de colapso propio, pero al pie ("Colapsar"/"Expandir", chevron, `sidebar.tsx:170-201`), sin cabecera de marca y sin la anatomía de hamburguesa de 36px que `AppShell` definió. No es lo mismo ni se ve igual.

`NavbarUtilities` (`navbar.tsx:402-495`) renderiza siempre `NotificationMenu`, con `notifications = []` por defecto: no hay forma de omitir la campana. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Que un módulo bajo un host pueda tener exactamente la misma columna lateral que tendría dentro de `AppShell`, sin barra, con el control de colapso que tuip ya diseñó para una columna sin barra: la franja al pie de `Sidebar`.
- Que `AppShell` y `ModuleShell` no puedan divergir en cómo persisten y auto-colapsan.
- Que un producto sin notificaciones pueda no mostrar la campana sin tocar nada más.

**Non-Goals:**
- Variante oscura de `ModuleShell` (igual que `AppShell`: nace clara).
- Control externo del colapso desde el host (el módulo es dueño de su colapso; si algún día el host necesita contraerlo, se agrega `collapsed`/`onCollapsedChange` como en `Sidebar`).
- Cambiar la anatomía de `Sidebar` suelto ni de su franja de colapso al pie.
- Ocultar otras zonas de `Navbar` (búsqueda ya se omite sin `onSearch`; utilidades ya aceptan `[]`).

## Decisions

1. **Componente nuevo (`ModuleShell`), no una prop `hideHeader` en `AppShell`.** Alternativa considerada: `AppShell` con `variant="module"` que oculte la barra y mueva la hamburguesa. Se descarta porque las props de `AppShell` que alimentan la barra (`user`, `userMenu`, `utilities`, `notifications`, `onSearch`…) serían obligatorias-pero-ignoradas en ese modo, y el requisito de `AppShell` dice literalmente que la hamburguesa vive en la barra; un componente con contrato propio y props sólo del módulo es más honesto y se documenta con su propio criterio de elección.

2. **El control de colapso es la franja al pie de `Sidebar`, en modo controlado; la columna no tiene cabecera.** Se probó primero una cabecera de marca como la de `AppShell` (cuadro + nombre del módulo) y **se descartó en pantalla**: bajo la barra del host, que ya muestra el producto y el módulo actual en el selector de apps, era un segundo título más chico. La columna empieza directamente por la navegación; el módulo se nombra sólo en `ariaLabel` del landmark, y `ModuleShell` no recibe `product`. `Sidebar` se usa con `collapsed`/`onCollapsedChange` y `collapsible` en su default (`true`): su franja de colapso — de borde a borde, chevron y rótulo "Colapsar"/"Expandir", con la zona activa que ya exige el requisito "Zona activa del control de colapso de Sidebar" — pasa a ser el control del módulo, y el estado lo gobierna el shell (persistencia y auto-colapso vía `useCollapsedNavigation`; en modo controlado `Sidebar` no persiste por su cuenta, como manda su requisito). Alternativa considerada y **descartada tras revisarla en pantalla**: una hamburguesa como primer elemento de la cabecera — sin barra al lado se veía fuera de lugar. Ventajas de la franja: es el control que tuip ya diseñó para una columna sin barra, no agrega anatomía nueva, y `footer` sigue teniendo su lugar (arriba de la franja, como en `Sidebar` suelto).

3. **`topOffset?: number` (px) para apoyarse bajo la barra del host.** Se aplica como `style={{ top: topOffset, height: \`calc(100vh - ${topOffset}px)\` }}` en el `<aside>` sticky, y `min-height` equivalente en el contenedor. Alternativa: una variable CSS (`--tuya-ui-shell-top`) que el host defina; se descarta porque acopla al host a un nombre de variable y oculta el contrato en CSS. Con `0` (default) la columna es idéntica a la de `AppShell`.

4. **La lógica de colapso se extrae a `src/lib/use-collapsed-navigation.ts`** (`useCollapsedNavigation(defaultCollapsed?)` → `{ collapsed, toggle }`, con lectura/escritura de `tuya-ui:sidebar-collapsed` y el `matchMedia("(max-width: 1119px)")` de `app-shell.tsx:118-144`) y `AppShell` pasa a consumirla. Refactor interno sin cambio de contrato; evita que las dos piezas diverjan. `sidebar.tsx` conserva su propia copia: ya tiene `useAutoCollapse` con la condición de modo no controlado, y unificar las tres es un refactor aparte.

5. **`showNotifications?: boolean` (default `true`) en `NavbarUtilitiesProps`, `NavbarProps` y `AppShellProps`.** En `false`, `NavbarUtilities` no renderiza el `NotificationMenu` ni su disparador. Alternativa: tratar `notifications === undefined` como "sin campana"; se descarta porque hoy el default es `[]` y `frontend/` no pasa la prop y sí muestra la campana — sería un cambio de comportamiento silencioso para un consumidor existente. El slot único de paneles no cambia: `"notifications"` simplemente nunca se abre.

6. **Versión `0.2.0`, MINOR.** Componente y prop nuevos, sin ruptura (`component-library-publishing`). Como `publish:local` sólo sube PATCH, la versión se fija a mano en `packages/components/package.json` antes de publicar; `@tuya-ui/tokens` recibe el PATCH automático que el script aplica siempre.

## Risks / Trade-offs

- [Dos cabeceras de 56px apiladas — la del host y la del módulo — pueden verse pesadas] → Es exactamente la anatomía de la fusión ya aprobada en `AppShell` (barra y cabecera de marca a la misma altura, filete continuo), sólo que ahora la barra la pone otro. Se valida en el ejemplo de docs "módulo bajo Navbar".
- [`calc(100vh - N)` con `topOffset` en viewports móviles con barra de navegador dinámica] → Mismo trade-off que `min-h-screen` en `AppShell`; se documenta `100dvh` como mejora posterior si aparece el caso.
- [Extraer el hook puede alterar `AppShell` sin querer] → Los tests existentes de `app-shell.test.tsx` (hamburguesa, persistencia, auto-colapso) deben seguir pasando sin cambios; son la red.
- [Un consumidor que ya pasaba `notifications` y ahora pasa `showNotifications={false}`] → Se documenta que `showNotifications` manda: con `false`, `notifications` se ignora.

## Migration Plan

Aditivo: `pnpm changeset` (minor), fijar `0.2.0`, `pnpm --filter @tuya-ui/components test`, `pnpm run publish:local`, y cada consumidor cambia sus dos rutas `file:` cuando quiera adoptarlo. `frontend/` no necesita moverse en este change. Rollback: los consumidores se quedan en `0.1.14`; nada de lo publicado los obliga a subir.
