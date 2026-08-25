## Why

Tuya CA necesita un sistema de diseño propio para que sus aplicaciones React compartan una identidad visual consistente y un flujo de desarrollo eficiente. Hoy no existe ningún componente, token ni herramienta reutilizable: cada aplicación tendría que reconstruir UI desde cero. Un sistema de diseño inspirado en Atlassian Design System, pero con la identidad de marca de Tuya CA, permite estandarizar componentes, distribuirlos de forma flexible (el equipo elige qué copiar a su proyecto, como en shadcn/ui) y documentarlos en un sitio navegable.

## What Changes

- Crear un **monorepo** (pnpm + Turborepo) bajo el nombre de paquete/marca **`tuya-ui`**, que aloja tres piezas: paquete de tokens de diseño, paquete de componentes fuente, CLI, y sitio de documentación.
- Definir un **paquete de design tokens** (`@tuya-ui/tokens`) con la identidad de marca de Tuya CA: color, tipografía, espaciado, radios, sombras — expresados como CSS Variables y consumidos por Tailwind CSS.
- Construir un **catálogo inicial de componentes** React (Button, Input, Card, Badge) estilizados con Tailwind CSS + CSS Variables, siguiendo patrones de accesibilidad y composición similares a Atlassian Design System.
- Construir un **CLI instalable globalmente vía npm** (`npm install -g tuya-ui` o uso vía `npx tuya-ui`) que:
  - Inicializa la configuración de Tailwind/tokens en una app React existente.
  - Permite listar y agregar componentes individualmente (`tuya-ca add button`), copiando el código fuente del componente al repo del consumidor (modelo shadcn/ui), no como dependencia npm por componente.
- Construir un **sitio de documentación** (React + Vite, sin Next.js) estilo Storybook/Atlassian Design System donde se puedan explorar visualmente los componentes, ver su código fuente y copiarlo, y consultar los tokens de marca.
- Este es un sistema nuevo: no hay comportamiento previo que modificar ni compatibilidad que preservar.

## Capabilities

### New Capabilities
- `design-tokens`: Definición y distribución de los tokens de marca de Tuya CA (color, tipografía, espaciado, radios, sombras) como CSS Variables consumibles por Tailwind.
- `component-library`: Catálogo de componentes React de UI (Button, Input, Card, Badge) construidos sobre los tokens, con variantes y accesibilidad básica.
- `cli-installer`: CLI global npm que inicializa el proyecto consumidor y agrega componentes individuales copiando su código fuente.
- `docs-site`: Sitio web (React + Vite) para explorar visualmente los componentes, ver/copiar su código y consultar los tokens de marca.

### Modified Capabilities
(ninguna — proyecto nuevo, sin capacidades existentes)

## Impact

- **Nuevo repositorio/monorepo**: estructura pnpm workspaces + Turborepo con paquetes `packages/tokens`, `packages/components` (fuente de componentes, no publicado como dependencia de runtime obligatoria), `packages/cli`, `apps/docs`.
- **Dependencias nuevas**: pnpm, Turborepo, Tailwind CSS, Vite, React, herramientas de build de CLI (ej. tsup/commander), y de documentación de componentes.
- **Publicación npm**: el paquete del CLI se publica en el registro npm (público o privado, a definir) bajo el nombre `tuya-ui`, y los paquetes auxiliares bajo el scope `@tuya-ui`.
- **Sin impacto en sistemas existentes**: no hay aplicaciones previas de Tuya CA integradas en este change; la integración en apps consumidoras queda fuera de este alcance inicial.
