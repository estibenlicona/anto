## Context

Proyecto nuevo (sin código previo). Ver `proposal.md` - Why para la motivación. Decisiones de stack ya acordadas con el usuario antes de este diseño:
- CLI estilo shadcn/ui (copia código fuente, no paquetes npm por componente).
- Sitio de documentación en React + Vite (sin Next.js).
- Monorepo pnpm + Turborepo.
- Estilos con Tailwind CSS + CSS Variables para tokens de marca.
- Nombre de paquete/marca: `tuya-ui`.

## Goals / Non-Goals

**Goals:**
- Estructura de monorepo que permita evolucionar tokens, componentes, CLI y sitio de forma independiente pero coordinada (versionado y build compartido).
- Un CLI simple de mantener: agregar un componente nuevo al catálogo no debe requerir cambios en la lógica del CLI, solo agregar el archivo fuente y su entrada en un registro/manifiesto.
- El sitio de documentación y el CLI leen del mismo registro de componentes, para que nunca queden desincronizados.

**Non-Goals:**
- No se define en este change la integración real en una aplicación de producción de Tuya CA (queda para un change posterior).
- No se decide aún si el paquete `tuya-ui` (CLI) y `@tuya-ui/tokens` se publican en el registro público de npm o en un registro privado — se implementa asumiendo registro público npm por simplicidad, dejando la URL del registro como variable de configuración.
- No se construye un sistema de theming multi-marca (solo la identidad de Tuya CA).

## Decisions

### 1. Estructura del monorepo
```
tuya-ui/
├── apps/
│   └── docs/              # Sitio React + Vite
├── packages/
│   ├── tokens/            # @tuya-ui/tokens — CSS Variables + definición fuente (JSON/TS)
│   ├── components/        # Fuente de componentes (registro interno), no se publica como dependencia obligatoria
│   └── cli/                # Paquete "tuya-ui" publicado en npm
├── pnpm-workspace.yaml
└── turbo.json
```
**Alternativa considerada**: un solo paquete plano sin monorepo. Descartada porque tokens, componentes, CLI y docs tienen ciclos de vida y dependencias distintas (el CLI depende del registro de componentes; el sitio depende de tokens y componentes).

### 2. Registro de componentes (component registry)
El CLI y el sitio de documentación consumen un **manifiesto JSON** generado a partir de `packages/components` (uno por componente: nombre, dependencias internas, dependencias npm externas, ruta del archivo fuente, categoría). Este manifiesto se publica junto al paquete del CLI y se sirve como asset estático para el sitio.

**Por qué**: evita duplicar metadatos en dos lugares (CLI y sitio) y es el mismo patrón que usa shadcn/ui (`registry.json`), ya validado para este modelo de distribución.

**Alternativa considerada**: que el CLI descargue componentes directamente desde el repositorio de GitHub en tiempo de ejecución. Descartada para la v1 por depender de disponibilidad de GitHub y complicar el versionado; se prefiere empaquetar el manifiesto y el código fuente dentro del propio paquete npm del CLI.

### 3. Resolución de dependencias entre componentes
El manifiesto declara dependencias internas por nombre de componente. El CLI resuelve el grafo de dependencias de forma transitiva y copia todos los archivos necesarios en una sola operación, deduplicando componentes ya presentes en el proyecto consumidor.

### 4. Tokens como CSS Variables + capa Tailwind, en dos niveles (primitivos → semánticos)
Los tokens se definen en una fuente única (TS) dentro de `packages/tokens`, siguiendo la arquitectura de dos capas de Atlassian Design Tokens:

- **Primitivos**: escalas numeradas crudas por familia (`neutral`, `brand`, `danger`, `warning`, `success`, `discovery`), sin significado semántico propio (ej. `brand.700`).
- **Semánticos**: tokens con nombre por categoría/rol/variante (`color.background.brand.bold`, `color.text.neutral.subtle`, etc.) que referencian un paso de la paleta primitiva. Solo los tokens semánticos son consumidos por componentes; los primitivos nunca se usan directamente fuera del propio paquete de tokens.

Convención de nombres: `<categoría>.<rol>.<variante>[.<estado>]`, ej. `color.background.brand.bold.hover`. Se genera como CSS Variables con el mismo esquema de nombres en kebab-case (`--tuya-color-background-brand-bold-hover`).

Ambas capas se generan como:
- Un archivo `.css` con CSS Variables, para runtime.
- Un preset de Tailwind (`tailwind.config` extendido) que mapea utilidades a las CSS Variables semánticas (nunca a las primitivas).

El comando de inicialización del CLI copia el archivo CSS de variables y agrega/mezcla el preset de Tailwind en la configuración del proyecto consumidor.

**Alternativa considerada**: CSS-in-JS (styled-components/Emotion), como usa Atlassian Design System en su implementación. Descartada por decisión explícita del usuario a favor de Tailwind + CSS Variables, que además simplifica que el código copiado por el CLI no dependa de una librería de runtime adicional. La arquitectura de dos capas (primitivos/semánticos) sí se adopta de Atlassian porque es independiente de la elección de CSS-in-JS vs. Tailwind.

**Alcance de los estados de interacción**: `hover`/`pressed` se definen solo para los roles `brand` y `neutral`, que son los que usan los componentes interactivos actuales (Button, Input). Los roles de estado (`danger`, `warning`, `success`, `discovery`) no tienen variantes de interacción en esta iteración por no tener aún componentes interactivos que los requieran; se agregarán cuando surja un caso de uso concreto.

### 5. Sitio de documentación como SPA Vite, no Storybook
Se construye un sitio propio con React + Vite en lugar de usar Storybook, para tener control total de la identidad visual de Tuya CA y de la estructura de navegación (catálogo, detalle de componente con preview + código + comando CLI, sección de tokens). El sitio importa los componentes directamente desde `packages/components` dentro del monorepo (no desde el paquete publicado).

### 6. CLI: stack técnico
- Lenguaje: TypeScript, compilado con `tsup` a un binario Node ejecutable (`bin` en `package.json`).
- Parsing de comandos: `commander`.
- Prompts interactivos (confirmaciones de sobrescritura, selección de componentes): `prompts` o `@clack/prompts`.
- Comandos principales: `tuya-ui init`, `tuya-ui list`, `tuya-ui add <componente...>`.

### 7. Escala tipográfica de encabezados y elevación con nombre
Se agrega una escala `heading.xxsmall`...`heading.xxlarge` (tamaño + peso + alto de línea combinados por paso), independiente de la escala `fontSize` de texto de UI ya existente, siguiendo la separación que hace Atlassian entre texto de interfaz y encabezados de contenido.

De forma análoga, se agregan tokens de elevación con nombre (`elevation.surface.raised/overlay/sunken`) que combinan un color de fondo y una sombra ya coordinados, en vez de dejar que cada componente combine `shadow.*` y `color.background.*` por su cuenta y arriesgue combinaciones inconsistentes.

### 8. Motion tokens
Se agregan tokens de duración (`motion.duration.fast/normal/slow`, en ms) y de easing (`motion.easing.standard/entrance/exit`, como curvas `cubic-bezier`). Ningún componente de esta iteración anima transiciones más allá de `hover`/`focus` (manejadas por CSS `transition-colors` de Tailwind), por lo que estos tokens se definen ahora como base para elevar transiciones futuras (overlays, tooltips, etc.) a un lenguaje de motion consistente.

### 9. Verificación de contraste WCAG AA
Se extiende el script `packages/tokens/scripts/verify-tokens.ts` para calcular la relación de contraste (fórmula de luminancia relativa de WCAG) de cada combinación semántica texto/fondo documentada (ej. `color.text.neutral.default` sobre `color.background.neutral.default`) y fallar si no alcanza 4.5:1 (texto normal) o 3:1 (texto grande/UI). La lista de combinaciones a verificar se declara explícitamente en el script — no se infiere automáticamente, para evitar falsos positivos en combinaciones que nunca se usan juntas en la práctica.

### 10. Visor de código estilo VS Code
El bloque de código fuente en el sitio de documentación usa `react-syntax-highlighter` con el tema `vscDarkPlus`, envuelto en un componente con barra de título tipo editor (nombre de archivo) y numeración de línea.

**Por qué**: es una librería liviana y madura que reproduce fielmente la paleta de colores de VS Code sin la complejidad de cargar gramáticas TextMate en tiempo real.

**Alternativa considerada**: Shiki (motor real de VS Code, resaltado pixel-perfect). Descartado para esta iteración por su mayor peso y complejidad de integración asíncrona en Vite; puede reconsiderarse si se requiere fidelidad exacta más adelante.

## Risks / Trade-offs

- **[Riesgo] Desincronización entre el manifiesto empaquetado en el CLI y la versión real de los componentes** si se publica el CLI sin regenerar el manifiesto → **Mitigación**: el build del CLI (Turborepo pipeline) regenera el manifiesto desde `packages/components` como paso previo obligatorio a cualquier publish.
- **[Riesgo] Sobrescritura accidental de personalizaciones del usuario** al re-ejecutar `add` sobre un componente ya modificado → **Mitigación**: requerimiento ya cubierto en `cli-installer` spec (confirmación antes de sobrescribir).
- **[Trade-off] Los componentes copiados no reciben actualizaciones automáticas** (a diferencia de una dependencia npm versionada) → aceptado conscientemente: es el modelo elegido (shadcn-style) porque prioriza la propiedad del código sobre la actualización automática.
- **[Riesgo] Mezclar el preset de Tailwind del usuario con el de Tuya UI puede generar conflictos de configuración** → **Mitigación**: el comando `init` detecta una configuración de Tailwind existente y hace merge no destructivo, avisando si hay claves en conflicto.
- **[Riesgo] Renombrar los tokens semánticos (de `primary`/`secondary` planos a `color.background.brand.bold`, etc.) es un cambio disruptivo para cualquier proyecto que ya haya corrido `tuya-ui init`/`add` contra la versión anterior** → **Mitigación**: como el sistema aún no tiene consumidores reales fuera de este monorepo (ver proposal.md - Impact), se acepta el renombre ahora; una vez publicado el CLI, futuros cambios de nombre de tokens deberán pasar por un período de alias/deprecación.
- **[Riesgo] Los tokens de estado de interacción (`hover`/`pressed`) solo cubren los roles `brand` y `neutral`** → **Mitigación**: documentado explícitamente en la Decisión #4; se amplía a otros roles cuando exista un componente interactivo que los necesite, evitando definir tokens sin consumidor real.

## Open Questions

- ¿El paquete `tuya-ui` (CLI) y `@tuya-ui/tokens` se publican en el registro público de npm o en un registro privado de la compañía? No cambia el diseño ni las tareas de esta v1 (se implementa contra npm público por defecto, configurable), pero sí debe resolverse antes de la primera publicación real.
