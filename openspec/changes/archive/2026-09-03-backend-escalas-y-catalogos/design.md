# Diseño — Backend: escalas y catálogos

## Context

Ver proposal.md — Why. Estado actual del .NET: `Seniority` (record VO, `Min=1`/`Max=4`, `Label` Principiante…Experto) usado en `Person`, `PersonDto` (`int Seniority` + `SeniorityLabel`), requests/validadores de Create/Update, `PersonConfiguration` (converter a int), `PersonRepository` (filtro `seniorities: int[]`), `PeopleEndpoints` (`GET /catalogs/seniorities` enumera 1–4) y tests (`SeniorityTests`, `PersonTests`, use cases, `AllocationUseCaseTests`). Tests con xUnit. Sin migraciones EF en el repo ni base productiva. El contrato objetivo está en `backend/oas.json` (esquemas `Level`, `Seniority`, `PersonDto`, `LevelOption`, `SeniorityOption`) y la guía en `backend/ENDPOINTS.md`.

## Goals / Non-Goals

**Goals**
- Dos escalas separadas en el dominio y en el contrato servido: `Level` (1–4) y `Seniority` (J/I/S), ambas campos propios de `Person`.
- `/catalogs/levels` y `/catalogs/seniorities` como los define el oas; filtros `level` y `seniority` en `GET /people`.
- Compilación y suite .NET verdes; semáforo actualizado.

**Non-Goals**
- No se agregan al DTO los campos que siguen pendientes (role ya existe; stacks, utilization, technicalLead, stats quedan para el siguiente ajuste).
- No se tocan Allocations/Squads/Initiatives más allá de lo que el rename arrastre por compilación.
- No se cambia oas.json ni el frontend.

## Decisions

1. **Rename mecánico primero, semántica después**: renombrar archivo y tipo `Seniority`→`Level` (valores y etiquetas intactos) y dejar que el compilador arrastre Person, DTOs, mappings, use cases, repositorio, configuración y tests; recién entonces crear el `Seniority` nuevo. Evita el estado ambiguo de dos tipos con el mismo nombre en ramas del refactor.
2. **`Seniority` nuevo como record VO con slugs en inglés y etiqueta en español** (`Junior`/`Intermediate`/`Senior` → Junior/Intermedio/Senior), espejo del contrato TS. `From(string)` valida contra el catálogo cerrado; persistencia como string (converter), igual que `Modality`.
3. **`Person.Seniority` obligatorio en el constructor** (los dos campos son propios y editables — decisión ya tomada en el cambio del frontend). Para datos previos sin columna, la regla de derivación 1–2→Junior, 3→Intermedio, 4→Senior queda documentada en la guía; no se escribe migración porque no hay base que migrar.
4. **Catálogos**: `GET /catalogs/levels` enumera `Level.Min..Max` con `{value, label}`; `GET /catalogs/seniorities` enumera el VO nuevo con `{value, label}` (value = slug). Formas exactas de `LevelOption`/`SeniorityOption` del oas.
5. **Filtros**: el binding actual de `seniority` (ints) pasa a la clave `level`; se agrega `seniority` (strings validados contra el VO). Claves repetidas sin corchetes, como bindea ASP.NET.
6. **Validadores**: level 1–4 (mensaje en español como los existentes); seniority requerido y del catálogo.
7. **Persistencia en memoria como tercera estrategia**: `PersistenceProvider.InMemory` + `InMemoryPersistenceStrategy` (`UseInMemoryDatabase("GestionCapacidad")`), resuelta por la `PersistenceStrategyFactory` existente — cero cambios en el patrón. Development la usa por defecto (`appsettings.Development.json`). Alternativa descartada: SQLite in-memory — más fiel a SQL pero exige mantener la conexión viva y no aporta nada mientras no haya SQL real que validar.
8. **Semillas code-first en un `DevelopmentDataSeeder`** (Infrastructure), invocado al arrancar sólo cuando el provider es InMemory y la base está vacía: crea el esquema con `EnsureCreated()` (code-first puro, sin migraciones) y siembra personas espejo de las del mock del frontend (mismos nombres, cargos, niveles, modalidades y FTE; `Seniority` derivado 1–2→Junior, 3→Intermedio, 4→Senior) para que la API responda datos familiares desde el primer `dotnet run`. Las semillas viven en código (no `HasData`): `HasData` ata los datos al modelo y ensucia futuras migraciones reales.
9. **Semáforo tras el cambio**: `GET /catalogs/levels` y `GET /catalogs/seniorities` → 🟢; `GET/POST /people` y `PUT /people/{id}` siguen 🟡 con nota reducida (faltan stacks/utilization/technicalLead y los filtros ya no son la brecha).

## Risks / Trade-offs

- **Rename amplio en .NET**: mitigado por el compilador y la suite; el riesgo real es dejar textos viejos ("seniority" refiriéndose a la escala de 4) en mensajes o Swagger — barrido final con grep.
- `AllocationUseCaseTests` y otros consumidores del VO se arrastran por compilación; si algún flujo asumía "seniority" numérico en un contrato público ya desalineado, este cambio lo rompe a propósito (pre-productivo).

## Migration Plan

Sin datos que migrar. Orden del apply: Domain → Application → Infrastructure → WebApi → tests → `dotnet build` + `dotnet test` → grep de barrido → semáforo en ENDPOINTS.md.

## Open Questions

(ninguna)
