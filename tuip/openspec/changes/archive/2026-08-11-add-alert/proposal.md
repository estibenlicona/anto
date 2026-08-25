## Why

El catálogo no tiene forma de comunicar un problema o una advertencia dentro del flujo de una pantalla — hoy `Badge` comunica estado en una etiqueta chica, pero nada cubre un mensaje de varias líneas con ícono, título opcional y una acción para resolverlo. La definición del sistema (`design-system/Componentes Tuya.dc.html`, sección "Alert") es la siguiente pieza faltante del catálogo.

## What Changes

- Se agrega el componente `Alert` al catálogo, como componente único (no compuesto): ícono obligatorio según la severidad, título opcional, descripción y una acción opcional.
- Cuatro variantes de severidad: `danger`, `warning`, `success` e `info` — las tres primeras ya ilustradas en la definición (danger, warning, info); se agrega `success` por simetría con las variantes que `Badge` ya expone, reusando los mismos tokens de estado.
- El ícono no es una prop que el consumidor elija: cada variante trae su propio ícono fijo (`status-error`, `status-warning`, `status-success`, `status-info`), porque la definición es explícita en que el color solo no alcanza para comunicar la severidad.
- Nace como `stable`: reusa los tokens de estado (`danger`/`warning`/`success`/`info`) que el sistema ya tiene resueltos para fondo, texto, borde e ícono — la misma familia que ya usan `Badge` y el estado de error de `Input`/`Select`/`Combobox`.
- Se añade contenido de documentación: ejemplos, anatomía y notas de accesibilidad.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Alert`; se añade el requisito de comportamiento de severidad y accesibilidad.

## Impact

- `packages/components/src/alert.tsx`: componente nuevo.
- `packages/components/registry/definitions.ts`: nueva entrada `alert`, categoría `feedback`, `status: "stable"`.
- `apps/docs/src/content/alert.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/alert/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y el requisito de comportamiento nuevo.
