## Context

Ver proposal.md - Why. Estado de la app que condiciona el reemplazo:

- `SquadsList.tsx` tiene `CapacityCell` (≈70 líneas) con `data-testid="capacity-pct|capacity-bau|capacity-transformation"`, y `components/capacity.ts` con `capacityOccupancy` (umbrales 85/100).
- `SquadsStatsCards.tsx` compone la barra de criticidad a mano con `CRITICALITY_HEAT_CLASSES` (incluye `opacity-45`) y `data-testid="heat-segment-*" | "legend-dot-*"`.
- `SquadTeamStatsCards.tsx` exporta `MIX_LEGEND_DOT_CLASSES` (lo importan `SquadsList` y la card de mix).
- `PeopleStatsCards.tsx` tiene `SENIORITY_TONES` + `LEGEND_DOT_CLASSES` y la card de seniority con pie de dos lecturas; `PeopleList.tsx` y `AllocationsList.tsx` componen la barra de utilización/dedicación con `utilizationFillClass` (warning exactamente al 100) y `minWidth: 7rem`.
- Los tests de esos componentes afirman clases de relleno (`bg-accent-*-fill`, `bg-danger-bold`, …) y, en algunos casos, `data-testid` o anchos inline.
- El paquete `@tuya-ui/components` instalado ya expone `CapacityBar`, `DistributionCard`, `Meter`, `SegmentedBarHeat`, `severityFor` (publicado por `extend-bars-for-capacity-views`).

## Goals / Non-Goals

**Goals:**
- Cero barras compuestas a mano y cero helpers de umbral en la app; cero `opacity-*` y cero alturas/anchos inline para barras.
- Resultado visual idéntico (salvo el matiz de "Media", que pasa al token).
- Tests equivalentes: mismas aserciones de negocio (cifras, umbrales, textos), adaptadas a la estructura de los componentes del sistema.

**Non-Goals:**
- Tocar umbrales, textos, orden de columnas o paletas.
- Abstraer las tres cards en un componente de la app: `DistributionCard` ya es esa abstracción.

## Decisions

### D1. Capacidad por célula → `CapacityBar`

```tsx
<CapacityBar
  className="max-w-64"   // el ancho lo limita el consumidor
  allocated={squad.allocatedFte}
  available={squad.teamAvailableFte}
  parts={[
    { label: "BAU", value: squad.bauFte, tone: "slate" },
    { label: "Transf.", value: squad.transformationFte, tone: "blue" },
  ]}
  unit="FTE"
/>
```
- Caso sin equipo: `allocated === 0 && parts` — las partes valen 0 pero existen; para que `CapacityBar` muestre la variante vacía se pasa `parts={[]}` cuando `memberCount === 0`. Los defaults (`warningFrom` 85, "libre", "Al tope", "Sin capacidad asignada") coinciden con los textos actuales.
- `MIX_TONES = { bau: "slate", transformation: "blue" } as const` queda como única constante de la app (en `SquadTeamStatsCards.tsx`, reemplazando `MIX_LEGEND_DOT_CLASSES`): el tono es la decisión de dominio; la clase la resuelve `tuip`.
- Se elimina `capacity.ts`; `severityFor` de `tuip` cubre el umbral si alguien lo necesita fuera de la barra.
- Tests de `SquadsList`: pasan a afirmar por `aria-label` ("90% de ocupación"), texto ("0.2 libre", "Al tope", "Sin capacidad asignada") y clases de relleno en los hijos del `SegmentedBar` (`.bg-accent-slate-fill`), sin `data-testid`.

### D2. Cards de distribución → `DistributionCard`

- **Criticidad** (`SquadsStatsCards`): `items = byCriticality.map(e => ({ label: CRITICALITY_LABELS[c], value: count, heat: CRITICALITY_HEAT[c] }))` con `CRITICALITY_HEAT: Record<Criticality, SegmentedBarHeat> = { Critical: "max", High: "high", Medium: "mid", Low: "low" }`; `totalNoun="células"`; `footer` = la lectura "N de M células en criticidad alta o crítica". Se borra `CRITICALITY_HEAT_CLASSES` y la barra manual.
- **Seniority** (`PeopleStatsCards`): `items` con `tone: SENIORITY_TONES[level]`; `totalNoun="personas"`; `footer` con las dos lecturas actuales (avanzado o superior · requieren acompañamiento). Se borra `LEGEND_DOT_CLASSES`; `SENIORITY_TONES` se queda (es la decisión de dominio nivel → tono, compartida con `SeniorityCard` por nombre).
- **Mix** (`SquadTeamStatsCards`): `items` BAU/Transformación con `MIX_TONES`, `separated={false}` (son partes de un todo), `totalNoun="FTE"` con `total = allocatedFte` — la cabecera hoy muestra "2.7 FTE"; `DistributionCard` imprime `{total} {totalNoun}` sin formato decimal, así que se pasa `total={Number(allocatedFte.toFixed(1))}`… **no**: `total` es `number` y `2.7` se imprime "2.7", pero `1` se imprimiría "1" y hoy es "1.0". Decisión: `DistributionCard.total` acepta `number | string`? No — no se toca `tuip` en este change. Se pasa `total={allocatedFte}` y se acepta "1 FTE" en el caso entero; es la card del detalle, la cifra grande va en la card vecina. Se anota como mejora menor para `tuip` (`totalFormatter`).
- Tests de las tres cards: se mantienen las aserciones de color por clase (`legendItemFor(label).querySelector("span")`) y las de pie; se quitan las que dependían de `data-testid="heat-segment-*"` (la barra la prueba `tuip`), conservando "un nivel en cero no pinta segmento" vía `.gap-hug > div`.

### D3. Utilización y dedicación → `Meter`

`<Meter value={person.utilization} warningFrom={100} label="Utilización" />` en `PeopleList`; `<Meter value={allocation.dedicationPercentage} warningFrom={100} className="max-w-36" />` en `AllocationsList` (hoy `maxWidth: 9rem`). Se borra `utilization.ts` y su test; los tests de umbral (0/1/99/100/101) viven en `tuip` (`progress.test.tsx`). Los tests de lista conservan "clase de relleno por umbral + ancho inline" leyendo el hijo del `[role=progressbar]`.

### D4. Mini barra BAU/Transf. de la fila del equipo

Ya es `SegmentedBar` con tonos; sólo gana `size="sm"` y pierde el `style={{ width: "10rem" }}` por `className="w-40"`.

### D5. Reinstalación

`npm install` en `frontend/` tras el `publish:local` ya hecho (el `package.json` apunta al `.tgz`); verificar que `node_modules/@tuya-ui/components/dist/index.d.ts` declara `CapacityBar` antes de tocar código.

## Risks / Trade-offs

- [Cabecera de la card de mix imprime "1 FTE" en vez de "1.0 FTE" para enteros] → Aceptado; mejora menor pendiente en `tuip` (`totalFormatter`). Los datos de las semillas no caen en ese caso.
- [Tests acoplados a `data-testid` locales] → Se reescriben sobre roles/labels/clases, que son contrato del sistema; las aserciones de negocio no cambian.
- [El `.tgz` instalado no es el último] → D5 lo verifica primero; si falta, `pnpm run publish:local` en `tuip` y reinstalar.
