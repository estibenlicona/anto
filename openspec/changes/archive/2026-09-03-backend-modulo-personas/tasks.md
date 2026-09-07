# Tareas — Backend: módulo Personas completo

## 1. Domain

- [x] 1.1 Crear `ValueObjects/PersonRole.cs` (VO estilo `Seniority`: slug + label — Administrator/Administrador, TechnicalLead/Líder Técnico, ExpertiseLead/Líder de Expertise, ProductOwner/Product Owner, Contributor/Contribuidor; `ValidValues`, `From(string)` con DomainException listando los válidos).
- [x] 1.2 Crear `Entities/PersonStack.cs` (owned: `Name` ≤100, `Level` (VO), `IsPrimary`; constructor valida nombre no vacío).
- [x] 1.3 `Person`: cambiar `Role` de string libre a `PersonRole`; agregar `TechnicalLeadId: Guid?` con `AssignTechnicalLead(Guid?)` (rechaza auto-referencia) y `_stacks` con `ReplaceStacks(IReadOnlyCollection<PersonStack>)` que valide nombres únicos y exactamente un principal cuando la lista no está vacía; actualizar constructor/UpdateProfile.
- [x] 1.4 Tests de dominio: `PersonRoleTests`, `PersonStackTests`, `PersonTests` (ReplaceStacks: duplicados, sin principal, dos principales, lista vacía ok; AssignTechnicalLead auto-referencia).

## 2. Application

- [x] 2.1 `PersonDto`: agregar `Role`/`RoleLabel`, `TechnicalLeadId`, `TechnicalLeadName`, `TechnicalLeadOfCount`, `Utilization`, `Stacks: IReadOnlyCollection<PersonStackDto>`; crear `PersonStackDto` y actualizar `PersonMappings` (recibe diccionarios de nombres/conteos y utilization).
- [x] 2.2 `CreatePersonRequest`/`UpdatePersonRequest`: `Role` validado contra `PersonRole.ValidValues`, `TechnicalLeadId` opcional (existe y ≠ id propio); actualizar use cases Create/Update y validadores.
- [x] 2.3 Use case `GetPeopleStats` (`PeopleStatsDto` según oas: activeCount, fteAvailable, fteTarget=12, bySeniority siempre con J/I/S, sample 5 por nombre, stackCoverage distinct + at-risk).
- [x] 2.4 Use case `ReplacePersonStacks` (`ReplaceStacksRequest`; 404 persona; 400: stack fuera de catálogo, >1 principal, sin principal — mensajes como el mock).
- [x] 2.5 Use cases `GetTechnicalLeads` (personas con rol TechnicalLead → `TechnicalLeadOption {id,name,count}`) y `GetStackCatalog` (catálogo → `string[]`).
- [x] 2.6 `GetPeople`/`GetPersonById`: filtro `stack` (nombre exacto, multivalor), y componer utilization (Σ dedicación de allocations) + technicalLeadName/OfCount al mapear.
- [x] 2.7 Tests de application: stats, replace stacks (los tres 400), technical-leads, filtro stack; actualizar `TestDataFactory` (rol slug válido, stacks).

## 3. Infrastructure

- [x] 3.1 `PersonConfiguration`: converter para `PersonRole` (string ≤30), `TechnicalLeadId`, `OwnsMany` de stacks (tabla `PersonStacks`, level como int).
- [x] 3.2 `IPersonRepository`/`PersonRepository`: filtro `stacks` en `GetPagedAsync`, `GetAllAsync` para stats/leads, consulta de conteos de líderes; `IStackCatalogRepository` simple (o provider estático en Infrastructure) con la lista del chapter.
- [x] 3.3 `DevelopmentDataSeeder`: roles por nombre (`ROLE_BY_NAME` del mock), stacks por persona (`STACK_SEEDS`, principal primero), líderes técnicos (`TECHNICAL_LEAD_BY_NAME`: Carlos Ramírez y Tomás Herrera), catálogo de stacks (= `STACK_CATALOG`).

## 4. WebApi

- [x] 4.1 `PeopleEndpoints`: binding `stack` (string[]) en GET /people; nuevos `GET /people/stats`, `GET /people/stacks`, `PUT /people/{id}/stacks`, `GET /people/technical-leads`, `GET /people/{id}/expertise-line` (stub `{id:null,name:null}` + comentario del supuesto).
- [x] 4.2 Catálogos: `GET /catalogs/roles` desde `PersonRole.ValidValues`.
- [x] 4.3 Ejemplos Swagger actualizados (PersonDto completo, stats, replace stacks).

## 5. Verificación

- [x] 5.1 `dotnet build` + `dotnet test` en verde (solo las 9 fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 5.2 Smoke con InMemory (`curl -sk https://localhost:51686/api/v1/...`): people con stacks/utilization/lead, stats, stacks catálogo, PUT stacks (200 y los tres 400), technical-leads, catalogs/roles, expertise-line nulo.
- [x] 5.3 `node backend/tools/contract-coverage.mjs` sigue 88/88; actualizar semáforo de Personas en `backend/ENDPOINTS.md` (🟢 los implementados, 🟡 expertise-line con nota del stub).
