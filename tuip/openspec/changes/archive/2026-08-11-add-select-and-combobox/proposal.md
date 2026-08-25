## Why

El catálogo tiene cuatro componentes; la definición documenta dieciocho. Select es el primero de los doce del núcleo —Fase 2 del roadmap— y el que este change usa como plantilla: calibra cómo se documenta un componente con estado abierto/cerrado, listbox, teclado completo y una regla de uso que depende de un número (cuántas opciones tiene la lista) antes de encarar los once restantes.

La definición trata "Select y Combobox" como un mismo capítulo con tres modos según el volumen de opciones: hasta 6, radios; de 7 a 20, select; más de 20, combobox con búsqueda. Los radios son un componente propio, fuera de este change. Select y Combobox sí se construyen ahora, como dos componentes separados que juntos cubren los dos modos que sí son un desplegable.

## What Changes

- Se agregan los componentes `Select` y `Combobox` al catálogo, ambos construidos sobre primitivas headless de Radix UI en vez de a mano: `Select` sobre `@radix-ui/react-select`, `Combobox` sobre `@radix-ui/react-popover` más `cmdk` para la lista filtrable. Es la primera vez que un componente del catálogo declara una dependencia de runtime más allá de `react`.
- `Select` soporta un estado de carga que se muestra dentro del propio desplegable, para las listas que llegan del backend — nunca un desplegable vacío mientras carga.
- `Combobox` filtra las opciones a medida que se escribe, con navegación completa por teclado (flechas, Enter, Escape) y sin exigir que el texto escrito coincida exactamente con una opción antes de poder confirmarla.
- Ambos exponen selección simple; `Combobox` además soporta selección múltiple con chips removibles dentro del campo, que es el patrón que la definición ilustra para clasificaciones de varios valores.
- Se documenta, en la página de cada componente y en su guía de uso, el umbral que decide cuál de los tres modos corresponde — incluida la recomendación de usar radios por debajo de 7 opciones, que este change no construye pero sí orienta.
- Se añade contenido de documentación completo para ambos: ejemplos, anatomía, notas de accesibilidad y guía de uso, siguiendo el mismo patrón que Button, Input, Card y Badge.
- Select y Combobox se publican como `stable`, no como `beta`.
- El vocabulario del campo de madurez se traduce al inglés: `"estable"` pasa a `"stable"`, para los seis componentes del catálogo, no solo los dos que agrega este change. Se usa la nomenclatura de canal de publicación estándar del ecosistema (`stable` / `beta`, la misma distinción que un dist-tag de npm) en vez de una traducción propia.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa de cuatro a seis componentes (se agregan Select y Combobox); se documenta que un componente puede declarar una dependencia de runtime más allá de `react`, distribuida por el mismo mecanismo (`npmDependencies` del registro) que ya declara `react` para los cuatro existentes; se fija el vocabulario del campo de madurez en inglés (`stable` / `beta`).
- `docs-site`: el requisito de estado de madurez del componente actualiza su ejemplo textual de `"estable"` a `"stable"`.

## Impact

- `packages/components/package.json`: nuevas dependencias `@radix-ui/react-select`, `@radix-ui/react-popover` y `cmdk`.
- `packages/components/src/select.tsx`, `packages/components/src/combobox.tsx`: componentes nuevos.
- `packages/components/registry/definitions.ts`: dos entradas nuevas, categoría `forms`, con sus `npmDependencies` declaradas.
- `apps/docs/src/content/select.ts`, `apps/docs/src/content/combobox.ts`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/select/*.tsx`, `apps/docs/src/examples/combobox/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado, la declaración de dependencias de runtime, y el vocabulario del campo de madurez.
- `openspec/specs/docs-site/spec.md`: el ejemplo textual del requisito de estado de madurez.
- `packages/components/registry/definitions.ts`: el tipo `ComponentStatus` y las seis entradas del registro (Button, Input, Card, Badge pasan de `"estable"` a `"stable"`; Select y Combobox se registran como `"stable"`).
- `apps/docs/src/data/registry.ts`: el tipo `ComponentStatus` espejado.
- `apps/docs/src/components/ComponentChips.tsx`: el mapa de clases por estado, hoy indexado por `"estable"`.
