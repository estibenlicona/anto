## Context

El listado de Células (`SquadsList.tsx`) muestra Capacidad como dos líneas de texto y la card de distribución (`SquadsStatsCards.tsx`) usa `SegmentedBar` con roles semánticos (`danger`/`warning`/`info`) y `color: "gray"` para Baja (que resuelve a `bg-neutral-bold`, casi negro). El mockup aprobado (artifact "Listado de Células", `Main.dc.html` en el scratchpad de esta sesión) define la nueva celda y la nueva paleta. Ver proposal.md - Why.

Restricciones:

- `SegmentedBar` de `tuip` sólo acepta `role` (4 estados), `color` (6 categóricos) o `tone` (4 acentos): no admite un hex arbitrario ni "marca atenuada", así que la barra de la card no puede salir de `SegmentedBar` con la nueva paleta.
- La ocupación por fila necesita el FTE disponible del equipo de cada célula; hoy sólo `GET /squads/:id/team-stats` lo calcula (`teamAvailableFte`). El listado no puede pedir N llamadas.
- El change `add-squad-detail-page` está implementado y sin archivar: el delta de "Listar células" parte de su versión (nombre como enlace) para que el archivo de cualquiera de los dos deje el spec completo.
- Tokens disponibles para la escala: `bg-danger-bold` (#8E0F18), `bg-brand-bold` (#C9151F), `border-neutral-default` (#E3E3E6). No hay paso intermedio de marca.

## Goals / Non-Goals

**Goals:**
- Celda Capacidad idéntica al mockup, compuesta con primitivos ya usados en la app (barra local con clases semánticas como la de utilización en Personas; tonos slate/blue para BAU/Transf. como en el detalle).
- Card de distribución con la escala de calor, manteniendo `SegmentedBar` fuera y la leyenda/pie en el mismo patrón que las otras cards.
- `teamAvailableFte` por célula en el listado, calculado en el mock.

**Non-Goals:**
- Tocar badges, el detalle, `SquadTeamStatsCards`, o proponer el token intermedio en `tuip` (se anota como candidato).

## Decisions

### D1. `SquadDto.teamAvailableFte` (mock)

`enrich()` en `squads.handlers.ts` ya cruza asignaciones; suma además `availableFte` de las personas de `getPeopleSnapshot()` que aparecen en las asignaciones de la célula (mismo cálculo que `computeTeamStats`, extraído a un helper compartido `teamAvailableFteOf(own)`). `SquadAdapter` normaliza `?? 0`.

### D2. Celda Capacidad (`SquadsList.tsx`)

```
[2.7 / 3.8 FTE]                       [71%]   ← % con clase por umbral
[■■■■■■■■■■■ ■■■■■■      ]                    ← barra apilada sobre teamAvailableFte
[● BAU 1.7  ● Transf. 1.0      1.1 libre]
```

- `capacityOccupancyClass(pct)` en `features/squads/components/capacity.ts`: `< 85 → text-success-default`, `85–99 → text-warning-default`, `≥ 100 → text-danger-default`; `pct = teamAvailableFte > 0 ? allocatedFte / teamAvailableFte * 100 : 0`. Exportada y probada como unidad (bordes 0/84/85/99/100/120). Es la misma idea que `utilizationFillClass` de Personas pero con un umbral de advertencia antes del tope, como pide el mockup; se mantienen separadas porque los umbrales difieren.
- Barra: `div` track `bg-neutral-subtle` con dos `div` hijos de ancho `bauFte / teamAvailableFte * 100 %` y `transformationFte / teamAvailableFte * 100 %` (saturados a 100 en conjunto), clases `bg-accent-slate-fill` y `bg-accent-blue-fill` (las mismas que `MIX_LEGEND_DOT_CLASSES` del detalle, importadas desde `SquadTeamStatsCards` para que sigan siendo una sola definición), `gap` de 2 px.
- Leyenda: puntos con las mismas dos clases + cifras `toFixed(1)`; a la derecha `"{free} libre"` o `"Al tope"` (`font-semibold text-danger-default`) cuando `pct ≥ 100`.
- Sin equipo (`memberCount === 0`): `0.0 FTE` atenuado, track vacío, "Sin capacidad asignada".
- La celda lleva `max-w` 260 px para que la barra no se estire con la tabla.

### D3. Card de distribución (`SquadsStatsCards.tsx`)

- Se reemplaza `SegmentedBar` por una barra local (`flex gap-[3px]`, segmentos `rounded-pill` con `flex: count`) para poder usar la escala. Mapa único `CRITICALITY_HEAT` usado por segmento y punto de leyenda:
  - Critical → `bg-danger-bold`
  - High → `bg-brand-bold`
  - Medium → `bg-brand-bold` con `opacity-45` (ver D4)
  - Low → `bg-neutral-subtle-pressed` (#E3E3E6, mismo valor que el borde neutro) con el punto de leyenda bordeado para que no desaparezca sobre blanco.
- Pie: `"{high + critical} de {total} células en criticidad alta o crítica"`, mismo estilo que el pie de la card de seniority en Personas.
- Los segmentos con `count === 0` no se renderizan en la barra (un `flex: 0` con gap dejaría un hueco), pero sí en la leyenda.

### D4. "Media" sin token intermedio

Se usa `bg-brand-bold` + `opacity-45` sobre el fondo blanco de la card, que resuelve visualmente al `#F29CA1` del mockup. Alternativa descartada: un hex literal (`bg-[#F29CA1]`) — rompe la regla de no definir colores localmente y no seguiría un cambio de marca. Se deja comentario señalando que si `tuip` publica un paso intermedio de la escala de marca, se reemplaza la opacidad por ese token.

### D5. Pruebas

- `capacity.test.ts`: bordes de umbral y `pct` con `teamAvailableFte = 0`.
- `SquadsList.test.tsx`: celda con `1.8 / 2.0 FTE`, `90%` en advertencia, anchos inline de los dos tramos, leyenda y "0.2 libre"; "Al tope" en peligro al 100 %; célula sin equipo.
- `SquadsStatsCards.test.tsx`: clases de la escala por nivel en segmento y punto (y que ya no usa roles `warning`/`info`), segmentos en cero ausentes de la barra y presentes en la leyenda, pie "3 de 5 …".
- `squads.handler.test.ts`: `teamAvailableFte` igual a la suma de `availableFte` de las personas asignadas; 0 sin equipo.
- Fixtures: `SquadDto`/`Squad` de `useSquads.test`, `useSquad.test`, `SquadAdapter.test`, `SquadDetailHeader.test`, `SquadsContainer.test` ganan `teamAvailableFte`.

## Risks / Trade-offs

- [La card deja de compartir color con los badges] → Decisión explícita del usuario (artboard A); el spec lo documenta como escala de intensidad propia de la card. Si se quisiera volver a la correspondencia, la paleta B del canvas es el camino.
- [`opacity-45` sobre un fondo no blanco (tema oscuro) no dará el mismo matiz] → La card siempre pinta sobre `bg-neutral-default`; en oscuro el rojo atenuado sigue leyéndose como "menos que Alta", que es lo que importa. Candidato a token en `tuip`.
- [Dos changes sin archivar tocan "Listar células"] → El delta de este change parte del texto del otro; archivar en cualquier orden deja el spec con ambos cambios.
