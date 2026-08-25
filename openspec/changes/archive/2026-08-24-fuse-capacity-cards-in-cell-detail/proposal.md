## Why

En el resumen del detalle de célula, dos de los tres indicadores repiten el mismo dato. "Capacidad asignada" muestra 2.8 / 3.8 FTE con su porcentaje y lo libre; "Mix BAU / Transformación" muestra… el mismo 2.8 FTE, repartido en BAU 1.6 + Transformación 1.2. El total del mix ES la capacidad asignada — dos cards vecinas contando la misma cifra, señalado por el usuario como repetición (con la precisión de que la redundancia está en el detalle, no en el listado del equipo).

El sistema de diseño ya tiene la pieza que dice ambas cosas a la vez: `CapacityBar` — asignado sobre disponible, el porcentaje de ocupación coloreado por severidad, la barra apilada cuyas partes son el reparto BAU/Transformación y cuyo track vacío es lo libre. La Torre de control ya la usa exactamente así en "Ocupación por célula": la fila de Backend Platform dice "2.8 / 3.8 FTE · 74% · BAU 1.6 · Transf. 1.2 · 1.0 libre" en una sola pieza.

## What Changes

- **El resumen del detalle pasa de 3 indicadores a 2**: "Equipo" queda como está, y "Capacidad asignada" y "Mix BAU / Transformación" se fusionan en una sola card de **Capacidad** construida sobre `CapacityBar`: FTE asignado sobre disponible, porcentaje de ocupación con su severidad (advertencia cerca del tope, peligro al pasarse — lo que hoy insinúa la barra de progreso roja), la barra apilada con las partes BAU y Transformación en los tonos del mix, lo libre como lectura, y en el pie el porcentaje del esfuerzo que va a operación (la lectura que hoy cierra la card del mix).
- **Nada de información desaparece**: total asignado, disponible, porcentaje, libre, BAU, Transformación y "% del esfuerzo va a operación" siguen todos presentes — una sola vez cada uno.
- **La grilla del resumen pasa de 3 a 2 columnas**, y las dos cards ganan el ancho que ocupaba la duplicación.
- **Coherencia con la Torre de control**: la misma célula se lee con la misma forma en la Torre ("Ocupación por célula") y en su detalle.

### Fuera de alcance

- La tabla del equipo del detalle (columnas "Dedicación" y "BAU / Transformación" por fila): existe una redundancia análoga ahí — BAU + Transformación suma la dedicación — pero es otra superficie y el usuario acotó el reporte al detalle. Queda anotada como posible seguimiento, con la dirección ya conversada (fusionar en una celda) si se decide tomarla.
- Los paneles y cards de la Torre de control, que ya tienen la forma fusionada.
- Datos, servicios, hooks y mocks: la card fusionada se calcula de las mismas cifras del resumen.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `squads`: "Detalle de célula" — el resumen pasa de 3 indicadores a 2, con la capacidad y el mix fusionados en una card de `CapacityBar` (MODIFIED).

## Impact

- **Cards**: `frontend/src/features/squads/components/SquadTeamStatsCards.tsx` — la card "CAPACIDAD ASIGNADA" (métrica + `Progress`) y la `DistributionCard` del mix se reemplazan por una card con `CapacityBar`; la grilla pasa a 2 columnas. `MIX_TONES` sigue exportándose desde ahí (lo consumen la Torre y `DedicationCell`).
- **Pruebas**: la suite que cubra `SquadTeamStatsCards` (o el detalle) se ajusta a la card fusionada; las lecturas ("74%", "1.0 libre", "% del esfuerzo va a operación") se conservan como aserciones.
- **Sin impacto**: `tuip` (CapacityBar ya existe y ya se consume), la Torre de control, la tabla del equipo, el listado de células.
