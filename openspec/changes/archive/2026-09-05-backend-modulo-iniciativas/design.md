# Diseño — Backend: módulo Iniciativas completo

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`InitiativeDto` con `evaluation` embebida y `squadHasOtherActive`, `InitiativeInput`, `SaveEvaluationRequest`, `SetInitiativeStatusRequest`, `InitiativesStats`, `EvaluationModel` y sus piezas). La semántica canónica vive en `frontend/src/features/initiatives/services/evaluationModel.ts` (motor `computeEvaluation`) y `frontend/src/mocks/handlers/initiatives.handlers.ts` (validaciones, reglas de estado, stats); los datos del modelo en los mocks de Admin (`question-pool` 30 preguntas, `talla-bands` límites [20,40,60,80] + 5 bandas, `capability-mix` 3 capacidades) y `initiatives.seeds.ts` (TRIAGE, QUESTION_KINDS, QUALITATIVE_SCALE, BAND_ACTIONS, 7 semillas con perfiles SMALL/MEDIUM/LARGE).

## Goals / Non-Goals

**Goals**
- Los 8 endpoints de Iniciativas en 🟢; el motor produce exactamente los números del mock sobre las mismas entradas.
- `activeInitiative.talla` de Células deja de viajar vacía.

**Non-Goals**
- Módulo Admin (el modelo se sirve de un proveedor estático de sólo lectura), Torre de control, dedicación real, migraciones SQL, scope por chapter.

## Decisions

1. **La evaluación se persiste como snapshot JSON**: `InitiativeEvaluation` es un record de Application/Domain con inputs (triage bool[], answers dict, targetMonths) y derivados (points, maxPoints, pct, talla, pmMin/Max, fteExpected/Min/Max, dimensions, mix, triageVerdict, savedAtUtc), guardado en EF con un converter a JSON string (`System.Text.Json`, una columna). Cambiar el modelo en Admin afecta la **siguiente** evaluación, no las guardadas (RN-40) — por eso snapshot y no recálculo al leer. Editar el plazo recalcula el FTE (pm/meses) conservando talla y puntos (RN-34): se reconstruye el snapshot con el motor usando los inputs guardados y el plazo nuevo, con el modelo vigente sólo para bandas/mix de la talla ya fijada — como hace el mock (re-evalúa completo con los inputs guardados; puntos y talla no cambian porque las respuestas no cambiaron).
2. **`EvaluationEngine` estático en Application**, espejo 1:1 de `computeEvaluation`: clamp de respuestas 0–4 (`SCORE_MAX`), pct a 1 decimal, banda = primera con `pct <= maxPct` (fallback última), dimensiones con pct/weight redondeados a entero, mix sólo con capacidades > 0 personas y FTE proporcional sin redondear, meses `Max(1, targetMonths)`. Tamizaje: crítica marcada o ≥3 → Required; ≥1 → Recommended; si no → FastTrack.
3. **`IEvaluationModelProvider` en Application, implementación estática en Infrastructure** (patrón `IStackCatalog`): sirve el `EvaluationModel` completo (dimensiones derivadas del orden de aparición de las preguntas, kinds/escala por id — las 6 objetivas del mock, resto evaluativas con la escala cualitativa —, bandas con rangos desde los límites: XS 0–20, S 20–40, M 40–60, L 60–80, XL 80–100, acción por talla, mix). Cuando llegue el módulo Admin, el proveedor lee de sus agregados.
4. **`Initiative` remodelada**: ctor (name ≤200, squadId, productOwner ≤100, targetMonths 1–36), `Rename/Reassign/ChangeProductOwner/ChangeTargetMonths` vía `Update(...)`, `SaveEvaluation(snapshot)`, `ChangeStatus` con guardas de dominio (Activar sin evaluación → excepción; Cerrar desde no-Activa → excepción); la regla "célula sin otra activa" queda en el use case (necesita el conjunto). `InitiativeStatus.Evaluation` se renombra `Evaluating` (slug del contrato).
5. **`squadHasOtherActive` derivado al responder**: `all.Any(otra activa misma célula, id distinto)` — patrón `respond` del mock; excluirse a sí misma es lo que deja "reactivar" la ya activa sin chocar consigo misma.
6. **Mensajes 400 en español como el mock**: «Para activar una iniciativa primero hay que evaluarla», «La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra.», «Sólo se cierra una iniciativa activa» — vía `BadRequestException` (la guarda de dominio equivalente se traduce en el use case para no responder 500).
7. **Validación de `SaveEvaluationRequest`**: tamizaje con exactamente 6 respuestas booleanas, `targetMonths ≥ 1`, respuestas enteras 0–4 con ids del pool vigente (400 si sobra un id). El request reemplaza también `targetMonths` de la iniciativa (como el mock).
8. **Stats**: las 5 tallas siempre presentes en el orden de las bandas; `fteDemand` = Σ `fteExpected` de activas redondeado a 2 decimales.
9. **Semillas**: tras células, sembrar las 7 iniciativas por nombre de célula con `productOwner`, `targetMonths`, estado y —donde el seed trae respuestas— la evaluación calculada por el motor con los inputs SMALL/MEDIUM/LARGE del mock y `savedAtUtc` = `createdAtUtc` del seed. Payment Engine v2 queda evaluada sin activar (Backend Platform ya tiene Kafka Migration activa): el caso que prueba la regla.
10. **Retiros**: rutas por célula, `DELETE /initiatives/{id}`, catálogos `initiative-types`/`initiative-statuses`, `InitiativeType` VO y flags — con sus use cases y tests. `GetBySquadAsync` de `IInitiativeRepository` se conserva si algo lo usa (verificar); el listado global usa `GetAllAsync` + filtros en memoria (5–10 iniciativas; en SQL será consulta).

## Risks / Trade-offs

- **BREAKING pre-productivo** amplio (entidad, rutas, slug de estado). Mitigado porque nada productivo consume las formas viejas.
- El snapshot JSON no es consultable en SQL — aceptado: el filtro `talla` se aplica en memoria sobre la página global; si algún día duele, la talla se promueve a columna.
- Motor duplicado (TS y C#): el riesgo de divergencia se acota con tests C# que fijan los números exactos que hoy produce el mock para SMALL/MEDIUM/LARGE (puntos, pct, talla, FTE, mix).

## Migration Plan

Sin datos que migrar. Orden: Domain (status + entidad + snapshot) → Application (modelo/motor/DTOs/use cases) → Infrastructure (proveedor + EF JSON + seeder) → WebApi (endpoints + ejemplos) → retiros → tests (motor contra números del mock, reglas de estado) → smoke InMemory (evaluation-model, stats con 3 activas y fteDemand, activar Payment Engine v2 → 400, cerrar Kafka y activarla → 200, `squads` muestra talla) → coverage 88/88 + semáforo.

## Open Questions

(ninguna)
