# Backend: módulo Iniciativas completo al contrato

## Why

Quinto ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Iniciativas está 0🟢 5🟡 3🔴 y es el corazón del dimensionamiento: el .NET actual expone las iniciativas por célula con otra forma (`type`, `deadlineMonths`, flags de backlog/arquitectura) mientras el contrato pide el listado global con la **evaluación embebida** (talla, FTE, mix) calculada por el servidor con el modelo vigente. Cerrarlo además le da la talla real a `activeInitiative` de Células (hoy viaja vacía) y deja lista la demanda de FTE que consumirá la Torre de control.

## What Changes

- **Domain — `Initiative` se remodela al contrato**: `name`, `squadId`, `productOwner` (≤100), `targetMonths` (1–36), `status` `Evaluating|Active|Closed` (renombra `Evaluation`→`Evaluating`) y `Evaluation` guardada como snapshot (inputs: tamizaje, respuestas, plazo + derivados calculados al guardar). Desaparecen `Type`, `DeadlineMonths` y los flags de backlog/arquitectura/early-stage (nada los consume).
- **Motor de evaluación en Application** (`EvaluationEngine`, espejo de `evaluationModel.ts`): puntos = Σ respuesta×peso, % sobre el máximo (1 decimal), talla por bandas (la que contiene el %; por encima de todas, la última), FTE esperado = (pmMin+pmMax)/2 ÷ meses (mín/máx con los extremos), desglose por dimensión, mix por talla (composición % y FTE proporcional, sólo capacidades con gente) y veredicto del tamizaje (crítica marcada o ≥3 síes → Required; ≥1 → Recommended; 0 → FastTrack).
- **Modelo vigente servido por `GET /initiatives/evaluation-model`**: 30 preguntas (6 dimensiones, con tipo y escala), tamizaje de 6, bandas XS–XL (límites 20/40/60/80, con lectura y acción) y mix de 3 capacidades — como proveedor estático en Infrastructure (espejo de los mocks de Admin) hasta que exista el módulo Admin que lo haga editable; anotado.
- **Endpoints del contrato**: `GET /initiatives` (global, filtros `search`/`status`/`squadId`/`talla`), `POST` (nace Evaluating, sin evaluación), `GET/PUT /initiatives/{id}` (editar el plazo recalcula el FTE de la evaluación guardada sin cambiar la talla), `PUT /{id}/evaluation` (valida tamizaje completo, respuestas 0–4 de ids del pool; el servidor calcula todo), `PUT /{id}/status` (activar exige evaluación guardada y célula sin otra activa; cerrar sólo desde Activa), `GET /initiatives/stats` (total, sin evaluar, activas, activas por talla con las 5 tallas, `fteDemand` = Σ fteExpected de activas a 2 decimales).
- **Se retiran** las rutas por célula (`/squads/{id}/initiatives`), `DELETE /initiatives/{id}` y los catálogos `initiative-types`/`initiative-statuses` (fuera del contrato, sin consumidor) con sus use cases.
- **Semillas**: las 7 iniciativas del mock (Kafka Migration Activa en Backend Platform, Payment Engine v2 evaluada sin activar, Onboarding App, Fraud Scoring v3, Lakehouse cerrada, y 2 sin evaluar), con sus respuestas evaluadas por el motor al sembrar; `SquadAggregates` deja de poner talla vacía.
- Fuera de alcance: módulo Admin (el modelo es de sólo lectura), Torre de control, dedicación real (Epic→iniciativa), scope por chapter.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract` y `backend/oas.json` ya exigen; el cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (remodelado de `Initiative` + `InitiativeStatus`, snapshot de evaluación), Application (motor, DTOs, use cases nuevos/reescritos, `SquadAggregates` con talla real), Infrastructure (proveedor del modelo, configuración EF con evaluación como JSON, seeder con 7 iniciativas), WebApi (endpoints del contrato, ejemplos).
- `backend/tests`: motor de evaluación (puntos/talla/FTE/mix/veredicto contra valores conocidos del mock), reglas de activación, use cases; se retiran los tests de las formas viejas.
- `backend/ENDPOINTS.md` (Iniciativas hacia 8🟢; actualizar nota de Células sobre la talla). `backend/oas.json` no cambia.
- **BREAKING pre-productivo**: entidad y rutas remodeladas; `Evaluation`→`Evaluating` como slug de estado; desaparecen type/flags y las rutas por célula.
