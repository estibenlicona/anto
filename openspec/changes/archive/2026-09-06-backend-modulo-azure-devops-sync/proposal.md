# Sincronización con Azure DevOps

## Por qué

Duodécimo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`) — y el último: cierra los tres endpoints 🔴 que quedan en todo el backend. Los tres dependen de la misma pieza que hoy no existe: un cliente HTTP real contra Azure DevOps.

Cuando `backend-modulo-capacidad` se partió en dos, su proposal.md ya dejó escrito el reparto: ese cambio entregó el modelo de capacidad y las dos lecturas asumiendo snapshots ya sembrados; **éste** entrega la sincronización real (`POST /dedication/collaborators/{personId}/sync`, `POST /dedication/collaborators/sync`) con un cliente del mismo patrón que `CompanyRegistry` — interfaz real, `BaseAddress` de ejemplo hasta que exista una organización real que configurar. Y `backend-modulo-detalle-persona`, a su vez, dejó pendiente `GET /devops/users` por la misma razón: necesita ese mismo cliente para buscar la identidad por correo.

## Qué cambia

- **`IAzureDevOpsClient`**: interfaz de aplicación con dos operaciones — buscar una identidad por correo (`SearchUserByEmailAsync`) y traer los datos crudos de un colaborador para un rango de fechas de sprint (`GetCollaboratorSyncDataAsync`: work items asignados, su historial de estados para reconstruir `wip`, y actividad de repos por día). Implementación real en Infrastructure, mismo patrón que `CompanyRegistryClient`: HttpClient tipado sobre `IRestClient`, `BaseAddress` de ejemplo en `appsettings.Development.json`, vacío en `appsettings.json`.
- **Autenticación por ambiente, no por configuración**: a diferencia de `CompanyRegistry` (que sólo varía `BaseAddress` entre ambientes), Azure DevOps exige credenciales reales incluso para probar la forma del cliente. En producción se usa Identidad Federada de Workload (`DefaultAzureCredential`, vía las variables que inyecta AKS); en local, un Personal Access Token de configuración/User Secrets. Es la primera rama `if (environment.IsDevelopment())` explícita del backend para elegir credenciales — se documenta la razón en design.md.
- **`GET /devops/users`**: nuevo use case en Detalle de persona que llama a `SearchUserByEmailAsync`; 404 si Azure DevOps no tiene coincidencia para ese correo, 400 si falta `email`.
- **`POST /dedication/collaborators/{personId}/sync`**: trae los datos crudos del colaborador vinculado, los reduce con una nueva calculadora pura (`SprintSnapshotSyncCalculator`, mismo patrón que `CapacityCalculator`/`BalanceSignalCalculator`) a comprometidos/agregados, `wip`, iniciativas concurrentes, historias y actividad, y los aplica sobre el `SprintSnapshot` del sprint vigente (creándolo si no existía). 404 si la persona no existe; 400 si existe pero no tiene identidad DevOps vinculada (sin sprint vigente tampoco es sincronizable — mismo trato); 502 si Azure DevOps no responde.
- **`POST /dedication/collaborators/sync`**: la misma operación para cada persona con identidad DevOps vinculada; nunca 404 (una lista vacía es un resultado válido), 502 si Azure DevOps no respondió para ninguno.
- **`SyncResultDto`**: sólo trae `lastSyncedAt` — se devuelve `DateTime.UtcNow` del momento en que la sincronización efectivamente corrió, sin recalcular nada adicional en la respuesta (el detalle ya sincronizado se lee después con los endpoints existentes de Capacidad).
- Nueva excepción `ExternalServiceUnavailableException` → 502, primera vez que este código aparece en el backend (hasta ahora sólo fallaba con 500 genérico).
- `backend/ENDPOINTS.md`: las tres filas restantes (`GET /devops/users`, los dos `.../sync`) pasan a 🟢. Con esto el semáforo del backend queda en 88/88 filas verdes salvo la única 🟡 heredada de Personas (fuera de alcance de este cambio y de todo este barrido).

## Fuera de alcance

- El job que sella automáticamente un snapshot al cierre de un sprint (`Seal()` sigue sin quién lo llame salvo las semillas) — `backend-modulo-capacidad` ya lo dejó así por decisión explícita y este cambio no lo retoma.
- Cualquier UI o proceso que dispare la sincronización periódicamente (cron, webhook de Azure DevOps) — estos dos endpoints son la sincronización *bajo demanda* que el contrato expone; quién los llama y con qué frecuencia es un problema de despliegue, no de este backend.
- Configurar una organización real de Azure DevOps (URL, proyecto, PAT real, `AZURE_CLIENT_ID`/`AZURE_TENANT_ID` de la Identidad Federada) — igual que `CompanyRegistry`, este cambio entrega el cliente listo para configurarse, no la configuración misma.
- Vincular por primera vez la identidad DevOps de una persona (`POST /people/{id}/devops-identity`) — ya existe, de `backend-modulo-detalle-persona`.

## Impacto

- `backend/src`: Application (`IAzureDevOpsClient` y sus DTOs crudos, `SprintSnapshotSyncCalculator`, use cases `SearchDevOpsUser`, `SyncCollaborator`, `SyncAllCollaborators`, `ExternalServiceUnavailableException`), Infrastructure (`AzureDevOpsClient`, el `DelegatingHandler` de autenticación por ambiente, registro en DI), WebApi (endpoint nuevo en `PersonDetailEndpoints`, dos endpoints nuevos en `DedicationEndpoints`, mapeo 502 en `ErrorHandlerMiddleware`, ejemplos Swagger).
- `appsettings.json`/`appsettings.Development.json`: sección `HttpClients:AzureDevOps` (`BaseAddress` vacío en base, de ejemplo en Development) y `AzureDevOps:Auth` (PAT de ejemplo vacío en Development — nunca un secreto real versionado).
- `backend/ENDPOINTS.md`: tres filas a 🟢, total actualizado a 88/89.
- Sin migración: no hay columnas ni tablas nuevas — `SprintSnapshot` ya tiene todo lo que este cambio necesita llenar.
