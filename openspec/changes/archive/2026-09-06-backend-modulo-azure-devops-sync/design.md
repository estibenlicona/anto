# Design

## Contexto

Las reglas de contrato están en `backend/oas.json` (operaciones `searchDevOpsUser`, `syncCollaborator`, `syncAllCollaborators`) y `backend/ENDPOINTS.md`. El modelo que este cambio llena — `SprintSnapshot` y sus tres colecciones poseídas (`ConcurrentInitiativeSnapshot`, `WorkItemSnapshot`, `ActivityDaySnapshot`) — ya existe completo desde `backend-modulo-capacidad`; ese cambio documentó explícitamente que la sincronización real era "el segundo cambio" y dejó el agregado listo para no tener que rediseñarlo acá.

No hay ninguna organización de Azure DevOps real disponible para probar contra ella — mismo punto de partida que `CompanyRegistry`. El cliente se entrega con forma real (requests, mapeo de respuesta, manejo de error) contra un `BaseAddress` de ejemplo; su corrección se valida por los tests de la calculadora pura, no por una llamada real.

## Decisiones

1. **La lógica de negocio vive en una calculadora pura, no en el cliente HTTP.** `SprintSnapshotSyncCalculator.Compute(AzureDevOpsSyncDataDto raw, DateOnly sprintStart)` recibe los datos crudos ya traídos por `IAzureDevOpsClient` y devuelve un `SprintSnapshotSyncResult` (comprometidos al inicio/agregados durante, `wip`, iniciativas concurrentes, historias, actividad) — mismo patrón que `CapacityCalculator`/`BalanceSignalCalculator`/`LineCapacityCalculator`: determinista, sin I/O, con sus tests unitarios cubriendo cada regla. `AzureDevOpsClient` sólo trae datos crudos y traduce errores de transporte; nunca decide qué es "comprometido al inicio" ni cómo se cuenta `wip`.

2. **`IAzureDevOpsClient` trae datos crudos, no snapshots.** Dos métodos:
   ```csharp
   Task<DevOpsUserSearchResultDto?> SearchUserByEmailAsync(string email, CancellationToken ct);
   Task<AzureDevOpsSyncDataDto> GetCollaboratorSyncDataAsync(string devOpsUserId, DateOnly sprintStart, DateOnly sprintEnd, CancellationToken ct);
   ```
   `AzureDevOpsSyncDataDto` trae, por work item: id, número, título, épica (id/título si la tiene), puntos, estado, tablero, url, marca (iniciativa/BAU si el work item la trae como tag — nulo si no), fecha de creación/adición al sprint, y sus transiciones de estado (para reconstruir `wip`); y, por separado, la actividad de repos del rango (commits/releases/features por día). `SearchUserByEmailAsync` devuelve `null` en 404 (Azure DevOps sin coincidencia), igual que `CompanyRegistryClient.GetCompanyAsync`.

3. **Reconstrucción de `wip`: máximo de historias simultáneamente "En progreso" a lo largo del sprint, a partir de las transiciones de estado.** Cada work item trae su lista de transiciones `(DateTime At, string State)`; la calculadora arma una línea de tiempo de eventos (+1 al entrar a un estado "activo" — no `New`/`Done`/`Removed` —, -1 al salir) y toma el máximo acumulado dentro de `[sprintStart, sprintEnd]`. Si un work item no trae transiciones (el cliente no pudo traer su historial), se excluye del cálculo de `wip` sin invalidar el resto — mismo criterio que la semilla original: `wip` nulo sólo cuando *ningún* work item aporta transiciones utilizables, nunca por uno solo.

4. **Comprometidos al inicio vs. agregados durante, por fecha de adición del work item.** Un work item con fecha de entrada al sprint (`AddedAt`) anterior o igual al inicio del sprint suma a `CommittedAtStartPoints`; posterior, a `AddedDuringSprintPoints` — ya reflejado en el propio agregado como `AddedAfterSprintStart` de `WorkItemSnapshot`. `CompletedPoints`/`CarryOverPoints` **no** los llena esta sincronización: sólo tienen sentido una vez sellado (`SprintSnapshot.EnsureNotSealed`), y sellar sigue siendo un job fuera de alcance (decisión 3, `backend-modulo-capacidad`). La sincronización sólo actualiza snapshots `Provisional` — sobre uno `Sealed` no hay nada que hacer (ver decisión 6).

5. **Iniciativas concurrentes: agrupar los work items por épica.** Una entrada `ConcurrentInitiativeSnapshot` por cada épica distinta entre los work items traídos, sumando sus puntos; `InitiativeId`/`InitiativeName` viajan tal como los resolvió el cliente (nulos si la épica no estaba mapeada a una iniciativa) — mismo campo congelado que ya describe `ConcurrentInitiativeSnapshot`, sin tocar el catálogo vivo de iniciativas (decisión 8 de `backend-modulo-capacidad` sigue vigente).

6. **Sincronizar es upsert sobre el snapshot del sprint vigente, nunca sobre uno sellado.** `SyncCollaboratorUseCase` resuelve el sprint vigente (`ISprintRepository.GetAllAsync` + `Sprint.IsCurrent(today)`); si no hay sprint vigente, no hay qué sincronizar — mismo trato que "sin identidad" (ver decisión 7). Busca el `SprintSnapshot` de `(personId, currentSprint.Id)`; si no existe, lo crea (`new SprintSnapshot(personId, currentSprint.Id)`, nace `Provisional`); si existe y ya está `Sealed`, la sincronización no tiene nada que actualizar — no es un error (un sprint recién cerrado puede recibir una llamada de sincronización tardía), simplemente no aplica cambios y devuelve igual `lastSyncedAt` de ahora. Aplica el resultado con `SetExecution`/`ReplaceInitiatives`/`ReplaceWorkItems`/`ReplaceActivity`.

7. **Error "no sincronizable" documentado pero no en el contrato: persona sin identidad DevOps o sin sprint vigente.** `oas.json` sólo declara 404 (persona inexistente) y 502 (Azure DevOps caído) para `syncCollaborator`. Intentar sincronizar a alguien sin `DevOpsUserId` vinculado, o cuando no hay ningún sprint vigente en el calendario, es un estado del sistema que no tiene forma de resolverse llamando a Azure DevOps — mismo criterio que los 400 ya añadidos en módulos anteriores para transiciones de estado inválidas (cerrar una evaluación dos veces, sellar un snapshot dos veces). Se añade como `BadRequestException` → 400, con el mensaje explicando cuál de las dos condiciones falta.

8. **`syncAllCollaborators` nunca 404: filtra, no falla.** Trae todas las personas con `DevOpsUserId` no nulo (filtro en el use case sobre `IPersonRepository.GetAllAsync`, sin repositorio nuevo — mismo criterio de "no crear un método de consulta por cada necesidad puntual" que otros use cases de listado ya siguen) y sincroniza cada una; una lista vacía (nadie tiene identidad vinculada todavía) es un resultado válido con `lastSyncedAt` de todos modos. Si *todas* las llamadas a Azure DevOps fallan (0 de N sincronizados exitosamente y N > 0), se propaga 502 — si al menos una tuvo éxito, se responde 200 iguademente (una sincronización parcial es mejor que ninguna; los fallos individuales sólo se registran en logs, el contrato no tiene un campo para reportarlos por persona).

9. **Autenticación por ambiente, no por configuración — la única excepción a como todo el resto del backend maneja secretos.** Todo cliente externo anterior (`CompanyRegistry`) resuelve su comportamiento sólo por `appsettings.json` vs `appsettings.Development.json`, sin ninguna rama de código por ambiente. Azure DevOps es distinto: en producción, la identidad la resuelve `DefaultAzureCredential` contra las variables que la Identidad Federada de Workload de AKS inyecta al pod (`AZURE_CLIENT_ID`/`AZURE_TENANT_ID`/`AZURE_FEDERATED_TOKEN_FILE`) — no hay ningún secreto que poner en configuración. En local no existe ese pod, así que la única forma de probar el cliente es con un Personal Access Token real de una organización de prueba, vía User Secrets. Son dos *mecanismos* de autenticación distintos (Bearer con token de Entra ID vs. Basic con un PAT), no sólo dos valores de configuración del mismo mecanismo — por eso la rama vive en código:
   ```csharp
   services.AddHttpClient<IAzureDevOpsClient, AzureDevOpsClient>(client => { ... })
       .AddHttpMessageHandler(sp =>
       {
           IHostEnvironment environment = sp.GetRequiredService<IHostEnvironment>();
           if (environment.IsDevelopment())
           {
               // Local: Personal Access Token de configuración/User Secrets.
               return new AzureDevOpsPatAuthHandler(options.Pat);
           }

           // Producción: Identidad Federada de Workload vía DefaultAzureCredential.
           return new AzureDevOpsFederatedAuthHandler(new DefaultAzureCredential(), options.Scope);
       });
   ```
   Ambos handlers implementan el mismo `DelegatingHandler`, así que el resto del cliente (`AzureDevOpsClient`, la calculadora, los use cases) no sabe ni le importa cuál está activo. No se extiende el `AuthenticationType` compartido de `GestionCapacidad.Core.RestClient` (usado por `CompanyRegistry` y cualquier cliente futuro que sólo necesite OAuth2 de token endpoint o Managed Identity clásica) porque ninguno de sus tipos cubre PAT (Basic) ni Identidad Federada de Workload (`DefaultAzureCredential`) — forzarlo ahí acoplaría una necesidad de un solo cliente a una librería compartida. `AddInfrastructure` gana un parámetro `bool isDevelopment` (lo resuelve `Program.cs`, que ya tiene `builder.Environment`), sin agregar una referencia a hosting en `Infrastructure` más allá de la que ya usan otros métodos de este mismo archivo.

10. **`ExternalServiceUnavailableException` → 502, primera vez en el backend.** Envuelve cualquier `ExternalApiException`/timeout que el cliente propague; hasta ahora ningún módulo necesitaba distinguir "el proveedor externo no respondió" de un 500 genérico porque `CompanyRegistry` no tiene ningún endpoint del contrato que dependa de que responda (su único use case, `GetExternalCompanyUseCase`, no está mapeado a ninguna operación de `oas.json` — es infraestructura preparada, no expuesta). Acá sí hay tres operaciones del contrato con 502 explícito.

## Riesgos / Trade-offs

- [`wip` puede seguir llegando `null` si Azure DevOps no expone historial de revisiones para ningún work item] → mismo comportamiento ya previsto por `evaluateMultitasking` desde `backend-modulo-capacidad`; no es una regresión.
- [Sin organización real, `AzureDevOpsClient` nunca se prueba end-to-end contra datos reales] → mismo trade-off ya aceptado para `CompanyRegistry`; la corrección de la lógica de negocio la garantiza `SprintSnapshotSyncCalculatorTests`, no un smoke test contra Azure DevOps.
- [La rama `if (IsDevelopment())` es la primera de su tipo en este backend] → documentada acá y en el proposal para que quien retome este cliente entienda por qué se apartó del patrón de sólo-configuración; no se generaliza a otros clientes sin la misma necesidad real.

## Plan de migración

Sin datos que migrar: no hay tablas ni columnas nuevas. Orden: Application (`IAzureDevOpsClient` + DTOs crudos, `ExternalServiceUnavialableException`, `SprintSnapshotSyncCalculator` con sus tests, tres use cases) → Infrastructure (`AzureDevOpsClient`, los dos `DelegatingHandler` de autenticación, registro en DI con la rama por ambiente) → WebApi (endpoint nuevo en Detalle de persona, dos endpoints nuevos en Capacidad, mapeo 502, ejemplos Swagger) → tests → smoke (verificando que sin `BaseAddress` real configurado el 502 se devuelve correctamente, no un 500) → `ENDPOINTS.md`. Rollback: quitar los tres endpoints, el cliente y sus handlers, y la sección `HttpClients:AzureDevOps` de configuración; ningún otro módulo depende de este cambio.
