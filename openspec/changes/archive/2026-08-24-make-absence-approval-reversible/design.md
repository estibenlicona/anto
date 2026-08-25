## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La asimetría está en el código, no en el diseño.** `handleApprove` llama al servicio y muestra un aviso de éxito; rechazar abre `RejectAbsenceDrawer` y exige escribir un motivo. Los dos botones están uno al lado del otro en la misma fila.
- **El mock lo impide hoy.** `absences.handlers.ts` valida que el estado de origen sea Solicitada y devuelve 400 en cualquier otro caso. Falta la transición, la acción en la interfaz y el requisito que la sostenga.
- **El impacto se recalcula solo.** `getApprovedAbsencesSnapshot` filtra por `status === "Approved"`, de modo que revertir una aprobación saca la ausencia del cálculo sin tocar la fórmula.
- **La tarjeta ya tiene el dato que le falta al lado.** La torre de control expone el FTE del chapter; la tarjeta muestra hoy sólo el descuento.
- **`absences` no está en `openspec/specs`.** Vive únicamente en `add-absences`, completo y sin archivar, así que el delta parte de ahí y no hay unión que armar.

## Goals / Non-Goals

**Goals:**

- Que aprobar cueste lo mismo que rechazar, en atención y en pasos.
- Que un error de aprobación tenga salida, y que la salida deje rastro.
- Que las dos lecturas de la pantalla se entiendan sin conocer cómo se calculan.

**Non-Goals:**

- Editar una ausencia decidida.
- Un historial de transiciones de estado.
- Implementar el descuento en la factura o el ajuste de capacidad, que siguen siendo futuros.

## Decisions

- **Revertir es rechazar, no deshacer.** Es lo que el requisito ya prometía —"se corrige rechazándolo"— y lo único que faltaba era hacerlo posible. Volver a Solicitada fue la alternativa considerada y se descartó por dos motivos: contradice el requisito vigente, y borra el hecho de que hubo una aprobación. Un registro del que salen decisiones de facturación no debería poder decir que algo nunca pasó. Una ventana de "deshacer" de unos segundos también se descartó: resuelve el clic equivocado inmediato y no el error que se descubre al día siguiente, que es el caso que importa.
- **El panel de rechazo sirve a los dos casos.** Ya pide motivo y ya lo traza. Duplicarlo en un "revertir" con su propio formulario daría dos caminos que hacen lo mismo y que se van a desincronizar; lo que cambia es de dónde se lo invoca y qué dice su encabezado.
- **La confirmación de aprobar dice la consecuencia, no la pregunta.** "¿Confirmás?" no agrega nada: el usuario ya pulsó el botón. Lo que evita el error es ver a quién afecta y cuánto FTE descuenta, que es la información que hoy hay que ir a buscar a la fila.
- **La cifra de impacto se vuelve fracción.** Un descuento en FTE no se interpreta sin el total del que sale: "−0.5 FTE" no dice si es mucho o poco. Contra el FTE del chapter del mes, la cifra se lee sola y además se vuelve comparable entre meses distintos.
- **El pie de la tarjeta deja de continuar la cifra.** Hoy "de lo aprobado · la más afectada: …" es la segunda mitad de una frase cuya primera mitad es el número de arriba. Esa construcción obliga a leer en orden y a adivinar el nexo. La frase nueva se explica sola.
- **El aviso al pie habla del registro, no del cronograma.** "(próximas fases del plan)" es una nota interna del equipo dentro de una pantalla de trabajo. El requisito lo prohíbe explícitamente en vez de sólo pedir "mejor redacción", porque si no vuelve en la siguiente reescritura.

## Risks / Trade-offs

- **[Revertir cambia cifras que ya se leyeron]** → Es el objetivo, y también el riesgo: alguien pudo haber tomado una decisión con el número anterior. Se mitiga con el motivo trazado, que deja escrito por qué cambió, y con que el impacto se recalcula desde el estado y no desde un acumulado — una cifra derivada no puede quedar desincronizada de las ausencias que la componen.
- **[La confirmación se vuelve un trámite]** → Un diálogo que siempre dice lo mismo se aprende a saltar. Por eso muestra datos de *esa* ausencia —quién y cuánto— y no un texto fijo: lo que se lee cambia en cada caso.
- **[Rechazar aparece dos veces con sentidos distintos]** → En una Solicitada es "no la apruebo"; en una Aprobada es "me equivoqué". Es el mismo acto con el mismo resultado, y por eso comparte camino; lo que tiene que distinguirse es el encabezado del panel, no la mecánica.
- **[El total del chapter puede no estar disponible]** → Si la lectura del total falla o llega en cero, la tarjeta no puede mostrar una fracción sobre cero. Tiene que resolver ese caso mostrando el descuento solo, y no un "0.5 de 0" ni una división por cero.

## Migration Plan

1. La confirmación de aprobar, con los datos de la ausencia a la vista.
2. La acción de rechazar en las filas Aprobadas, reutilizando el panel de motivo.
3. La tarjeta de impacto: la cifra como fracción del FTE del chapter y el pie como frase entera.
4. El aviso al pie del listado, reescrito.

Rollback: los cuatro pasos son de interfaz y se revierten solos. Ninguna ausencia ya registrada cambia de estado por revertir el código.

## Open Questions

- Si conviene distinguir en el listado una ausencia que fue aprobada y luego rechazada de una que se rechazó de entrada. El motivo trazado ya lo permite saber al abrirla; si hiciera falta verlo en la fila, se resuelve después sin cambiar lo que este change decide.
