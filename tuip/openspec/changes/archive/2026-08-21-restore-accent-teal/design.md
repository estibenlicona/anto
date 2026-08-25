## Context

Ver proposal.md — Why. Es la reversa exacta de `swap-accent-teal-for-gold` (archivado hoy), con una diferencia que simplifica todo: **no hay tonalidad que decidir**. Los píxeles de la referencia del usuario son `#2E97A3` — el turquesa original —, y sus contrastes ya están medidos y aprobados (3.46 / 3.32 / 3.15 / 5.17, piso 3:1).

Los puntos de contacto del rename son los mismos que la ida: `accent-colors.ts`, `lib/accent-tone.ts`, `level-meter.tsx`, el mapa `tone` de `progress.tsx`, tres archivos de test, y en docs la prosa de fundamentos más los ejemplos que escriben `tone="gold"`. Preset, CSS generado, verificación de contraste, swatches y tablas derivan de la paleta y se regeneran solos.

## Goals / Non-Goals

**Goals:**

- Dejar la escala exactamente como la muestra la referencia: gris, azul, turquesa `#2E97A3`, morado.
- Que el ida y vuelta quede caro de repetir por accidente pero barato de ejecutar: un solo commit de rename, con el historial de ambos changes explicando cada estado.

**Non-Goals:**

- No se toca la rama `tone` de `SegmentedBar` más allá del nombre del miembro: el vocabulario se queda.
- No se reevalúa el valor del turquesa: la referencia lo fija y ya pasa el piso. Ajustarlo sería contradecir el pedido.
- No se restaura la nota "gold/warning" bajo otro nombre: el turquesa no tiene pariente semántico y la advertencia general del acento cubre lo demás.

## Decisions

- **Vuelve el nombre `teal`, no un alias nuevo.** Alternativa considerada: llamarlo `cyan` o similar para no reusar un nombre que ya existió con otro valor... el valor es el mismo de antes, así que reusar `teal` es restaurar, no confundir. El único estado intermedio (gold) queda en los archives.
- **El margen de contraste del turquesa (0.15 en fila seleccionada) se acepta tal cual.** El criterio de margen ≥ 0.3 fue del proceso de elección del dorado, donde había tono que elegir; acá el hex viene dado por la referencia y ya está en producción visual en la imagen que el usuario aprobó. `verify-tokens` lo mide y el build falla si una superficie futura lo hunde.
- **La tabla de contraste del encabezado vuelve a sus valores originales medidos**, no se recalcula a ojo: son los mismos números que el archivo tenía antes del swap, y `verify-tokens` los confirma al correr.
- **El delta de `design-tokens` viaja como REMOVED + ADDED con nombre nuevo, no como MODIFIED.** El validador de OpenSpec (verificado en el fuente de la 1.8.0) hace inmortales los títulos de escenario dentro de un requisito: un MODIFIED que omite un escenario vigente es error, no existe rename de escenario, y re-declarar el mismo nombre en ADDED+REMOVED también es error. El escenario "El matiz dorado supera el piso de contraste" nombra un matiz que deja de existir, así que la única codificación honesta es retirar el requisito y volver a declararlo con otro nombre — "Vocabulario de acento sin significado de estado" — con la razón escrita en el propio bloque REMOVED. El costo es un nombre de requisito nuevo para el mismo contrato; la alternativa (conservar para siempre un escenario titulado "dorado" en un spec turquesa) engaña a quien lo hojea.

- **El changeset es `MINOR` de ambos paquetes, como la ida.** El rename es BREAKING para consumo directo del nombre y así se declara; el único consumidor conocido (`PeopleStatsCards` de la app) se actualiza en su change companion, que depende de este `.tgz`.

## Risks / Trade-offs

- **[Un tercer cambio de color del mismo paso en el mismo día puede leerse como indecisión del sistema]** → Es una decisión del dueño del diseño con una referencia concreta delante, no un vaivén del sistema: la paleta siguió a la referencia vigente en cada momento. Los changesets acumulados cuentan la historia en orden.
- **[La app queda rota si actualiza el `.tgz` sin su rename (`tone="gold"` deja de tipar y `bg-accent-gold-fill` deja de existir)]** → Es exactamente el orden que los changes imponen: éste publica, el de la app renombra y reinstala en el mismo apply. Mientras la app no reinstale, nada cambia para ella.
- **[Los archives de hoy (`swap-accent-teal-for-gold` y su sync de specs) quedan describiendo un estado que ya no es el vigente]** → Es lo esperado del historial: los specs principales quedan en turquesa tras el sync de este change, y los archives documentan el estado que cada uno dejó.

## Migration Plan

1. Rename y valor en tokens; build + verificación.
2. Rename en componentes y tests; suite verde.
3. Docs (prosa y ejemplos), registry, changeset, `publish:local`.
4. El change de la app (`redesign-seniority-distribution-card`) reinstala y renombra su lado.

Rollback: el commit inverso ya existe como referencia (el change del dorado); revertir es repetirlo.
