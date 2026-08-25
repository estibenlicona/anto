## Why

El sitio de documentación de Tuya UI hoy solo sigue el tema del sistema operativo (sin control del usuario), su visor de código siempre usa un tema oscuro fijo — lo que rompe la armonía visual y el contraste cuando el sitio está en modo claro — y su navegación es una sola barra superior sin estructura por categorías. Para que el sitio se perciba como una documentación de sistema de diseño profesional (al nivel de Atlassian Design System), necesita selector de tema explícito, un visor de código cuyo tema acompañe al del sitio, una navegación de dos niveles (header + sidebar), y una identidad de marca clara ("Tuip - Tuya UI Platform") en el título y el header.

## What Changes

- Agregar un **selector de tema claro/oscuro** explícito en el sitio (además de respetar la preferencia del sistema por defecto), persistido entre visitas, aplicando los tokens de color ya definidos en `@tuya-ui/tokens` (modo claro/oscuro) a toda la interfaz.
- Hacer que el **tema del visor de código fuente sea coherente con el tema activo del sitio**: tema claro de VS Code cuando el sitio está en modo claro, tema oscuro (el actual `vscDarkPlus`) cuando está en modo oscuro — resolviendo el problema de contraste reportado en modo claro.
- Rediseñar la navegación como **header superior + sidebar lateral**: el header aloja el wordmark/título y el selector de tema; el sidebar lista las secciones (Componentes agrupados por categoría, Tokens).
- Actualizar el **título del sitio** (`<title>` del navegador) a "Tuip - Tuya UI Platform", y mostrar ese mismo nombre como **wordmark en el header**.
- Pulir la identidad visual general del sitio (espaciado, tipografía, jerarquía) para acercarla al nivel de acabado de la documentación de Atlassian Design System.
- No se agregan capacidades nuevas de negocio: todo el trabajo modifica el comportamiento ya definido en la capacidad `docs-site`.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `docs-site`: se agregan requisitos de selección de tema claro/oscuro, coherencia de tema en el visor de código, navegación de dos niveles (header + sidebar por categorías), y el nombre "Tuip - Tuya UI Platform" como identidad del sitio.

## Impact

- **Código afectado**: `apps/docs` — `index.html` (título), `src/main.tsx`/`src/components/Layout.tsx` (header + sidebar + selector de tema), `src/components/CodeBlock.tsx` (tema de resaltado de sintaxis condicionado al tema activo), y las páginas existentes (`Catalog`, `ComponentDetail`, `Tokens`) para adaptarse al nuevo layout.
- **Dependencias nuevas**: un tema claro de `react-syntax-highlighter` (ej. `vs` o `oneLight`) además del `vscDarkPlus` ya usado.
- **Sin impacto** en `packages/tokens`, `packages/components` ni `packages/cli` — estos ya exponen tokens de modo claro/oscuro; este change solo consume esa capacidad desde el sitio.
