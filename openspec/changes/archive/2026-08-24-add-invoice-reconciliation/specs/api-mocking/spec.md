## MODIFIED Requirements

### Requirement: Handler de mock para facturación de proveedores
El sistema SHALL exponer un handler de mock con: `GET` de cierres por período (`period=YYYY-MM`) que devuelve, por cada proveedor del catálogo con al menos una persona externa vigente, su registro de ese período o `null`; `POST` generar el esperado de un período (crea los que faltan, con una línea por persona externa del proveedor tomando `monthlyCost`, cargo y célula del snapshot de personas y asignaciones, y el descuento derivado de las ausencias aprobadas de esa persona en el período; los existentes no se tocan); `GET` por id; `POST` de la factura recibida a un sub-recurso (número, fecha y monto; deja la factura en `Received`; 400 si el proveedor ya tiene factura de ese período —salvo que esté objetada, en cuyo caso la corregida la devuelve a `Received`—, si el esperado no existe, o si la factura está aprobada); `PUT` del facturado de una línea (pasa la factura a `InReview`); `PUT` ajuste de una línea (monto entero distinto de cero, motivo del catálogo `Overtime | PartialEntry | Exit | Other`, nota opcional; pasa la factura a `InReview`; 400 si la factura está aprobada o el monto es cero) y `DELETE` del ajuste; `PUT` de estado (`Approved` sólo desde `Received` o `InReview`, y con nota obligatoria cuando la diferencia no es cero; `Objected` sólo desde `Received` o `InReview` y con motivo obligatorio; 400 en otro caso).

Un registro con el esperado generado y todavía sin factura SHALL llevar estado `Pending`. El esperado, el facturado, la diferencia y los totales SHALL calcularse en el handler; el descuento por ausencias SHALL derivarse del snapshot de ausencias aprobadas y SHALL NOT aceptarse digitado. Una factura aprobada SHALL conservar las cifras con las que se aprobó aunque cambien las ausencias del período. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Los datos de ejemplo SHALL incluir el mes anterior con una factura aprobada y otra objetada, y el mes en curso con el esperado generado, una factura en revisión con diferencia por un descuento no aplicado, y un proveedor sin factura todavía.

El handler SHALL exponer un snapshot de sólo lectura de los cierres.

#### Scenario: Generar cierres de un período
- **WHEN** se hace un `POST` de generar para `2026-08`
- **THEN** responde con un registro por proveedor con externos, cada uno con sus líneas, su descuento derivado de las ausencias aprobadas y `esperado = Σ (tarifa − descuento + ajustes)`, y un segundo `POST` no crea duplicados

#### Scenario: Ajustar una línea
- **WHEN** se hace un `PUT` de ajuste con `amount: 1140000` y `reason: "Overtime"` sobre una línea de una factura no aprobada
- **THEN** la línea guarda el ajuste, su esperado lo incorpora y los totales y la diferencia se recalculan; sobre una factura aprobada responde 400

#### Scenario: Aprobar y reabrir
- **WHEN** se hace un `PUT` de estado `Approved` sobre una factura sin diferencia, y luego se registra la factura corregida de una objetada
- **THEN** el primero responde con la factura aprobada y `approvedAtUtc` fijado, y el segundo la devuelve a `Received`; aprobar una ya aprobada responde 400

#### Scenario: Registrar la factura recibida
- **WHEN** se hace un `POST` de la factura con número, fecha y monto sobre un proveedor con esperado generado
- **THEN** responde el registro en `Received` con cada línea facturada por su tarifa y la diferencia calculada; un segundo `POST` para el mismo proveedor y período responde 400, y hacerlo sin esperado generado también

#### Scenario: Objetar y aprobar con diferencia
- **WHEN** se hace un `PUT` de estado `Objected` con motivo, o `Approved` sobre una factura con diferencia distinta de cero
- **THEN** el primero responde la factura objetada con el motivo trazado, y el segundo exige la nota: sin ella responde 400, con ella aprueba y la deja trazada

### Requirement: Handler de mock para ausencias
El sistema SHALL exponer un handler de mock con `GET` listado de ausencias filtrado por mes (`month=YYYY-MM`, devuelve las ausencias cuyo rango toca ese mes junto con los días hábiles del mes pedido), `POST` alta (400 si el rango es inválido o se solapa con otra ausencia no rechazada de la misma persona), y `PUT` de estado a un sub-recurso (`Aprobada` sólo desde `Solicitada`; `Rechazada` sólo desde `Solicitada` y con motivo obligatorio; 400 en otro caso, 404 si no existe). Los cambios SHALL persistir en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio.

Cada ausencia SHALL llevar `id`, `personId`, `personName`, `providerName | null`, `type` (`Vacation | Leave | SickLeave`), `startDate`, `endDate`, `businessDays` (días hábiles L–V del rango completo), `status` (`Requested | Approved | Rejected`), `rejectReason | null`, y — calculados para el mes pedido — `businessDaysInMonth` y `squadImpacts` (`squadId`, `squadName`, `dedicationPct`, `fteImpact`). Los impactos SHALL derivarse de los datos de personas y asignaciones del propio mock (FTE disponible y dedicaciones vigentes), no de valores digitados, usando los mismos ids y nombres que esos handlers.

El handler SHALL exponer un snapshot de sólo lectura de las ausencias **aprobadas** de un período, con los días hábiles de cada una dentro de ese mes y los días hábiles del mes, para que el handler de facturación derive de ahí los descuentos sin duplicar la cuenta de días.

Los datos de ejemplo SHALL incluir ausencias de los tres tipos y los tres estados, de personas de terceros y de planta, y al menos una que cruza un fin de mes, con fechas relativas al mes corriente para que la pantalla abra con contenido. El cálculo SHALL repartir el impacto entre varias asignaciones en proporción a su dedicación cuando existan, aunque el mundo semilla de asignaciones tenga hoy una célula por persona — el reparto se cubre a nivel del cálculo, no de las semillas.

#### Scenario: Listar por mes
- **WHEN** se hace un `GET` con `month=2026-07`
- **THEN** responde las ausencias que tocan julio — incluidas las que empiezan en junio o terminan en agosto — con `businessDaysInMonth` y `squadImpacts` calculados sólo sobre los días hábiles de julio

#### Scenario: Alta con solape
- **WHEN** se hace un `POST` con un rango que se cruza con otra ausencia Solicitada o Aprobada de la misma persona
- **THEN** responde 400 con un problema que explica el conflicto y no crea nada

#### Scenario: Cambiar el estado
- **WHEN** se aprueba una Solicitada, o se rechaza una Solicitada con motivo
- **THEN** responde la ausencia actualizada; rechazar sin motivo o transicionar desde Aprobada/Rechazada responde 400, y un id inexistente 404

#### Scenario: Snapshot de aprobadas del período
- **WHEN** el handler de facturación pide las ausencias aprobadas de un mes
- **THEN** recibe sólo las aprobadas que tocan ese mes, con sus días hábiles dentro del mes y los días hábiles del mes, y las solicitadas y rechazadas quedan fuera
