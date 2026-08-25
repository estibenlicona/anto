## Why

El Badge implementado no corresponde al "Badge de estado" que define `design-system/Componentes Tuya.dc.html` (sección 06, "Badge de estado y Tag"). La definición especifica un badge **cuadrado** (radio 3, para distinguirlo de un control clicable) con **punto de color + texto**, seis estados semánticos (`Sincronizado`, `En progreso`, `Al límite`, `Error`, `Sin iniciar`, `Sugerido por IA`), y una regla explícita: *"Nunca uses el rojo de marca en un badge: en una fila leería como acción"*. La implementación actual es una píldora sin punto, con solo cuatro variantes (`primary/success/warning/danger`), y su variante por defecto (`primary`) usa justamente el color de marca que la definición prohíbe. El componente "badge de estado" que el catálogo declara tener, en los hechos, no existe todavía.

## What Changes

- **BREAKING**: `BadgeVariant` pasa de `"primary" | "success" | "warning" | "danger"` a `"success" | "info" | "warning" | "danger" | "neutral" | "discovery"`. Se elimina `primary` (usaba el rojo de marca, prohibido en un badge) y se agregan `info`, `neutral` y `discovery`, cubriendo los seis estados que ilustra la definición. La variante por defecto pasa a `neutral`.
- Badge cambia de píldora (`radius.pill`) a forma cuadrada (`radius.control`, el mismo radio que Button e Input), para distinguirlo visualmente de Chip (que sigue siendo píldora, porque comunica pertenencia y no estado).
- Badge SHALL mostrar un punto de color antes del texto en todas sus variantes; el punto no es opcional ni se puede omitir.
- Se documenta explícitamente que Badge no SHALL usar el rol `brand` (rojo de marca) en ninguna de sus variantes.
- Se actualiza la documentación del componente (uso, anatomía, accesibilidad) y sus ejemplos en vivo para reflejar las seis variantes con punto, en vez de las cuatro anteriores sin punto.

## Capabilities

### Modified Capabilities

- `component-library`: se agrega el requisito "Opciones del componente Badge" (no existía uno dedicado) que fija la forma cuadrada, el punto obligatorio, las seis variantes semánticas y la prohibición del color de marca.

## Impact

- `packages/components/src/badge.tsx`: forma, variantes y marcado (punto + texto) reescritos. Cambio de API (`BadgeVariant`, valor por defecto).
- `apps/docs/src/content/badge.tsx`: uso, anatomía (partes y variantes) y accesibilidad actualizados a las seis variantes con punto.
- `apps/docs/src/examples/badge/*.tsx`: ejemplo de variantes reescrito con los seis estados de la definición; posible ejemplo adicional para el punto como parte no textual.
- `openspec/specs/component-library/spec.md`: nuevo requisito "Opciones del componente Badge".
- Ningún otro componente del catálogo importa `Badge` ni `BadgeVariant`, así que el cambio de API queda contenido al propio Badge y a su documentación.
