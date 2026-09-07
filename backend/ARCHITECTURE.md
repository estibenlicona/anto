# Architecture

## Layers
- `Domain`: entities, primitive base types, domain exceptions, and repository contracts.
- `Application`: use cases, DTOs, validation, and manual mappings.
- `Infrastructure`: EF Core persistence strategies, provider selection, repository implementations, Unit of Work, and outbound technical integrations.
- `WebApi`: HTTP endpoints, middleware, Swagger, CORS, health checks, optional Azure App Configuration, and observability.

## Dependency Rules
- Domain depends on no project and has no persistence-provider concepts.
- Application depends only on Domain.
- Infrastructure depends on Application, Domain, and RestClient and owns provider selection and outbound integration implementations.
- WebApi depends on Application, Domain, and Infrastructure.
- Tests may reference all projects needed for verification. RestClient tests are unified under `api_capacidadti_celulasti.WebApi.Tests/Core/RestClient`.

## HTTP and Persistence Flow
```text
HTTP Request -> Middleware -> Controller -> UseCase -> Repository -> ApplicationDbContext -> selected EF Core provider
```

The selected provider comes from `Persistence:Provider`. Supported values are `SqlServer` and `MongoDb`. Domain, Application, and repositories do not branch on provider.

## Outbound HTTP Flow
```text
HTTP Request -> Middleware -> Controller -> UseCase -> Application external-service abstraction -> Infrastructure typed RestClient -> external API
```

The copied RestClient library lives under `src/api_capacidadti_celulasti.Core/RestClient` and is included in the solution as `api_capacidadti_celulasti.RestClient`. Application defines domain-specific external API abstractions such as `ICompanyRegistryClient`; Infrastructure implements them using `IRestClient` and registers typed clients with `AddRestClient<TClient, TImplementation>`.

Outbound client configuration lives under `HttpClients`. The Company Registry example uses `TimeoutOnly` resilience by default, and retry is intentionally disabled unless a team explicitly chooses a safe preset with idempotency protection. RestClient outbound OAuth and Managed Identity authentication are for external API calls only and do not change the inbound authentication boundary.

## Persistence Strategy Pattern
Infrastructure registers one `IPersistenceStrategy` per provider and a `PersistenceStrategyFactory` resolves the configured provider (`Persistence:Provider`: `SqlServer`, `MongoDb`, `InMemory`, or `Postgres`). `AddInfrastructure` binds `PersistenceOptions`, resolves the strategy through DI, and configures `ApplicationDbContext` without `BuildServiceProvider`.

SQL Server is implemented with EF Core SQL Server. PostgreSQL is implemented with `Npgsql.EntityFrameworkCore.PostgreSQL` and is the provider used in Development, in certification, and in production. MongoDB is implemented with the MongoDB EF Core provider, using the same `ApplicationDbContext` and repository abstractions. InMemory backs the test suite and offers a schema-free fallback.

When MongoDB is selected, Infrastructure registers a singleton `IMongoClient`. `MongoDbPersistenceStrategy` resolves that singleton from DI and passes it to the MongoDB EF Core provider. The readiness health check reuses the same singleton and pings the selected database. Other providers do not require MongoDB configuration.

MongoDB EF Core supports the current model and index configuration. MongoDB indexes are created through `Database.EnsureCreated()`. Teams extending the template should validate MongoDB behavior for their own entity model and should not assume relational feature parity.

### Schema: migrations vs. `EnsureCreated`

EF Core migrations exist **only for PostgreSQL** (`src/GestionCapacidad.Infrastructure/Migrations/`), because a migration is compiled against a specific provider and PostgreSQL is the only relational provider actually deployed. SQL Server remains declared and selectable but has no migrations of its own; it has no way to create its schema today, exactly as before this was made explicit.

`InMemory` has no migrations and does not need any: its schema is created with `Database.EnsureCreated()`, which bypasses the migrations history entirely. Running `EnsureCreated()` against a provider that *does* have migrations (Postgres) would leave the database in a state `dotnet ef database update` does not recognize, so the two mechanisms are kept mutually exclusive by provider, both in `DevelopmentDataSeeder` and by convention elsewhere.

`GestionCapacidad.Infrastructure` ships an `IDesignTimeDbContextFactory<ApplicationDbContext>` so `dotnet ef` can build the context without starting the application or requiring the local secret: it reads `Persistence:PostgresConnectionString` from configuration (appsettings, User Secrets, environment variables) when present, and falls back to a design-time-only connection string that is never actually opened — generating or diffing a migration does not touch the database.

EF Core tools are pinned as a local .NET tool (`backend/.config/dotnet-tools.json`), restored with `dotnet tool restore`, so the same `dotnet-ef` version is used on every machine and in CI. Typical commands, run from `backend/`:

```bash
dotnet ef migrations add <Name> --project src/GestionCapacidad.Infrastructure --startup-project src/GestionCapacidad.WebApi --output-dir Migrations
dotnet ef migrations script --project src/GestionCapacidad.Infrastructure --startup-project src/GestionCapacidad.WebApi
dotnet ef database update --project src/GestionCapacidad.Infrastructure --startup-project src/GestionCapacidad.WebApi
```

`PendingModelChangesTests.Model_HasNoChangesPendingAMigration` fails the build whenever the EF model has drifted from the last migration (a property added, a relationship changed) without a matching migration being generated — the same check `dotnet ef migrations add` uses internally, run as a unit test so a forgotten migration is caught in CI rather than discovered against a real database.

### Applying migrations: Development vs. every other environment

In **Development only**, `Program.cs` calls `Database.MigrateAsync()` on startup, before `DevelopmentDataSeeder` runs, so `dotnet run` leaves a developer's local database fully migrated and seeded with no manual step. The guard is `IsDevelopment()` plus `Database.IsRelational()` (so it is a no-op under `InMemory`), never a configuration flag — there is no way to enable auto-migration outside Development by mistake.

**Outside Development — certification and production, which behave identically — the application never migrates itself.** A running instance discovering that a migration is about to lock a table is exactly the wrong moment to find that out; migrations there are applied by the deployment pipeline, either with `dotnet ef database update` against the target connection string or with a portable migrations bundle (`dotnet ef migrations bundle`) that does not require the SDK or the source tree on the target host. Whichever mechanism a given pipeline uses, it must run and succeed *before* the new application revision starts receiving traffic.

### Where the PostgreSQL connection string comes from

The connection string is never committed to the repository, and *where it comes from is decided by the environment*, not by a flag:

- **On a developer's machine** (`Environment` = `Development`), it comes from **.NET User Secrets**, stored outside the repository under the user's profile (`%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\secrets.json` on Windows) and loaded automatically only in Development:
  ```bash
  dotnet user-secrets set "Persistence:PostgresConnectionString" "Host=localhost;Database=gestioncapacidad_dev;Username=postgres;Password=<your-local-password>" --project src/GestionCapacidad.WebApi
  ```
  `appsettings.Development.json` sets `Persistence:Provider` to `Postgres` and leaves `PostgresConnectionString` empty, like the other connection strings — the secret is what fills it in, and it never touches a file under source control.

- **In certification and production**, it comes from **Azure App Configuration, with `Persistence:PostgresConnectionString` published as a Key Vault reference** — the value itself lives in Key Vault, not in App Configuration or in the pipeline, so rotating it does not require a redeploy. The application authenticates to App Configuration with **workload identity federation**, resolved by `DefaultAzureCredential` from the environment variables and projected token file the platform injects — there is no client secret anywhere. `AddOptionalAzureAppConfiguration` connects whenever `Environment.IsDevelopment()` is false; it requires the `AzureAppConfiguration__Endpoint` environment variable to be set (throwing an explicit `InvalidOperationException` if it is missing) and reads no other value from `appsettings` for that endpoint, since that is the one setting that must vary per environment and never belongs in a checked-in file.

`postgresConnectionString` is included in the Serilog sensitive-data-masking property list (`Observability:SensitiveDataMasking:PropertyNames`), alongside the other connection strings, so it is redacted from logs even if it ever ended up in a logged object graph.

**Configuration precedence** (each source overrides the previous one): `appsettings.json` → `appsettings.{Environment}.json` → User Secrets (Development only) → environment variables → Azure App Configuration (added last by `AddOptionalAzureAppConfiguration`, so it wins over environment variables and files whenever it is connected). This is existing, unmodified `WebApplicationBuilder` behavior; it is worth remembering explicitly, because an environment variable that silently loses to a value published in App Configuration is a common source of "why isn't my override taking effect" investigations.

## Manual Mapping
AutoMapper is intentionally not used. `CompanyMappings` contains explicit mapping methods for DTO and response shapes, making mappings easy to read, debug, and test.

## Observability Flow
```text
Application ILogger/Serilog events -> Serilog enrichers -> Sensitive masking -> Console / Serilog OTLP sink
OpenTelemetry SDK traces and metrics -> Observability:OtlpEndpoint
```

`Observability:OtlpEndpoint` is the single endpoint for OpenTelemetry traces, metrics, and Serilog-exported logs. `Observability:ExportTraces`, `ExportMetrics`, and `ExportLogs` control each signal. If the endpoint is empty and `ExportToConsole=true`, traces and metrics use local console exporters.

Serilog is the single structured application logging pipeline. It enriches events with application, environment, `TraceId`, and `SpanId` context, writes local console logs, and exports logs through `Serilog.Sinks.OpenTelemetry` when configured. The OpenTelemetry SDK is used for traces and metrics only; the Microsoft.Extensions.Logging OpenTelemetry logging provider is not used.

Sensitive data masking is enabled by default before any Serilog sink receives events. It uses established Serilog masking enrichers and operators for supported sensitive patterns, including credit-card and IBAN values. It masks configured property names case-insensitively and common bearer-token, query-string secret, API key, subscription key, and connection-string secret patterns. Arbitrary bank-account number patterns are covered through property-name masking unless a stable operator supports the pattern. This does not replace secure coding practices; teams should still avoid logging secrets intentionally.

## Authentication Boundary
Authentication and authorization are intentionally external to this template. The service does not configure token authentication, authorization policies, controller authorization attributes, or Swagger security schemes. Use an API Gateway, APIM, ingress, platform identity layer, service mesh, reverse proxy, identity proxy, or upstream middleware to authenticate callers before traffic reaches the service.

The service does not process authentication headers. Default CORS allowed headers are `Content-Type` and `Idempotency-Key`; `Authorization` is intentionally not allowed by default. Teams that need `Authorization` passthrough for a specific downstream use case must opt in by adding it to `Cors:AllowedHeaders`.

Outbound OAuth credentials for external APIs must come from environment variables, user secrets, Azure App Configuration, or Key Vault references through Azure App Configuration. Managed Identity outbound auth uses configured scopes and an optional user-assigned identity client ID; it does not require a client secret and tokens must not be logged. Managed Identity failures preserve exception context while avoiding token, credential response, authorization header, client secret, and raw OAuth response values. These outbound mechanisms do not add inbound JWT authentication, controller authorization attributes, Swagger Bearer auth, or `Authorization` to default CORS headers.

## Health Checks
The Web API exposes liveness and readiness separately:

- `/health/live`: liveness; process-only self check tagged `live`.
- `/health/ready`: readiness; selected persistence-provider check tagged `ready`.
- `/health`: readiness behavior for backward compatibility.

Readiness returns unhealthy when the configured provider is unsupported, misconfigured, or unavailable. Responses are JSON with overall status, total duration, and per-entry status, description, duration, tags, and error details.

## Error Flow
Exceptions flow to `ErrorHandlerMiddleware`, which returns `ProblemDetails` with `title`, `status`, `detail`, and `traceId`.

Client-aborted requests are not converted into HTTP 500. The error middleware does not write `ProblemDetails` after the response has started, and middleware response writes use `HttpContext.RequestAborted` where applicable.

Mappings:
- `NotFoundException`: 404
- `BadRequestException`: 400
- `ValidationException`: 400
- `UnauthorizedAccessException`: 401
- Other exceptions: 500

## Validation Flow
Requests are validated with FluentValidation inside use cases before state changes. Validation failures throw the template `ValidationException` and are converted to HTTP 400 by middleware.

## Template Packaging
`template/content` is the source used by `dotnet new install ./template`. The template content itself is the source of truth for source code, tests, and generated documentation.

## Explicitly Out of Scope
RabbitMQ, asynchronous messaging, Docker, docker-compose, pipelines, Kubernetes, Helm, APIM integration, API Gateway integration, inbound rate limiting, SBOM, SonarQube, Trivy, load testing, JWT authentication, authorization policies, and Testcontainers are intentionally not included.
