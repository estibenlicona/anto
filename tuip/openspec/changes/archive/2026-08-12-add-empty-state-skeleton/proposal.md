## Why

El catálogo no tiene forma de representar dos de los cinco estados que la propia definición exige que cubra todo componente antes de entrar a `@tuya/ui` (`design-system/Componentes Tuya.dc.html`: *"los cinco estados (vacío, cargando, con datos, error, sin permiso)"*): el estado vacío y el estado de carga. Hoy, un consumidor que necesita mostrar "todavía no hay filas" o "esto está cargando" tiene que armarlo a mano sin ningún componente del sistema — el único precedente parcial es el `Icon name="sync"` girando que ya usan `Select`/`Combobox` para su propio estado de carga interno, que no es reutilizable fuera de esos dos componentes.

## What Changes

- Se agrega `EmptyState` al catálogo: icono (32px, el tamaño que la librería ya reserva para "ilustración de estado vacío"), título, descripción opcional y una acción opcional (ej. un `Button`), centrados. No es un contenedor propio con borde — se apoya en la superficie donde el consumidor lo coloque (un `Card`, el cuerpo de una `Table`, una sección de página).
- Se agrega `Skeleton` al catálogo: un bloque neutro con animación de pulso (`animate-pulse`, ya disponible en Tailwind sin tocar el preset), sin forma fija — el consumidor lo dimensiona y lo redondea por `className` para imitar la forma real del contenido que reemplaza (una línea de texto, un círculo de avatar), tal como exige la definición: *"el skeleton imita la forma real de lo que viene, no un rectángulo genérico"*.
- Se documenta como guía de uso (no como comportamiento forzado por el componente, ya que `EmptyState`/`Skeleton` no tienen forma de saber cuánto lleva esperando el consumidor) que un skeleton se muestra recién a partir de 300ms de espera, y que una espera de más de 10 segundos pide un mensaje explícito con opción de cancelar en vez de un skeleton indefinido.
- Se documenta que `EmptyState` cubre tres situaciones distintas y no intercambiables — sin datos aún (invita a crear), sin resultados (invita a limpiar filtros), sin permiso (dice a quién pedirlo) — como guía de uso con icono/título/acción sugeridos para cada una, no como una prop `variant` que cambie el render.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `EmptyState` y `Skeleton`; se agregan sus requisitos de opciones.

## Impact

- `packages/components/src/empty-state.tsx`, `packages/components/src/skeleton.tsx`: componentes nuevos.
- `packages/components/registry/definitions.ts`: dos entradas nuevas, categoría `feedback`, `status: "stable"`.
- `apps/docs/src/content/empty-state.tsx`, `apps/docs/src/content/skeleton.tsx`: contenido de uso (incluidas las tres situaciones de EmptyState y el umbral de 300ms/10s de Skeleton), anatomía y accesibilidad.
- `apps/docs/src/examples/empty-state/*.tsx`, `apps/docs/src/examples/skeleton/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `EmptyState` y `Skeleton`.
- No se agrega ningún icono nuevo: `EmptyState` reutiliza `status-empty`, cuya geometría ya coincide exactamente con el icono que ilustra el mockup.
