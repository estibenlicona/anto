# Diseño — Contrato del backend (oas.json + guía)

## Context

Ver proposal.md — Why. Inventario congelado en esta propuesta: **88 endpoints** (sin el simulador de auth) en 16 archivos de handlers; el backend .NET implementa ~24 paths bajo `/api/v1` con el dominio viejo (allocations, bau-tasks, companies, initiatives, people, squads, catálogos con `sfia-levels`). La fuente de verdad de formas y semántica es el frontend: `services/*.ts` (DTOs, URLs, serialización de filtros con clave repetida sin corchetes) y `mocks/handlers/*` (validaciones, códigos de error, reglas). Las reglas de negocio ya están especificadas en `openspec/specs` (real-dedication, people, squads, absences, career-plan, skill-assessment, skills-catalog, expertise-lines, provider-billing, control-tower, admin-shell, initiatives).

## Goals / Non-Goals

**Goals**
- Un `backend/oas.json` completo, válido y fiel a lo que el front consume — el contrato con el que se implementa el backend real.
- Un `backend/ENDPOINTS.md` implementable: rutas + esquemas + reglas + semáforo de estado.

**Non-Goals**
- No se implementa ningún endpoint ni se toca `backend/src`.
- No se cambia el frontend ni los mocks.
- No se modela seguridad por endpoint (claims del gateway, transversal).
- No se generan clientes ni tipos desde el OAS (posible cambio futuro).

## Decisions

1. **OAS escrito a mano (asistido por scripts de inventario), no generado del código**: no hay anotaciones en los mocks de las que derivarlo, y el .NET actual generaría el contrato viejo. Un script en el apply recorre `services/*.ts` y `mocks/handlers/*` para producir el inventario método+ruta y detectar sobres/paginación; los esquemas se transcriben de los tipos TS. Alternativa descartada: swagger del .NET — documentaría lo que hay, no lo que falta.
2. **Un solo archivo `backend/oas.json`, reemplazando el actual.** Los 24 paths viejos que siguen vigentes se conservan con su forma nueva; los que el front no consume (p. ej. `company-registry`, `bau-tasks` si nadie los llama) salen del contrato y se anotan en la guía como "existentes sin consumidor". El archivo viejo queda en el historial de git.
3. **Paths relativos + `servers: [{url: "…/api/v1"}]`**: la misma forma que usa el `httpClient` (baseURL con el prefijo). Los `operationId` en camelCase por módulo (`listPeople`, `getPersonDetail`, `syncCollaborator`).
4. **Esquemas con los nombres de los DTOs de TS** (`components.schemas.PersonDto`, `PagedResultOfPersonDto` como sobre genérico expandido por tipo, `BalanceSignalDto`, `CollaboratorDedicationDetailDto`, …): el vocabulario ya existe y el backend debe hablarlo. Enums como en TS (`Seniority: Junior|Intermediate|Senior`, `BalanceSignal`, `SnapshotStatus`, `Criticality`, `Modality`, `PersonRole`, `SkillLevel` 1–4).
5. **La guía documenta reglas por referencia + resumen**: cada módulo resume la lógica (umbrales de las 6 evidencias, mediana histórica sobre sprints sellados, derivación de horas de capacidad, brecha = nivel esperado − evaluado, unicidad de asignación, scope por chapter) y enlaza el requirement de `openspec/specs` que la gobierna — la guía no reescribe la spec, la aterriza a endpoints.
6. **Semáforo por comparación real contra `backend/src`**: Implementado (misma ruta y forma), Desalineado (existe con otra forma — se anota la diferencia exacta: `sfia-levels`, `Seniority` de 5, `requiredSfia`, rutas de allocations), Pendiente (no existe). El grueso quedará Pendiente; eso es información, no un problema.
7. **Validación**: `npx @redocly/cli lint backend/oas.json` (o `swagger-cli validate` si redocly no está disponible offline) + un script de cobertura que cruza el inventario del front contra los `paths` del oas (falla si falta o sobra algo).

## Risks / Trade-offs

- **El contrato queda acoplado al mock de hoy**: es deliberado — el mock es lo único que el front acepta. Cambios futuros del front deben tocar oas + guía (la capability nueva lo exige).
- **Deriva silenciosa**: sin CI que corra el script de cobertura, el oas puede quedar viejo; el script queda en el repo (`backend/tools/` o scratch reproducible en la guía) para correrlo a demanda.
- 88 endpoints con esquemas es volumen: se mitiga por módulos y reutilización de `components`.

## Migration Plan

Un solo apply de documentación. El backend real migra después, módulo por módulo, usando la guía; el front cambia de mock a real solo con `VITE_USE_MOCKS=false` y la baseURL.

## Open Questions

(ninguna — ubicación y decisiones de forma quedan registradas arriba como supuestos del cambio)
