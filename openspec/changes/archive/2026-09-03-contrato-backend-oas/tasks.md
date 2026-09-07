# Tasks — Contrato del backend (oas.json + guía)

## 1. Inventario y esqueleto

- [x] 1.1 Script de inventario (`backend/tools/contract-inventory.mjs`): recorre `frontend/src/features/*/services/*.ts` y `frontend/src/mocks/handlers/*.handlers.ts`, resuelve constantes de URL y emite el listado método+ruta+módulo (excluyendo el simulador de auth). Verificar: emite los 88 endpoints conocidos.
- [x] 1.2 Esqueleto de `backend/oas.json` (OpenAPI 3.0.3): `info`, `servers` con `/api/v1`, `tags` por módulo, convención de errores (`ErrorResponse {message}`) y sobre genérico de paginación. Verificar: valida como OpenAPI.

## 2. Esquemas y paths por módulo (fuente: tipos TS + handlers + specs)

- [x] 2.1 Personas y catálogos: `/people` (CRUD, filtros `search`/`level`/`seniority`/`stack`), `/people/stats`, `/people/technical-leads`, `/people/stacks`, `/people/:id/stacks`, `/people/:id/provider/:providerId`, `/people/:id/expertise-line`, `/catalogs/{levels,seniorities,modalities,roles}`, `/companies`. Esquemas `PersonDto`, `PeopleStats`, opciones de catálogo. Verificar contra `personService.ts` y `people.handlers.ts`.
- [x] 2.2 Detalle de persona y DevOps: `/people/:id/detail`, `/devops/users`, `/people/:id/devops-identity` (409 con el dueño actual). Esquemas `PersonDetailDto`, `DevOpsIdentityDto`, `CurrentSprintDto`. Verificar contra `personDetailService.ts`.
- [x] 2.3 Células y asignaciones: `/squads` (CRUD + `/stats` + `/:id/team-stats`), `/criticalities`, `/squads/:squadId/allocations`, `/allocations/:id` (unicidad de asignación por persona, 400 de mezcla BAU/Transformación). Verificar contra `squadService.ts`/`allocationService.ts`.
- [x] 2.4 Iniciativas: CRUD, `/initiatives/{stats,evaluation-model}`, `/:id/{status,evaluation}` y catálogos que consuma el front. Verificar contra `initiativeService`.
- [x] 2.5 Ausencias: `GET/POST /absences`, `PUT /absences/:id/status` (medios días, rechazo con motivo). Verificar contra `absenceService`.
- [x] 2.6 Líneas de expertise: CRUD + `people`, `/:id/{lead,people,archive,reactivate}`, `/expertise-lines/people` (roster). Verificar contra `expertiseLinesService.ts`.
- [x] 2.7 Competencias: `/skills-catalog` (habilidades, criterios por nivel, expectativas por cargo, activar/retirar), `/people/:personId/assessment` (abrir, calificar habilidad, cerrar), `/career-plan/{span,span/summary,people/:id/plan,acciones}`. Esquemas `SkillDto`, `AssessmentDto`, `PersonPlanDto`, `SpanMatrixDto`. Verificar contra los tres servicios.
- [x] 2.8 Capacidad (dedicación): `/dedication/collaborators` (+`/:personId`, `/sync`, `/:personId/sync`) con `BalanceSignalDto`, evidencias y umbrales, `SprintRefDto`, capacidad FTE/horas, tendencia y actividad. Verificar contra `dedicationService.ts` (el DTO más grande del sistema).
- [x] 2.9 Prefacturación: `/billing` (listado, detalle, `generate`, `prefacture`, `prefactured`, `status`, `adjustment` PUT/DELETE). Verificar contra `billingService`.
- [x] 2.10 Torre de control y Admin: `/chapter/capacity-overview`, `/admin/{sprint-config,talla-bands,capability-mix,question-pool}` (GET/PUT con validaciones de rango). Verificar contra sus servicios.

## 3. Validación del contrato

- [x] 3.1 Validar `backend/oas.json` con un validador OpenAPI (`npx @redocly/cli lint` o `swagger-cli validate`). Verificar: sin errores.
- [x] 3.2 Script de cobertura (`backend/tools/contract-coverage.mjs`): cruza el inventario 1.1 contra los `paths` del oas; falla si un endpoint consumido falta o si el contrato declara rutas sin consumidor (excepciones anotadas). Verificar: cobertura 88/88.

## 4. Guía de endpoints y lógica

- [x] 4.1 `backend/ENDPOINTS.md`: introducción (fuente de verdad, servers, convención de errores, seguridad transversal por claims y scope por chapter, decisión levels/seniorities) + tabla resumen por módulo con el semáforo. Verificar: los 88 aparecen una vez.
- [x] 4.2 Secciones por módulo: por endpoint, esquemas del oas, reglas de negocio aterrizadas (6 evidencias y umbrales del balance, mediana sobre sprints sellados, horas derivadas de días y ausencias, brecha nivel esperado−evaluado y acciones, generación/ajuste de prefacturas, validaciones y errores 400/404/409) con enlace al requirement de `openspec/specs` que las gobierna. Verificar: cada regla enlaza una spec existente.
- [x] 4.3 Semáforo real contra `backend/src`: marcar Implementado/Desalineado/Pendiente revisando endpoints .NET existentes; anotar las desalineaciones exactas (`sfia-levels`, enum Seniority de 5, `requiredSfia`, formas de allocations/initiatives). Verificar con `grep` sobre `backend/src`.

## 5. Cierre

- [x] 5.1 Puerta: validador OpenAPI sin errores, cobertura 88/88, `openspec validate contrato-backend-oas` válido; el frontend no cambió (`git status` limpio en `frontend/`). Verificar: todo verde.
