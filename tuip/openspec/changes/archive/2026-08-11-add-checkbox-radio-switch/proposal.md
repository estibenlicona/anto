## Why

El catálogo tiene seis componentes; la definición documenta dieciocho. Checkbox, Radio y Switch son el cuarto capítulo del núcleo (Fase 2) y el que cierra un pendiente que `add-select-and-combobox` dejó abierto a propósito: Select orienta a usar un grupo de radios cuando una lista tiene seis opciones o menos, pero ese componente no existía todavía. Con este change, la orientación que Select ya da deja de apuntar a un componente inexistente.

Los tres controles resuelven la misma pregunta —"¿cuál de estas opciones aplica?"— con matices distintos: Checkbox es de a uno o de varios a la vez y necesita un paso explícito de guardado; Radio es mutuamente excluyente dentro de un grupo; Switch aplica al instante, sin paso de guardado, y por eso nunca se usa donde Checkbox sí corresponde.

## What Changes

- Se agregan los componentes `Checkbox`, `RadioGroup` y `Switch` al catálogo.
- `Checkbox` soporta los tres estados que la definición ilustra: marcado, desmarcado e indeterminado — el indeterminado fijado vía ref, porque no existe como atributo de JSX en un `<input>`.
- `RadioGroup` recibe una lista de opciones (mismo shape que `SelectOption`) y gestiona la selección como un solo componente, igual que Select — no se expone un `Radio` individual suelto para que el consumidor arme el grupo a mano.
- `Switch` se construye sobre `@radix-ui/react-switch`, con `role="switch"` y `aria-checked` resueltos por la primitiva. Es el único de los tres sin equivalente HTML nativo — Checkbox y Radio se construyen a mano sobre `<input>`, que ya trae la semántica y el teclado correctos del navegador.
- Se documenta la regla que distingue Switch de Checkbox —aplica al instante vs. requiere guardar— como orientación cruzada en ambos componentes, siguiendo el mismo patrón que el umbral radios/Select/Combobox de la propuesta anterior.
- Los tres nacen como `stable`: ninguno introduce un patrón de accesibilidad nuevo sin resolver — Checkbox y Radio heredan la semántica nativa, y Switch reusa la misma familia de Radix ya adoptada y verificada para Select y Combobox.
- Se añade contenido de documentación completo para los tres: ejemplos, anatomía, notas de accesibilidad y guía de uso.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa de seis a nueve componentes; se añaden los requisitos de comportamiento de Checkbox, RadioGroup y Switch.

## Impact

- `packages/components/package.json`: nueva dependencia `@radix-ui/react-switch`.
- `packages/components/src/checkbox.tsx`, `packages/components/src/radio-group.tsx`, `packages/components/src/switch.tsx`: componentes nuevos.
- `packages/components/registry/definitions.ts`: tres entradas nuevas, categoría `forms`, `status: "stable"`.
- `apps/docs/src/content/checkbox.tsx`, `apps/docs/src/content/radio-group.tsx`, `apps/docs/src/content/switch.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/checkbox/*.tsx`, `apps/docs/src/examples/radio-group/*.tsx`, `apps/docs/src/examples/switch/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los tres requisitos de comportamiento nuevos.
