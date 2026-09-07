# Tareas — Backend: módulo Iniciativas completo

## 1. Domain

- [x] 1.1 `InitiativeStatus`: renombrar `Evaluation`→`Evaluating` (slug del contrato); actualizar referencias.
- [x] 1.2 Remodelar `Initiative`: ctor (name ≤200, squadId, productOwner ≤100, targetMonths 1–36), `Update(name, squadId, productOwner, targetMonths)`, `SaveEvaluation(InitiativeEvaluation)`, `ChangeStatus` con guardas (Activar sin evaluación / Cerrar desde no-Activa); retirar `Type`, `DeadlineMonths`, flags y `InitiativeType` VO. `InitiativeEvaluation` como record inmutable (inputs + derivados + savedAtUtc).
- [x] 1.3 Tests de dominio: guardas de estado, rangos del ctor, snapshot asignable/reemplazable.

## 2. Application — modelo y motor

- [x] 2.1 DTOs del contrato: `InitiativeDto` (con `Evaluation?` y `SquadHasOtherActive`), `InitiativeEvaluationDto`, `EvaluationModelDto` (dimensiones, preguntas con kind/escala, tamizaje, bandas con rangos, mix), `InitiativesStatsDto`; requests `InitiativeInput`, `SaveEvaluationRequest`, `SetInitiativeStatusRequest`.
- [x] 2.2 `IEvaluationModelProvider` (Abstractions) + `EvaluationEngine` estático (espejo de `computeEvaluation`: clamp 0–4, pct 1 decimal, banda por `pct <= maxPct` con fallback última, dimensiones con enteros, FTE = pm/meses con meses ≥ 1, mix proporcional sólo con gente, veredicto del tamizaje).
- [x] 2.3 Tests del motor contra los números del mock: perfiles SMALL/MEDIUM/LARGE → puntos, pct, talla, fteExpected/min/max, mix y veredicto exactos; banda extrema (pct 100 → XL), sin respuestas (0 puntos → XS).

## 3. Application — use cases

- [x] 3.1 `GetInitiatives` (global paginado; filtros search por nombre, status, squadId, talla sobre evaluación; `squadHasOtherActive` y `squadName` derivados del conjunto) y `GetInitiativeById`.
- [x] 3.2 `CreateInitiative` (valida célula existente; nace Evaluating sin evaluación) y `UpdateInitiative` (misma validación; si hay evaluación guardada, re-evalúa con los inputs guardados y el plazo nuevo — talla y puntos no cambian).
- [x] 3.3 `SaveEvaluation` (404; 400 si tamizaje ≠ 6 booleanos, plazo < 1, respuestas fuera de 0–4 o con ids fuera del pool; calcula con el motor y también actualiza `targetMonths`).
- [x] 3.4 `ChangeInitiativeStatus` reescrito: 400 «Estado inválido» / «Para activar una iniciativa primero hay que evaluarla» / «La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra.» (excluyéndose a sí misma) / «Sólo se cierra una iniciativa activa».
- [x] 3.5 `GetEvaluationModel` (proveedor) y `GetInitiativesStats` (5 tallas siempre, fteDemand a 2 decimales). Registrar todo en DI; retirar use cases viejos (por célula, delete, flags).
- [x] 3.6 `SquadAggregates`: `activeInitiative.talla` sale de la evaluación guardada (deja de ser "").
- [x] 3.7 Tests de use cases: filtros, reglas de activación/cierre (los 4 400), guardado de evaluación (400s y recálculo de plazo), stats.

## 4. Infrastructure

- [x] 4.1 `StaticEvaluationModelProvider` con las semillas del mock (30 preguntas con dimensión/peso, 6 objetivas con su escala + escala cualitativa, TRIAGE 6 con T2/T3 críticas, bandas XS 0–20/S 20–40/M 40–60/L 60–80/XL 80–100 con pm y lectura y acción, mix Backend Dev/QA Engineer/Arquitecto). Registrar en DI.
- [x] 4.2 `InitiativeConfiguration`: status renombrado, `Evaluation` como columna JSON (converter System.Text.Json), retirar columnas viejas.
- [x] 4.3 Seeder: 7 iniciativas del mock por nombre de célula (estados y respuestas SMALL/MEDIUM/LARGE; savedAtUtc = createdAtUtc del seed), evaluadas con el motor al sembrar.

## 5. WebApi

- [x] 5.1 `InitiativesEndpoints` reescrito: `GET /initiatives` (+filtros), `POST`, `GET/PUT /{id}`, `PUT /{id}/evaluation`, `PUT /{id}/status`, `GET /evaluation-model`, `GET /stats` (literales antes de `/{id:guid}`); retirar rutas por célula, DELETE y catálogos initiative-types/statuses.
- [x] 5.2 Ejemplos Swagger nuevos.

## 6. Verificación

- [x] 6.1 `dotnet build` + `dotnet test` en verde (solo las 9 fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 6.2 Smoke con InMemory: evaluation-model completo; listado con filtros (`status=Active` → 3, `talla=M`); Payment Engine v2 con `squadHasOtherActive=true` y activar → 400; cerrar Kafka Migration y activar Payment Engine → 200; PUT evaluación de "Pago con QR" → talla calculada; stats (7 totales, 2 sin evaluar, activas por talla, fteDemand); `GET /squads` muestra la talla en `activeInitiative`.
- [x] 6.3 `node backend/tools/contract-coverage.mjs` sigue 88/88; `backend/ENDPOINTS.md`: Iniciativas 8🟢, nota de Células actualizada (talla real), total actualizado.
