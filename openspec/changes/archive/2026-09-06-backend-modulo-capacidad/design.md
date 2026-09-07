# Diseño — Backend: módulo Capacidad (dedicación), modelo y lectura

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`CollaboratorDedicationListDto`, `CollaboratorDedicationRowDto`, `CollaboratorDedicationDetailDto`, `CapacityDto`/`CapacityBreakdownDto`, `SprintExecutionDto`, `ReferenceDto`, `MultitaskingDto`/`ConcurrentInitiativeDto`, `BalanceSignalDto`/`BalanceEvidenceDto`, `SprintTrendPointDto`/`SelectedSprintDto`, `WorkItemDto`, `ActivityDayDto`, `DedicationSettingsDto`, enums `SnapshotStatus`/`BalanceSignal`/`SquadContext`/`NotEvaluableReason`/`EvidenceId`/`EvidenceDirection`/`WorkItemTag`). La semántica canónica —y la que este cambio **porta literalmente**, no reinterpreta— vive en tres módulos del frontend:

- `frontend/src/features/dedication/adapters/capacityFte.ts` — FTE disponible y sus días.
- `frontend/src/features/dedication/adapters/history.ts` — mediana y referencia.
- `frontend/src/features/dedication/adapters/balanceSignal.ts` — evidencias, umbrales y agregación a señal.

Las reglas están en `openspec/specs/real-dedication/spec.md` y `openspec/specs/admin-shell/spec.md` (Calendario de sprints, ya implementado en Admin: `HistoryWindowSprints`, `MinHistorySprints`, `HoursPerSprint`). `dedicationService.ts` documenta explícitamente, en su propio comentario "PENDIENTE DE BACKEND", las cuatro piezas que el servidor real todavía no tiene — dos de ellas (el job de sellado y la reconstrucción de `wip`) son la razón por la que este módulo se partió en dos cambios.

Convenciones ya asentadas en los diez módulos anteriores: agregados `AggregateRoot`; entidades poseídas con ctor privado sin parámetros + propiedades de sólo lectura, para que EF las materialice por propiedades; `IEndpointDefinition` por módulo; ejemplos Swagger con `IExamplesProvider`; provider InMemory/Postgres con semillas en `DevelopmentDataSeeder`; cliente HTTP externo con el patrón ya usado por `CompanyRegistry` (interfaz + `HttpClients` en appsettings) — ese patrón se reserva para el segundo cambio.

## Goals / Non-Goals

**Goals**
- Las 2 rutas de lectura en 🟢, con exactamente los números y umbrales que hoy produce el frontend.
- Dejar `Sprint`/`SprintSnapshot` listos para que el segundo cambio (sincronización) sólo tenga que llenarlos, no rediseñarlos.

**Non-Goals**
- Sincronización real con Azure DevOps, sellado automático al cierre de un sprint, reconstrucción de `wip`, vínculo de identidad DevOps (Detalle de persona), calendario de festivos administrable, mapeo épica↔iniciativa contra un catálogo vivo, scope por chapter.

## Decisions

1. **`Sprint` es un agregado propio, no una fórmula sobre `SprintConfiguration`.** `SprintConfiguration` (Admin) fija cuántas semanas dura un sprint y con qué ventana se mira el histórico, pero no un punto de anclaje del que derivar nombres y fechas — y el propio mock los declara con nombre y fechas explícitas (`S12`…`S18`), no calculados. `Sprint` guarda `Name` (único), `StartDate`, `EndDate` y `Holidays` (festivos de calendario del sprint, sembrados — "la plataforma no administra el calendario todavía", literal del comentario del frontend). "Sprint actual" **nunca se persiste**: se deriva de si la fecha de hoy cae entre sus fechas.

2. **`SprintSnapshot` es la unidad de sellado, con `PersonId`/`SprintId` como referencia informativa, sin navegación** — mismo patrón que `Allocation.SquadId`. Guarda todo lo que las pantallas necesitan sin volver a tocar un catálogo vivo: SP comprometidos al inicio y agregados durante (de ahí salen comprometidos totales, no completados y trabajo no planificado), completados y carry-over (sólo tienen sentido si está sellado), `wip` (nulo si no se pudo reconstruir), las iniciativas concurrentes por épica **congeladas** (id/título de épica, iniciativa mapeada si la había, puntos — ver decisión 8), las historias del sprint y el mapa de actividad por día, también congelados.

3. **`Seal()` es un método del agregado; quién lo llama es del segundo cambio.** El agregado sabe pasar de `Provisional` a `Sealed` fijando `SealedAtUtc` — la invariante ("no se sella dos veces", "no se sella sin datos de ejecución") vive ahí. Que ese sellado ocurra automáticamente al cierre de un sprint (`sprintCloseTime` del Calendario) es un job que este cambio no construye: sin sincronización real no hay qué sellar todavía. Las semillas llaman a `Seal()` directamente, como hace `Initiative.SaveEvaluation` con su snapshot.

4. **FTE disponible reutiliza `BusinessDayMath` (Ausencias) sin reescribir la aritmética.** `businessDays.ts`/`BusinessDayMath.CountBusinessDays` ya cuentan días hábiles con medias jornadas; `absenceDaysInSprint` del frontend recorta una ausencia contra el sprint con `ClampRange`, exactamente lo que `AbsenceContext` ya hace contra un mes. Este cambio agrega `CapacityCalculator` (Application) que hace lo mismo contra las fechas del sprint: días hábiles del sprint, menos festivos del sprint, menos vacaciones y ausencias **aprobadas** (`IAbsenceRepository`) que lo tocan, menos `OtherUnavailableDays` del propio snapshot. El resultado se acota a `[0, contractualFte]` — descuentos mal sembrados no pueden dar capacidad negativa ni mayor que el contrato. Las horas (`availableHours`/`deductedHours`) se calculan siempre al responder, nunca se guardan — es lectura derivada, nunca un parte de trabajo, literal del spec.

5. **La mediana de célula es "SP por colaborador", no el total de la célula.** El escenario del spec ("colaborador 9 SP, célula 9 SP" vs. "colaborador 9 SP, célula 22 SP") sólo tiene sentido si la cifra de célula está en la misma escala que la del colaborador: para cada sprint sellado de la ventana, se suman los SP comprometidos de todos los colaboradores de esa célula ese sprint y se divide por cuántos colaboradores tuvo, y **de esas cifras por sprint** se saca la mediana — no la mediana de todos los SP individuales de todos los colaboradores. *Alternativa descartada*: mediana de los SP comprometidos de cada colaborador de la célula en el sprint elegido (una sola cifra, no histórica) — no es "histórico de la célula", es sólo el sprint actual repartido, y el spec pide explícitamente una referencia de la célula **contra su propio histórico**.

6. **La señal de balance es un puerto literal de `balanceSignal.ts`, no una reinterpretación.** Los seis umbrales (`DEMAND_DEVIATION_PCT=25/50`, `COMPLETION_DROP_PP=15/30`, `CARRY_OVER_EXCESS_PP=10/25`, `UNPLANNED_RATE_PCT=20/50`, `MULTITASKING_INITIATIVES=3/5`, `MULTITASKING_WIP=4/6`, `SQUAD_SAME_DIRECTION_TOLERANCE_PP=10`, `STRONG_MIN_EVIDENCES=2`) se copian como constantes con nombre, no como números sueltos — el propio frontend los agrupa así "para que ajustarlos sea cambiar una constante, no una arqueología". Las seis funciones de evaluación (`evaluateDeviation`, `evaluateCompletion`, `evaluateCarryOver`, `evaluateUnplanned`, `evaluateMultitasking`) y la agregación (`aggregate`, `resolveSquadContext`) se traducen método a método, conservando sus casos borde exactos: cumplimiento sin sellar sólo evalúa el 100 %, no la caída; carry-over sólo existe sellado; direcciones opuestas caen a "Carga habitual"; el contexto de célula se anota y **nunca** descuenta una evidencia.

7. **Identidad DevOps como campo mínimo en `Person`, no el flujo completo.** `Person.DevOpsUserId` (string, nulo) sólo alimenta `hasIdentity` y el motivo "No evaluable: sin identidad". Buscar en Azure DevOps por correo, vincular con su 409 si la identidad ya es de otra persona, y desvincular son de **Detalle de persona** (`GET /devops/users`, `POST /people/{id}/devops-identity`), un módulo todavía 🔴 que este cambio no adelanta. Acá el campo se puebla sólo por semilla, con un método interno (`Person.LinkDevOpsIdentity`) que ese módulo futuro reutilizará.

8. **Las iniciativas concurrentes y las historias viajan congeladas dentro del snapshot, no resueltas contra `Initiative` en cada respuesta.** `Initiative` no tiene hoy (ni lo necesita para su propio contrato) un campo que la vincule a una épica de Azure DevOps; inventar esa referencia sólo para esta lectura acoplaría un dato que depende de una sincronización que no existe todavía. `ConcurrentInitiativeDto.initiativeId/initiativeName` se guardan tal cual llegaron a congelarse en el snapshot (nulos cuando la épica no estaba mapeada) — el segundo cambio, cuando sincronice de verdad, decidirá cómo resuelve ese mapeo contra el catálogo vivo de iniciativas.

9. **`GET /dedication/collaborators` no exige `sprint`.** Sin parámetro, resuelve el sprint vigente (por fecha); con un nombre que no existe en el catálogo de sprints, 400 — el contrato no lo declara explícitamente (su lista de respuestas es sólo `200`), pero un nombre inventado no tiene sprint del que derivar filas, y responder con datos inventados sería peor que un 400 no documentado. La ruta de detalle sí declara 404, reservado a persona inexistente — un `sprint` inválido en el detalle sigue la misma regla del listado.
10. **El orden por defecto es el de la señal accionable**, calculado en Application con los mismos cuatro grupos del spec (sobreasignación y subasignación primero, luego carga habitual, luego no evaluables) — no una columna de base de datos que ordenar, porque la señal misma es derivada por completo en cada respuesta.

## Risks / Trade-offs

- [Sin sincronización real, los snapshots sólo existen por semilla] → el segundo cambio los reemplaza por datos reales sin tocar la forma del agregado; mientras tanto el dashboard es fiel a los mismos números que ya muestra el mock.
- [`wip` puede llegar `null` de la semilla, igual que de una sincronización real que no pudo reconstruirlo] → la evidencia de multitarea queda sin evaluar en ese caso, comportamiento ya previsto por `evaluateMultitasking`.
- [La mediana de célula exige que todos los colaboradores de una célula tengan snapshots del mismo sprint para ser comparable] → si faltan, ese sprint sencillamente no aporta a la mediana de célula (se excluye, no se aproxima).
- [Campo de identidad DevOps mínimo, sin flujo de vinculación] → cuando Detalle de persona exista, reutiliza el mismo campo; hasta entonces sólo se puebla por semilla, y no hay endpoint que lo cambie.
- [Sin scope por chapter] → igual que los diez módulos anteriores.

## Migration Plan

Sin datos que migrar: tablas nuevas (`Sprints`, `SprintSnapshots` y sus colecciones poseídas) y una columna nueva en `People` (`DevOpsUserId`, nulo). Orden: Domain (value objects + `Sprint` + `SprintSnapshot` + campo en `Person`) → Application (`CapacityCalculator`, referencia histórica, señal de balance, DTOs, dos use cases) → Infrastructure (configuración EF + repositorios + semillas cubriendo cada señal y cada motivo de "no evaluable") → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar los dos endpoints, las tablas nuevas y la columna en `People`; ningún otro módulo depende todavía de Capacidad.

## Open Questions

(ninguna)
