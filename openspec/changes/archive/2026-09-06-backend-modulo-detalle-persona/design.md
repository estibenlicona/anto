# Diseño — Backend: módulo Detalle de persona (sin búsqueda en Azure DevOps)

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`PersonDetailDto`, `PersonDetailAllocationDto`, `DevOpsIdentityDto`, `CurrentSprintBalanceDto`, `PersonStackDetailDto`, `SuggestedSquadDto`, `CostReading`, `LinkDevOpsIdentityRequest`). Las reglas de pantalla viven en `openspec/specs/people/spec.md` (Detalle de persona, Línea de expertise de una persona, Vincular identidad DevOps por correo). La semántica canónica de cada fórmula se investigó contra el mock del frontend: `frontend/src/mocks/handlers/personDetail.handlers.ts` (cálculo real), `personDetail.seeds.ts` (bandas de costo, tablas de células sugeridas, chapters), `frontend/src/mocks/handlers/chapters.ts` (el catálogo de chapter) y `frontend/src/features/people/services/personDetailService.ts` (formas de los DTOs).

## Goals / Non-Goals

**Goals**
- Las dos rutas internas en 🟢, con los mismos números y reglas que ya produce el mock.
- Reutilizar sin reinterpretar todo lo que ya existe: `PersonDto`/`PersonDerivedData` (Personas), `DedicationContext`/`CapacityCalculator`/`HistoryReference`/`BalanceSignalCalculator` (Capacidad), `SquadAggregates` (Células), `Person.ChapterId`/`ExpertiseLineId`/`DevOpsUserId`/`LinkDevOpsIdentity` (ya construidos).

**Non-Goals**
- `GET /devops/users` — segundo cambio, junto con la sincronización de Capacidad.
- Un maestro editable de chapters — no hay ruta `/chapters` en el contrato; se siembra como catálogo fijo.
- Scope por chapter (claims) — igual que los catorce módulos anteriores. Aquí hay una distinción importante que vale la pena dejar explícita: el **chapter** que este cambio resuelve (`chapterName`/`chapterLeadName`) es un dato de la ficha —un catálogo chico, sin filtrar nada—, mientras que el **scope por chapter** pendiente es sobre autorización —qué personas puede ver cada Líder de Expertise—. Resolver el primero no adelanta el segundo.

## Decisions

1. **`Chapter` es un catálogo de sólo lectura, sin agregado ni migración — mismo patrón que `IStackCatalog`/`ChapterStackCatalog`.** El contrato no declara ninguna ruta para administrarlo (a diferencia de Líneas de expertise, que sí tiene sus 10 rutas); inventar un CRUD que nadie pide sería construir por delante del contrato. `IChapterCatalog` expone `IReadOnlyList<ChapterCatalogEntry>` (`Id`, `Name`, `LeadEntraObjectId`); `ChapterDirectoryCatalog` la implementa sembrada con los tres chapters del mock. `Person.ChapterId` ya existe (columna e índice ya migrados, y ya se confirmó distinto de `ExpertiseLineId` en el cambio anterior) — sólo le faltaba un catálogo que resolver.

2. **El lead de un chapter se resuelve en vivo contra `Person.EntraObjectId`, con la etiqueta sembrada como respaldo — literal del mock.** `chapterLeadName = personas.FirstOrDefault(p => p.EntraObjectId == chapter.LeadEntraObjectId && p.EntraObjectId != "")?.Name ?? chapter.LeadName_sembrado`. La guarda contra cadena vacía importa: las personas sembradas hoy tienen `EntraObjectId` vacío (nadie ha iniciado sesión todavía), así que sin ella cualquier chapter emparejaría con la primera persona de la lista. Con datos reales de Entra, el nombre del lead sigue al de la persona sin tocar el catálogo — mismo principio que ya rige el lead de una línea de expertise.

3. **`GET /people/{id}/detail` no agrega ningún cálculo propio nuevo — cruza lo que cada módulo ya calcula.** `person` sale de `PersonMappings.ToDto` + `PersonDerivedData.Build` (Personas, sin cambios). `allocation` sale de `IAllocationRepository`/`ISquadRepository`, con `teammates` = nombres de las demás personas con asignación en la misma célula (sin acotar por chapter — ver Non-Goals). `currentSprint` (dentro de `devOpsIdentity`, sólo si la persona tiene identidad) reutiliza `DedicationContext.BuildAsync` + `BuildRowAsync` para esa sola persona: `sprint`/`capacity`/`balance.signal`/`balance.notEvaluableReason` vienen tal cual del `CollaboratorDedicationRowDto` que Capacidad ya arma; `evidenceCount = max(overCount, underCount)` de esa misma fila. Sin sprint vigente configurado, `currentSprint` es `null` aunque la persona tenga identidad — igual que el mock ("null cuando DevOps no devuelve sprints").

4. **`costReading` son bandas fijas por nivel, sin endpoint que las edite (no hay uno en el contrato) — literal del mock.**
   ```
   Nivel 1: 4.000.000 – 6.500.000
   Nivel 2: 5.500.000 – 8.500.000
   Nivel 3: 7.000.000 – 11.000.000
   Nivel 4: 9.000.000 – 15.000.000
   ```
   `monthlyCost > max → High`; `< min → Low`; en cualquier otro caso (incluidos los bordes) → `InRange`. `CostReading` se modela como catálogo cerrado (value object), igual que el resto de los enumerados del backend, aunque nunca se persiste — es puramente derivado, mismo trato que `BalanceSignal`.

5. **`suggestedSquads` sólo se calcula sin célula, por cargo — no por stack ni por capacidad —, con las mismas dos tablas fijas del mock, ahora indexadas por *nombre* de célula en vez de por id** (los ids del mock son ficticios; las cinco células ya sembradas por nombre son las mismas). Una célula se sugiere cuando su tabla de cargos deseados incluye el cargo de la persona y **nadie con ese mismo cargo** ya está asignado a esa célula. `reason` es `"Sin equipo"` si la célula no tiene ninguna asignación, si no `"Sin {cargo} en el equipo"`. `requiredLevel` sale de una segunda tabla fija (célula × cargo), con 2 (Competente) como respaldo si la combinación no está en la tabla — mismo respaldo del mock. `allocatedFte`/`teamAvailableFte` se calculan con `FteMath` sobre el equipo actual de esa célula, igual que Torre de control y Líneas de expertise.

6. **La cobertura de un stack (`otherCoverers`/`coverers`) se calcula sobre todas las personas, sin acotar por chapter** — mismo criterio que el resto de los módulos mientras el scope por chapter siga pendiente (ver Goals/Non-Goals). `coverers` trae hasta 3 personas, para avatares.

7. **`POST /people/{id}/devops-identity` no valida el `identityId` contra Azure DevOps real.** Ese directorio no existe todavía en este cambio (es `GET /devops/users`, el segundo cambio); acá se confía en que el cliente ya lo resolvió con su propia búsqueda, y el servidor sólo hace lo que sí puede hacer sin esa integración: 404 si la persona no existe, 409 si ese `identityId` ya está vinculado a **otra** persona (nombrándola, literal del mock), y si no, `Person.LinkDevOpsIdentity(identityId)` — el método que Capacidad ya dejó escrito para este momento. `IPersonRepository` gana `GetByDevOpsUserIdAsync` para resolver el 409.
8. **`providerName`/`contractEndsAt` sólo existen para personas externas** (`ProviderId` no nulo); `contractEndsAt` no tiene ninguna fuente real todavía en el propio mock (una tabla fija con una sola persona sembrada, comentario explícito de "las demás externas: sin fecha") — se replica igual: casi siempre `null`, sin inventar una fecha donde el mock tampoco la tiene.

## Risks / Trade-offs

- [Endpoint de lectura más amplio del backend: toca Personas, Células, Compañías, Líneas de expertise y Capacidad en una sola respuesta] → cada pieza ya está construida y probada en su propio módulo; este cambio sólo las orquesta, sin duplicar ninguna fórmula.
- [`suggestedSquads`/`REQUIRED_SFIA_BY_SQUAD` indexadas por nombre de célula, no por id] → frágil si una célula sembrada cambia de nombre; aceptable porque son datos de semilla, no de producción, y el propio mock tiene el mismo acoplamiento (por id ficticio en su caso).
- [`POST /people/{id}/devops-identity` no verifica que el `identityId` sea real] → explícito y temporal: el segundo cambio (con `GET /devops/users`) es lo único que puede cerrar esa brecha, porque necesita el mismo cliente externo.
- [Sin scope por chapter] → igual que los catorce módulos anteriores; y explícitamente distinto del catálogo `Chapter` que este cambio sí resuelve (decisión 1).

## Migration Plan

Sin migración de `People` — `ChapterId` ya existe. Catálogo `Chapter` sembrado en código (sin tabla). Orden: Domain (`CostReading`, `IPersonRepository.GetByDevOpsUserIdAsync`) → Application (`CostReadingCalculator`, `SuggestedSquadCalculator`, DTOs, dos use cases) → Infrastructure (`IChapterCatalog`/`ChapterDirectoryCatalog`, `PersonRepository.GetByDevOpsUserIdAsync`, semillas de chapter) → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar los dos endpoints; nada que revertir de `Person`.

## Open Questions

(ninguna)
