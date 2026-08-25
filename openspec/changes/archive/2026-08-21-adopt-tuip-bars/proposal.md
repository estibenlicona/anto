## Why

`tuip` acaba de publicar (change `extend-bars-for-capacity-views`, ya archivado y en el `.tgz` local) los tres componentes que la app venía componiendo a mano —`CapacityBar`, `DistributionCard`, `Meter`— más `SegmentedBar` con `heat`/`total`/`size`, `Progress` con `warningFrom` y el token `bg-brand-strong`. Mientras la app no los adopte, mantiene cuatro barras locales con medidas sueltas, dos helpers de umbral duplicados (`utilization.ts`, `capacity.ts`), tres cards de distribución escritas tres veces y un `opacity-45` que ya tiene token. Adoptarlos deja a la app consumiendo el sistema tal cual y sin código de presentación propio para estas piezas.

## What Changes

- **Reinstalar `@tuya-ui/components`** desde `tuip/.local-packages` para tomar la versión publicada.
- **Listado de Células — columna Capacidad**: `CapacityCell` local → `CapacityBar` (`allocated`, `available = teamAvailableFte`, `parts` BAU/Transf. en slate/blue, `unit="FTE"`, umbral 85 por defecto, textos por defecto). Se elimina `components/capacity.ts` y su test.
- **Cards de distribución** → `DistributionCard`:
  - Personas, "Distribución por seniority" (`tone` por nivel, pie con "% en avanzado o superior" y "requieren acompañamiento").
  - Células, "Distribución por criticidad" (`heat` por nivel, pie "N de M células en criticidad alta o crítica").
  - Detalle de célula, "Mix BAU / Transformación" (`tone` slate/blue, `separated={false}`, pie "% del esfuerzo va a operación").
  Se eliminan `CRITICALITY_HEAT_CLASSES`, `MIX_LEGEND_DOT_CLASSES`, `LEGEND_DOT_CLASSES` / `SENIORITY_TONES` locales en lo que ya no haga falta; la barra local de la card de criticidad desaparece con `opacity-45`.
- **Barras de porcentaje en filas** → `Meter`:
  - Personas, columna Utilización (`warningFrom={100}`: igual que hoy, warning exactamente al 100).
  - Equipo del detalle, columna Dedicación (`warningFrom={100}`).
  Se elimina `people/components/utilization.ts` y su test.
- **Sin cambio de comportamiento ni de spec**: mismas cifras, mismos umbrales, mismos colores (el único matiz que cambia es "Media" en la card de criticidad, que pasa de marca al 45 % a `bg-brand-strong`, el token que nació para eso). Por eso el change declara `skip_specs`.

### Fuera de alcance

- Cambiar umbrales, textos o paletas. Cualquier ajuste visual es un change aparte.
- La barra de mix BAU/Transformación de cada fila del equipo se mantiene como `SegmentedBar` con tonos (ya es componente de `tuip`); sólo pasa a `size="sm"` para quitar la altura inline.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — refactor de presentación sin cambio de requisitos; `skip_specs: true`)

## Impact

- `frontend/package.json` / lockfile: reinstalación del paquete local.
- `features/squads/components/SquadsList.tsx`, `SquadsStatsCards.tsx`, `SquadTeamStatsCards.tsx`; `features/people/components/PeopleList.tsx`, `PeopleStatsCards.tsx`; `features/allocations/components/AllocationsList.tsx`.
- Eliminados: `features/squads/components/capacity.ts` (+ test), `features/people/components/utilization.ts` (+ test).
- Tests de los componentes tocados: se ajustan los selectores que dependían de `data-testid`/clases de las barras locales a la estructura de los componentes de `tuip` (mismas clases de relleno, así que las aserciones de color se mantienen).
- Sin impacto en mocks, hooks, servicios ni rutas.
