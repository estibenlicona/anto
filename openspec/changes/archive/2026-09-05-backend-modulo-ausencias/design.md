# Diseño — Backend: módulo Ausencias

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`AbsencesMonthDto`, `AbsenceDto`, `AbsenceSquadImpactDto`, `CreateAbsenceRequest`, `UpdateAbsenceStatusRequest`, enums `AbsenceType` y `AbsenceStatus`). La semántica canónica vive en `frontend/src/features/absences/services/businessDays.ts` (la aritmética: conteo con medias jornadas, recorte contra el mes, reparto del impacto) y `frontend/src/mocks/handlers/absences.handlers.ts` (validaciones, reglas de estado, semillas relativas al mes, y `edgesWithinRange`, que es la sutileza del borde compartido). Las reglas de negocio están en `openspec/specs/absences/spec.md` y `frontend/openspec/specs/absence-half-days/spec.md`.

Convenciones a respetar, ya asentadas en los seis módulos anteriores: agregados `AggregateRoot` con las invariantes en el constructor y en los métodos; value objects cerrados estilo `PersonRole`; derivados por request en una clase de contexto (`SquadAggregates`, `InitiativeContext`); validación con FluentValidation traducida a 400 por `ValidationException`, y `BadRequestException` para las reglas que necesitan datos; `IEndpointDefinition` por módulo; ejemplos Swagger con `IExamplesProvider`; provider InMemory con `EnsureCreated` y semillas en `DevelopmentDataSeeder`.

## Goals / Non-Goals

**Goals**
- Los 3 endpoints en 🟢, con exactamente los números y los mensajes que hoy produce el mock.
- Dejar la aritmética de días hábiles y el snapshot de aprobadas en un solo lugar, listo para que Capacidad y Prefacturación lo consuman sin duplicar la cuenta.

**Non-Goals**
- Consumir las ausencias desde Capacidad o Prefacturación, festivos, scope por chapter, edición de una ausencia decidida.

## Decisions

1. **`Absence` como agregado con las guardas adentro, salvo las dos que necesitan el conjunto.** El rango válido, el día hábil, las reglas de la media jornada y las transiciones de estado son del agregado: no dependen de nada externo y son lo que hace que una ausencia sea una ausencia. Quedan fuera, en el use case, que la persona exista y que no haya solape con otra suya — las dos exigen mirar más allá del agregado. *Alternativa*: todo en el use case, como hace el mock. Se descarta porque dejaría al dominio permitiendo un permiso de media jornada de tres días, que es justamente lo que la regla prohíbe.

2. **La media jornada se valida como un trío, no como dos banderas sueltas.** El contrato transporta `startsHalfDay` y `endsHalfDay` por separado, pero el modelo es "este permiso de un día es de media jornada": las dos marcas viajan siempre iguales, sólo para `Leave`, y sólo cuando inicio y fin son el mismo día. El agregado rechaza cualquier otra combinación con los mensajes del mock («El medio día es del día pedido, no de un extremo», «Sólo un permiso puede pedirse por medio día», «Un medio día se pide sobre un solo día»). *Alternativa*: un solo campo `isHalfDay`. Cambiaría el contrato y el front sin necesidad; las dos banderas se conservan y la invariante las mantiene coherentes.

3. **Un rango sin ningún día hábil no se registra.** `frontend/openspec/specs/absence-half-days/spec.md` lo pide para el permiso en sábado; se generaliza a cualquier rango con cero días hábiles, que es la misma razón — no descuenta nada — y cubre el caso sin una regla especial por tipo. El mock no lo valida (lo evita el selector de fechas del formulario), pero el servidor no puede confiar en el formulario. Es la única regla que este módulo agrega sobre el mock, y queda anotada.

4. **`BusinessDayMath` estático en Application**, espejo de `businessDays.ts`: `CountBusinessDays(start, end, edges)` (lunes a viernes; cada extremo marcado descuenta 0.5 sólo si cae en día hábil; un rango de un día descuenta una vez, no dos), `MonthBounds(month)`, `ClampRange(...)` y `BusinessDaysInMonth(...)`. **Sin festivos**, que es la decisión ya tomada y anotada en el mock y en la spec; `backend/ENDPOINTS.md` dice hoy que se excluyen y hay que corregirlo. Cuando existan, entran acá y los dos lados cambian a la vez. Los días son `decimal` porque son múltiplos de 0.5.

5. **El borde compartido de un rango que cruza el mes no lleva la marca.** Al recortar una ausencia contra un mes, `startsHalfDay` sólo aplica si el inicio del tramo es el inicio real de la ausencia, y lo mismo con el fin. Sin esto, una ausencia de media jornada a cada extremo que cruza el fin de mes descontaría media jornada de más en cada mes. Es `edgesWithinRange` del mock, y va con su test.

6. **`AbsenceContext` construido por request** desde personas, compañías y asignaciones, igual que `SquadAggregates`. Resuelve nombre, proveedor (nulo cuando la persona es de planta) y los impactos por célula. Nada se persiste: `businessDaysInMonth` y `squadImpacts` dependen del mes que se pregunte, y la dedicación cambia sin que la ausencia cambie. Una persona sin asignaciones responde `squadImpacts` vacío, no un impacto de cero contra una célula inventada.

7. **El impacto no se redondea.** `fteImpact` = días en el mes ÷ días hábiles del mes × FTE disponible × dedicación/100, tal cual — como el FTE del mix en Iniciativas. Redondear cada porción haría que las porciones no sumen el total del mes, y la pantalla ya formatea al mostrar.

8. **El cuerpo del cambio de estado es `{ status, reason? }`**, alineado con lo que `absenceService.ts` envía: `reason` obligatorio sólo al rechazar. `backend/oas.json` se corrige en el mismo cambio para que contrato y consumidor digan lo mismo. *Alternativa considerada y descartada*: aceptar `reason` y `rejectReason` a la vez — deja una tolerancia permanente que nadie recuerda por qué existe.

9. **Rechazar es la única salida de una aprobación.** Aprobar sólo desde Solicitada; rechazar desde Solicitada o Aprobada; Rechazada es terminal. Revertir no devuelve a Solicitada a propósito: el registro debe decir que hubo una aprobación y que se revirtió, no que nunca ocurrió. Corregir un registro equivocado es rechazarlo y volver a registrarlo, y por eso el solape se mira sólo contra las **no rechazadas**.

10. **`GET /absences` exige `month`.** Sin él, o con una forma que no sea `YYYY-MM`, responde 400 «Mes inválido: se espera month=YYYY-MM». No hay listado sin mes porque el DTO entero —impactos incluidos— está expresado contra un mes; un listado sin mes tendría que inventarse el denominador.

11. **Persistencia como entidad normal, no como documento.** `Absence` es una fila con columnas: fechas `DateOnly`, tipo y estado con converter a string, motivo nulable. A diferencia de la evaluación de una iniciativa, acá no hay snapshot: todo lo derivado se recalcula, así que no hay nada que congelar. Índice por persona, que es por donde se consulta el solape.

12. **Semillas relativas al mes en curso.** El seeder calcula las fechas contra el mes actual —la n-ésima semana, el último día hábil— como hace el mock, porque una semilla con fechas fijas deja la pantalla vacía en cuanto pasa el mes. Cinco ausencias sembradas por nombre de persona sobre gente que ya tiene asignación, para que los impactos no salgan vacíos: unas vacaciones aprobadas, una incapacidad aprobada que cruza el fin de mes, un permiso de media jornada solicitado, unas vacaciones solicitadas y un permiso rechazado con su motivo.

## Risks / Trade-offs

- [La aritmética vive en TS y en C#] → tests que fijan los números del mock: 0.5 de un permiso de media jornada, el reparto 60/40 entre células, y el rango que cruza el fin de mes contando sólo sus días en cada mes.
- [Las semillas dependen del mes en que se arranque] → los tests no usan las semillas sino fechas fijas; las semillas sólo alimentan la pantalla en desarrollo.
- [Sin festivos, los días hábiles de diciembre están inflados] → aceptado y anotado; es la decisión ya tomada del otro lado, y cambiarla sin cambiar el frontend haría que las dos pantallas discrepen.
- [Cambiar `oas.json` por primera vez desde un módulo] → el cambio es un renombre de campo en un solo esquema, la cobertura no mira esquemas y el validador de OpenAPI se corre igual en la verificación.
- [Sin scope por chapter, `GET /absences` responde por todo el mundo] → igual que los seis módulos anteriores; se cierra cuando llegue el ajuste de seguridad, y queda anotado en la guía.

## Migration Plan

Sin datos que migrar: tabla `Absences` nueva. Orden: Domain (value objects + agregado) → Application (`BusinessDayMath` + DTOs + contexto + use cases) → Infrastructure (configuración EF + repositorio + semillas) → WebApi (endpoints + ejemplos) → contrato (`oas.json`) → tests → smoke InMemory → `ENDPOINTS.md`. Rollback: quitar el endpoint y la tabla; ningún otro módulo depende todavía.

## Open Questions

(ninguna)
