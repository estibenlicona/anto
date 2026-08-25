## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La pieza de la fusión ya existe y ya se consume**: `CapacityBar` (`tuip`, beta) recibe `allocated`/`available`/`parts`/`unit`/`warningFrom`/`freeLabel`/`atCapacityLabel`/`emptyLabel` y dibuja las tres lecturas de una vez (cifras, porcentaje por severidad, barra apilada con track libre). La Torre de control la usa en "Ocupación por célula" y en el drawer de reasignación, con `MIX_TONES` como partes.
- **Las dos cards a fusionar viven en `SquadTeamStatsCards.tsx`** con las cifras ya calculadas ahí: `allocatedFte`, `teamAvailableFte`, `bauFte`, `transformationFte`, `assignedPct`, `freeFte`, `bauPct`. La fusión no pide ningún dato nuevo.
- La card actual de capacidad usa `Progress brandFill` (decorativo, sin severidad); el spec nuevo pide severidad — `CapacityBar` la trae (`warningFrom`, danger al pasarse).
- `MIX_TONES` se exporta desde este archivo y lo importan la Torre y `DedicationCell`: tiene que sobrevivir a la reescritura.

## Goals / Non-Goals

**Goals:**

- Una cifra, una card: capacidad y mix como una sola lectura, con la misma forma que la Torre ya enseñó.
- Cero datos nuevos y cero cambios en `tuip`.

**Non-Goals:**

- No se toca la tabla del equipo (la redundancia análoga por fila queda como seguimiento anotado en proposal).
- No se rediseña la card "Equipo" ni el encabezado del detalle.
- No se cambia `CapacityBar`: si algo de la card no sale con su API, se compone alrededor, no se le agrega prop desde acá.

## Decisions

- **La card fusionada es `Card` + título "CAPACIDAD" + `CapacityBar` + pie.** `CapacityBar` con `allocated={allocatedFte}`, `available={teamAvailableFte}`, `unit="FTE"`, `parts` BAU/Transf con `MIX_TONES`, `freeLabel="libre"`, `emptyLabel` para la célula sin equipo. El pie conserva la lectura del mix: "X% del esfuerzo va a operación" (el `bauPct` existente). Alternativa considerada: `DistributionCard` con las partes y lo libre como tercer ítem (la forma de "FTE DEL CHAPTER" en la Torre). Se descarta: pierde el porcentaje de ocupación por severidad, que es la señal operativa del detalle ("¿queda espacio en esta célula?"), y "libre" no es una parte del mix sino su complemento.
- **`warningFrom` queda en el default de la pieza (85)**: el detalle adopta el criterio de severidad que `CapacityBar` ya estandarizó en la Torre — misma célula, misma lectura en las dos pantallas. La barra de progreso roja actual de la card vieja (brand, decorativa) desaparece con ella.
- **La grilla pasa a `lg:grid-cols-2`**; en `sm` sigue apilando. Equipo y Capacidad reparten el ancho de las tres cards anteriores.
- **`MIX_TONES` no se mueve de archivo** en este change: mudarlo a `shared` rompería imports de la Torre y del `DedicationCell` sin necesidad — se anota como refactor menor si molesta.

## Risks / Trade-offs

- **[El porcentaje cambia de significado visual: antes barra de marca decorativa, ahora severidad (verde/ámbar/rojo)]** → Es lo que el spec nuevo pide y lo que la Torre ya muestra para las mismas células; la señal decorativa era la anomalía. Queda dicho en el escenario del resumen.
- **[La card fusionada es más densa que cualquiera de las dos que reemplaza]** → Con la grilla a 2 columnas gana ancho; `CapacityBar` ya demostró la densidad en filas mucho más angostas (panel de la Torre).
- **[Alguna prueba existente puede asertar la card del mix por su título "MIX BAU / TRANSFORMACIÓN"]** → Se localizan y ajustan en el mismo apply; las lecturas de negocio ("71%", "1.1 libre", "% del esfuerzo") se conservan como textos assertables.

## Migration Plan

1. Reescribir las dos cards en una en `SquadTeamStatsCards.tsx` (grilla a 2 columnas).
2. Ajustar pruebas del componente/detalle.
3. Verificación en pantalla contra la Torre (misma célula, misma lectura) y el caso sin equipo.

Rollback: revertir el archivo — datos y servicios no cambian.
