## Context

`design-system/Sidebar Tuya.dc.html` es la fuente autoritativa de anatomía, estados, contadores, responsive y accesibilidad — mismo formato de demo `.dc.html` que `Navbar Tuya.dc.html` (React de juguete, colores en hex crudo, tabla de API ilustrativa). Su propia introducción lo posiciona como el complemento de Navbar ya archivado: "la navbar dice en qué producto estás; el sidebar dice qué puedes hacer dentro".

A diferencia de `add-navbar`, este change no necesita extender ningún componente existente — reutiliza `Tooltip` tal cual está publicado, sin tocarlo.

## Goals / Non-Goals

**Goals:**
- Un componente `Sidebar` de una sola pieza, data-driven (`groups`), igual que Navbar — el propio mockup lo usa como `<Sidebar groups={...} activeId={...} onNavigate={...} collapsible />`, sin sub-componentes expuestos.
- Reutilizar `Tooltip` para el nombre del ítem en la variante colapsada.
- Todo color y medida sale de un token o de la escala estándar de Tailwind ya usada en el resto del catálogo.

**Non-Goals:**
- La transformación en drawer por debajo de 960px — es responsabilidad de quien arma el app shell (ver proposal.md).
- Subsecciones anidadas, árboles de más de un nivel, botones de acción dentro de Sidebar — el propio mockup los excluye en su sección de reglas.
- Sincronizar el colapso entre pestañas del navegador abiertas simultáneamente — `localStorage` ya lo comparte al recargar, pero no hay listener de `storage` para reflejarlo en vivo entre pestañas; fuera de alcance de la primera versión.

## Decisions

### 1. `density: "comfortable" | "compact"`, no `'amplia' | 'compacta'` del mockup

El mockup nombra la prop en español. Pero `Table` (`packages/components/src/table.tsx`) ya resuelve exactamente este concepto — mismo par de valores, mismo propósito — con `TableDensity = "comfortable" | "compact"` en inglés, mapeado a `px-4 py-3` / `px-3 py-1.5`. Introducir un segundo vocabulario en español para la misma idea fragmentaría el catálogo sin ninguna ganancia. Sidebar reusa el nombre `"comfortable" | "compact"` tal cual, con las alturas del propio mockup (36px/32px) expresadas en la escala estándar de Tailwind: `h-9` (36px) y `h-8` (32px) — ninguna es un valor arbitrario.

### 2. Contador: markup propio, no `Badge` ni `Chip`

`Badge` siempre antepone un punto de estado y exige un `variant` semántico (success/warning/...) — está resuelto para una palabra de estado, no para una cifra. `Chip` siempre exige `onRemove` y un botón de cierre — resuelto para un filtro removible. Ninguno encaja con "un número suelto en una píldora, sin variante semántica ni botón". El contador de Sidebar es su propio `<span>` mínimo: fondo `bg-brand-bold` (`p.brand[600]`, `#C9151F` — exactamente el hex que el mockup pide explícitamente para "cifra dentro, nunca Red 500, regla §10"), texto `text-brand-on-bold` (blanco, el mismo par `background.bold`/`text.onBold` que cualquier superficie de marca sólida ya usa en el catálogo).

### 3. Foco de teclado: el anillo de marca ya establecido, no el azul `#1F4E8C` del mockup

El mockup dibuja el estado "Foco de teclado" con un anillo azul (`0 0 0 4px #1F4E8C`) que no aparece en ningún otro lugar del sistema — verificado: cada componente publicado usa `focus-visible:ring-focus focus-visible:ring-border-brand-focus` (o la variante de danger/neutral cuando corresponde), nunca azul. Es la misma clase de desajuste que el "z-index 400" de Navbar: un valor de una pasada de diseño distinta que nunca se reconcilió con el token final. Sidebar usa el anillo de marca ya establecido, consistente con los otros 15+ componentes que lo usan.

### 4. `aria-label` configurable con default genérico, no `role="navigation"` explícito

El mockup pide `role="navigation"` explícito con una etiqueta que nombre la app. Ningún componente publicado usa el atributo explícito — `Breadcrumb` y `Pagination` usan `<nav aria-label={ariaLabel}>` (el elemento nativo ya provee el landmark; el atributo explícito sería redundante) con un default en español y una prop para sobreescribirlo. Sidebar sigue exactamente ese patrón: prop `ariaLabel?: string`, default `"Navegación principal"` — Sidebar no conoce el nombre del producto (eso lo tiene Navbar), así que quien arma el app shell pasa una etiqueta más específica cuando la tiene.

### 5. Persistencia del colapso: primer uso de `localStorage` en el paquete, sin precedente que seguir

Verificado: ningún componente ni la app de docs usa `localStorage` hoy. Esto es territorio nuevo, así que la implementación se mantiene deliberadamente simple y defendida:
- Lectura inicial dentro de `useState(() => ...)`, con `typeof window === "undefined"` como guarda (SSR) y un `try/catch` alrededor del acceso (modo privado o almacenamiento deshabilitado lanzan en algunos navegadores) — cae a `false` (expandido) en cualquiera de los dos casos.
- Clave con namespace: `"tuya-ui:sidebar-collapsed"`, no un nombre genérico como `"collapsed"`, para minimizar choques si la misma página monta más de una cosa que use `localStorage` en el futuro.
- Solo se lee/escribe cuando `collapsed` no viene controlado (`collapsed === undefined`). En modo controlado, Sidebar no toca `localStorage` en absoluto — la app es la única fuente de verdad, como pide la spec.
- **Límite documentado, no resuelto**: "persiste entre apps" (frase del mockup) solo es cierto si esas apps comparten el mismo origen — `localStorage` no cruza subdominios ni dominios distintos sin un mecanismo aparte, que está fuera de alcance.

### 6. Colapso automático por ancho: un solo umbral (1120px), sin el segundo tramo de 960px

El mockup describe dos tramos — 1120-1439 (expandido, solo el contenido ajusta su padding) y 960-1119 (colapsa solo) — y una tercera transición a drawer por debajo de 960px que ya quedó fuera de alcance (ver proposal.md). Como Sidebar no maneja esa tercera transición, tampoco necesita distinguir el segundo tramo de un tercero que no le pertenece: un único breakpoint en 1120px cubre el comportamiento que sí es responsabilidad de Sidebar (colapsarse solo, sin que el usuario pierda la posibilidad de volver a expandirlo a mano). Implementado con el mismo patrón de listener de `matchMedia` que ya usa `useNarrowViewport` en Navbar — reacciona a la transición, no fuerza el estado en cada render, así que expandirlo de nuevo a mano no entra en conflicto con el próximo render.

### 7. `onCollapsedChange` agregado junto a `collapsed`, no listado en la tabla del mockup

La tabla de API del mockup lista `collapsed: boolean` sin una prop de cambio — pero "Sin él, el componente lo persiste solo" solo tiene sentido si, cuando SÍ se pasa `collapsed`, existe alguna forma de que la app se entere de que la persona activó el control de colapso interno. Se agrega `onCollapsedChange?: (collapsed: boolean) => void`, el mismo patrón `valor`/`onValorChange` que ya usan `open`/`onOpenChange` en Menu, NotificationMenu y Navbar.

## Risks / Trade-offs

- **[Riesgo]** `localStorage` sin precedente en el paquete — más superficie nueva para revisar que un componente puramente visual. → **Mitigación**: guardas explícitas (SSR + try/catch) documentadas arriba, alcance mínimo (una sola clave, un solo booleano).
- **[Riesgo]** El colapso automático por ancho y la persistencia interactúan: un auto-colapso en modo no controlado se guarda como si la persona lo hubiera elegido. → **Mitigación**: es el comportamiento correcto — si la persona vuelve a visitar en una ventana ancha, `matchMedia` ya no fuerza nada y el valor persistido simplemente refleja la última interacción real, controlada o automática, sin distinguir entre ellas de cara al futuro (tal como ya funciona hoy cualquier preferencia persistida en este tipo de UI).
- **[Riesgo]** El contador reimplementa markup en vez de reusar `Badge`/`Chip` — dos piezas de UI "de píldora" ligeramente distintas en el catálogo en vez de una. → **Mitigación**: ninguno de los dos resuelve el caso ("cifra sola, sin variante ni botón de cierre") sin forzar props que no aplican; documentado explícitamente para que un futuro `Badge`/contador compartido, si aparece la necesidad, pueda unificarlos con contexto completo.
