## Why

Aprobar una ausencia es un clic sin red. Rechazar abre un panel y exige un motivo; aprobar dispara al instante desde un botón que está justo al lado del de rechazar, y en cuanto la ausencia queda Aprobada la fila deja de ofrecer acciones. No hay confirmación antes ni corrección después.

El requisito que gobierna eso se contradice a sí mismo: dice que aprobar o rechazar sólo es posible "mientras está Solicitada", y en la misma frase que "un registro equivocado se corrige **rechazándolo** y registrando la ausencia de nuevo" — que es exactamente lo que una ausencia Aprobada no puede hacer. La corrección está prometida y cerrada con llave.

Y no es un error inocuo. Una aprobación descuenta FTE del mes, y de ese mismo registro van a salir —dice la propia pantalla— el descuento en la factura del tercero y el ajuste de capacidad en célula y sprint. Un clic equivocado que nadie puede deshacer se propaga.

Además, dos textos de la pantalla no se entienden de entrada:

- El aviso al pie explica el alcance futuro del registro con una frase larga que se interrumpe a sí misma y termina en un paréntesis administrativo — "(próximas fases del plan)" — que no le dice nada a quien está mirando ausencias hoy.
- La tarjeta **Impacto en capacidad** muestra una cifra en FTE y debajo un pie que **empieza a mitad de frase**: "de lo aprobado · la más afectada: Backend Platform". Quien la mira por primera vez no sabe de qué total se descuenta ese número, ni qué significa "la más afectada", ni por qué a veces dice una cosa y a veces otra.

## What Changes

- **Aprobar pide confirmación.** El paso que hoy es inmediato pasa a preguntar antes, diciendo a quién afecta y cuánto FTE descuenta del mes, para que la decisión se tome con la consecuencia a la vista.
- **Una aprobación se puede revertir**, rechazándola con motivo — que es lo que el requisito ya prometía. La ausencia pasa a Rechazada, el motivo queda trazado y el impacto del mes deja de contarla. No vuelve a Solicitada: revertir es una decisión que deja rastro, no un borrado.
- **La tarjeta de impacto dice contra qué.** La cifra pasa a leerse como fracción del FTE del chapter en el mes, y el pie pasa a una frase entera que explica que sólo cuentan las aprobadas y qué es la célula más afectada.
- **El aviso al pie se reescribe** para decir qué pasa con lo que se registra, sin la jerga de planificación interna.

### Fuera de alcance

- Editar una ausencia ya decidida. Sigue sin poder editarse: se rechaza y se registra de nuevo, como hasta ahora.
- El descuento en la factura del tercero y el ajuste de capacidad en célula y sprint, que siguen siendo trabajo futuro. Este change sólo cambia cómo se los anuncia.
- Un historial de cambios de estado. La trazabilidad que se agrega es la del motivo del rechazo, que ya existe.

## Capabilities

### Modified Capabilities

- `absences`: aprobar pasa a requerir confirmación; una ausencia Aprobada puede rechazarse con motivo, y el impacto del mes deja de contarla; la lectura agregada del impacto se expresa contra el FTE del chapter del mes.

## Impact

- **Contrato de API**: el cambio de estado de Aprobada a Rechazada pasa a ser una transición válida. Hoy el mock la **rechaza** con un 400: valida que el estado de origen sea Solicitada. Habilitarla es trabajo de este change, no un detalle que ya estuviera resuelto.
- Frontend: `features/absences` (contenedor, tabla, tarjetas y el panel de rechazo, que pasa a servir a los dos casos).
- **Lecturas que cambian de valor**: revertir una aprobación mueve el impacto del mes y la célula más afectada. Es el punto donde un error de implementación se vuelve invisible: la pantalla se ve bien y la cifra es otra.
- **Orden**: `absences` **no está en `openspec/specs`** — vive sólo en `add-absences`, que está completo y sin archivar. Los deltas parten de ese texto. Es la única fuente, así que no hay unión que armar; si `add-absences` se archiva antes de aplicar esto, el texto de partida es el mismo.
