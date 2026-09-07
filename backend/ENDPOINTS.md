# Endpoints y lógica del backend

El contrato completo vive en [`oas.json`](./oas.json) (OpenAPI 3.1, 88 operaciones). Este documento lo aterriza para implementarlo **sin depender del mock**: por módulo, cada endpoint con sus esquemas, las reglas de negocio que debe cumplir (con la spec de OpenSpec que las gobierna) y su estado frente a `backend/src`.

**Fuente de verdad.** Lo que el frontend consume: los tipos TypeScript de `frontend/src/features/*/services` y la semántica de los handlers de `frontend/src/mocks/handlers`. Cuando el backend real y este contrato difieran, gana el contrato: el front ya funciona contra estas formas.

**Convenciones transversales.**
- `servers: /api/v1` — las rutas de acá son relativas al gateway.
- Autenticación por bearer del gateway; **el scope es por chapter**: toda lectura del Líder de Expertise responde sólo por las personas a su cargo (claims, nunca parámetros).
- Errores: `ErrorResponse { message }`; 400 validación, 404 no existe, 409 conflicto (el mensaje dice con qué), 401/403 transversales.
- Filtros multivalor como clave repetida sin corchetes (`level=1&level=2`); paginación `page`/`pageSize` con sobre `items/page/pageSize/totalCount/totalPages`.
- **Niveles vs. Seniority**: `level` 1–4 (Principiante, Competente, Avanzado, Experto — la escala del value object `Seniority` del .NET actual) y `seniority` Junior/Intermediate/Senior son dos campos distintos. El catálogo `sfia-levels` no existe.

**Semáforo**: 🟢 Implementado (misma ruta y forma) · 🟡 Desalineado (existe con otra forma; la nota dice cuál) · 🔴 Pendiente (no existe en `backend/src`).

## Resumen

| Módulo | Endpoints | 🟢 | 🟡 | 🔴 |
|---|---:|---:|---:|---:|
| Ausencias | 3 | 3 | 0 | 0 |
| Admin (parámetros del modelo) | 8 | 8 | 0 | 0 |
| Asignaciones | 4 | 4 | 0 | 0 |
| Prefacturación | 8 | 8 | 0 | 0 |
| Competencias (span y planes) | 5 | 5 | 0 | 0 |
| Catálogos | 6 | 6 | 0 | 0 |
| Torre de control | 1 | 1 | 0 | 0 |
| Capacidad (dedicación) | 4 | 4 | 0 | 0 |
| Detalle de persona | 3 | 3 | 0 | 0 |
| Líneas de expertise | 10 | 10 | 0 | 0 |
| Iniciativas | 8 | 8 | 0 | 0 |
| Personas | 10 | 10 | 0 | 0 |
| Evaluaciones | 4 | 4 | 0 | 0 |
| Catálogo de habilidades | 7 | 7 | 0 | 0 |
| Células | 7 | 7 | 0 | 0 |
| **Total** | **88** | **88** | **0** | **0** |

## Ausencias

**Reglas.** Los días hábiles son de lunes a viernes; **los festivos no se descuentan** — decisión vigente del modelo, la misma del cálculo del frontend. Un permiso puede pedirse por media jornada, sobre un único día, y descuenta 0.5. El impacto en FTE por célula = días hábiles de la ausencia dentro del mes ÷ días hábiles del mes × FTE disponible × dedicación declarada. Sólo lo aprobado descuenta. Rechazar exige motivo y sirve también para revertir una aprobación; una rechazada es terminal, así que corregir un registro es rechazarlo y volver a registrarlo. Las ausencias aprobadas descuentan capacidad en el módulo de Capacidad y en la prefacturación.
→ Specs: `openspec/specs/absences/spec.md` y `frontend/openspec/specs/absence-half-days/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /absences` — Ausencias del mes con su impacto en FTE por célula | — | `AbsencesMonthDto` | 400 | Implementado: `month=YYYY-MM` obligatorio (400 si falta o no tiene esa forma). Devuelve las que tocan el mes ordenadas por fecha de inicio; los días y los impactos van expresados contra ese mes, con `monthBusinessDays` como denominador. Una que cruza el fin de mes cuenta en cada mes sólo sus días de ese mes. Falta el scope por chapter (claims), pendiente del ajuste de seguridad. |
| 🟢 | `POST /absences` — Registra una ausencia (un permiso admite media jornada sobre un solo día) | `CreateAbsenceRequest` | `AbsenceDto` | 400 | Implementado: nace Solicitada. 400 con rango inválido, rango sin días hábiles (un permiso sobre un sábado no descuenta nada), media jornada pedida para otro tipo o sobre varios días, marcas de media jornada distintas entre sí, persona inexistente, o solape con otra **no rechazada** de la misma persona. |
| 🟢 | `PUT /absences/{id}/status` — Aprueba o rechaza una ausencia (el rechazo exige motivo) | `UpdateAbsenceStatusRequest` | `AbsenceDto` | 400, 404 | Implementado: aprobar sólo desde Solicitada; rechazar desde Solicitada o Aprobada, exigiendo motivo. 400 con estado que no es una decisión, aprobación de algo no solicitado, cambio sobre una rechazada, o rechazo sin motivo. |

**El cuerpo del cambio de estado.** `UpdateAbsenceStatusRequest` es `{ status, reason? }`: `reason` sólo al rechazar, y se omite al aprobar. El contrato declaraba `rejectReason` y lo exigía siempre, lo que ningún consumidor enviaba; se corrigió `oas.json` para que diga lo que el frontend manda.

## Admin (parámetros del modelo)

**Reglas.** Parámetros con validación de rango: horas por sprint 20–400; hora de cierre `HH:mm`; cortes de talla estrictamente crecientes con 5 bandas; pesos de preguntas > 0. Cambiarlos re-parametriza los módulos que los leen (Capacidad, Iniciativas) sin migrar datos históricos.
→ Specs: `openspec/specs/admin-shell/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /admin/capability-mix` — Mix de capacidades por talla | — | `CapabilityMixRow[]` | — | Implementado: Filas en el orden guardado, con `id` estable y cantidades indexadas por talla. |
| 🟢 | `PUT /admin/capability-mix` — Guarda el mix de capacidades | `CapabilityMixRow[]` | `CapabilityMixRow[]` | 400 | Implementado: Reemplazo en bloque; 400 con id repetido, nombre repetido (sin distinguir mayúsculas) o cantidad negativa. |
| 🟢 | `GET /admin/question-pool` — Banco de preguntas de evaluación de iniciativas | — | `QuestionPoolRow[]` | — | Implementado: Las preguntas en el orden guardado, cada una con su dimensión de las 7 del catálogo cerrado. |
| 🟢 | `PUT /admin/question-pool` — Guarda el banco de preguntas | `QuestionPoolRow[]` | `QuestionPoolRow[]` | 400 | Implementado: Reemplazo en bloque; 400 con dimensión inexistente, peso < 1, texto vacío o id repetido. |
| 🟢 | `GET /admin/sprint-config` — Parámetros de sprint (semanas, horas por sprint, ventana de histórico) | — | `SprintConfig` | — | Implementado: Los seis campos del contrato, sin puntos por FTE ni reporte de horas. |
| 🟢 | `PUT /admin/sprint-config` — Guarda los parámetros de sprint | `SprintConfig` | `SprintConfig` | 400 | Implementado: Rangos 1–4 / 4–8 / 20–400 / 3–12 / 2–6, hora `HH:mm` y el mínimo nunca mayor que la ventana. |
| 🟢 | `GET /admin/talla-bands` — Bandas de talla vigentes (cortes y 5 bandas) | — | `TallaBands` | — | Implementado: Los 4 cortes interiores y las 5 bandas en el orden guardado. |
| 🟢 | `PUT /admin/talla-bands` — Guarda las bandas de talla | `TallaBands` | `TallaBands` | 400 | Implementado: 4 cortes crecientes que dejan ≥5 puntos por banda (mínimo inclusivo) contra 0 y 100, y 5 bandas con talla única y `pmMin ≤ pmMax`. |

**Valores por defecto.** Mientras nadie haya guardado un parámetro, su `GET` responde el valor de referencia del mock —calendario 2/6/80/23:00/6/3; cortes 20/40/60/80 con XS…XL; Backend Dev, QA Engineer y Arquitecto; las 30 preguntas del modelo v7, peso total 70— **sin persistirlo**. El primer `PUT` crea la fila; los siguientes la reemplazan. Así los endpoints responden con cualquier provider, sin depender del seeder de Development, y el módulo de Iniciativas siempre tiene modelo con el que evaluar.

## Asignaciones

**Reglas.** Una persona tiene **una sola asignación**: crear una segunda responde 400. Dedicación 1–100; BAU + Transformación = dedicación (400 si no cuadra). El margen de la persona es 100 − dedicación. Los campos de persona del DTO se derivan del maestro de personas al responder.
→ Specs: `openspec/specs/allocations/spec.md` y `openspec/specs/control-tower/spec.md` (reasignar con la misma semántica: asignar = crear, subir = editar, mover = quitar y crear).

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `PUT /allocations/{id}` — Cambia dedicación o mezcla de una asignación | `UpdateAllocationRequest` | `AllocationDto` | 400, 404 | Implementado: Cuerpo del contrato (sólo porcentajes; la iniciativa no se toca), mezcla validada como 400 y respuesta con el DTO enriquecido. |
| 🟢 | `DELETE /allocations/{id}` — Quita a la persona de la célula | — | `204` | 404 | Implementado: Misma ruta y semántica. |
| 🟢 | `GET /squads/{squadId}/allocations` — Asignaciones vigentes de la célula | — | `PagedResultOfAllocationDto` | 404 | Implementado: DTO con los campos de persona derivados del maestro (`personAvailablePercentage` = 100 − dedicación) y filtros `search`/`level`; 404 si la célula no existe. |
| 🟢 | `POST /squads/{squadId}/allocations` — Asigna una persona a la célula | `CreateAllocationRequest` | `AllocationDto` | 400, 404 | Implementado: Una persona tiene una sola asignación (400 si ya tiene), mezcla BAU+Transformación = dedicación como 400; la iniciativa nace nula. |

## Prefacturación

**Reglas.** Generar produce una prefactura por persona **externa** del período: esperado = costo mensual − descuento por ausencias (días hábiles ausentes / días hábiles del mes × costo) ± ajuste. La diferencia = prefacturado − esperado la calcula el servidor. Aprobar con diferencia ≠ 0 exige nota; objetar exige motivo y queda trazado. El documento del proveedor lleva imputación completa. El snapshot de la persona (nombre, cargo, célula, proveedor, costo mensual) se congela al generar; sólo el nombre del proveedor y el descuento por ausencias se resuelven en vivo, y el descuento deja de recalcularse en cuanto la prefactura se aprueba. Scope por chapter pendiente, como los siete módulos anteriores.
→ Specs: `openspec/specs/provider-billing/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /billing` — Prefacturas del período (una por persona externa) | — | `PrefactureDto[]` | — | Implementado: una fila por persona externa, existente o sintética en `None` sin persistir. |
| 🟢 | `GET /billing/{id}` — Detalle de una prefactura | — | `PrefactureDto` | 404 | Implementado. |
| 🟢 | `PUT /billing/{id}/adjustment` — Registra o reemplaza el ajuste del período (horas extra, ingreso parcial, salida…) | `BillingAdjustmentDto` | `PrefactureDto` | 400, 404 | Implementado: bloqueado en aprobada/objetada; mueve una `Received` a `InReview`. |
| 🟢 | `DELETE /billing/{id}/adjustment` — Quita el ajuste del período | — | `PrefactureDto` | 404 | Implementado. |
| 🟢 | `POST /billing/{id}/prefacture` — Registra el documento recibido del proveedor con su imputación | `RegisterPrefactureRequest` | `PrefactureDto` | 400, 404 | Implementado: una sola vez por período, salvo corrigiendo una objetada. |
| 🟢 | `PUT /billing/{id}/prefactured` — Registra el valor prefacturado (el servidor calcula la diferencia) | `SetPrefacturedRequest` | `PrefactureDto` | 400, 404 | Implementado. |
| 🟢 | `PUT /billing/{id}/status` — Aprueba (nota obligatoria si hay diferencia) u objeta (motivo obligatorio) | `SetBillingStatusRequest` | `PrefactureDto` | 400, 404 | Implementado: aprobar congela el descuento vigente en ese momento. |
| 🟢 | `POST /billing/generate` — Genera las prefacturas esperadas del período (costo mensual − descuento por ausencias) | `GeneratePrefacturesRequest` | `PrefactureDto[]` | 400 | Implementado: idempotente. |

## Competencias (span y planes)

**Reglas.** El span cruza la última evaluación cerrada de cada persona contra lo que su cargo exige; personas sin evaluar no cuentan en los totales. Una acción del plan nace de una brecha abierta y apunta a un nivel superior al actual; marcarla cumplida **no** cierra la brecha — la brecha se cierra reevaluando. Pendientes de gestión: sin evaluar, brechas sin plan, planes vencidos (dueMonth pasado), cargos sin nivel declarado.
→ Specs: `openspec/specs/career-plan/spec.md` y `openspec/specs/skill-assessment/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /career-plan/people/{personId}/plan` — Perfil evaluado y plan de desarrollo de la persona | — | `PersonPlanDto` | 404 | Implementado: sin evaluación cerrada, plan con `skills: []` y `cycle: null`; el nombre/grupo/criterios de cada habilidad salen del recorte congelado de la evaluación, `expectedLevel`/`gap` siempre contra el catálogo y el cargo vigentes — nunca lo que la evaluación congeló al cerrar. |
| 🟢 | `POST /career-plan/people/{personId}/plan/actions` — Acuerda una acción del plan (nace de una brecha) | `CreatePlanActionRequest` | `PersonPlanDto` | 400, 404 | Implementado: 400 si la habilidad no está entre las evaluadas de la persona, si no tiene brecha registrada, si el nivel objetivo no es 1-4 o no supera al alcanzado, o si el mes no tiene forma `YYYY-MM`. `fromLevel` se congela al nivel alcanzado en ese momento. |
| 🟢 | `PUT /career-plan/people/{personId}/plan/actions/{actionId}/status` — Marca la acción como cumplida (cerrar la brecha exige reevaluar) | `SetPlanActionStatusRequest` | `PersonPlanDto` | 404 | Implementado: sólo cambia el estado de la acción; el `gap` de esa habilidad no se mueve — sale siempre de la evaluación cerrada más reciente. |
| 🟢 | `GET /career-plan/span` — Matriz persona × habilidad del chapter con brechas | — | `SpanMatrixDto` | — | Implementado: sólo habilidades activas; persona sin evaluación cerrada → fila `evaluated: false` con celdas sin nivel. |
| 🟢 | `GET /career-plan/span/summary` — Resumen del span: brechas, cobertura, riesgo, tendencia y pendientes | — | `SpanSummaryDto` | — | Implementado: brechas críticas ≥2 niveles, riesgo ≥3 brechas, habilidades foco pesadas por niveles que faltan (no por cuenta de personas), serie por ciclo siempre contra la exigencia de hoy, y los cuatro pendientes de gestión calculados una sola vez sobre el span completo. |

## Catálogos

**Reglas.** Catálogos cerrados y de sólo lectura. `levels` es la escala Tuya de 4 (por nombre, sin número en pantalla); `seniorities` es Junior/Intermediate/Senior (etiquetas Junior/Intermedio/Senior). No existe `sfia-levels`.
→ Specs: `openspec/specs/people/spec.md` (Selección de seniority y modalidad desde catálogo).

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /catalogs/levels` — Escala Tuya de 4 niveles | — | `LevelOption[]` | — | Implementado: La escala Tuya de 4, movida desde el viejo `seniorities`. |
| 🟢 | `GET /catalogs/modalities` — Modalidades de trabajo | — | `Modality[]` | — | Implementado: Misma ruta y forma. |
| 🟢 | `GET /catalogs/roles` — Roles de participación en la aplicación | — | `RoleOption[]` | — | Implementado: Servido desde el catálogo cerrado `PersonRole` (slug + etiqueta en español). |
| 🟢 | `GET /catalogs/seniorities` — Seniorities: Junior, Intermedio, Senior | — | `SeniorityOption[]` | — | Implementado: Sirve Junior/Intermediate/Senior con etiquetas en español. |
| 🟢 | `GET /companies` — Compañías/proveedores (solo lectura) | — | `CompanyDto[]` | — | Implementado: Misma ruta; verificar el DTO (id, name). |
| 🟢 | `GET /criticalities` — Catálogo de criticidades | — | `Criticality[]` | — | Implementado: Misma ruta y forma. |

## Torre de control

**Reglas.** Vista agregada del chapter (personas con margen, células por ocupación) calculada del maestro; alimenta el drawer de reasignación, que aplica los cambios con los endpoints de Asignaciones.
→ Specs: `openspec/specs/control-tower/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /chapter/capacity-overview` — Vista agregada del chapter: FTE, personas y células, para la Torre y el drawer de reasignación | — | `CapacityOverviewDto` | — | Implementado: reutiliza `FteMath`/`SquadAggregates` de Células a escala de chapter. `people` sólo trae a quienes tienen margen (sin célula primero, luego por margen descendente); `squads` trae todas, sin equipo primero, luego al tope (`AllocatedFte >= TeamAvailableFte` con equipo), luego el resto por menor margen. |

## Capacidad (dedicación)

**Reglas.** El corazón del backend nuevo. Por colaborador y sprint: **capacidad** = FTE contractual ajustado por días (hábiles − festivos − vacaciones − ausencias − otros) y en horas (`hoursPerSprint` prorrateado); **referencia** = mediana de SP sobre los últimos `historyWindowSprints` sprints **sellados** (mínimo `minHistorySprints`, si no: NotEvaluable/InsufficientHistory); **señal de balance** agregando 6 evidencias — demanda vs histórico propio (umbral ±25 %), demanda por FTE disponible (±25 %, fuerte al doble), cumplimiento (piso: referencia −15 pts), carry-over (techo 20 %), trabajo no planificado (techo 20 %), multitarea (WIP ≥4, fuerte ≥6) — con el modificador de célula (`squadContext: SameDirection` cuando la célula se desvía igual). Los sprints cerrados sin snapshot (`Missing`) no cuentan en el histórico. `sync` reconsulta Azure DevOps (items, épicas, actividad) y responde `lastSyncedAt`; 502 si DevOps no responde.
→ Specs: `openspec/specs/real-dedication/spec.md` (todas sus requirements) y `openspec/specs/admin-shell/spec.md` (horas por sprint y ventana de histórico).

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /dedication/collaborators` — Balance de carga por colaborador para el sprint elegido | — | `CollaboratorDedicationListDto` | 400 | Implementado: sin `sprint` resuelve el vigente (400 si no hay ninguno); nombre inexistente, 400. Filtra por `search`/`squadId` (uno o más) sin tocar el resumen, que siempre habla del sprint completo. |
| 🟢 | `GET /dedication/collaborators/{personId}` — Dashboard de balance del colaborador (tendencia + sprint seleccionado) | — | `CollaboratorDedicationDetailDto` | 400, 404 | Implementado: tendencia con todos los sprints sembrados; `sprint` inválido, 400; persona inexistente, 404. |
| 🟢 | `POST /dedication/collaborators/{personId}/sync` — Actualiza desde Azure DevOps un colaborador | — | `SyncResultDto` | 400, 404, 502 | Implementado: 400 sin identidad DevOps vinculada o sin sprint vigente; no toca un snapshot ya sellado; `wip` reconstruido desde las transiciones de estado de las historias. |
| 🟢 | `POST /dedication/collaborators/sync` — Actualiza desde Azure DevOps todos los colaboradores a cargo | — | `SyncResultDto` | 502 | Implementado: sincroniza a quien tenga identidad vinculada; nadie vinculado responde 200 igual; 502 sólo si absolutamente ninguna sincronización individual tuvo éxito. |

## Detalle de persona

**Reglas.** Una sola llamada agrega ficha, stacks (con cobertura del chapter), identidad DevOps y el balance del sprint en curso (mismas reglas de la capability real-dedication). `costReading` compara el costo mensual contra la banda del **nivel** (escala de 4). La búsqueda en DevOps es por correo exacto; vincular una identidad que ya es de otra persona responde 409 diciendo de quién es. `suggestedSquads` sólo viaja sin célula.
→ Specs: `openspec/specs/people/spec.md` (Detalle de persona) y `openspec/specs/real-dedication/spec.md` (Señal de balance de capacidad).

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /devops/users` — Busca la identidad en Azure DevOps por correo corporativo | — | `DevOpsUserDto` | 400, 404 | Implementado: 400 sin `email`; 404 sin coincidencia. |
| 🟢 | `GET /people/{id}/detail` — Detalle agregado de la persona (ficha, stacks, identidad y balance del sprint) | — | `PersonDetailDto` | 404 | Implementado: cruza Personas/Células/Compañías/Líneas de expertise/Capacidad sin recalcular ninguna fórmula propia; `chapterName`/`chapterLeadName` salen de un catálogo fijo sembrado (sin ruta propia en el contrato); `costReading` contra bandas fijas por nivel; `suggestedSquads` sólo sin célula, por cargo. |
| 🟢 | `POST /people/{id}/devops-identity` — Vincula la identidad DevOps a la persona | `LinkDevOpsIdentityRequest` | `204` | 404, 409 | Implementado: no valida el `identityId` contra Azure DevOps real (eso es del segundo cambio); 409 nombrando a la persona que ya lo tiene vinculado. |

## Líneas de expertise

**Reglas.** El código es único (≤10); nombre ≤100; descripción ≤200. Incorporar personas las saca de la línea que tuvieran (una persona pertenece a lo sumo a una línea) y no toca sus células. Archivar no borra: la línea conserva su historia y se puede reactivar. El lead debe pertenecer a la línea.
→ Specs: `openspec/specs/expertise-lines/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /expertise-lines` — Todas las líneas (activas y archivadas) | — | `ExpertiseLineDto[]` | — | Implementado. |
| 🟢 | `POST /expertise-lines` — Alta de línea | `UpsertExpertiseLineRequest` | `ExpertiseLineDto` | 400 | Implementado: 400 con nombre repetido entre las activas, código repetido entre todas (incluidas archivadas), o campos fuera de límite; el código se normaliza a mayúsculas. |
| 🟢 | `GET /expertise-lines/{id}` — Detalle de la línea con su gente y capacidad | — | `ExpertiseLineDetailDto` | 404 | Implementado: la pertenencia reutiliza `Person.ChapterId`, ya existente; capacidad con las mismas fórmulas de `FteMath` que Células y Torre de control, con `freeFte` acotado a 0 (a diferencia de Torre de control). |
| 🟢 | `PUT /expertise-lines/{id}` — Edición de línea | `UpsertExpertiseLineRequest` | `ExpertiseLineDto` | 400, 404 | Implementado: mismas validaciones que el alta, excluyendo la propia línea de las comprobaciones de unicidad. |
| 🟢 | `POST /expertise-lines/{id}/archive` — Archiva la línea | — | `ExpertiseLineDto` | 400, 404 | Implementado: 400 si tiene personas (con la cuenta en el mensaje) o si ya está archivada — no declarado en el contrato, mismo criterio que otros agregados ante una doble transición. |
| 🟢 | `PUT /expertise-lines/{id}/lead` — Designa (o retira, con null) el lead de la línea | `SetLineLeadRequest` | `ExpertiseLineDetailDto` | 404 | Implementado: designar incorpora a la persona a la línea (`AssignToChapter`) y le quita el lead a cualquier otra línea que lo tuviera, sin error — la pantalla ya lo impide, el servidor lo corrige igual. |
| 🟢 | `POST /expertise-lines/{id}/people` — Incorpora personas (las saca de la línea que tuvieran; no toca células) | `AddLinePeopleRequest` | `ExpertiseLineDetailDto` | 404 | Implementado. |
| 🟢 | `DELETE /expertise-lines/{id}/people/{personId}` — Retira a la persona de la línea | — | `ExpertiseLineDetailDto` | 400, 404 | Implementado: 400 si la persona es el lead de la línea — no declarado en el contrato, mismo criterio que archivar con personas. |
| 🟢 | `POST /expertise-lines/{id}/reactivate` — Reactiva una línea archivada | — | `ExpertiseLineDto` | 400, 404 | Implementado: 400 si no está archivada; vuelve `Active` sin gente ni lead (los que ya tenía al archivarse, por construcción). |
| 🟢 | `GET /expertise-lines/people` — Roster: todas las personas con la línea a la que pertenecen (o ninguna) | — | `RosterPersonDto[]` | — | Implementado: resuelto en una sola pasada, sin N+1. |

## Iniciativas

**Reglas.** La evaluación la calcula el servidor con el modelo vigente (`/initiatives/evaluation-model`): puntos por pregunta × peso, % sobre el máximo, talla por bandas, FTE esperado/mín/máx y mix por talla; el tamizaje produce el veredicto (Required/Recommended/FastTrack). Activar exige evaluación guardada y célula sin otra iniciativa activa.

**De dónde sale el modelo.** `evaluation-model` se **compone desde los parámetros de Admin** —el pool de preguntas, las bandas de talla y el mix de capacidades, ya implementados— y no desde una copia propia. Lo que Admin no administra y este módulo aporta: el rango de porcentaje de cada banda (derivado de los cortes), el tipo y la escala de cada pregunta, el tamizaje y la acción por talla. Cambiar un parámetro en Admin afecta la **siguiente** evaluación, no las ya guardadas, que son snapshots.
→ Specs: `openspec/specs/initiatives/spec.md` y `openspec/specs/admin-shell/spec.md` (parámetros del modelo).

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /initiatives` — Listado paginado de iniciativas | — | `PagedResultOfInitiativeDto` | — | Implementado: Listado global con la evaluación embebida y `squadHasOtherActive` derivado del conjunto; filtros `search`/`status`/`squadId`/`talla` (la talla sale de la evaluación, así que una sin evaluar nunca la matchea). |
| 🟢 | `POST /initiatives` — Alta de iniciativa (nace en evaluación) | `InitiativeInput` | `InitiativeDto` | 400 | Implementado: Nace Evaluating y sin evaluar; 400 con nombre > 200, product owner > 100 o plazo fuera de 1–36; 404 si la célula no existe. |
| 🟢 | `GET /initiatives/{id}` — Detalle de una iniciativa | — | `InitiativeDto` | 404 | Implementado: Mismo DTO enriquecido del listado. |
| 🟢 | `PUT /initiatives/{id}` — Edición de iniciativa | `InitiativeInput` | `InitiativeDto` | 400, 404 | Implementado: Cambiar el plazo re-evalúa con las respuestas guardadas — el FTE se mueve, la talla y los puntos no— y conserva la fecha de guardado. |
| 🟢 | `PUT /initiatives/{id}/evaluation` — Guarda la evaluación de dimensionamiento (el servidor calcula talla, FTE y mix) | `SaveEvaluationRequest` | `InitiativeDto` | 400, 404 | Implementado: Sólo se reciben respuestas; 400 si el tamizaje no trae 6, si el plazo está fuera de 1–36, o si una respuesta sale de 0–4 o cita una pregunta fuera del pool. También actualiza el plazo. |
| 🟢 | `PUT /initiatives/{id}/status` — Cambia el estado (activar exige evaluación guardada y célula sin otra activa) | `SetInitiativeStatusRequest` | `InitiativeDto` | 400, 404 | Implementado: Los cuatro 400 en español — «Estado inválido», «Para activar una iniciativa primero hay que evaluarla», «La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra.» y «Sólo se cierra una iniciativa activa». Cuando faltan evaluación y cupo, se pide evaluar primero: es lo que el usuario puede resolver ahora. |
| 🟢 | `GET /initiatives/evaluation-model` — Modelo de evaluación vigente (preguntas, tamizaje, bandas de talla, mix) | — | `EvaluationModel` | — | Implementado: Compuesto desde Admin en cada petición; 30 preguntas en 7 dimensiones, tamizaje de 6 con T2 y T3 críticas, y bandas con su rango derivado de los cortes (la frontera es de la banda de abajo: XS 0–20, S 21–40, …). |
| 🟢 | `GET /initiatives/stats` — Resumen agregado de iniciativas | — | `InitiativesStats` | — | Implementado: Sobre el total; las 5 tallas siempre presentes en el orden de las bandas y `fteDemand` = Σ `fteExpected` de las activas a 2 decimales. |

## Personas

**Reglas.** El listado responde sólo por las personas a cargo del Líder de Expertise (scope por claims). Filtros combinables con paginación; al cambiar búsqueda o filtro se vuelve a la página 1. `level` (1–4) y `seniority` (J/I/S) son **dos escalas distintas y ambas campos propios y editables** de la persona. Validaciones del alta/edición: nombre ≤200, documento ≤50, UPN ≤250, cargo ≤100, rol del catálogo, nivel 1–4, seniority del catálogo, FTE 0–1, costo ≥0. Los stacks se reemplazan en bloque por su sub-recurso: 400 si un stack no está en el catálogo, hay más de un principal, o hay stacks sin principal. `utilization` la calcula el servidor desde las asignaciones. El resumen (`/people/stats`) se calcula sobre el total a cargo, no sobre la página, y distribuye por seniority (J/I/S).
→ Specs: `openspec/specs/people/spec.md` (Listar personas · Crear persona · Editar persona · Eliminar persona · Selección de seniority y modalidad desde catálogo · Resumen del módulo · Editar los stacks de una persona).

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /people` — Listado paginado de personas a cargo del Líder de Expertise | — | `PagedResultOfPersonDto` | — | Implementado: DTO completo del contrato (stacks, `utilization` = Σ dedicación de asignaciones, líder técnico con nombre y conteo derivados) y los tres filtros `level`/`seniority`/`stack`. Falta el scope por chapter (claims), pendiente del ajuste de seguridad. |
| 🟢 | `POST /people` — Alta de persona | `CreatePersonRequest` | `PersonDto` | 400 | Implementado: Rol validado contra el catálogo cerrado y `technicalLeadId` opcional (debe existir). |
| 🟢 | `PUT /people/{id}` — Edición de persona | `CreatePersonRequest` | `PersonDto` | 400, 404 | Implementado: Igual que el alta; además, si la persona deja de ser Líder Técnico, quienes la tenían asignada quedan sin líder. |
| 🟢 | `DELETE /people/{id}` — Baja de persona | — | `204` | 404 | Implementado: Misma ruta y semántica. |
| 🟢 | `GET /people/{id}/expertise-line` — Línea de expertise a la que pertenece la persona | — | `PersonExpertiseLineDto` | 404 | Implementado: resuelve contra `Person.ExpertiseLineId` y el módulo de Líneas de expertise; `{id:null,name:null}` sin línea vinculada. |
| 🟢 | `PUT /people/{id}/provider/{providerId}` — Asigna el proveedor de una persona externa | — | `204` | 404 | Implementado: Misma ruta y semántica. |
| 🟢 | `PUT /people/{id}/stacks` — Reemplaza la lista completa de stacks de la persona | `ReplaceStacksRequest` | `PersonDto` | 400, 404 | Implementado: 400 con stack fuera del catálogo, repetido, más de un principal o lista sin principal; guarda el principal primero. |
| 🟢 | `GET /people/stacks` — Catálogo de stacks del chapter (solo lectura) | — | `string[]` | — | Implementado: Lista fija en Infrastructure (espejo del mock) hasta que exista administración de stacks. |
| 🟢 | `GET /people/stats` — Resumen agregado del chapter (sin paginar ni filtrar) | — | `PeopleStats` | — | Implementado: Sobre el total; los tres escalones de seniority siempre presentes, muestra de 5 por nombre, cobertura con stacks de una sola persona en riesgo. `fteTarget` sigue asumido en 12. |
| 🟢 | `GET /people/technical-leads` — Personas que pueden ser líder técnico | — | `TechnicalLeadOption[]` | — | Implementado: Sólo quienes tienen el rol TechnicalLead, ordenadas por nombre. |

## Evaluaciones

**Reglas.** Una evaluación por persona y ciclo (`YYYY-S1|S2`, el semestre en curso al abrir). Mientras está en curso se resuelve contra el catálogo **vigente** — si el catálogo cambia a mitad de camino, la evaluación lo ve de inmediato. Calificar una habilidad exige nota sólo cuando el nivel alcanzado queda por debajo de lo que el cargo pide; sin brecha la nota es opcional. Cerrar exige que todas las habilidades activas del catálogo (más cualquiera que la evaluación ya haya usado) tengan nivel; al cerrar, cada habilidad calificada congela su propio recorte (nombre, grupo, criterios de sus cuatro niveles, nivel exigido) — de ahí en adelante esa evaluación no vuelve a tocar el catálogo, aunque cambie después. El nombre y el cargo de la persona **nunca** se congelan, ni siquiera en una cerrada. Una evaluación cerrada no se edita — corregirla es evaluar de nuevo.
→ Specs: `openspec/specs/skill-assessment/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /people/{personId}/assessment` — Evaluación del ciclo (en curso o cerrada), o null si no existe | — | `AssessmentDto?` | 404 | Implementado. |
| 🟢 | `POST /people/{personId}/assessment` — Abre la evaluación del ciclo vigente (sin cuerpo) | — | `AssessmentDto` | 400, 404 | Implementado: 400 si ya hay una en curso para esa persona y ciclo. |
| 🟢 | `PUT /people/{personId}/assessment/{assessmentId}/close` — Cierra la evaluación: congela el recorte de cada habilidad calificada | — | `AssessmentDto` | 400, 404 | Implementado: 400 si ya está cerrada o si faltan habilidades sin nivel, listándolas por nombre. |
| 🟢 | `PUT /people/{personId}/assessment/{assessmentId}/skills/{skillId}` — Califica una habilidad: nivel alcanzado, criterios marcados y nota | `SaveSkillRequest` | `AssessmentDto` | 400, 404 | Implementado: 400 con brecha sin nota, o con una habilidad fuera del alcance. |

## Catálogo de habilidades

**Reglas.** El catálogo es versionado: cada cambio estructural sube `version`. Los cargos (`positions`) no son un catálogo propio: salen de los cargos vigentes de las personas registradas, y `expectations` trae una entrada por cada uno (nivel o `null`). Los criterios de un nivel se reemplazan en bloque. `level: null` en expectations retira la exigencia del cargo. El borrado ya comprueba uso: `DELETE` de una habilidad que alguna evaluación **cerrada** calificó responde 400 ofreciendo desactivarla en su lugar (Evaluaciones cerró esta guarda). Sigue sin haber historial de versiones publicadas, sólo el contador — cada evaluación cerrada carga su propio recorte.
→ Specs: `openspec/specs/skills-catalog/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /skills-catalog` — Catálogo versionado de habilidades, criterios por nivel y expectativas por cargo | — | `SkillsCatalogDto` | — | Implementado. |
| 🟢 | `POST /skills-catalog/skills` — Alta de habilidad (nace incompleta, sin criterios) | `UpsertSkillRequest` | `SkillDto` | 400 | Implementado: nombre obligatorio y único (sin distinguir mayúsculas ni espacios de borde). |
| 🟢 | `PUT /skills-catalog/skills/{id}` — Edición de nombre, grupo y descripción | `UpsertSkillRequest` | `SkillDto` | 400, 404 | Implementado. |
| 🟢 | `DELETE /skills-catalog/skills/{id}` — Borra una habilidad que ninguna evaluación usó | — | `204` | 400, 404 | Implementado: 400 si alguna evaluación cerrada la calificó, ofreciendo desactivarla. |
| 🟢 | `PUT /skills-catalog/skills/{id}/active` — Retira o reactiva la habilidad del catálogo vigente | `SetSkillActiveRequest` | `SkillDto` | 404 | Implementado. |
| 🟢 | `PUT /skills-catalog/skills/{id}/expectations` — Declara (o retira, con null) el nivel esperado para un cargo | `SetExpectationRequest` | `SkillDto` | 400, 404 | Implementado: 400 si el cargo no existe entre las personas registradas. |
| 🟢 | `PUT /skills-catalog/skills/{id}/levels/{level}/criteria` — Reemplaza en bloque los criterios de un nivel | `SetCriteriaRequest` | `SkillDto` | 400, 404 | Implementado. |

## Células

**Reglas.** Los agregados del DTO (memberCount, members, FTEs, `activeInitiative`) los calcula el servidor desde las asignaciones e iniciativas vigentes; son de sólo lectura. Una célula sostiene a lo sumo una iniciativa activa. `/squads/stats` se calcula sobre el total (incluye los 4 niveles de criticidad aunque estén en cero).
→ Specs: `openspec/specs/squads/spec.md`.

| | Endpoint | Request | Response | Errores | Estado |
|---|---|---|---|---|---|
| 🟢 | `GET /squads` — Listado paginado de células | — | `PagedResultOfSquadDto` | — | Implementado: DTO con agregados derivados de asignaciones e iniciativas (muestra de 3 miembros por nombre, FTEs a 1 decimal, iniciativa Activa con su talla real tomada de la evaluación guardada) y filtros `search`/`criticality`. |
| 🟢 | `POST /squads` — Alta de célula | `CreateSquadRequest` | `SquadDto` | 400 | Implementado: Misma forma base (name, team, criticality, description). |
| 🟢 | `GET /squads/{id}` — Detalle de una célula | — | `SquadDto` | 404 | Implementado: Mismo DTO enriquecido del listado. |
| 🟢 | `PUT /squads/{id}` — Edición de célula | `CreateSquadRequest` | `SquadDto` | 400, 404 | Implementado: Misma forma base. |
| 🟢 | `DELETE /squads/{id}` — Baja de célula | — | `204` | 404 | Implementado: Misma ruta y semántica. |
| 🟢 | `GET /squads/{id}/team-stats` — Resumen de las personas de la célula | — | `SquadTeamStats` | 404 | Implementado: Equipo completo ordenado por nombre; expertos = nivel 4, principiantes = nivel 1. |
| 🟢 | `GET /squads/stats` — Resumen agregado de células (sin paginar ni filtrar) | — | `SquadsStats` | — | Implementado: Al tope = con gente y asignado ≥ disponible; `chapterFte` = Σ disponible de todas las personas; los 4 niveles de criticidad siempre presentes. |

## Existente en .NET sin consumidor

Rutas que hoy existen en `backend/src` y ninguna pantalla llama; quedan fuera del contrato hasta que alguna las necesite:

- `/squads/{squadId}/bau-tasks` (CRUD) — existe en .NET sin consumidor en el front; fuera del contrato hasta que una pantalla lo use.
- `/people/{personId}/allocations` — existe en .NET; el front lee las asignaciones por célula o por el detalle de la persona.
- `/people/{id}/chapter` (PUT/DELETE) — existe en .NET; la gestión de chapter aún no tiene pantalla.
- `/company-registry/{identificationNumber}` — existe en .NET sin consumidor.
- `/catalogs/initiative-types` y `/catalogs/initiative-statuses` — **retirados** con el módulo de Iniciativas: nadie los consumía y el estado viaja en el DTO. Con ellos se fueron las rutas por célula (`/squads/{id}/initiatives`) y `DELETE /initiatives/{id}`.
- `/catalogs/sfia-levels` — retirado del contrato: la escala de 4 es `/catalogs/levels`.

## Cómo mantener esto vivo

```bash
node backend/tools/contract-inventory.mjs   # qué consume el front hoy
node backend/tools/contract-coverage.mjs    # cruza inventario vs oas.json (falla si divergen)
npx @redocly/cli lint backend/oas.json      # el contrato sigue siendo OpenAPI válido
```
