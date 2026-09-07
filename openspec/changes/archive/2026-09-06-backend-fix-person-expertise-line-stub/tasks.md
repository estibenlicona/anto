# Tasks

## 1. Application

- [x] 1.1 `GetPersonExpertiseLineUseCase(personId)`: `NotFoundException` si la persona no existe; `id`/`name` nulos si `ExpertiseLineId` es nulo; si no, resuelve `IExpertiseLineRepository.GetByIdAsync` y devuelve su `Id`/`Name`. Registro en DI.
- [x] 1.2 Tests: persona inexistente → 404; persona sin línea → `{id:null,name:null}`; persona con línea → `{id,name}` correctos.

## 2. WebApi

- [x] 2.1 `PeopleEndpoints.GetExpertiseLineAsync` llama al use case en vez de devolver el stub estático; quitar el comentario de "stub mientras no existe el módulo".

## 3. Verificación y cierre

- [x] 3.1 `dotnet build` y `dotnet test` sin errores.
- [x] 3.2 Smoke test contra Postgres local: una persona sembrada con línea de expertise responde `{id,name}` reales; una sin línea responde nulos; un id inexistente responde 404.
- [x] 3.3 `backend/ENDPOINTS.md`: fila de Personas a 🟢; total 88/88.
