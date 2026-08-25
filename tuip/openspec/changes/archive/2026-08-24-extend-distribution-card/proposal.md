## Why

El resumen de Personas rediseñado abre cada card con una cifra ("61 %", "2 sin respaldo"), una acción en la cabecera y una leyenda en línea bajo la barra. `DistributionCard` sólo sabía de un total en la esquina y de una leyenda en dos columnas o en lista; la app habría tenido que componer barra y leyenda a mano, contra la regla de que primero se valida tuip.

## What Changes

- `DistributionCard` gana `headline?: { value, note }` (cifra en `text-metric` con su lectura, entre el rótulo y la barra), `action?: ReactNode` (ocupa el slot derecho de la cabecera en lugar del total) y `legend="inline"` (una fila que envuelve, chips punto + etiqueta + cifra). `total`/`totalNoun` pasan a opcionales.
- Docs: cuándo usar `headline`/`action`, anatomía.

## Capabilities

### Modified Capabilities
- `component-library`: "Opciones del componente DistributionCard" (cifra titular, acción y leyenda en línea).

## Impact

- `packages/components/src/distribution-card.tsx` (+ test), `apps/docs/src/content/distribution-card.tsx`. Consumidor: frontend `refine-people-summary`.
