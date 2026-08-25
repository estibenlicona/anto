## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El diseño aprobado ya existe**: el canvas "Facturación de Terceros y Ausencias" (artboards "Facturación de terceros" y "Conciliación de factura") fija el listado con Facturado/Esperado/Diferencia/Novedades y el detalle con la fila por persona, la alerta de la novedad no reflejada y las acciones Aprobar / Objetar con nota.
- **Lo construido se conserva**: `add-provider-billing` ya trae el listado por período, el detalle con líneas congeladas, el drawer de ajuste y su handler de mock. Este change los evoluciona; no reescribe la feature.
- **Ausencias ya calcula días hábiles**: `businessDays.ts` cuenta L–V y reparte por mes; su handler responde `businessDaysInMonth` por ausencia. Ese cálculo es la fuente para el descuento.
- **La app no compila Tailwind del paquete**: medidas calculadas van inline; nada nuevo en tuip.

## Goals / Non-Goals

**Goals:**

- Cerrar el caso real: la factura llega, se compara contra lo esperado, se aprueba u objeta con traza.
- Una sola fuente por novedad: la ausencia se aprueba en Ausencias y de ahí sale el descuento.

**Non-Goals:**

- No se rehace la pantalla de Ausencias ni su modelo.
- No se agrega el adjunto de la factura ni exportaciones.
- No se automatizan las horas extra: siguen siendo un ajuste manual hasta el módulo 2.5.

## Decisions

- **El descuento se prorratea por días hábiles, no por 30 días calendario.** La nota del canvas dejaba abierto "tarifa ÷ 30 × días" contra "días hábiles"; se decide días hábiles porque es la unidad que el módulo de Ausencias ya calcula y muestra. Con ÷30 la misma ausencia se leería distinto en las dos pantallas y habría que mantener dos convenciones. Fórmula: `descuento = tarifa × (días hábiles ausentes en el mes ÷ días hábiles del mes)`.
- **El esperado se materializa al generar y se recalcula hasta aprobar.** Las líneas congelan la tarifa (comportamiento que ya existe y se conserva), pero el descuento se vuelve a derivar en cada lectura mientras la factura no esté aprobada; al aprobar, las cifras se congelan con la aprobación. Alternativa considerada: congelar todo al generar. Se descarta: aprobar una ausencia después de generar el mes es lo normal, y el esperado quedaría desactualizado sin que nadie lo note.
- **El facturado por línea arranca en la tarifa mensual.** Es lo que el proveedor factura por defecto y es exactamente el caso del diseño (María facturada completa con vacaciones aprobadas). Corregir línea por línea cubre la factura que sí trae desglose. El monto total declarado se compara contra la suma y se avisa si no cuadra — aviso, no bloqueo: una factura real puede traer conceptos que la plataforma no modela.
- **Estados**: `Received` (esperado generado, factura registrada recién llegada) → `InReview` → `Approved` | `Objected`. En la capa visible: Recibida · En revisión · Aprobada · Objetada, más "Sin cierre" para el proveedor sin esperado. Se retira `Draft`: el borrador era el cierre interno, que ahora es "el esperado" y no un estado de la factura.
- **`AdjustmentReason` cambia `UnworkedDays` por `Overtime`.** Los días no laborados dejan de digitarse (vienen de Ausencias); las horas extra pasan a ser el ajuste típico. `PartialEntry`, `Exit` y `Other` se conservan.
- **Objetar reusa el patrón del rechazo** (drawer con motivo obligatorio, trazado), igual que la curación del backlog y el rechazo de ausencias. Aprobar con diferencia usa el mismo drawer con la nota como campo obligatorio.
- **Sin marca en el listado**: el nombre sigue siendo enlace neutro y las acciones por fila viven en el menú; el color de marca queda para el primario del encabezado y para "Aprobar factura" en el detalle, que es la acción primaria de esa pantalla.

## Risks / Trade-offs

- **[Recalcular el descuento en cada lectura puede mover un esperado que el lead ya miró]** → Es lo correcto mientras la factura no esté aprobada, y el detalle muestra los días que sustentan cada descuento para que el cambio sea explicable. Congelar al aprobar corta la deriva.
- **[El facturado por línea es una suposición cuando la factura no trae desglose]** → Por eso arranca en la tarifa (el caso mayoritario) y se avisa si el total no cuadra; el lead corrige la línea que difiera.
- **[Cambian estados y forma de las líneas: rompe la capacidad]** → Marcado BREAKING en el proposal. Nadie externo consume el módulo todavía; las pruebas de `add-provider-billing` se ajustan en el mismo apply.
- **[Depende del orden de archivado de dos changes sin archivar]** → Anotado en el proposal y en la primera tarea.

## Migration Plan

1. Mock: snapshot de aprobadas en ausencias; facturación consume, deriva el descuento, agrega factura recibida, facturado por línea y estados nuevos.
2. Service, adapter y hooks; luego listado y detalle con las columnas nuevas.
3. Drawers de registro de factura y de objeción / nota de aprobación.
4. Ajuste de las pruebas existentes de facturación y verificación en pantalla contra los dos artboards.

Rollback: el change es aditivo sobre una feature que nadie consume aún; revertir los archivos de `features/billing` y los dos handlers deja la app en el estado de `add-provider-billing`.
