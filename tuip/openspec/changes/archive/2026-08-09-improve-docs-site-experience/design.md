## Context

El sitio (`apps/docs`) ya consume `@tuya-ui/tokens`, cuyo CSS generado (`tokens.css`) define ambos modos: `:root` (claro), `:root[data-theme="dark"]` (oscuro forzado), y `@media (prefers-color-scheme: dark)` como fallback automático cuando no hay `data-theme` explícito. Hoy el sitio nunca setea `data-theme`, así que sigue ciegamente la preferencia del SO sin control del usuario. Ver `proposal.md` - Why para la motivación completa.

## Goals / Non-Goals

**Goals:**
- Control de tema explícito, persistente, reusando exactamente el mecanismo `data-theme` que los tokens ya soportan (sin cambios en `packages/tokens`).
- El visor de código sigue el mismo tema activo del sitio.
- Navegación de dos niveles (header + sidebar) sin introducir un router de estado adicional más allá de `react-router-dom`, ya en uso.

**Non-Goals:**
- No se rediseña la paleta de marca ni se agregan nuevos tokens — este change es puramente de consumo/UX del sitio.
- No se agrega un sistema de temas multi-marca ni "temas custom" más allá de claro/oscuro.
- No se cambia el modelo de componentes ni el CLI.

## Decisions

### 1. Mecanismo de tema: contexto de React + `data-theme` + `localStorage`
Se agrega un `ThemeProvider` (contexto de React) en `apps/docs` que:
- Lee `localStorage.getItem("tuya-ui-docs-theme")` al montar; si no hay valor, usa `window.matchMedia("(prefers-color-scheme: dark)")` para el valor inicial.
- Aplica el tema seteando `document.documentElement.dataset.theme = "light" | "dark"`, que es exactamente el atributo que ya consume `tokens.css`.
- Expone `theme` y `toggleTheme()` vía un hook `useTheme()`.
- Persiste cada cambio en `localStorage`.

**Por qué**: reutiliza el mecanismo de tokens ya construido (`[data-theme="dark"]`) sin tocar `packages/tokens`; es el patrón estándar (contexto + `data-*` en `<html>`) para theming en SPAs React y evita parpadeo de FOUC al poder leer `localStorage` de forma síncrona antes del primer render.

**Alternativa considerada**: depender solo de `prefers-color-scheme` sin control manual. Descartada porque el pedido explícito del usuario es un selector visible, y porque el visor de código necesita saber el tema activo de forma programática (no solo vía CSS), lo cual requiere que el tema viva en JS accesible, no solo en una media query CSS.

### 2. Tema del visor de código ligado al tema del sitio
`CodeBlock` consume `useTheme()` y selecciona entre dos temas de `react-syntax-highlighter`: `vscDarkPlus` (ya usado, modo oscuro) y un tema claro equivalente de VS Code (`vs`, el tema por defecto de VS Code en modo claro) para modo claro. La barra de título del bloque de código (actualmente siempre oscura tipo VS Code) también adapta sus colores de fondo/texto al tema activo, usando los tokens semánticos de superficie (`elevation.surface.raised`) en vez de un valor `#1e1e1e` fijo.

**Por qué**: soluciona directamente el problema reportado (bajo contraste al usar un bloque de código oscuro fijo sobre un sitio en modo claro).

### 3. Layout: header fijo + sidebar + contenido
- **Header** (altura fija, siempre visible): wordmark "Tuip - Tuya UI Platform" a la izquierda, control de tema a la derecha.
- **Sidebar** (columna izquierda, altura completa bajo el header): lista de componentes agrupada por categoría (leyendo el mismo `registry.json` que ya usa el catálogo) + link a "Tokens". Usa `NavLink` de `react-router-dom` para resaltar la sección activa (ya usado en el nav actual).
- **Contenido**: el resto del ancho, donde se renderizan `Catalog`, `ComponentDetail` y `Tokens` sin cambios en su lógica interna, solo en el contenedor que las envuelve.

La página de Catálogo (`Catalog.tsx`) se mantiene como vista de bienvenida/overview con las tarjetas existentes; el sidebar es un atajo de navegación persistente, no la reemplaza.

**Alternativa considerada**: sidebar colapsable/responsive con manejo de estado de apertura en mobile. Fuera de alcance de este change (no se pidió soporte mobile específico); se puede agregar después si se detecta necesidad real de uso en pantallas chicas.

### 4. Título del sitio
`index.html` cambia su `<title>` a "Tuip - Tuya UI Platform". El header muestra el mismo texto como wordmark (ver decisión de alcance ya confirmada con el usuario), en una tipografía basada en `typography.heading.xsmall` para no competir visualmente con los encabezados de contenido.

## Risks / Trade-offs

- **[Riesgo] Flash of incorrect theme (FOUC)** al cargar la página antes de que React monte el `ThemeProvider` → **Mitigación**: se agrega un script inline mínimo en `index.html` (antes de cargar el bundle) que lee `localStorage`/`prefers-color-scheme` y setea `data-theme` en `<html>` de forma síncrona, igual que hace el propio `tokens.css` como fallback.
- **[Riesgo] Mantener dos temas de `react-syntax-highlighter` sincronizados visualmente con la marca** (que ninguno choque con los tokens de superficie del sitio) → **Mitigación**: solo se envuelve el tema de librería para el *código coloreado*; la barra de título y el fondo del bloque usan tokens de Tuya UI (`elevation.surface.raised`), no colores de la librería.
- **[Trade-off] El sidebar no es colapsable en esta iteración** → aceptado; el sitio es una herramienta interna de equipo, no un producto público con tráfico mobile significativo todavía.
