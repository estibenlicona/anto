# Backend: módulo Ausencias al contrato

## Why

Séptimo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Ausencias está 0🟢 3🔴 y es el módulo más pequeño que queda, pero el que más desbloquea: **Capacidad** descuenta de la capacidad del sprint los días aprobados, y **Prefacturación** descuenta del costo esperado esos mismos días. Sin él, esos dos módulos —doce endpoints entre ambos— no pueden calcular su número principal. Cerrarlo deja además la cuenta de días hábiles y el reparto del impacto por célula en un solo lugar del backend, que es de donde los dos van a leerla.

## What Changes

- **Domain — agregado `Absence`**: persona, tipo (`Vacation|Leave|SickLeave`), rango de fechas, marcas de media jornada, estado (`Requested|Approved|Rejected`) y motivo de rechazo. Nace Solicitada. Guardas del dominio: fin no anterior al inicio; el rango debe tener al menos un día hábil (un permiso pedido sobre un sábado no descuenta nada, así que no se registra); la media jornada es sólo de un permiso, sobre un único día, con las dos marcas iguales. Transiciones: aprobar sólo desde Solicitada; rechazar desde Solicitada **o Aprobada** —así se revierte una aprobación equivocada— exigiendo motivo; Rechazada es terminal y no vuelve a Solicitada, porque una aprobación que ocurrió deja rastro.
- **Cálculo de días hábiles compartido** (`BusinessDayMath` en Application): días hábiles de un rango son lunes a viernes, **sin festivos**; cada extremo marcado descuenta media jornada y sólo si cae en día hábil; un rango de un solo día descuenta la media jornada una vez y no dos. Intersección de un rango con un mes, y días hábiles del mes. Es la aritmética que Capacidad y Prefacturación reutilizarán.
- **Derivados al responder** (`AbsenceContext`, patrón de `SquadAggregates` e `InitiativeContext`): nombre de la persona, proveedor (o nulo si es de planta), días hábiles del rango completo, días hábiles dentro del mes pedido, e impacto por célula = días dentro del mes ÷ días hábiles del mes × FTE disponible × dedicación, repartido entre las células de la persona. Nada de eso se persiste: depende del mes que se pregunte y de asignaciones que cambian.
- **Al recortar una ausencia contra un mes, la marca de media jornada sólo se aplica en el extremo real de la ausencia**: un rango que cruza el fin de mes tiene, en cada tramo, un borde que no es suyo, y marcarlo descontaría la misma media jornada dos veces.
- **Endpoints del contrato**: `GET /absences?month=YYYY-MM` (400 si el mes falta o no tiene esa forma; devuelve las que tocan el mes, ordenadas por fecha de inicio, con los días hábiles del mes como denominador), `POST /absences` (400 con rango inválido, media jornada mal pedida, persona inexistente o solape con otra no rechazada de la misma persona) y `PUT /absences/{id}/status` (404; 400 con estado inválido, aprobación de algo que no está Solicitado, cambio sobre una Rechazada, o rechazo sin motivo).
- **Semillas**: cinco ausencias relativas al mes en curso —tres tipos, tres estados, una que cruza el fin de mes y un permiso de media jornada— sembradas por nombre de persona. Con fechas fijas el mes se vería vacío en cuanto pasara.
- **BREAKING del contrato, acordado**: `UpdateAbsenceStatusRequest` pasa de `{ status, rejectReason }` (ambos obligatorios) a `{ status, reason? }`, que es lo que `absenceService.ts` envía hoy: `reason` sólo al rechazar, y nada al aprobar. `backend/oas.json` se corrige — es la primera vez que un cambio de backend lo toca. La corrección va en la dirección que `backend-contract` ya exige (los esquemas hablan el vocabulario del frontend, sin campos renombrados), así que no cambia ningún requirement.
- Fuera de alcance: Capacidad y Prefacturación (este cambio les deja la fuente, no las consume), scope por chapter —el mock filtra por las personas a cargo de quien pide y el backend sigue sin claims, como los seis módulos anteriores—, festivos, y editar una ausencia ya decidida.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/absences/spec.md` ya exigen; la corrección del contrato acerca `oas.json` a un requirement existente en vez de cambiarlo. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregado `Absence`, value objects `AbsenceType` y `AbsenceStatus`, contrato de repositorio), Application (`BusinessDayMath`, DTOs del contrato, `AbsenceContext`, tres use cases con su validador, registro en DI), Infrastructure (configuración EF con las fechas y los enums, repositorio, semillas), WebApi (`AbsencesEndpoints` y ejemplos Swagger).
- `backend/tests`: aritmética de días hábiles (medias jornadas, recorte por mes, el borde compartido que no debe descontarse dos veces), invariantes y transiciones del agregado, los use cases con cada 400, y el reparto del impacto entre células.
- `backend/oas.json`: `UpdateAbsenceStatusRequest` corregido. La cobertura sigue en 88/88 porque las rutas no cambian.
- `backend/ENDPOINTS.md`: Ausencias hacia 3🟢, total actualizado, y corregir la nota de reglas, que hoy dice que los días hábiles excluyen festivos cuando la implementación de referencia es lunes a viernes sin festivos, por decisión anotada.
- Sin migraciones: tabla nueva, vacía salvo por las semillas de desarrollo.
