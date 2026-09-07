# Tasks

## 1. Domain

- [x] 1.1 `ExternalServiceUnavailableException` en `Domain.Exceptions`, mismo patrón que `ConflictException`/`BadRequestException` (`sealed class ... : DomainException`).
- [x] 1.2 `ErrorHandlerMiddleware` mapea `ExternalServiceUnavailableException` → 502 (`StatusCodes.Status502BadGateway`, título "Bad gateway"). Verificar con test: lanzar la excepción desde un endpoint de prueba devuelve 502 con el mensaje.

## 2. Application — cliente y DTOs crudos

- [x] 2.1 `IAzureDevOpsClient` en `Application/ExternalServices/AzureDevOps`: `SearchUserByEmailAsync(string email, CancellationToken)` → `DevOpsUserSearchResultDto?` (null si Azure DevOps no tiene coincidencia); `GetCollaboratorSyncDataAsync(string devOpsUserId, DateOnly sprintStart, DateOnly sprintEnd, CancellationToken)` → `AzureDevOpsSyncDataDto`.
- [x] 2.2 DTOs crudos: `DevOpsUserSearchResultDto` (id/displayName/email/avatarUrl/projects/teams/boards — mismo shape que `DevOpsUserDto` del contrato), `AzureDevOpsSyncDataDto` (lista de `RawWorkItemDto`: id/número/título/épica id+título/puntos/estado/tablero/url/marca/fecha de adición al sprint/transiciones `(DateTime, string)`; lista de `RawActivityDayDto`: fecha/commits/releases/features).

## 3. Application — calculadora pura

- [x] 3.1 `SprintSnapshotSyncCalculator.Compute(AzureDevOpsSyncDataDto raw, DateOnly sprintStart)` → `SprintSnapshotSyncResult` (CommittedAtStartPoints, AddedDuringSprintPoints, Wip, IReadOnlyList<ConcurrentInitiativeSnapshot>, IReadOnlyList<WorkItemSnapshot>, IReadOnlyList<ActivityDaySnapshot>). Sin I/O, estático o instanciable sin dependencias — mismo estilo que `CapacityCalculator`.
- [x] 3.2 Reconstrucción de `wip`: por cada work item con transiciones, generar eventos +1/-1 al entrar/salir de un estado "activo" (no `New`/`Done`/`Removed`, sin importar mayúsculas), acumular sobre la línea de tiempo del sprint y tomar el máximo; `null` sólo si ningún work item aportó transiciones utilizables.
- [x] 3.3 Comprometidos al inicio vs. agregados durante, por `AddedAt <= sprintStart`. Iniciativas concurrentes por agrupación de épica sumando puntos. `WorkItemSnapshot`/`ActivityDaySnapshot` mapeados 1:1 desde los DTOs crudos.
- [x] 3.4 `SprintSnapshotSyncCalculatorTests`: wip con una sola historia activa todo el sprint (1), con dos historias solapadas (2), con una sin transiciones entre dos que sí las tienen (no invalida el resto), sin ninguna transición en ningún work item (`null`); comprometido al inicio vs. agregado durante partido correctamente por fecha; dos work items de la misma épica se agrupan en una sola iniciativa concurrente sumando puntos.

## 4. Application — use cases

- [x] 4.1 `SearchDevOpsUserUseCase(email)`: `BadRequestException` si `email` viene vacío; llama al cliente, `NotFoundException` si devuelve `null`, envuelve fallas de transporte en `ExternalServiceUnavailableException`. Devuelve `DevOpsUserDto`.
- [x] 4.2 `SyncCollaboratorUseCase(personId)`: `NotFoundException` si la persona no existe; `BadRequestException` si no tiene `DevOpsUserId` vinculado o si no hay sprint vigente; si el snapshot del sprint vigente ya está sellado, no aplica cambios y devuelve igual `lastSyncedAt` de ahora; si no, llama al cliente (envolviendo fallas en `ExternalServiceUnavailableException`), reduce con la calculadora, hace upsert del `SprintSnapshot` (crea si no existe) con `SetExecution`/`ReplaceInitiatives`/`ReplaceWorkItems`/`ReplaceActivity`, persiste y devuelve `SyncResultDto`.
- [x] 4.3 `SyncAllCollaboratorsUseCase()`: filtra personas con `DevOpsUserId` no nulo sobre `IPersonRepository.GetAllAsync`; ejecuta la sincronización de cada una (reutilizando la lógica de 4.2 factorizada en un método compartido); si N > 0 y todas fallan por transporte, propaga `ExternalServiceUnavailableException`; si al menos una tuvo éxito, responde igual con `lastSyncedAt` de ahora. Lista vacía (nadie vinculado) también responde 200.
- [x] 4.4 Tests de use case (mocks de `IAzureDevOpsClient`/`IPersonRepository`/`ISprintRepository`/`ISprintSnapshotRepository`): persona inexistente → 404; sin identidad vinculada → 400; sin sprint vigente → 400; snapshot ya sellado → no lo modifica y responde igual; cliente lanza excepción de transporte → `ExternalServiceUnavailableException`; sincronización exitosa crea el snapshot si no existía y lo actualiza si sí; `syncAll` con lista vacía responde 200; `syncAll` con una falla y una exitosa responde 200 (no propaga la excepción).

## 5. Infrastructure — cliente y autenticación

- [x] 5.1 `AzureDevOpsOptions` (BaseAddress, TimeoutSeconds, Pat [sólo dev], Scope [prod, default `499b84ac-1321-427f-aa17-267ca6975798/.default`]).
- [x] 5.2 `AzureDevOpsPatAuthHandler : DelegatingHandler` — agrega `Authorization: Basic base64(:{Pat})` a cada request.
- [x] 5.3 `AzureDevOpsFederatedAuthHandler : DelegatingHandler` — pide token a `DefaultAzureCredential` para el `Scope` configurado (con cache/expiración, mismo criterio que `ManagedIdentityTokenProvider`) y agrega `Authorization: Bearer {token}`.
- [x] 5.4 `AzureDevOpsClient : IAzureDevOpsClient` — HttpClient tipado; `SearchUserByEmailAsync` captura 404 → `null` (mismo patrón que `CompanyRegistryClient.GetCompanyAsync`); cualquier otra falla de transporte se envuelve en `ExternalServiceUnavailableException`.
- [x] 5.5 `AddInfrastructure` gana parámetro `bool isDevelopment`; registra `IAzureDevOpsClient` con `AddHttpClient<IAzureDevOpsClient, AzureDevOpsClient>` + el handler correspondiente según `isDevelopment` (no pasa por `AddRestClient<T>` genérico — ver design.md, decisión 9). `Program.cs` pasa `builder.Environment.IsDevelopment()`.
- [x] 5.6 `appsettings.json`: sección `HttpClients:AzureDevOps` (`BaseAddress` vacío, `Auth.Scope` con el resource id de Azure DevOps). `appsettings.Development.json`: `BaseAddress` de ejemplo (`https://example.com/azure-devops/`), `Auth.Pat` vacío (nunca un secreto real versionado — se completa por User Secrets si alguien prueba contra una organización real).

## 6. WebApi

- [x] 6.1 `PersonDetailEndpoints`: `GET /people/devops/users?email=` (ruta exacta del contrato: `GET /devops/users`, revisar el grupo de rutas correcto) → `SearchDevOpsUserUseCase`; `Produces<DevOpsUserDto>(200)`, `Produces(400)`, `Produces(404)`.
- [x] 6.2 `DedicationEndpoints`: `POST /dedication/collaborators/{personId}/sync` → `SyncCollaboratorUseCase`; `POST /dedication/collaborators/sync` → `SyncAllCollaboratorsUseCase`. Ambos `Produces<SyncResultDto>(200)`, `Produces(400/404 según aplique)`, `Produces(502)`.
- [x] 6.3 Ejemplos Swagger: `DevOpsUserDtoExample` (si no existe ya de un módulo anterior), `SyncResultDtoExample`.

## 7. Verificación y cierre

- [x] 7.1 `dotnet build` y `dotnet test` completos sin errores.
- [x] 7.2 Smoke test contra Postgres local: `POST /dedication/collaborators/sync` sin ninguna persona con identidad vinculada responde 200 con `lastSyncedAt`; vincular una identidad de prueba y volver a llamar produce el 502 esperado (BaseAddress de ejemplo no resuelve) en vez de un 500 genérico — confirma el mapeo de `ExternalServiceUnavailableException`.
- [x] 7.3 `backend/ENDPOINTS.md`: las tres filas restantes a 🟢 (Detalle de persona: `GET /devops/users`; Capacidad: los dos `.../sync`), total del resumen actualizado a 88/89 (queda sólo la 🟡 heredada de Personas, fuera de alcance).
