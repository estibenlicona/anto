## Decisions

1. "Libre" como segmento explícito (`heat: low`) y no como pista vacía: DistributionCard no tiene `total`, y así la leyenda en línea lleva la cifra de libre junto a BAU y Transformación, igual que la lectura de cada fila.
2. BAU/Transformación toman `MIX_TONES` (`sky`/`violet`), la misma decisión del listado y del detalle: la card y la columna comparten color por construcción.
3. Criticidad conserva la escala `heat` (Crítica max · Alta high · Media mid · Baja low) — no cambia el vocabulario, sólo la anatomía; el pie pasa a headline.
4. `atCapacityCount` se calcula en el mock de células desde el snapshot de asignaciones, como ya hace `withoutTeamCount`.
