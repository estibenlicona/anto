## Why

`add-provider-billing` construyó un cierre interno: la plataforma calcula lo que *debería* costar cada proveedor desde el costo mensual de sus externos, con ajustes digitados a mano. Falta la mitad que motivó el módulo: la factura **llega** del proveedor mes vencido y hay que comprobarla contra ese cálculo. Hoy no existe el monto facturado, así que no hay diferencia que revisar, ni forma de objetarle al proveedor un descuento que no aplicó.

Además, las ausencias ya se aprueban en la plataforma (`add-absences`) y el cierre las ignora: el mismo permiso se vuelve a digitar como ajuste "días no laborados". Esa doble digitación es justo lo que el diseño aprobado evitaba — la novedad nace en Ausencias y acá sólo se comprueba que la factura la refleje.

Este change agrega la capa de conciliación sobre lo ya construido: el cierre generado pasa a ser explícitamente **lo esperado**, y contra él se concilia la factura recibida.

## What Changes

- **El esperado se deriva, no se digita**: el descuento por ausencias de cada línea sale de las ausencias **aprobadas** de esa persona en el período (las solicitadas y rechazadas no cuentan) y es de sólo lectura. El ajuste manual sobrevive para lo que ningún módulo alimenta todavía, y gana el motivo **Horas extra** (monto positivo) hasta que exista el módulo de reporte de horas.
- **La factura recibida se registra**: número, fecha de recepción y monto total, uno por proveedor y período. Cada línea lleva su facturado (por defecto la tarifa mensual congelada, corregible), y el sistema avisa si la suma de las líneas no cuadra con el monto declarado.
- **Listado y detalle muestran la conciliación**: columnas Facturado, Esperado y Diferencia (coloreada por severidad, no decorativa), más Novedades; los tres indicadores del período pasan a facturas del mes, esperado vs facturado y novedades (días de ausencia y horas extra).
- **Estados nuevos**: `Recibida → En revisión → Aprobada | Objetada`, en lugar de Borrador/Aprobado. **BREAKING** para la capacidad `provider-billing`: cambian los estados, el vocabulario del listado y la forma de las líneas.
- **Objetar exige motivo** y queda trazado (mismo patrón que el rechazo en curación y en ausencias); **aprobar con diferencia distinta de cero exige una nota** que justifique aceptarla. La factura corregida que llega después vuelve a Recibida.
- **Mocks**: el handler de ausencias expone un snapshot de sólo lectura de las aprobadas; el de facturación lo consume para derivar los descuentos.

### Fuera de alcance

- Horas extra automáticas desde el reporte de horas (módulo 2.5, pendiente): siguen registrándose como ajuste al conciliar.
- El documento de la factura como adjunto, exportar a Excel/PDF, tarifas por proveedor en Admin y facturación de internos — como en `add-provider-billing`.
- Tocar la pantalla de Ausencias: sólo se lee lo que ya produce.

## Capabilities

### Modified Capabilities

- `provider-billing`: los dos requirements existentes cambian (el listado del período y el detalle pasan a conciliar factura contra esperado) y se agregan tres — registro de la factura recibida, cálculo del esperado desde las novedades, y objeción con motivo trazado.
- `api-mocking`: el handler de facturación gana el registro de la factura, el esperado derivado y los estados nuevos; el de ausencias expone el snapshot de aprobadas que ese cálculo necesita.

## Impact

- Frontend: `features/billing` (service, adapter, hooks, listado, tabla de líneas, drawer de ajuste, encabezado del detalle) y dos piezas nuevas — drawer de registro de factura y drawer de objeción. Sin pantallas nuevas.
- Mocks: `billing.handlers.ts` (+ seeds) y `absences.handlers.ts` (snapshot).
- `features/absences` no cambia de comportamiento; sólo se lee su estado.
- tuip: sin cambios. Se reusan `Table`, `Card`, `Badge`, `Drawer`, `Alert`, `Input`, `Textarea`, `Menu`.
- **Orden de archivado**: este change MODIFICA requirements que hoy sólo viven en las deltas de `add-provider-billing` y `add-absences`, ambas sin archivar. Los dos deben archivarse antes que éste; si se archiva al revés, los bloques MODIFIED no encuentran su anclaje.
