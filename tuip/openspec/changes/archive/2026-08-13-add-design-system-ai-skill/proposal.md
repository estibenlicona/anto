## Why

Hoy, cuando un modelo de IA construye una pantalla con Tuya UI, tiene que redescubrir el catálogo cada vez: leer el código fuente de los componentes o el sitio de documentación para saber qué existe, qué props acepta cada uno y cuándo corresponde usarlo. Eso gasta tokens en volver a derivar información que ya está construida y documentada, y sin una fuente autorizada el modelo puede terminar reinventando un componente en lugar de usar el que ya existe. Como `@tuya-ui/components` ya expone su catálogo estructurado (`registry.json`: props, API, descripciones) y el sitio de documentación ya tiene lineamientos de uso redactados por componente, ese conocimiento se puede empaquetar como una Skill de Claude que el modelo carga bajo demanda en vez de reconstruir desde cero.

## What Changes

- Se agrega una Skill de Claude para el sistema de diseño Tuya UI: un `SKILL.md` que dispara cuando se está construyendo UI en un proyecto que usa (o podría usar) `@tuya-ui/components`, más archivos de referencia separados por categoría (acciones, formularios, feedback, layout, overlays, iconografía, fundamentos) que el modelo lee solo cuando los necesita.
- El contenido de esos archivos de referencia se genera automáticamente a partir de las fuentes que ya existen — `registry.json` (props, API, descripción, estado de madurez), las guías de uso de `apps/docs/src/content/*.tsx` (cuándo usar, cuándo no, pares de uso recomendado/desaconsejado) y los ejemplos de código de `apps/docs/src/examples/**` — en vez de redactarse a mano, para que no se desincronice del catálogo real.
- La Skill se empaqueta dentro de `@tuya-ui/components`: cualquier proyecto que ya instaló la librería tiene los archivos de la Skill disponibles en su `node_modules`, sin un paquete aparte que mantener sincronizado.
- Se agrega un comando (`npx @tuya-ui/components install-skill` o equivalente) que copia esos archivos al `.claude/skills/` del proyecto consumidor, para que Claude Code la detecte y la use.

## Capabilities

### New Capabilities
- `ai-skill`: contenido y estructura de la Skill de Claude del sistema de diseño — el `SKILL.md`, los archivos de referencia por categoría, y el requisito de que se generen automáticamente desde las fuentes existentes (registry, guías de uso, ejemplos) en vez de mantenerse a mano.
- `skill-installer`: el comando empaquetado con `@tuya-ui/components` que copia los archivos de la Skill al `.claude/skills/` del proyecto consumidor.

### Modified Capabilities
(ninguna — este change no altera el comportamiento de los componentes en sí ni de la publicación del paquete, solo agrega contenido y un comando nuevos)

## Impact

- `packages/components`: nuevo script de generación (análogo a `registry/generate.ts`) que produce los archivos de la Skill a partir de `registry.json` y del contenido de `apps/docs`; nuevo `bin` en el paquete para el comando de instalación de la Skill; el build (`pnpm run build`) pasa a incluir este paso.
- `apps/docs`: sigue siendo la fuente de las guías de uso y los ejemplos que alimentan la generación — no cambia su propio comportamiento.
- Ningún cambio en el comportamiento de los componentes React, en cómo se instala `@tuya-ui/components`, ni en el proceso de versionado/publicación ya definido en `component-library-publishing`.
