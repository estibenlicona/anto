## 1. Theming infrastructure

- [x] 1.1 Crear `ThemeProvider`/`useTheme()` en `apps/docs` que setea `document.documentElement.dataset.theme` y persiste en `localStorage`
- [x] 1.2 Agregar script inline en `index.html` que aplica el tema guardado (o la preferencia del sistema) antes del primer render, evitando FOUC
- [x] 1.3 Cambiar el `<title>` de `index.html` a "Tuip - Tuya UI Platform"

## 2. Header y sidebar

- [x] 2.1 Construir el header: wordmark "Tuip - Tuya UI Platform" + control de alternancia de tema (usando `useTheme()`)
- [x] 2.2 Construir el sidebar: componentes agrupados por categoría (leyendo `registry.json`) + link a Tokens, con resaltado de sección activa
- [x] 2.3 Rearmar el layout general (`Layout.tsx`) para el esquema header + sidebar + contenido
- [x] 2.4 Adaptar `Catalog.tsx`, `ComponentDetail.tsx` y `Tokens.tsx` al nuevo contenedor de contenido (sin cambiar su lógica interna)

## 3. Visor de código con tema coherente

- [x] 3.1 Agregar un tema claro de `react-syntax-highlighter` (ej. `vs`) junto al `vscDarkPlus` existente
- [x] 3.2 Hacer que `CodeBlock` seleccione el tema de resaltado según `useTheme()`
- [x] 3.3 Reemplazar los colores fijos de la barra de título de `CodeBlock` (`#1e1e1e`, `#cccccc`) por tokens de superficie (`elevation.surface.raised`) que respondan al tema activo

## 4. Verificación

- [x] 4.1 Verificar visualmente (dev server) que el toggle de tema cambia sitio y visor de código de forma coherente en ambas direcciones
- [x] 4.2 Verificar que la elección de tema persiste tras recargar la página
- [x] 4.3 Build de producción de `apps/docs` sin errores de tipos ni de Tailwind
