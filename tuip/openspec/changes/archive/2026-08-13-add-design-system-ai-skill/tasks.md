## 1. Script de generación de la Skill

- [x] 1.1 Crear `packages/components/scripts/generate-skill.ts`: leer `dist/registry.json`, agrupar componentes por `category`
- [x] 1.2 Para cada componente, extraer `usage.whenToUse`, `usage.whenNotToUse` y `usage.pairs` de `apps/docs/src/content/<name>.tsx` (omitir la sección si el componente no tiene contenido todavía, sin fallar la generación) — extracción por texto en vez de `import()` dinámico: ver design.md, Decisión 4, por el problema de JSX a nivel de módulo encontrado al implementar
- [x] 1.3 Para cada componente, leer como texto los archivos de `apps/docs/src/examples/<name>/**/*.tsx` y tomar su `meta` (título, descripción) y el cuerpo del ejemplo como fragmento de código
- [x] 1.4 Generar `dist/skill/references/<category>.md` por cada categoría con: import, estado de madurez, descripción, tabla de props, orientación de uso, ejemplos de código
- [x] 1.5 Generar `dist/skill/references/foundations.md` a partir de las reglas de tokens ya redactadas en `apps/docs/src/content/fundamentos.tsx` (escasez del color de marca, relación de espaciado, etc.)
- [x] 1.6 Generar `dist/skill/references/icons.md` a partir de `iconFamily`/`iconPaths` del paquete, con los nombres válidos agrupados por familia
- [x] 1.7 Generar `dist/skill/SKILL.md` con frontmatter (`name`, `description` disparadora) y un resumen que indique qué archivo de referencia abrir según la tarea
- [x] 1.8 Fallar con mensaje claro si `dist/registry.json` no existe cuando se corre el script
- [x] 1.9 Agregar el paso al script `build` de `packages/components/package.json`, después de `generate:registry`

## 2. Comando de instalación de la Skill

- [x] 2.1 Crear `packages/components/scripts/install-skill.ts`: copia `dist/skill/` (relativo a la ubicación del propio paquete instalado) a `<cwd>/.claude/skills/tuya-ui-design-system/`
- [x] 2.2 Resolver el `cwd` a su ruta real y verificar que el destino final quede contenido dentro de esa raíz antes de escribir cualquier archivo
- [x] 2.3 Si `.claude/skills/tuya-ui-design-system/` ya existe en el proyecto consumidor, pedir confirmación (con `node:readline/promises`, sin agregar una dependencia nueva) antes de sobrescribir
- [x] 2.4 Configurar `tsup` para compilar este script a `dist/install-skill.js` con shebang de Node
- [x] 2.5 Agregar `"bin"` a `packages/components/package.json` apuntando a `dist/install-skill.js`

## 3. Verificación

- [x] 3.1 Correr `pnpm run build` en `packages/components` y confirmar que `dist/skill/SKILL.md` y las referencias por categoría se generan sin errores
- [x] 3.2 Revisar a mano al menos una referencia generada (por ejemplo `references/actions.md`) contra el catálogo real: props, ejemplo de código e import correctos (se encontraron y corrigieron dos bugs reales: tipos union con `|` rompían las tablas Markdown, y descripciones con salto de línea partían filas — ver `escapeCell` en `generate-skill.ts`)
- [x] 3.3 Empaquetar con `pnpm run publish:local`, instalar el `.tgz` en un proyecto local de prueba, y correr el comando de instalación de la Skill
- [x] 3.4 Confirmar que la Skill queda en `.claude/skills/tuya-ui-design-system/` de ese proyecto (verificado: los 8 archivos generados quedaron copiados). El formato de `SKILL.md` (frontmatter `name`/`description`) coincide con el de las Skills ya reconocidas en este mismo repo (`.claude/skills/openspec-*`); no se abrió una sesión nueva de Claude Code aparte para confirmar la detección automática
- [x] 3.5 Volver a correr el comando de instalación sobre el mismo proyecto y confirmar que pide confirmación antes de sobrescribir (probados ambos caminos: cancelar con "n" no modifica nada, confirmar con "y" sobrescribe)
- [x] 3.6 Correr `openspec validate add-design-system-ai-skill --strict` y la comprobación estándar del proyecto (lint, build)
