## Why

El listado de Células quiere la barra de capacidad con sus tramos separados (BAU · Transformación · libre como piezas, no como un continuo), igual que la card de resumen que la acompaña. `SegmentedBar` ya sabe dibujarse separada, pero `CapacityBar` no lo expone.

## What Changes

- `CapacityBar` gana `separated?: boolean` (por defecto `false`, para no cambiar a nadie) y lo traslada a su `SegmentedBar`; con `total`, el resto libre sigue visible como pista.
- Docs de CapacityBar: cuándo separar (cuando los tramos son categorías que comparten un total y la card de al lado ya los separa).

## Capabilities

### Modified Capabilities
- `component-library`: "Opciones del componente CapacityBar" (tramos separados).

## Impact

- `packages/components/src/capacity-bar.tsx` (+ test), `apps/docs/src/content/capacity-bar.tsx`. Consumidor: frontend `compact-squads-summary`.
