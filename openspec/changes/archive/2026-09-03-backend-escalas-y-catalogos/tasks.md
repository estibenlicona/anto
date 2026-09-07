# Tasks — Backend: escalas y catálogos

## 1. Domain

- [x] 1.1 Renombrar el value object `Seniority` → `Level` (archivo, tipo, `Min`/`Max`, etiquetas intactas) y arrastrar por compilación `Person` (propiedad `Level`), eventos y todo consumidor. Verificar: `dotnet build` verde con el rename solo.
- [x] 1.2 Crear el value object `Seniority` nuevo (`Junior`/`Intermediate`/`Senior`; `Label` Junior/Intermedio/Senior; `From(string)` valida el catálogo cerrado; `ValidValues`). Verificar con tests del VO.
- [x] 1.3 `Person`: agregar `Seniority` como propiedad obligatoria del constructor y editable en `Update`, junto a `Level`. Verificar con `PersonTests`.

## 2. Application

- [x] 2.1 `PersonDto`: `Level`/`LevelLabel` + `Seniority`/`SeniorityLabel`; `PersonMappings` al día. Verificar: build.
- [x] 2.2 Requests y validadores de Create/Update: ambos campos, level 1–4 y seniority del catálogo, mensajes en español como los existentes; use cases construyen/actualizan con los dos. Verificar con tests de use cases.

## 3. Infrastructure

- [x] 3.1 `PersonConfiguration`: converter `Level`↔int (renombrado) + columna `Seniority` string con su converter (como `Modality`). Verificar: build y arranque del contexto en tests.
- [x] 3.2 `PersonRepository`: filtro `levels` (ints 1–4, antes `seniorities`) + filtro nuevo `seniorities` (slugs válidos); `IPersonRepository` al día. Verificar con tests del repositorio/lista si existen, o de use case de listado.

## 3b. Base en memoria y semillas (code-first)

- [x] 3.3 Estrategia `InMemory`: valor nuevo en `PersistenceProvider`, `InMemoryPersistenceStrategy` (`UseInMemoryDatabase`), registro en DI y paquete `Microsoft.EntityFrameworkCore.InMemory` en `Directory.Packages.props` + csproj. Verificar: la API arranca con `Persistence:Provider=InMemory` sin SQL ni Mongo.
- [x] 3.4 `DevelopmentDataSeeder`: con provider InMemory y base vacía, `EnsureCreated()` + siembra de personas espejo del mock (nombres, cargos, `Level`, `Seniority` derivado, modalidad, FTE, costo, ingreso) y lo mínimo que sus entidades exijan. `appsettings.Development.json` con `Provider: InMemory`. Verificar: `GET /people` responde las semillas tras `dotnet run`.

## 4. WebApi

- [x] 4.1 `PeopleEndpoints`: `GET /catalogs/levels` (Level.Min..Max → `{value,label}`) y `GET /catalogs/seniorities` sirviendo el VO nuevo (`{value: slug, label}`); binding de `level` y `seniority` en `GET /people` como claves repetidas. Verificar con tests de endpoints si existen; si no, con `dotnet run` + curl manual anotado.
- [x] 4.2 Ejemplos de Swagger (`PeopleExamples`) y cualquier texto que llame "seniority" a la escala de 4. Verificar: `grep -ri seniority backend/src` sólo encuentra el concepto J/I/S (o el VO nuevo).

## 5. Tests y cierre

- [x] 5.1 `SeniorityTests` → `LevelTests`; tests nuevos del `Seniority` (valores, labels, From inválido); `PersonTests`, `CreatePersonUseCaseTests`, `UpdatePersonUseCaseTests`, `AllocationUseCaseTests` con los dos campos. Verificar: `dotnet test` verde.
- [x] 5.2 Puerta: `dotnet build` + `dotnet test` verdes; arranque manual con InMemory verificando `GET /people`, `/catalogs/levels` y `/catalogs/seniorities`; barrido `grep`; actualizar el semáforo de `backend/ENDPOINTS.md` (catálogos 🟢; notas de `/people` reducidas) y verificar que `backend/tools/contract-coverage.mjs` sigue 88/88 (el oas no cambió). Verificar: todo verde.
