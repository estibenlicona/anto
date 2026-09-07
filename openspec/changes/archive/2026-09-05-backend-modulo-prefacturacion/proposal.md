# Backend: módulo Prefacturación al contrato

## Why

Octavo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Prefacturación está 0🟢 8🔴 y es el módulo que consume lo que Ausencias dejó listo: el descuento por ausencias aprobadas de cada persona externa, ya calculado en `BusinessDayMath` y expuesto por el repositorio de ausencias. Cerrarlo deja andando el ciclo completo de una prefactura: generarla, recibir el documento del proveedor, ajustarla, y aprobarla u objetarla.

## What Changes

- **Domain — agregado `Prefacture`**: persona, período (`YYYY-MM`), estado (`Pending|Received|InReview|Approved|Objected` — `None` es un estado sintético de respuesta, nunca persistido), costo mensual, ajuste opcional (monto entero no cero, motivo cerrado, nota), documento del proveedor opcional (número, fecha, monto, moneda `COP`, imputación con sus 7 campos), valor prefacturado, objeción opcional (motivo, fecha), nota de aprobación y descuento por ausencias **congelado sólo al aprobar**. Nace `Pending` al generarse. Guardas del dominio: registrar el documento sólo si no hay uno ya (salvo corrigiendo una objetada); no editar (ajuste, prefacturado, documento) una aprobada u objetada; aprobar u objetar sólo desde `Received`/`InReview`; aprobar con diferencia ≠ 0 exige nota; objetar exige motivo.
- **Snapshot congelado al generar**: nombre, cargo, célula, proveedor y costo mensual de la persona se copian al crear el registro y no cambian después, aunque la persona cambie de célula o de tarifa — es un registro de un período cerrado. Sólo el nombre del proveedor se resuelve en vivo (por si la empresa se renombra) y el descuento por ausencias se recalcula en cada respuesta **mientras no esté aprobada** (una ausencia puede aprobarse después de generar el mes).
- **Cálculo del esperado** (`Application`, reutiliza `BusinessDayMath` y el repositorio de ausencias de Ausencias): descuento = costo mensual × (días hábiles ausentes del período ÷ días hábiles del período), sumando sólo ausencias **aprobadas** de la persona; sin ausencias aprobadas, sin descuento (no un descuento en cero). Esperado = costo mensual − descuento + ajuste. Diferencia = prefacturado − esperado, sólo cuando ya llegó un valor prefacturado.
- **Endpoints del contrato**: `GET /billing?period=` (400 si el período falta o no tiene forma `YYYY-MM`; una fila por persona externa vigente — con proveedor asignado —, con registro existente o sintética en `None` si aún no se generó), `POST /billing/generate` (idempotente: sólo crea lo que falte para las personas externas sin registro ese período), `GET /billing/{id}` (404), `PUT /billing/{id}/adjustment` y `DELETE /billing/{id}/adjustment` (404; bloqueado en aprobada/objetada), `POST /billing/{id}/prefacture` (400 con datos inválidos, con una aprobada, o con una que ya tiene documento y no está objetada — la única vía a un segundo documento es corregir una objetada), `PUT /billing/{id}/prefactured` (400 sin documento aún, bloqueado en aprobada/objetada), `PUT /billing/{id}/status` (aprobar u objetar; 400 fuera de `Received`/`InReview`, sin nota con diferencia ≠ 0, o sin motivo al objetar).
- Registrar o corregir el documento, o cambiar el prefacturado o el ajuste, mueve una prefactura `Received` a `InReview` (trabajarla la pone en revisión); nunca retrocede el estado.
- **Semillas**: prefacturas relativas al período actual y al anterior, sobre los proveedores externos ya sembrados por Personas — una aprobada con documento completo, una objetada con motivo, y una en revisión con documento pero sin orden de compra (para distinguir un campo de imputación faltante de uno vacío).
- Fuera de alcance: scope por chapter (el backend sigue sin claims, como los siete módulos anteriores), monedas distintas de COP (el contrato ya las cierra a un único valor), y editar una aprobada u objetada.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/provider-billing/spec.md` ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregado `Prefacture`, value objects `BillingStatus`, `AdjustmentReason`, `Currency`, y los objetos de valor de ajuste/documento/imputación/objeción, contrato de repositorio), Application (DTOs del contrato, contexto que cruza personas/asignaciones/proveedores/ausencias, cálculo del descuento y el esperado, seis use cases con sus validadores, registro en DI), Infrastructure (configuración EF, repositorio, semillas), WebApi (`BillingEndpoints` y ejemplos Swagger).
- `backend/tests`: cálculo del descuento y el esperado (sin ausencias, con varias aprobadas, con ausencias no aprobadas que no cuentan), invariantes y transiciones del agregado, los use cases con cada 400, y el snapshot congelado al generar frente a un cambio posterior de la persona.
- `backend/ENDPOINTS.md`: Prefacturación hacia 8🟢, total actualizado.
- Sin cambios al contrato: `backend/oas.json` ya tiene las 8 rutas y sus esquemas.
- Migración nueva (tabla `Prefactures`, vacía salvo por las semillas de desarrollo).
