## 1. Monorepo setup

- [x] 1.1 Inicializar repositorio con pnpm workspaces (`pnpm-workspace.yaml`) y Turborepo (`turbo.json`)
- [x] 1.2 Crear estructura de carpetas: `apps/docs`, `packages/tokens`, `packages/components`, `packages/cli`
- [x] 1.3 Configurar TypeScript base compartido (tsconfig raíz + extends por paquete)
- [x] 1.4 Configurar linting/formatting compartido (ESLint + Prettier) a nivel de monorepo

## 2. Design tokens (`@tuya-ui/tokens`)

- [x] 2.1 Definir la fuente única de tokens (color, tipografía, espaciado, radios, sombras, breakpoints) en TS/JSON
- [x] 2.2 Definir valores de tokens de color para modo claro y modo oscuro
- [x] 2.3 Generar archivo de salida `.css` con CSS Variables agrupadas por categoría a partir de la fuente de tokens
- [x] 2.4 Generar preset de Tailwind que mapea utilidades (`bg-primary`, `text-primary`, etc.) a las CSS Variables
- [x] 2.5 Escribir tests/verificación de que cambiar un valor de token se refleja en el CSS generado

## 3. Catálogo de componentes (`packages/components`)

- [x] 3.1 Configurar Tailwind CSS dentro de `packages/components` consumiendo el preset de tokens
- [x] 3.2 Implementar componente Button (variantes primario/secundario, estados hover/focus/disabled) usando solo clases de Tailwind ligadas a tokens
- [x] 3.3 Implementar componente Input (estados focus/disabled/error, accesibilidad de teclado y label)
- [x] 3.4 Implementar componente Card (estructura composable: header/body/footer)
- [x] 3.5 Implementar componente Badge (variantes de color/estado)
- [x] 3.6 Verificar accesibilidad básica (roles ARIA, navegación por teclado, foco visible) en los 4 componentes
- [x] 3.7 Definir el manifiesto (`registry.json` o similar) con metadata de cada componente: nombre, ruta fuente, dependencias internas, dependencias npm externas, categoría
- [x] 3.8 Escribir script que genera/valida el manifiesto a partir de los componentes existentes

## 4. CLI (`tuya-ui`)

- [x] 4.1 Inicializar paquete `packages/cli` con TypeScript + `tsup` (build a binario Node) + `commander`
- [x] 4.2 Configurar `package.json` del CLI con campo `bin` apuntando al binario compilado, nombre de paquete `tuya-ui`
- [x] 4.3 Empaquetar el manifiesto de componentes y el código fuente de `packages/components` como assets del paquete CLI
- [x] 4.4 Implementar comando `tuya-ui init`: detecta/crea configuración de Tailwind, hace merge no destructivo del preset de tokens, copia el archivo CSS de variables
- [x] 4.5 Implementar detección de proyecto ya inicializado (evitar sobrescritura sin confirmación)
- [x] 4.6 Implementar comando `tuya-ui list`: lee el manifiesto y lista los componentes disponibles
- [x] 4.7 Implementar comando `tuya-ui add <componente...>`: resuelve dependencias internas transitivas y copia los archivos fuente a la ruta configurada del proyecto consumidor
- [x] 4.8 Implementar manejo de error cuando se solicita un componente inexistente
- [x] 4.9 Implementar prompt de confirmación antes de sobrescribir un archivo de componente ya existente
- [x] 4.10 Escribir pruebas end-to-end del CLI contra un proyecto React de prueba (init → add → verificar archivos copiados)

## 5. Sitio de documentación (`apps/docs`)

- [x] 5.1 Inicializar app Vite + React en `apps/docs`, consumiendo `packages/components` y `packages/tokens` del monorepo
- [x] 5.2 Aplicar la identidad visual de Tuya CA al propio sitio (colores, tipografía, logo) usando los tokens
- [x] 5.3 Construir la página de catálogo con lista de componentes disponibles (leyendo el manifiesto)
- [x] 5.4 Construir la página de detalle de componente: preview en vivo con variantes/estados
- [x] 5.5 Agregar visor de código fuente con acción de copiar al portapapeles en la página de detalle
- [x] 5.6 Mostrar el comando exacto de `tuya-ui add` correspondiente en cada página de detalle
- [x] 5.7 Construir la sección de design tokens (paleta de color, tipografía, espaciado, radios, sombras) con nombre y valor de cada token
- [x] 5.8 Configurar navegación general del sitio (layout, routing entre catálogo/detalle/tokens)
- [x] 5.9 Instalar y configurar `react-syntax-highlighter` con el tema `vscDarkPlus`
- [x] 5.10 Rediseñar `CodeBlock` con barra de título estilo editor (nombre de archivo) y numeración de línea, aplicando resaltado de sintaxis por lenguaje

## 6. Integración y build del monorepo

- [x] 6.1 Configurar pipeline de Turborepo: build de tokens → build de components → build de cli (con manifiesto regenerado) → build de docs
- [x] 6.2 Configurar script de publicación del paquete `tuya-ui` (CLI) a npm, asegurando que el manifiesto empaquetado esté actualizado
- [x] 6.3 Documentar en el README del monorepo el flujo de desarrollo (agregar un componente nuevo, correr el sitio local, publicar el CLI)

## 7. Arquitectura avanzada de tokens (nivel Atlassian)

- [x] 7.1 Definir paletas primitivas (`neutral`, `brand`, `danger`, `warning`, `success`, `discovery`) como escalas numeradas en la fuente de tokens
- [x] 7.2 Migrar los tokens semánticos de color a la nomenclatura por categoría/rol/variante (`background`/`text`/`border`/`icon` × `default`/`subtle`/`bold`/`subtlest`/`disabled`/`inverse`/`selected`), referenciando los primitivos
- [x] 7.3 Agregar tokens de estado de interacción (`hover`/`pressed`) para los roles `brand` y `neutral`
- [x] 7.4 Agregar escala tipográfica de encabezados (`heading.xxsmall`...`heading.xxlarge`) separada de la escala de texto de UI
- [x] 7.5 Agregar tokens de elevación con nombre (`elevation.surface.raised/overlay/sunken`) combinando fondo y sombra
- [x] 7.6 Agregar tokens de motion (duración `fast/normal/slow` y easing `standard/entrance/exit`)
- [x] 7.7 Agregar tokens de ancho de borde (`default`/`bold`)
- [x] 7.8 Extender el script de verificación de tokens para comprobar contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande/UI) en las combinaciones semánticas documentadas
- [x] 7.9 Actualizar el preset de Tailwind para exponer los nuevos tokens semánticos (y dejar de exponer los primitivos como utilidades directas)
- [x] 7.10 Actualizar Button, Input, Card y Badge para consumir los tokens semánticos renombrados (fondo/texto/borde por rol y estado), reemplazando las clases hardcoded actuales
- [x] 7.11 Actualizar la página de tokens del sitio de documentación para mostrar la nueva estructura (primitivos, semánticos por rol/variante, elevación, tipografía de encabezados, motion)
