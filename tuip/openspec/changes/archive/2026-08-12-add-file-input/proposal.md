## Why

El catálogo no tiene ninguna forma de adjuntar un archivo. A diferencia de cada change anterior de esta serie, no hay una sección que traducir: se buscó "drag", "drop", "file", "archivo", "adjuntar" en los seis archivos de `design-system/*.dc.html` — `Componentes Tuya`, `Componentes Compuestos`, `Fundamentos Tuya DS`, `Iconografía`, `Torre de Control`, `Tipografía opciones` — y ninguno tiene una sección de carga de archivos. Este change diseña el componente desde los tokens, los íconos y las convenciones ya establecidas, no desde una traducción literal de un mockup.

Se pidieron dos variantes con alcance explícitamente acotado por el usuario: `FileInput` para un solo archivo, sin lista; `FileUploader` para varios, cada uno en su propia fila con nombre, tamaño y estado. Ninguna de las dos simula una subida — el progreso y el resultado (éxito o error) los maneja quien consume el componente con su propia lógica de red, la misma regla que ya rige para `Alert`, `Button` y el `action` de `Toast`: el componente nunca sabe qué hace la acción, solo la expone.

## What Changes

- Se agrega `FileInput` al catálogo: campo de un solo archivo, con zona de arrastrar-y-soltar y una alternativa por teclado que no depende de arrastrar nada — un `<input type="file">` nativo, visualmente oculto pero enfocable, detrás de la zona visible. Mismas props `label`/`error` que ya expone `Input`, para que el modelo mental sea el mismo.
- Se agrega `FileUploader` al catálogo: mismo mecanismo de arrastre, pero para varios archivos a la vez, cada uno en una fila con su propio estado (`uploading` con una barra de progreso, `success`, `error` con mensaje). El estado de cada archivo es controlado por quien lo usa — `FileUploader` no fabrica un progreso falso con un temporizador.
- Ambos son componentes separados con archivo y entrada de registro propios — mismo criterio que ya separó `Modal` de `Drawer`: comparten el mecanismo de arrastre y la alternativa de teclado, pero el contenido difiere lo suficiente (una fila fija contra una lista con estado por ítem).
- La barra de progreso de cada fila de `FileUploader` reusa el componente `Progress` ya publicado, sin reimplementarlo.
- Los íconos son todos ya existentes: `import` para la zona vacía, `attach-doc` para cada archivo elegido, `close` para quitarlo, `check`/`status-error` para los estados de `FileUploader`. Ninguno nuevo.
- Ninguno de los dos valida tipo ni tamaño de archivo — quedó fuera de alcance en la decisión inicial; ambos exponen `accept` como paso directo al atributo nativo del input, sin UI de error propia para eso.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `FileInput` y `FileUploader`; se agregan sus requisitos de opciones.

## Impact

- `packages/components/src/file-input.tsx`, `packages/components/src/file-uploader.tsx`: componentes nuevos.
- `packages/components/registry/definitions.ts`: dos entradas nuevas, categoría `forms` (junto a `Input`, `Select`, `DateField`), `status: "stable"`, sin `npmDependencies` fuera de `react`; `file-uploader` declara `dependencies: ["utils", "icon", "progress"]` para poder reusar `Progress` como archivo interno.
- `apps/docs/src/content/file-input.tsx`, `apps/docs/src/content/file-uploader.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/file-input/*.tsx`, `apps/docs/src/examples/file-uploader/*.tsx`: ejemplos en vivo, incluida una simulación de subida real (con progreso avanzando de verdad, no instantáneo) para probar los tres estados de `FileUploader`.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `FileInput` y `FileUploader`.
