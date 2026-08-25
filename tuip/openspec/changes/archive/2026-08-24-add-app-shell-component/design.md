## Context

Ver proposal.md — Why. El diseño visual está aprobado en el canvas "Tuya AppShell" (dos artboards, expandido y colapsado, con el colapso funcionando), calcado del sistema real: cabecera y barra de 56px, sidebar 248↔64px, filete `#E3E3E6` continuo, ítem activo con riel + fondo + peso.

Lo que condiciona el cómo, verificado en el fuente:

- **Las piezas para componer ya existen y están exportadas**: `Sidebar` acepta `collapsed` controlado, `onCollapsedChange` y `collapsible={false}` (oculta su franja inferior); `NavbarSearch` y `NavbarUtilities` son exports públicos con todos los contratos de la barra (utilidades, notificaciones, cuenta, paneles con slot único). `NavbarBrand` existe pero siempre renderiza cuadro + texto — no tiene modo sólo-cuadro.
- **La persistencia y el auto-colapso viven dentro de `Sidebar`** y sólo aplican en modo no controlado: clave `tuya-ui:sidebar-collapsed`, umbral `(max-width: 1119px)` reaccionando al evento `change` (no a un chequeo continuo, para no pelear la re-expansión manual).
- **El slot único de paneles de Navbar** (apps/notifications/account, uno abierto a la vez) vive en el estado de `Navbar`; `NavbarUtilities` recibe los `open`/`onOpenChange` desde afuera. AppShell tiene que reproducir ese pequeño orquestador.
- La app consumidora hoy no pasa `onSearch` ni `apps` — la barra del shell arranca sin búsqueda y la cabecera sin switcher.

## Goals / Non-Goals

**Goals:**

- Que el esqueleto de una app con navegación lateral sea una sola pieza que ya viene bien compuesta — la fusión no se rearma a mano en cada consumidor.
- Cero cambios de contrato en `Navbar` y `Sidebar`.

**Non-Goals:**

- No se agrega el switcher de apps ni notificaciones a la cabecera del sidebar (v1: marca + nombre).
- No se decide dónde va el breadcrumb: sigue siendo composición del consumidor dentro de `children`.
- No se deprecia `Navbar` ni `Sidebar` sueltos: siguen siendo las piezas para apps sin lateral / superficies sin barra.

## Decisions

- **`AppShell` es un componente nuevo que compone, no una variante de `Navbar`.** Alternativa considerada: props de acople (`Navbar attached`, `Sidebar header`) para que cada app siga armando la fusión. Se descarta porque la fusión tiene estado propio (colapso, persistencia, auto-colapso, orquestación de paneles) que cada consumidor tendría que recablear — exactamente el error que la pieza viene a eliminar. La composición interna reutiliza `Sidebar`, `NavbarSearch` y `NavbarUtilities` tal cual.
- **API**: `product`, `groups`/`activeId`/`onNavigate` (los de Sidebar), `user`/`userMenu`/`utilities`/`notifications`/`onSearch`/callbacks (los de Navbar), `defaultCollapsed?`, `density?`, `sidebarFooter?`, `ariaLabel?`, `children`. Sin `variant` oscuro en v1: el shell nace claro como la app que lo pide; el oscuro se suma con un caso real delante (misma decisión que tomó `Link` con los tonos).
- **La cabecera de marca la renderiza AppShell, no `NavbarBrand`**: necesita el modo sólo-cuadro al colapsar, y `NavbarBrand` no lo tiene. Se copia su anatomía exacta (cuadro 24px `bg-brand-bold` `rounded-control` + producto `text-body-sm font-semibold`) en la cabecera, con el comentario que remite a `NavbarBrand` como fuente de la forma. Extender `NavbarBrand` con un modo colapsado se evaluó y se descartó: metería un estado de AppShell en una pieza que no lo necesita suelta.
- **El colapso es estado de AppShell**: `useState` inicializado desde `defaultCollapsed ?? persistido`, hamburguesa lo alterna, se escribe a la clave `tuya-ui:sidebar-collapsed` — **la misma de Sidebar, a propósito**: la preferencia de la persona sobrevive a la migración de una app de Sidebar suelto a AppShell, y las dos piezas nunca conviven en la misma vista, así que compartir clave no crea carreras. El auto-colapso replica la técnica de Sidebar (matchMedia `change`, umbral 1119px). `Sidebar` se usa controlado (`collapsed` + `collapsible={false}`), así que su propia persistencia y auto-colapso quedan inertes — sin duplicación en runtime.
- **La hamburguesa**: botón de 36px con el ícono `menu` del set (20px), primer elemento de la barra con `aria-label` fijo ("Contraer navegación" / "Expandir navegación" según estado) y `aria-expanded` reflejando el estado. No es el `onMenuToggle` de `NavbarUtilities` (ése es el menú del modo angosto): es un control propio de AppShell.
- **El filete continuo**: cabecera del sidebar con `border-b` + `border-r`; la barra con `border-b`; el `Sidebar` de abajo conserva su `border-r`. Tres trazos del mismo token que se leen como dos líneas continuas — sin CSS nuevo ni cambios en Sidebar.
- **Orquestación de paneles**: AppShell replica el `openPanel` de `Navbar` (un solo panel abierto entre notificaciones y cuenta; sin apps en v1) y le pasa los `open`/`onOpenChange` a `NavbarUtilities`, igual que `Navbar` hace hoy. La limitación documentada de Radix (cambiar de panel toma dos activaciones) se hereda tal cual y se anota en la página de docs.

## Risks / Trade-offs

- **[La anatomía de la marca queda copiada en dos lugares (NavbarBrand y la cabecera de AppShell)]** → Copia mínima (dos elementos, cuatro clases) con comentario cruzado en ambos; si diverge, el visual lo delata en la página de docs donde ambos se ven. La alternativa (prop nueva en NavbarBrand) acoplaba más de lo que ahorra.
- **[Compartir la clave de almacenamiento con Sidebar significa que un cambio futuro del formato de esa clave rompe a los dos]** → La clave es un booleano serializado y estable desde que existe; el comentario en ambos archivos la declara contrato compartido.
- **[Dos maneras de armar una app con lateral (AppShell vs. composición manual) pueden convivir confundiendo]** → El criterio entra al spec como requisito propio con su escenario, y las guías de Navbar y Sidebar remiten a AppShell para el caso combinado.
- **[`NavbarUtilities` es export público pero su API se pensó para Navbar; usarla desde AppShell la vuelve contrato de dos consumidores]** → Ya era pública (el registry la distribuye); AppShell la consume con las mismas props que Navbar, sin pedirle nada nuevo.

## Migration Plan

Aditivo: `AppShell` se publica en un `MINOR` y nadie cambia hasta adoptarlo. La adopción en la app (ChapterLeadLayout/AdminLayout) es su propio change en el otro repo; su rollback es volver a componer Navbar + Sidebar sueltos, que siguen intactos.
