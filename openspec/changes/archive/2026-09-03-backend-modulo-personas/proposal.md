# Backend: módulo Personas completo al contrato

## Why

Segundo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Con las escalas y los catálogos ya alineados, Personas es el maestro del que dependen los demás módulos, y aún le falta la mitad: el DTO no trae **stacks**, **utilization** ni **líder técnico**; el listado no filtra por `stack`; y siguen 🔴 `GET /people/stats`, `GET /people/stacks` (catálogo), `PUT /people/{id}/stacks`, `GET /people/technical-leads`, `GET /catalogs/roles` y `GET /people/{id}/expertise-line`. Cerrarlo deja `GET /people` consumible por el frontend real.

## What Changes

- **Domain — `Person` gana lo que el contrato pide**: colección propia de **stacks** (`PersonStack`: nombre del catálogo, nivel 1–4 con el VO `Level`, uno y sólo un principal cuando hay stacks; reemplazo en bloque), **líder técnico** (`TechnicalLeadId: Guid?` — informativo, sin ciclo consigo mismo), y **rol validado contra el catálogo cerrado** (Administrator, TechnicalLead, ExpertiseLead, ProductOwner, Contributor) en vez de texto libre.
- **Application**: `PersonDto` completo (`technicalLeadId/Name`, `technicalLeadOfCount`, `utilization`, `stacks`); requests de alta/edición con `technicalLeadId`; use cases nuevos — `GetPeopleStats` (resumen sobre el total: distribución por seniority J/I/S, FTE, muestra de avatares, cobertura de stacks), `ReplacePersonStacks` (400: stack fuera del catálogo, más de un principal, o stacks sin principal), `GetTechnicalLeads`, `GetStackCatalog`.
- **`utilization` y los campos derivados los calcula el servidor**: utilization = Σ dedicación de las asignaciones de la persona (ya existe `Allocation`); `technicalLeadName`/`technicalLeadOfCount` se resuelven al mapear.
- **WebApi**: filtro `stack` en `GET /people`; endpoints nuevos `GET /people/stats`, `GET /people/stacks`, `PUT /people/{id}/stacks`, `GET /people/technical-leads`, `GET /catalogs/roles`; `GET /people/{id}/expertise-line` responde `{id:null,name:null}` mientras no exista el módulo de líneas (anotado en la guía, queda 🟡).
- **Semillas**: el seeder extiende las personas con stacks (espejo de `STACK_SEEDS` del mock, con el principal primero), roles (`ROLE_BY_NAME`) y líderes técnicos (`TECHNICAL_LEAD_BY_NAME`), y el catálogo de stacks del chapter.
- Fuera de alcance: chapter/scope por claims, células/asignaciones (más allá de leerlas para utilization), y los demás módulos del semáforo.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract` y `backend/oas.json` ya exigen; el cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (`Person`, `PersonStack` nuevo, `PersonRole` catálogo, eventos si aplica), Application (DTO, mappings con derivados, use cases nuevos y validadores), Infrastructure (configuración EF de stacks como owned collection, repositorio con filtro `stack` y consultas de stats/leads, seeder extendido con catálogo de stacks), WebApi (endpoints y ejemplos Swagger).
- `backend/tests`: tests de `PersonStack`/rol, `ReplacePersonStacks`, stats, filtro `stack`, y actualización de factories.
- `backend/ENDPOINTS.md` (semáforo Personas hacia 🟢). `backend/oas.json` no cambia.
- Supuestos anotados: `/people/{id}/expertise-line` devuelve nulos hasta el módulo de líneas; el catálogo de stacks vive en el seeder (lista del chapter, igual al mock) hasta tener administración propia; sin migraciones (InMemory).
