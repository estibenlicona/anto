## Why

El catálogo no tiene forma de mostrar en qué paso de un flujo con validación entre pasos está una persona. `design-system/Componentes Compuestos Tuya.dc.html` — un segundo archivo de mockup, distinto del que fundamentó cada change anterior, dedicado a patrones compuestos en vez de componentes atómicos — trae la sección "Stepper · Solicitud de ampliación" (línea 410) con la regla de uso explícita: bajo tres pasos alcanza un formulario simple, sobre cinco el usuario pierde el hilo y conviene guardar borrador.

Este archivo también contiene, en la sección siguiente (línea 465), su propia versión de "Activity timeline" — el componente que ya se agregó al catálogo en un change anterior a partir de una captura, cuando esta fuente no se había mirado todavía. Los colores y la estructura de esa sección coinciden con lo ya construido, así que no hace falta ninguna reconciliación — se lo menciona acá solo como constancia de que esta fuente es consistente con lo ya archivado, no como algo que este change deba tocar.

## What Changes

- Se agrega `Stepper` al catálogo: familia compuesta `Stepper` (fila horizontal) y `StepperStep` (cada paso), con tres estados por paso — `completed`, `current`, `pending` — que el consumidor asigna explícitamente, sin que `Stepper` calcule posiciones ni infiera el paso activo a partir de un índice.
- Los tres estados reusan tokens y piezas ya existentes: el círculo de `completed` usa `bg-success-bold` + el ícono `check` ya publicado; el de `current` usa exacto el mismo par `bg-brand-bold`/`text-brand-on-bold` que ya valida el botón primario; el de `pending` usa `border-neutral-default` + `text-neutral-subtle`. Ningún ícono ni token nuevo.
- El diámetro del círculo (28px) coincide exacto con el paso `h-7`/`w-7` de la escala de espaciado de Tailwind que ya expone el preset — no hace falta un valor arbitrario para eso, a diferencia del ancho de Tooltip o de Menu en changes anteriores.
- La línea de conexión entre pasos sigue el mismo mecanismo que ya resolvió `ActivityTimeline` para su línea vertical: un segmento que cada `StepperStep` dibuja hacia el siguiente, suprimido en el último paso por CSS, sin que `Stepper` necesite inspeccionar su posición entre los `children`.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Stepper`; se agrega su requisito de opciones.

## Impact

- `packages/components/src/stepper.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: entrada nueva, categoría `layout` (junto a `Tabs` y `Breadcrumb` — navegación secundaria dentro de un flujo), `status: "stable"`, sin `npmDependencies` fuera de `react`.
- `apps/docs/src/content/stepper.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/stepper/*.tsx`: ejemplos en vivo, incluida una traza interactiva de "Atrás"/"Continuar" que avanza el estado de los pasos.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `Stepper`.
