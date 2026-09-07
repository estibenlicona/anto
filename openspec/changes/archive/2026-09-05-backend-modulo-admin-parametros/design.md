# Diseño — Backend: módulo Admin (parámetros del modelo)

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`SprintConfig`, `TallaBands` + `TallaBand`, `CapabilityMixRow`, `QuestionPoolRow`; los `PUT` reciben y devuelven la misma forma). La semántica canónica vive en los handlers del mock (`frontend/src/mocks/handlers/{sprint-config,talla-bands,capability-mix,question-pool}.handlers.ts`: validaciones y valores por defecto) y en las constantes de los servicios del front (`QUESTION_DIMENSIONS` — 7 dimensiones en orden —, `TALLA_RANGE_MIN/MAX` 0–100, `TALLA_MIN_BAND_WIDTH` 5, `SPRINT_CLOSE_TIME_PATTERN` `^([01]\d|2[0-3]):[0-5]\d$`). Quien consume estos datos aguas abajo: `buildEvaluationModel` de `initiatives.handlers.ts` (pool + bandas + mix → modelo de evaluación) y `getDedicationSettings` de `dedication.handlers.ts` (calendario → capacidad).

Hoy no existe nada bajo `/admin` en `backend/src`. Convenciones a respetar: agregados `AggregateRoot` con invariantes en el constructor/métodos, colecciones poseídas con `OwnsMany` (patrón `PersonStacks`), converters para value objects, FluentValidation → `ValidationException` (400 con los mensajes unidos por `; `), `IEndpointDefinition` por módulo, ejemplos Swagger con `IExamplesProvider`, provider InMemory con `EnsureCreated` y `DevelopmentDataSeeder`, abstracciones de sólo lectura en `Application/Abstractions` (patrón `IStackCatalog`).

## Goals / Non-Goals

**Goals**
- Los 8 endpoints de Admin en 🟢, con exactamente las reglas del mock y respuestas en el mismo orden en que se guardaron.
- Dejar una costura clara (repositorios + valores por defecto) para que Iniciativas y Capacidad lean los parámetros sin duplicarlos.

**Non-Goals**
- Componer el `EvaluationModel` (es del cambio de Iniciativas), versionado de parámetros, validación cruzada mix↔bandas, autorización por rol, migraciones SQL.

## Decisions

1. **Cuatro agregados de fila única, no una tabla clave/JSON ni un proveedor estático.** `SprintConfiguration`, `TallaBandSet`, `CapabilityMix` y `QuestionPool` como `AggregateRoot` con sus filas como entidades poseídas (`TallaBand`, `CapabilityMixRow`, `PoolQuestion`, cada una con `Position` para conservar el orden) y un método `Replace(...)`/`Update(...)` que re-valida el conjunto completo. *Alternativas*: una tabla `ModelParameters(Key, Json)` deja las invariantes sólo en validadores y obliga a Iniciativas a parsear JSON; un proveedor estático (como `ChapterStackCatalog`) no puede persistir el `PUT`. Los agregados mantienen las reglas en Domain, siguen el patrón EF existente y son legibles por otros módulos sin conversión.

2. **Repositorio genérico de fila única.** `ISingleDocumentRepository<T> where T : AggregateRoot` en `Domain/Interfaces` con `GetAsync(ct)` (la única fila o `null`), `AddAsync` y `Update`; una sola implementación `SingleDocumentRepository<T>` en Infrastructure (`DbSet<T>.FirstOrDefaultAsync()`), registrada cuatro veces en DI. Los use cases de guardado hacen "obtener o crear, luego `Replace`, luego `SaveChangesAsync`". *Alternativa*: cuatro interfaces/repositorios — más archivos sin ganar nada. Concurrencia: gana la última escritura (un solo administrador, pre-productivo).

3. **Valores por defecto en Application, no en el seeder.** `Application/ModelParameters/ModelParameterDefaults` construye los cuatro agregados de referencia (espejo de los `default*` del mock: calendario 2/6/80/23:00/6/3; cortes 20/40/60/80 con XS 0.5–1 «Cambio menor», S 1–3 «Ajuste puntual», M 3–6 «Iniciativa media», L 6–10 «Iniciativa grande», XL 10–18 «Transformación mayor»; Backend Dev 1/2/3/5/8, QA Engineer 0/1/1/2/3, Arquitecto 0/0/1/1/2; las 30 preguntas del modelo v7 con dimensión, texto y peso — peso total 70, 4/4/4/5/5/4/4 preguntas por dimensión). Los `GET` responden `await repo.GetAsync() ?? ModelParameterDefaults.X()` sin persistir. *Alternativa*: sembrar en `DevelopmentDataSeeder` — sólo funciona con InMemory; con SQL/Mongo vacíos los `GET` fallarían y Iniciativas no tendría modelo para sembrar. Infrastructure depende de Application, así que el seeder de Iniciativas podrá usar los mismos defaults.

4. **Columnas JSON por converter para lo que no es tabular.** `TallaBandSet.Boundaries` (`IReadOnlyList<decimal>`) y `CapabilityMixRow.PorTalla` (`IReadOnlyDictionary<string,int>`) se guardan como `string` JSON (`System.Text.Json`) con `ValueComparer` por contenido. *Alternativa*: colecciones primitivas / `ToJson()` de EF 8+ — el soporte difiere entre SqlServer, el provider de Mongo y InMemory; el converter a string funciona igual en los tres. Nadie consulta por dentro de esas columnas.

5. **Los 400 salen de los validadores; el dominio repite las invariantes como última línea.** Validadores FluentValidation por request con un mensaje en español por regla (p. ej. «Las horas por sprint deben estar entre 20 y 400», «El mínimo de sprints para evaluar no puede superar la ventana de histórico», «La hora de cierre debe tener formato HH:mm», «Deben enviarse exactamente 4 cortes y 5 bandas», «Los cortes deben ser crecientes y dejar al menos 5 puntos entre bandas y contra 0 y 100», «La banda M tiene pmMin mayor que pmMax», «El nombre de la capacidad se repite: QA Engineer», «La cantidad de QA Engineer para la talla M debe ser un entero ≥ 0», «La dimensión de la pregunta N9 no existe», «El peso de la pregunta N9 debe ser un entero ≥ 1», «El id de la pregunta se repite: N1»). Los agregados lanzan `DomainException` si se construyen violando una regla (como `Person.ReplaceStacks`). Tipos: enteros como `int` (`weeks`, `sprintsPerQuarter`, `historyWindowSprints`, `minHistorySprints`, `peso`, cantidades del mix — un 1.5 en JSON cae en 400 al deserializar, lo que el mock también rechaza), `decimal` para `hoursPerSprint`, `pmMin/pmMax` y `boundaries` (0.5 es un valor válido de persona-mes).

6. **Requests que se deserializan directo cuando el cuerpo es un objeto; envueltos por el endpoint cuando es un arreglo.** `SaveSprintConfigRequest(Weeks, SprintsPerQuarter, HoursPerSprint, SprintCloseTime, HistoryWindowSprints, MinHistorySprints)` y `SaveTallaBandsRequest(Boundaries, Bands)` se ligan del cuerpo tal cual; para `capability-mix` y `question-pool` el endpoint recibe `CapabilityMixRowDto[]` / `QuestionPoolRowDto[]` y construye `SaveCapabilityMixRequest(Rows)` / `SaveQuestionPoolRequest(Questions)` porque FluentValidation valida un objeto raíz. Los DTOs de respuesta (`SprintConfigDto`, `TallaBandsDto`+`TallaBandDto`, `CapabilityMixRowDto`, `QuestionPoolRowDto`) usan los nombres del contrato tal cual (`Capacidad`→`capacidad`, `PorTalla`→`porTalla`, `Texto`, `Peso`, `Talla`, `PmMin`, `PmMax`, `Lectura`) — camelCase por defecto del serializador.

7. **`QuestionDimension` como value object cerrado** con las 7 dimensiones en el orden de referencia (Negocio y cliente, Alcance funcional, Integraciones, Datos, seguridad y cumplimiento, Tecnología y arquitectura, Operación y soporte, Incertidumbre y dependencias); `From(string)` exige coincidencia exacta como el mock. Las tallas de las bandas **no** se restringen a XS/S/M/L/XL (el mock tampoco; el front las declara fijas) — sólo no vacías y únicas; el `id` de las filas del mix y el código de las preguntas son cadenas que decide el cliente (estables, ≤50), no GUIDs.

8. **Un `AdminEndpoints`** con el grupo `api/v{version:apiVersion}/admin` (tag `Admin`), cuatro `GET` y cuatro `PUT` que responden 200 con el DTO (el contrato no usa 201 aquí). `IdempotencyMiddleware` ya cubre los `PUT` (el smoke manda `Idempotency-Key`).

9. **Costura hacia Iniciativas y Capacidad.** Iniciativas inyecta `ISingleDocumentRepository<TallaBandSet>`, `<CapabilityMix>` y `<QuestionPool>` (con `ModelParameterDefaults` como fallback) para componer el modelo; la derivación de rangos por banda (`minPct` = corte anterior + 1 salvo la primera; `maxPct` = corte siguiente o 100), el tipo/escala por pregunta, el tamizaje y la acción por talla siguen siendo suyos. Capacidad inyecta `<SprintConfiguration>`. El orden de las dimensiones del modelo es el orden de aparición en el pool, como en el mock.

## Risks / Trade-offs

- [Los defaults viven en TS (mock) y en C#] → tests que fijan los conteos y sumas del pool (30 preguntas, 7 dimensiones con 4/4/4/5/5/4/4, peso total 70), las 5 bandas con sus cortes y las 3 capacidades con sus cantidades; cualquier divergencia rompe el test.
- [Un `GET` sin fila y un `PUT` concurrente pueden pisarse] → gana la última escritura; aceptado (un administrador, sin datos productivos).
- [El contrato tipa `peso`/`porTalla` como `number` y el backend exige `int`] → un decimal responde 400 al deserializar (mensaje genérico del binder, no en español); el front nunca los manda decimales y el mock también los rechaza.
- [Columnas JSON no consultables en SQL] → nadie filtra por cortes ni por cantidades; si hiciera falta, se promueven a columnas/tabla.
- [`skip_specs`] → las reglas ya están fijadas en `admin-shell` (formulario y editores) y en `backend/ENDPOINTS.md`; no hay requirement nuevo que capturar.

## Migration Plan

Sin datos que migrar: cuatro tablas nuevas (`SprintConfigurations`, `TallaBandSets` + `TallaBands`, `CapabilityMixes` + `CapabilityMixRows`, `QuestionPools` + `PoolQuestions`) vacías hasta el primer `PUT`. Orden: Domain (VO + 4 agregados + repositorio genérico) → Application (defaults, DTOs, requests/validadores, 8 use cases, DI) → Infrastructure (configuraciones EF, `DbSet`s, repositorio genérico, DI) → WebApi (endpoints + ejemplos) → tests → smoke InMemory → `ENDPOINTS.md`. Rollback: quitar el `AdminEndpoints` y las cuatro tablas; ningún otro módulo depende todavía.

## Open Questions

(ninguna)
