# Contrato del backend: oas.json completo y guía de endpoints

## Why

El frontend consume hoy **88 endpoints** en 16 módulos, todos definidos por los mocks (MSW) y los tipos TypeScript de los servicios. El backend real (`backend/`, .NET `GestionCapacidad`) implementa ~24 paths con formas que ya divergieron del front: sirve `sfia-levels` y un `Seniority` de 5 valores, no conoce Capacidad (dedicación por sprint), Competencias (catálogo, evaluaciones, planes), Ausencias, Líneas de expertise, Prefacturación, la Torre de control ni los parámetros de Admin. Para empezar a implementar el backend sin depender del mock hace falta **fijar el contrato**: un `oas.json` que cubra todo lo que el front consume, y un documento que enumere endpoint por endpoint la lógica que el backend debe implementar.

## What Changes

- **`backend/oas.json` se regenera como el contrato objetivo completo** (OpenAPI 3), con la fuente de verdad en los tipos TS de `frontend/src/features/*/services` y el comportamiento de los handlers de `frontend/src/mocks/handlers`: los ~88 endpoints con sus esquemas de request/response, errores y query params (paginación, filtros `level`/`seniority`/`stack`, sobres `PagedResult`). El oas.json actual queda reemplazado (la versión vieja vive en git).
- **Nace `backend/ENDPOINTS.md`**: el inventario por módulo con, para cada endpoint, método y ruta, DTOs, reglas de negocio que el mock ya encapsula (señales de balance y sus 6 evidencias con umbrales, capacidad en FTE/horas desde los días del sprint, brechas y planes de desarrollo, generación de prefacturas, scope por chapter del Líder de Expertise, catálogos `levels`/`seniorities`) y su **estado** frente al backend actual: Implementado / Desalineado / Pendiente.
- Decisiones de contrato que el documento fija: catálogo `levels` (escala Tuya de 4) + `seniorities` (`Junior`/`Intermediate`/`Senior`) — `sfia-levels` desaparece y el enum de 5 valores del Domain actual queda anotado como desalineación a corregir; paths sin prefijo con `servers: /api/v1`; autenticación/scope fuera del cuerpo (claims del gateway) documentada como regla transversal.
- No se toca código del backend ni del frontend: este cambio produce contrato y documentación.

## Capabilities

### New Capabilities

- `backend-contract`: el contrato OpenAPI del backend y su documento de endpoints/lógica se mantienen alineados con lo que el frontend consume.

### Modified Capabilities

(ninguna — `api-mocking` no cambia: los mocks ya son la referencia)

## Impact

- `backend/oas.json` (reemplazado) y `backend/ENDPOINTS.md` (nuevo). Nada más.
- Insumos: `frontend/src/features/*/services/*.ts` (DTOs y URLs), `frontend/src/mocks/handlers/*` (validaciones, errores, semántica), `openspec/specs/*` (reglas ya especificadas) y `backend/src` (estado actual para el semáforo).
- Supuestos anotados: el simulador de auth (`GET/POST /` de `auth.handlers`) no es parte del contrato; `GET /devops/users` y la vinculación de identidad sí lo son (los sirve el backend contra Azure DevOps).
