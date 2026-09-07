# Diseño — Backend: módulo Asignaciones completo

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`AllocationDto` con 5 campos de persona, `CreateAllocationRequest` = personId + 3 porcentajes, `UpdateAllocationRequest` = 3 porcentajes) y semántica en `frontend/src/mocks/handlers/allocations.handlers.ts` (enrich, filtros, unicidad global) y `openspec/specs/allocations/spec.md`. El dominio ya valida dedicación ≥1 y BAU+Transf = dedicación (`Allocation.ValidateDedicationBreakdown`); `Person` ya trae `Level`, `Modality`, `Position`. Personas quedó 🟢 en el cambio anterior y su `utilization` suma dedicaciones vía `PersonDerivedData`.

## Goals / Non-Goals

**Goals**
- Los 4 endpoints de Asignaciones en 🟢: DTO enriquecido, filtros, unicidad del contrato.
- Semillas de células + asignaciones espejo del mock; `utilization` de Personas deja de ser 0.

**Non-Goals**
- Iniciativas (initiativeId/Name siguen nulos), agregados de Células, scope por chapter, migraciones SQL.
- No se retira `GET /people/{personId}/allocations` (existe sin consumidor; fuera del contrato).

## Decisions

1. **El repositorio devuelve `(Allocation, Person)` para el listado por célula**: `GetBySquadPagedAsync` pasa de `(Allocation, string PersonName)` a un join con la entidad `Person` completa, con `search` (nombre o cargo, case-insensitive) y `levels` aplicados en la consulta antes de paginar. Es lo que permite derivar los 5 campos y filtrar sin segunda pasada.
2. **`personAvailablePercentage` se deriva al mapear**: `Math.Max(0, 100 − dedicación)` — con la regla de asignación única es el margen real de la persona; el mock hace exactamente esto.
3. **Unicidad global por persona**: `ExistsByPersonAsync(personId)` reemplaza a `ExistsByPersonAndSquadAsync` + tope de 100% en el create. Mensaje 400 en español como el mock («La persona ya está asignada a una célula»). El método viejo y `GetTotalDedicationForPersonAsync` se retiran si nadie más los usa (verificar; el PUT no cambia de persona, así que no los necesita).
4. **Requests del contrato**: `CreateAllocationRequest(SquadId, PersonId, Dedication, Bau, Transformation)` — `SquadId` se inyecta desde la ruta (`request with { SquadId = id }`, como Update de personas) y no viaja en el cuerpo; `InitiativeId` desaparece del request (nace nulo). `UpdateAllocationRequest(Id, 3 porcentajes)` igual, con `Id` de la ruta.
5. **Validadores devuelven la mezcla como 400**: dedicación 1–100, BAU/Transf 0–100, `bau + transf == dedication` en FluentValidation (además del dominio, que como `DomainException` sería 500). 404 de persona/célula/asignación se mantienen.
6. **Mapeo con diccionario de personas**: `AllocationMappings.ToDto(allocation, person, squadName, initiativeName)` recibe la `Person`; Create/Update ya cargan la persona para validar, y GetBySquad la trae del join. Sin `PersonDerivedData` acá — los campos son de la persona, no derivados de terceros.
7. **Semillas**: 5 células (Backend Platform/Ecosistema Digital/High, Canales Digitales/Ecosistema Digital/Critical, Fraude Tarjetas/Riesgo y Fraude/Critical, Pagos Instantáneos/Pagos/Low, Plataforma de Datos/Datos y Analítica/Medium) y 9 asignaciones por nombre de persona: María 80/50, Carlos 100/60, Andrés 50/20, Isabella 50/30 (Backend Platform); Laura 100/30, Diego 100/70 (Canales); Valentina 60/20 (Fraude); Sebastián 100/50, Paula 60/60 (Datos). Transformación = dedicación − BAU. Se siembran tras las personas, resolviendo ids por nombre.

## Risks / Trade-offs

- **BREAKING pre-productivo**: quien dependa del tope repartido (tests actuales de create) pasa a la regla de asignación única; se reescriben esos tests con la semántica nueva.
- Retirar métodos del repositorio puede romper otros use cases: se verifica con grep antes de borrar; si algo más los usa, se dejan.
- El join por célula carga la persona completa por fila — irrelevante con InMemory; en SQL será un include/projection.

## Migration Plan

Sin datos que migrar. Orden: Application (DTO/mappings/requests/validadores/use cases) → Infrastructure (repo + seeder) → WebApi (bindings + ejemplos) → tests → smoke (InMemory, con Idempotency-Key en POST/PUT) → `contract-coverage` 88/88 + semáforo.

## Open Questions

(ninguna)
