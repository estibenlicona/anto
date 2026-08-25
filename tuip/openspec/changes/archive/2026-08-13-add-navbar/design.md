## Context

El mockup `design-system/Navbar Tuya.dc.html` es la fuente autoritativa de anatomía, variantes, responsive y accesibilidad. Es un archivo `.dc.html` de demo (React de juguete con estado propio, sin usar Radix ni los tokens reales) — sus valores de color están escritos en hex crudo y su tabla de API (8 props) es una lista ilustrativa, no una interfaz TypeScript literal. Ese desfase entre "demo visual" y "componente real sobre el sistema de tokens existente" es el grueso de las decisiones de este documento.

Ya existen `Menu`/`MenuItem`/`MenuSeparator` (`menu.tsx`) y `NotificationMenu`/`NotificationMenuHeader`/`NotificationMenuList`/`NotificationMenuItem`/`NotificationMenuFooter` (`notification-menu.tsx`), ambos sobre `@radix-ui/react-dropdown-menu`, con `z-menu`/`shadow-md`. El panel de notificaciones y el panel de cuenta del mockup calzan casi exactamente con esas dos familias ya publicadas.

## Goals / Non-Goals

**Goals:**
- Un componente `Navbar` de una sola pieza (no una familia compuesta): el propio mockup lo usa como `<Navbar product=... apps=... onSearch=... notifications=... user=... />`, sin sub-componentes expuestos.
- Reutilizar `Menu`/`NotificationMenu` para los paneles de cuenta y notificaciones en vez de reimplementar listas de items ya resueltas.
- Todo color sale de un token semántico existente. Ninguna clase con hex arbitrario, ningún primitivo referenciado directo (`primitives.ts` es explícito: "Never consumed directly by components").

**Non-Goals:**
- El menú lateral que abre el botón de hamburguesa en la variante compacta — componente aparte, no cubierto aquí (ver proposal.md).
- La UI del command palette — Navbar solo expone el disparador (`onSearch`).
- Sincronizar la variante `dark`/`light` de Navbar con un futuro modo oscuro de toda la app — son conceptos independientes (ver Decisión 1).

## Decisions

### 1. `variant="dark"|"light"` no es el modo oscuro de la app — es un color fijo por producto

El sistema de tokens ya tiene una paleta oscura completa (`semanticColorsDark` en `packages/tokens/src/semantic-colors.ts`), activada globalmente vía `:root[data-theme="dark"]`. Pero ningún componente publicado la usa hoy (`grep` sin resultados de `dark:` ni `data-theme` en `packages/components/src`), y las variables solo se reasignan cuando el atributo está en `:root` — no hay manera de escopar un subárbol a "siempre oscuro" independientemente del tema activo de la página sin tocar el paquete de tokens, algo fuera de alcance de este change.

Como el mockup pide exactamente eso ("Tema de la barra. Constante dentro de un producto" — independiente de si la página alrededor es clara u oscura), Navbar no puede depender de `data-theme`. En su lugar:
- **`variant="dark"`** usa la familia `-inverse` de los tokens neutrales de la paleta activa (`bg-neutral-inverse`, `text-neutral-inverse`) — el mismo mecanismo que ya usa `Avatar` (`bg-neutral-bold text-neutral-inverse`) para una superficie oscura legible sobre una página clara.
- **`variant="light"`** usa la familia `-default`/`-subtlest` directamente — es, en la práctica, la paleta activa sin invertir.
- Donde el mockup pide un hex sin token `-inverse` equivalente (p. ej. `linkColor`, `dividerColor`, `searchBg` en modo oscuro), se usa el token semántico neutral más cercano en la jerarquía (`subtle`/`subtlest`/`disabled` según corresponda), verificado visualmente durante la implementación — mismo método ya usado para Stepper y NotificationMenu cuando el mockup no calzaba exacto con un token.

**Alternativa descartada**: escopar `data-theme="dark"` en el `<header>` de Navbar. No funciona con el CSS generado actual (`:root[data-theme="dark"] {...}` solo coincide con el elemento raíz del documento, no con un descendiente), y cambiar esa regla es un cambio de `packages/tokens`, no de este componente.

### 2. `z-navigation` (100), no el "z-index 400" que anota el mockup

El mockup anota "z-index 400" a mano, pero el token de layout ya define seis capas con una específica para esto: `packages/tokens/src/layout.ts` → `layer.navigation = "100"` (clase `z-navigation`), por debajo de `z-overlay`(400)/`z-menu`(600)/`z-notification`(800). Usar `z-navigation` es más correcto que copiar el "400" del mockup: así un Modal, un Menu o un Toast siempre se apilan por encima de la barra sticky, que es el comportamiento esperado y ninguno de esos tres tokens ya usados por otros componentes queda comprometido.

Los tres paneles propios de Navbar (apps, notificaciones, cuenta) usan `z-menu` (600) — la misma capa que ya usan `Menu`, `NotificationMenu`, `Select`, `Combobox` y `Tooltip` para paneles anclados no bloqueantes.

### 3. Reutilización: notificaciones y cuenta componen piezas existentes; el selector de apps es nuevo

- **Notificaciones**: Navbar arma internamente `<NotificationMenu trigger={campana}><NotificationMenuHeader .../><NotificationMenuList>{notifications.map(...)}</NotificationMenuList><NotificationMenuFooter/></NotificationMenu>` a partir de la prop `notifications`. Cada item mapea 1:1 a `NotificationMenuItemProps` (`unread`, `label`, `detail`, `timestamp`, `variant`).
- **Cuenta**: Navbar arma `<Menu trigger={avatarYNombre}>{userMenu.map(action => <MenuItem destructive={action.destructive} .../>)}</Menu>`, insertando un `MenuSeparator` antes del primer item marcado `destructive` — replica el patrón visual del mockup (separador antes de "Cerrar sesión") sin exigir que quien use Navbar lo arme a mano.
- **Selector de apps**: no hay componente publicado con esta forma (ícono cuadrado de color propio por app + nombre + descripción + etiqueta "actual"; sin puntos de estado, sin timestamp — no calza en `MenuItem` de una sola línea ni en `NotificationMenuItem`). Se construye directo sobre `@radix-ui/react-dropdown-menu` (la misma dependencia que ya declaran `Menu`/`NotificationMenu`), como una pieza interna de `navbar.tsx` sin export propio.

### 4. Extender `Menu` y `NotificationMenu` con apertura controlada opcional

El mockup exige que a lo sumo un panel esté abierto a la vez (abrir el selector de apps cierra notificaciones o cuenta, y viceversa). `Menu`/`NotificationMenu` hoy envuelven `DropdownMenu.Root` sin exponer `open`/`onOpenChange`, así que cada instancia maneja su propio estado sin coordinación posible entre ellas.

Se agrega a ambos un par de props opcionales `open?: boolean` / `onOpenChange?: (open: boolean) => void`, pasadas directo a `DropdownMenu.Root` (que ya soporta modo controlado nativamente). Sin esas props, el comportamiento no cambia: Radix cae a no controlado exactamente como hoy. Navbar es el primer consumidor: mantiene un único estado `openPanel: "apps" | "notifications" | "account" | null` y controla los tres paneles contra él.

**Alternativa descartada**: que Navbar arme sus tres paneles con `DropdownMenu.Root/Trigger/Portal/Content` crudo, sin pasar por `Menu`/`NotificationMenu`. Funcionaría, pero duplicaría exactamente las clases de `z-menu`/`shadow-md`/`rounded-control`/`border` que esos dos componentes ya fijan — cambiar ese estilo en un lugar y no el otro los desalinearía con el tiempo. Extender con props aditivas y opcionales es más barato que mantener dos veces la misma superficie visual.

**Ajuste sobre el plan original, verificado empíricamente durante la implementación**: el plan inicial asumía que este modo controlado alcanzaba para que activar el disparador B mientras el panel A está abierto cerrara A y abriera B en el mismo clic — coordinación "atómica". Verificado con clics reales (no sintéticos) contra las tres combinaciones de disparadores, esto no ocurre: cada `DropdownMenu.Root` es independiente, así que abrir el panel B es, desde el punto de vista de A, un clic externo — cierra A correctamente por sí solo — pero ese mismo clic **no** dispara la apertura de B; se probaron múltiples estrategias para forzarlo (coordinar por `mousedown`/`mouseup`, interceptar `click` a nivel de `document` en fase de captura con `stopImmediatePropagation`, diferir el cierre un microtask para que una apertura en el mismo tick lo gane) y las tres fallaron de la misma forma: Radix nunca llega a invocar la apertura de B para ese clic, no es una carrera entre actualizaciones de estado. Cambiar de disparador toma entonces dos activaciones — la primera cierra el panel abierto, la segunda abre el nuevo — nunca deja dos paneles visibles a la vez, que es la invariante que de verdad importa. Forzar la apertura atómica exigiría reemplazar el mecanismo propio de descarte de Radix (`DismissableLayer`) por uno propio, exactamente el tipo de reimplementación que este catálogo evita en todos los componentes ya construidos sobre Radix. La spec de este change se ajustó para reflejar el comportamiento real.

### 5. Props que el mockup no lista explícitamente

La tabla "API" del mockup lista 8 props (`product`, `variant`, `apps`, `onSearch`, `notifications`, `user`, `utilities`, `onNavigate`), pero otras secciones del mismo mockup describen comportamiento que esas 8 props no alcanzan a configurar. Se agregan las siguientes, siguiendo el patrón ya establecido "sin handler, no se muestra" que el propio mockup usa para `onSearch`:

- **`onMenuToggle?: () => void`** — la variante compacta muestra una hamburguesa para "el menú lateral" (sección 04), pero ninguna prop del mockup conecta ese botón a nada. Sin `onMenuToggle`, la hamburguesa no se renderiza — un botón que no hace nada es peor que ningún botón.
- **`userMenu: UserMenuAction[]`** (requerida) — el panel de cuenta lista acciones ("Mi perfil", "Cerrar sesión", etc., sección "01 En vivo") que no vienen de ninguna prop documentada; solo `user` (nombre/rol/iniciales) está en la tabla. Como esas acciones son inherentes a cada producto (no hay un "Cerrar sesión" genérico razonable), se vuelve prop requerida en vez de inventarle un default.
- **`onMarkAllNotificationsRead?` / `onViewAllNotifications?`** — el panel de notificaciones del mockup tiene "Marcar leídas" y "Ver todas"; mismo patrón, sin handler no se muestra esa acción.

Se documenta cada una como una desviación deliberada de la tabla del mockup, no un vacío accidental — quedan marcadas igual en tasks.md al implementarlas.

### 6. Brand 500 en superficies decorativas: `bg-brand-bold` como sustituto más cercano

El mockup pide explícitamente Red 500 (`#ED1C29`) para el cuadro de marca y el punto de notificación "porque no cargan texto" (nota de accesibilidad, sección 06) — una regla que la propia paleta semántica documenta (`border.brand.default`/`icon.brand.default` sí resuelven a `p.brand[500]`, con el comentario "Step 500 keeps its brand role everywhere it carries no text"). Pero no existe un `background.brand.*` semántico en ese escalón — el más cercano es `bg-brand-bold` (`p.brand[600]`, `#C9151F`). Se usa ese, documentado: sigue siendo Tuya Red, cumple AA con margen mayor que el 500 que pide el mockup, y no introduce un valor fuera del sistema de tokens.

### 7. Breakpoints por pixel exacto, no la escala por defecto de Tailwind

El mockup fija quiebres en 960/1120/1440px, que no coinciden con la escala default de Tailwind (640/768/1024/1280/1536). Se usan variantes de breakpoint arbitrario (`max-[959px]:`, etc.). Esto no es una excepción a la regla de tokens: el requisito de "solo tokens" del catálogo cubre color, tipografía, espaciado, radio y sombra — no quiebres responsive — y ya hay precedente de valores en píxeles arbitrarios para medidas estructurales (`max-h-[500px]` en `NotificationMenuList`).

## Risks / Trade-offs

- **[Riesgo]** Los roles de color sin token `-inverse` exacto (`linkColor`, `mutedColor`, `dividerColor`, `searchBg`, `hoverSurface` en modo oscuro) requieren elegir el token semántico más próximo caso por caso, con margen de contraste a verificar recién al implementar. → **Mitigación**: verificación visual con `getComputedStyle`/captura de pantalla contra cada combinación variant×rol durante `/opsx:apply`, igual que Stepper y NotificationMenu; cualquier ajuste se documenta en tasks.md.
- **[Riesgo]** `Menu`/`NotificationMenu` son componentes ya publicados; agregarles props cambia su superficie pública. → **Mitigación**: `open`/`onOpenChange` son opcionales y no tocan el default no controlado — cualquier ejemplo o página de documentación ya existente sigue funcionando sin cambios.
- **[Riesgo]** El selector de apps es la única pieza sin precedente directo en el catálogo — más superficie nueva para revisar que las otras dos zonas de la derecha. → **Mitigación**: reutiliza el mismo primitivo (`@radix-ui/react-dropdown-menu`) y las mismas clases de superficie (`z-menu`, `shadow-md`, `rounded-control`, `border-neutral-default`) que `Menu`/`NotificationMenu` ya validaron, así que el riesgo real queda acotado al layout interno de cada fila, no al comportamiento del panel.
