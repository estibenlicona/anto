## ADDED Requirements

### Requirement: Handler de mock para facturación de proveedores
El sistema SHALL exponer un handler de mock con: `GET` de cierres por período (`period=YYYY-MM`) que devuelve, por cada proveedor del catálogo con al menos una persona externa vigente, su cierre de ese período o `null`; `POST` generar cierres de un período (crea en `Draft` los que faltan, con una línea por persona externa del proveedor tomando `monthlyCost`, cargo y célula del snapshot de personas y asignaciones; los existentes no se tocan); `GET` por id; `PUT` ajuste de una línea (monto entero distinto de cero, motivo del catálogo, nota opcional; 400 si el cierre está aprobado o el monto es cero) y `DELETE` del ajuste; `PUT` de estado (`Approved` sólo desde `Draft`, `Draft` sólo desde `Approved`; 400 en otro caso). Los totales (subtotal, ajustes, total) SHALL calcularse en el handler. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Los datos de ejemplo SHALL incluir el mes anterior con un cierre aprobado y uno en borrador con un ajuste, y el mes en curso sin cierres.

El handler SHALL exponer un snapshot de sólo lectura de los cierres.

#### Scenario: Generar cierres de un período
- **WHEN** se hace un `POST` de generar para `2026-08`
- **THEN** responde con un cierre `Draft` por proveedor con externos, cada uno con sus líneas y `total = Σ monthlyCost`, y un segundo `POST` no crea duplicados

#### Scenario: Ajustar una línea
- **WHEN** se hace un `PUT` de ajuste con `amount: -1200000` y `reason: "UnworkedDays"` sobre una línea de un cierre en borrador
- **THEN** la línea guarda el ajuste, `line.total = monthlyCost + amount` y los totales del cierre se recalculan; sobre un cierre aprobado responde 400

#### Scenario: Aprobar y reabrir
- **WHEN** se hace un `PUT` de estado `Approved` sobre un borrador y luego `Draft` sobre el aprobado
- **THEN** ambos responden con el cierre actualizado y `approvedAtUtc` se fija al aprobar; `Approved` sobre uno ya aprobado responde 400
