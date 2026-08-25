## Context

Ver proposal.md — Why, incluida la interpretación registrada del pedido. Lo que condiciona el cómo:

- **La forma destino ya existió en este repo hoy**: la composición `SegmentedBar separated` + leyenda 2×2 es exactamente la que la card tenía antes del rediseño (quedó registrada en el archive de `adopt-accent-scale-in-people-stats`, con los tonos de acento ya adoptados y `teal` vigente). No se diseña nada nuevo: se restaura esa composición y se le suma el pie.
- **El pie ya existe en la card actual** con sus cálculos (`advancedPct`, `needsSupport`) y su filete: sobrevive tal cual, cambiando sólo lo que tiene arriba.
- **El spec principal nunca recibió el texto de las filas** — el rediseño está sin archivar — así que el delta de este change modifica el texto vigente (barra + leyenda) sumándole el párrafo y los dos escenarios del pie. Sin uniones ni orden de archivado condicionado para este delta.
- Los dos changes intermedios (`redesign-…`, `compact-…`) están `all_done` sin archivar; su destino lo fija el proposal: archivar **sin sincronizar**.

## Goals / Non-Goals

**Goals:**

- La card vuelve a ser baja y de un golpe de vista (barra + leyenda), y conserva la respuesta a "¿cómo estamos?" en el pie.
- Cero decisiones nuevas de color o de sistema: tonos de acento como hasta ahora, `tone` en los segmentos.

**Non-Goals:**

- No se restauran los descriptores, el eje ni los porcentajes por fila — el usuario los soltó al pedir el diseño inicial; el concepto "acompañamiento" sobrevive en el pie.
- No se toca la densidad `gap-2` que el change de compactación dejó en las tres cards: compactar sigue siendo deseable, sólo cambia la forma de la tercera.
- No se revierte nada en `tuip`: la rama `tone` de `SegmentedBar` recupera consumidor, y aunque no lo tuviera, es vocabulario publicado.

## Decisions

- **Restaurar, no rediseñar.** El JSX de la barra y la leyenda se toma de la forma previa al rediseño (misma estructura: `SegmentedBar separated` con `tone`, `ul` 2×2 con punto `bg-accent-<matiz>-fill` + nombre + conteo), debajo el pie actual. Las constantes que las filas pedían (`SENIORITY_DESCRIPTORS`, `axisMaxFor`, `axisMarksFor`, `ROW_GRID_STYLE`) se borran; queda un solo mapeo nivel → tono/clase.
- **El pie conserva exactamente sus textos y cálculos actuales**, incluido el singular/plural de "requiere(n) acompañamiento" y las guardas de división por cero. Es lo que el usuario pidió conservar; reescribirlo sería riesgo sin beneficio.
- **El encabezado conserva "N personas"** (no vuelve al "N" solo de la versión inicial): es información del pie de página del rediseño que ya está pagada, ocupa el mismo renglón y ancla los porcentajes del pie.
- **Los dos escenarios del pie entran al spec con los mismos títulos que usaba el delta del rediseño** ("Lectura de avanzado o superior", "Lectura de acompañamiento"): son la misma promesa, y mantener el título estable evita que el mismo concepto exista bajo dos nombres en el historial.
- **Los changes intermedios archivan sin sync.** Alternativa considerada: sincronizarlos en orden y que este delta se escriba como unión sobre el texto de las filas. Se descarta por dos razones: el spec principal registraría un estado (filas + eje) que ninguna versión estable retuvo, y los títulos de escenario del eje quedarían inmortales en el requisito por la regla del validador — habría que renombrar el requisito para retirarlos, como ya costó en `design-tokens`. Archivar sin sync es el camino que el propio flujo ofrece para deltas superseded.

## Risks / Trade-offs

- **[La interpretación del pedido podría estar corta: "las líneas" podría referir a otra cosa]** → Está registrada explícitamente en el proposal; si el usuario esperaba otra forma, la corrección es sobre una composición pequeña y contenida. El costo de preguntar una cuarta vez hoy superaba al de iterar.
- **[Se pierde la comparación visual por nivel contra un eje común]** → Es la contrapartida del pedido: la barra segmentada muestra proporciones del total, no magnitudes comparables. El pie compensa con la lectura agregada, que es la que el usuario dijo necesitar.
- **[Archivar sin sync deja los deltas de los dos changes intermedios como registro histórico que nunca tocó el spec]** → Es deliberado y queda anotado en ambos lugares (proposal de este change; el flujo de archive pregunta y se responde "sin sincronizar"). El riesgo real sería el inverso: sincronizarlos y ensuciar el spec con un estado efímero.
- **[Las pruebas de la card se reescriben por tercera vez hoy]** → Inevitable si la forma cambia; la suite de la card es chica (4 casos) y las aserciones de pie y de clases de acento se conservan casi tal cual.

## Migration Plan

Un archivo más su prueba. Rollback: revertir `PeopleStatsCards.tsx` a la versión de filas (está íntegra en el historial del change de rediseño). Al archivar: `restore-accent-teal` (tuip) se sincroniza normal; `redesign-seniority-distribution-card` y `compact-people-stats-cards` se archivan sin sync; éste se sincroniza normal.
