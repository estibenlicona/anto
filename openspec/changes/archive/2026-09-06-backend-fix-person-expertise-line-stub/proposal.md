# Resolver GET /people/{id}/expertise-line contra el módulo real

## Por qué

Última fila 🟡 del backend: `GET /people/{id}/expertise-line` responde hoy un stub fijo `{id:null,name:null}` porque, cuando Personas se construyó, Líneas de expertise todavía no existía. Ese módulo ya está implementado y archivado (`backend-modulo-lineas-expertise`, con su corrección `backend-fix-expertise-line-membership` que le dio a `Person` su propio `ExpertiseLineId`), así que la pregunta ya tiene con qué resolverse de verdad. Con este cambio, el semáforo del backend queda en 88/88 filas 🟢.

## Qué cambia

- `GetPersonExpertiseLineUseCase`: busca la persona (404 si no existe); si `Person.ExpertiseLineId` es nulo, responde `{id:null,name:null}` (la respuesta honesta ya vigente); si no, resuelve el nombre contra `IExpertiseLineRepository.GetByIdAsync` y responde `{id, name}`.
- `PeopleEndpoints.GetExpertiseLineAsync` deja de ser un stub estático y pasa a llamar al use case.
- `backend/ENDPOINTS.md`: la fila de Personas pasa de 🟡 a 🟢; total 88/88.

## Fuera de alcance

- Cualquier otro campo de `PersonDetailDto`/`PersonDto` — este cambio toca únicamente esta ruta.
- Scope por chapter en esta lectura (pendiente transversal, ya anotado en otros módulos).

## Impacto

- `backend/src`: Application (`GetPersonExpertiseLineUseCase`, registro en DI), WebApi (`PeopleEndpoints`).
- `backend/ENDPOINTS.md`: una fila y el resumen.
- Sin migración: no hay cambios de esquema.
