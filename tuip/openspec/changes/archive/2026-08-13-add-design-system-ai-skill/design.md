## Context

Ver proposal.md - Why. `packages/components` ya genera `dist/registry.json` en su build (`registry/generate.ts`, ver `openspec/specs/docs-site` y el change `adopt-published-component-library`), con la API, props y descripción de cada componente. `apps/docs/src/content/*.tsx` tiene, por componente, un objeto `ComponentContent` con `usage.whenToUse`, `usage.whenNotToUse` y `usage.pairs` (do/dont/why) en texto plano, además de funciones que renderizan JSX para la vista previa (irrelevantes para la Skill). `apps/docs/src/examples/<componente>/*.tsx` tiene fragmentos de código reales, ya escritos para mostrarse en el sitio con `import { X } from "@tuya-ui/components"`.

## Goals / Non-Goals

**Goals:**
- Que la Skill se pueda regenerar con un solo comando cuando cambia el catálogo, sin edición manual.
- Que instalar la Skill en otro proyecto sea un solo comando, coherente con `pnpm run publish:local` (ver el change anterior) como flujo de trabajo 100% local.
- Que el contenido esté organizado para carga progresiva: `SKILL.md` corto + referencias por categoría, no un volcado único de todo el catálogo.

**Non-Goals:**
- No se genera una Skill por framework: el catálogo es React, la Skill es sobre React.
- No se automatiza la publicación de la Skill por separado de `@tuya-ui/components`; viaja siempre junto con el paquete.
- No hay modo watch ni actualización incremental: se regenera completa en cada build.
- No se valida ni se prueba automáticamente que el contenido generado "suene bien"; la validación es de estructura (props, ejemplos, orientación de uso presentes o ausentes según corresponda), no de calidad editorial.

## Decisions

### 1. Formato: Markdown, no JSON

Los archivos de referencia se generan en Markdown, siguiendo la convención de Agent Skills (`SKILL.md` + archivos de referencia en Markdown que el modelo lee con la herramienta de lectura de archivos). Es el formato más legible para un modelo de lenguaje por carácter/token frente a JSON, y es el que ya usan los ejemplos de Skills existentes.

### 2. Agrupamiento: un archivo de referencia por categoría, no por componente

`registry.json` ya clasifica cada componente en una categoría (`actions`, `forms`, `feedback`, `layout`, `overlays`, más `utility` para iconos y helpers). Se genera un archivo Markdown por categoría (`references/actions.md`, `references/forms.md`, etc.), más `references/foundations.md` (reglas de tokens) y `references/icons.md` (nombres válidos de ícono).

**Por qué**: 39 archivos por componente obligarían a Claude a decidir cuál abrir componente por componente; una categoría por archivo alcanza para resolver la mayoría de las tareas ("armá un formulario", "agregá feedback a esta acción") con una sola lectura, sin cargar categorías que no vienen al caso.

**Alternativas consideradas**:
- *Un archivo por componente*: más preciso pero multiplica las decisiones de qué abrir y el número de archivos a mantener.
- *Un único archivo con todo el catálogo*: más simple de generar, pero anula el ahorro de tokens que motiva este change — Claude cargaría el catálogo completo aunque solo necesite un botón.

### 3. Fuente de los ejemplos de código: los mismos que usa el sitio de documentación

En vez de generar ejemplos nuevos, el script copia el contenido de `apps/docs/src/examples/<componente>/*.tsx` tal cual — son los mismos fragmentos que ya se muestran y mantienen actualizados en el sitio, con el import correcto (`@tuya-ui/components`).

**Por qué**: es la forma más directa de lograr el objetivo del proposal — que el modelo reutilice código ya escrito en vez de generarlo — y evita mantener una tercera copia de ejemplos (código fuente del componente, ejemplo del sitio, ejemplo de la Skill).

### 4. El script de generación vive en `packages/components` y lee `apps/docs` por ruta relativa

`packages/components/scripts/generate-skill.ts` lee `apps/docs/src/content/<componente>.tsx` y `apps/docs/src/examples/<componente>/*.tsx` como texto plano por ruta relativa dentro del monorepo (no los importa como módulos: algunos archivos de contenido construyen JSX a nivel de módulo — por ejemplo un ícono dentro de una lista de opciones — que solo se evalúa correctamente bajo el runtime de JSX de un bundler, no en un `import()` de Node vía `tsx`; probado en la implementación). Del campo `usage` extrae solo el objeto balanceado por texto (`usage: { ... }`) y lo evalúa de forma aislada — ese objeto es siempre datos planos (strings y arrays), nunca JSX, así que evaluarlo por separado evita el problema sin perder la extracción dinámica. `references/foundations.md` e `references/icons.md` sí importan sus fuentes dinámicamente (`fundamentos.tsx`, `icons/paths.ts`), porque ninguna de las dos construye JSX a nivel de módulo. Corre como parte de `pnpm run build` de `@tuya-ui/components`, después de `generate:registry` (del que depende: necesita `dist/registry.json` ya generado).

**Por qué**: mismo patrón que ya usa `scripts/build-css.ts` (lee `../tokens/dist/tokens.css` por ruta relativa) — es un acoplamiento de build-time ya aceptado en este monorepo entre paquetes hermanos, no una dependencia de runtime nueva.

**Alternativas consideradas**:
- *Mover las guías de uso a `packages/components` como fuente única*: más limpio a largo plazo, pero reescribe la organización actual de `apps/docs` sin necesidad para este change; queda como mejora futura si el acoplamiento se vuelve un problema real.

### 5. Instalador: un `bin` en `@tuya-ui/components`, no un paquete aparte

Se agrega `"bin"` a `packages/components/package.json` apuntando a un script compilado (`dist/install-skill.js`) que copia `dist/skill/` (generado por el paso anterior) al `.claude/skills/tuya-ui-design-system/` del proyecto consumidor. Se invoca con `npx tuya-ui-install-skill` (o el nombre de bin equivalente) desde cualquier proyecto que ya tenga `@tuya-ui/components` instalado — incluyendo el flujo de instalación local por `.tgz` de `pnpm run publish:local`, ya que un `bin` viaja dentro del tarball igual que `dist/`.

El script usa únicamente módulos nativos de Node (`node:fs`, `node:path`, `node:readline/promises`) para la confirmación de sobrescritura, sin agregar una dependencia de runtime nueva al paquete (a diferencia del viejo `tuip`, que usaba `prompts`).

**Por qué**: el objetivo explícito de esta sesión es que instalar la Skill sea "súper fácil" y no dependa de un segundo paquete ni de un paso de publicación aparte; un `bin` dentro del mismo paquete que ya se instala cumple eso con la menor superficie posible.

**Alternativas consideradas**:
- *Paquete `@tuya-ui/claude-skill` separado*: descartado en la conversación previa — un paquete más para versionar y sincronizar sin necesidad, dado que la Skill siempre corresponde 1:1 a la versión de `@tuya-ui/components` con la que se generó.

### 6. Contención de escritura: destino fijo, no configurable

A diferencia del viejo `cli-installer`, este comando no lee ninguna configuración del proyecto consumidor para decidir dónde escribir — el destino es siempre `<cwd resuelto>/.claude/skills/tuya-ui-design-system`. La verificación de contención se reduce a resolver `cwd` a su ruta real (siguiendo symlinks) y confirmar que el destino final cae bajo esa raíz, sin superficie de ataque por configuración externa como la que motivó los requisitos de contención del CLI original.

## Risks / Trade-offs

- [El build de `packages/components` pasa a depender de la estructura interna de `apps/docs`] → Mitigado porque es el mismo tipo de acoplamiento de build-time que ya existe en el monorepo (Decisión 4); si `apps/docs` reorganiza sus carpetas, el script de generación falla de forma clara en vez de producir una Skill vacía.
- [La Skill puede quedar desactualizada si alguien publica `@tuya-ui/components` sin correr el build completo] → Mitigado porque la generación es parte de `pnpm run build`, el mismo comando que ya corre `prepublishOnly` antes de publicar.
- [Agregar un `bin` a una librería de componentes es un patrón poco común] → Aceptado como decisión explícita de esta sesión; la superficie es mínima (solo copia archivos de la Skill, no toca componentes ni tokens), muy distinta en alcance del CLI de copy-paste retirado en el change anterior.

## Migration Plan

No aplica: este change es puramente aditivo (contenido nuevo empaquetado + un comando nuevo), no cambia el comportamiento de los componentes existentes ni el flujo de instalación ya documentado en `openspec/specs/docs-site`.
