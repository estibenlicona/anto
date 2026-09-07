# Diseño — Backend: módulo Personas completo

## Context

Ver proposal.md — Why. Estado tras `backend-escalas-y-catalogos`: `Person` con `Level` + `Seniority`, catálogos servidos, filtros `level`/`seniority`, InMemory + seeder con 18 personas. Falta lo listado en el semáforo de `backend/ENDPOINTS.md` (Personas: 2🟢 3🟡 5🔴). Las formas objetivo están en `backend/oas.json` (`PersonDto`, `PersonStackDto`, `PeopleStats`, `RoleOption`, `TechnicalLeadOption`, `ReplaceStacksRequest`) y la semántica en los mocks (`people.handlers.ts`) y en `openspec/specs/people/spec.md`.

## Goals / Non-Goals

**Goals**
- `GET /people` sirve el `PersonDto` completo del contrato (stacks, utilization, líder técnico, rol del catálogo) con los tres filtros.
- Los 5 endpoints 🔴 de Personas implementados; `/catalogs/roles` servido.
- Semillas fieles al mock (stacks, roles, líderes) para que el front real muestre lo mismo que con MSW.

**Non-Goals**
- Scope por chapter/claims (todo el listado es visible; queda para el ajuste de seguridad).
- `expertise-line` real (stub nulo documentado) y cualquier otro módulo.
- Migraciones SQL (InMemory; las EntityConfigurations quedan listas para generarlas después).

## Decisions

1. **`PersonStack` como owned collection de `Person`** (`OwnsMany`, tabla propia con FK), no entidad aparte: los stacks no tienen identidad fuera de la persona y se reemplazan en bloque — exactamente el contrato del sub-recurso. Invariantes en el agregado: nombres únicos, nivel con `Level`, exactamente un principal cuando la lista no está vacía (los mismos 400 del mock).
2. **`Role` validado con un catálogo estático `PersonRole`** (VO ligero como `Seniority`: slug + etiqueta en español) y `GET /catalogs/roles` servido de ahí. El campo persiste como string (sin migración de datos: los seeds ya escriben slugs válidos).
3. **`TechnicalLeadId` como `Guid?` sin navegación**: informativo; se valida que exista y no sea la propia persona. `technicalLeadName` y `technicalLeadOfCount` se resuelven en la consulta del listado (join en memoria en el repo), no se persisten.
4. **`utilization` derivada al responder**: Σ `dedicationPercentage` de las asignaciones vigentes de la persona (repo de allocations consultado desde el use case de listado/detalle). Sin asignaciones, 0; puede superar 100.
5. **Catálogo de stacks del chapter como semilla propia** (lista fija igual a `STACK_CATALOG` del mock) servida por `GET /people/stacks`; el `PUT` de stacks valida contra ella. Cuando exista administración de stacks, el catálogo migra a su propio agregado.
6. **`GetPeopleStats` calcula sobre el total en memoria del repositorio** (sin paginar): activeCount, fteAvailable, fteTarget (12 asumido como el mock), bySeniority (los 3 escalones siempre presentes), sample (primeras 5 por nombre), stackCoverage (distintos y en riesgo = un solo dueño).
7. **Semillas espejo del mock**: stacks por nombre (principal primero), `ROLE_BY_NAME` (2 TechnicalLead, 4 ExpertiseLead, 1 ProductOwner, resto Contributor) y `TECHNICAL_LEAD_BY_NAME` (Carlos y Tomás como líderes), resueltos por nombre tras insertar.

## Risks / Trade-offs

- El join de utilization/leads en memoria no escala a miles de personas — irrelevante con InMemory y un chapter; cuando llegue SQL se reescribe como consulta.
- Validar `Role` contra catálogo es **BREAKING** para requests con roles libres ("Developer" de los tests actuales): se actualizan factories y ejemplos; pre-productivo.
- El stub de expertise-line puede olvidarse: queda 🟡 en el semáforo con nota explícita.

## Migration Plan

Sin datos que migrar. Orden: Domain (PersonStack, PersonRole, TechnicalLeadId) → Application (DTO/mappings/use cases/validadores) → Infrastructure (EF owned collection, repo, seeder) → WebApi (endpoints) → tests → smoke con curl → semáforo.

## Open Questions

(ninguna)
