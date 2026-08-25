## RENAMED Requirements

- FROM: `### Requirement: Handler de mock para facturación de proveedores`
- TO: `### Requirement: Handler de mock para prefacturas de proveedores`

## MODIFIED Requirements

### Requirement: Handler de mock para prefacturas de proveedores
El sistema SHALL exponer un handler de mock cuyo recurso es la **prefactura de una persona externa en un período**, no un cierre por proveedor: `GET` de prefacturas por período (`period=YYYY-MM`) que devuelve una por cada persona externa vigente, con su proveedor y su registro de ese período o `null`; `POST` generar el esperado de un período (crea las que faltan, tomando `monthlyCost`, cargo y célula del snapshot de personas y asignaciones, y el descuento derivado de las ausencias aprobadas de esa persona en el período; las existentes no se tocan); `GET` por id; `POST` de la prefactura recibida a un sub-recurso (número, fecha de recibida, valor total, moneda, y los datos de imputación —célula o CoE, concepto, cuenta contable y su número, centro de costos, orden de compra y cuenta destinada al pago—; deja la prefactura en `Received`; 400 si esa persona ya tiene prefactura de ese período —salvo que esté objetada, en cuyo caso la corregida la devuelve a `Received`—, si el esperado no existe, si la prefactura está aprobada, o si la moneda no es COP); `PUT` del valor prefacturado (pasa a `InReview`); `PUT` ajuste (monto entero distinto de cero, motivo del catálogo `Overtime | PartialEntry | Exit | Other`, nota opcional; pasa a `InReview`; 400 si está aprobada o el monto es cero) y `DELETE` del ajuste; `PUT` de estado (`Approved` sólo desde `Received` o `InReview`, y con nota obligatoria cuando la diferencia no es cero; `Objected` sólo desde `Received` o `InReview` y con motivo obligatorio; 400 en otro caso).

Los datos de **imputación** SHALL persistirse tal como se reciben y SHALL poder llegar incompletos: el número de prefactura, la fecha de recibida y el valor total son obligatorios; los demás SHALL admitir `null` y devolverse como `null`, para que el consumidor distinga un dato que falta de uno en blanco. La **moneda** SHALL viajar con cada prefactura y el handler SHALL rechazar con 400 cualquier valor distinto de `COP`, porque la diferencia se calcula contra un esperado en COP y compararlo con otra moneda sin tasa produce una cifra falsa.

Una prefactura con el esperado generado y todavía sin recibir SHALL llevar estado `Pending`. El esperado, el valor prefacturado, la diferencia y los totales del período SHALL calcularse en el handler; el descuento por ausencias SHALL derivarse del snapshot de ausencias aprobadas y SHALL NOT aceptarse digitado. Una prefactura aprobada SHALL conservar las cifras con las que se aprobó aunque cambien las ausencias del período. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Los datos de ejemplo SHALL incluir el mes anterior con una prefactura aprobada y otra objetada, y el mes en curso con el esperado generado, una prefactura en revisión con diferencia por un descuento no aplicado, y una persona sin prefactura todavía. SHALL incluir además **dos personas del mismo proveedor imputadas a células distintas**: con una sola por proveedor, la razón por la que la unidad es la persona no se puede probar.

El handler SHALL exponer un snapshot de sólo lectura de las prefacturas.

#### Scenario: Generar cierres de un período
- **WHEN** se hace un `POST` de generar para `2026-08`
- **THEN** responde con una prefactura por persona externa, cada una con su tarifa, su descuento derivado de las ausencias aprobadas y `esperado = tarifa − descuento + ajustes`, y un segundo `POST` no crea duplicados

#### Scenario: Ajustar una línea
- **WHEN** se hace un `PUT` de ajuste con `amount: 1140000` y `reason: "Overtime"` sobre una prefactura no aprobada
- **THEN** guarda el ajuste, su esperado lo incorpora y la diferencia y los totales se recalculan; sobre una aprobada responde 400

#### Scenario: Aprobar y reabrir
- **WHEN** se hace un `PUT` de estado `Approved` sobre una prefactura sin diferencia, y luego se registra la corregida de una objetada
- **THEN** el primero responde con la prefactura aprobada y `approvedAtUtc` fijado, y el segundo la devuelve a `Received`; aprobar una ya aprobada responde 400

#### Scenario: Registrar la factura recibida
- **WHEN** se hace un `POST` de la prefactura con número, fecha, valor total e imputación sobre una persona con esperado generado
- **THEN** responde el registro en `Received` con su imputación persistida y la diferencia calculada; un segundo `POST` para la misma persona y período responde 400, y hacerlo sin esperado generado también

#### Scenario: Objetar y aprobar con diferencia
- **WHEN** se hace un `PUT` de estado `Objected` con motivo, o `Approved` sobre una prefactura con diferencia distinta de cero
- **THEN** el primero responde la prefactura objetada con el motivo trazado, y el segundo exige la nota: sin ella responde 400, con ella aprueba y la deja trazada

#### Scenario: Imputación incompleta
- **WHEN** se registra una prefactura sin orden de compra ni centro de costos
- **THEN** el handler la guarda y devuelve esos campos en `null`, en vez de rechazar el registro o devolver cadenas vacías

#### Scenario: Una moneda que no es COP
- **WHEN** se registra una prefactura con moneda `USD`
- **THEN** el handler responde 400 explicando que sólo compara en COP, y no persiste el registro

#### Scenario: Dos personas del mismo proveedor
- **WHEN** se pide el período de un proveedor con dos personas externas
- **THEN** el handler devuelve dos prefacturas independientes, cada una con su propia imputación y su propio estado
