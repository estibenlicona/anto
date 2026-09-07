# Backend: módulo Detalle de persona al contrato (sin búsqueda en Azure DevOps)

## Why

Décimo cuarto ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Detalle de persona está 0🟢 3🔴, pero sólo uno de sus tres endpoints necesita una integración externa real: `GET /devops/users` (buscar en Azure DevOps por correo). `GET /people/{id}/detail` y `POST /people/{id}/devops-identity` son internos — el segundo reutiliza `Person.DevOpsUserId`/`LinkDevOpsIdentity`, ya construidos en Capacidad (decisión 7 de ese cambio, que explícitamente reservó el método para este módulo. Este cambio cierra los dos internos; `GET /devops/users` queda para un segundo cambio, junto con la sincronización real de Capacidad — misma partición ya aprobada para ese módulo, mismo motivo: ambos necesitan el mismo cliente HTTP a Azure DevOps.

Es también el endpoint de lectura más amplio del backend hasta ahora: cruza casi todos los módulos anteriores (Personas, Células, Compañías, Líneas de expertise, y Capacidad para el balance del sprint en curso) en una sola respuesta — pero cada pieza que cruza ya existe y ya está probada; este cambio no reinventa ninguna, sólo las combina.

## What Changes

- **Un catálogo `Chapter` mínimo, sin CRUD**: el contrato no declara ninguna ruta `/chapters` — a diferencia de Líneas de expertise, que sí tiene su propio maestro editable, el chapter aquí es sólo lo que `PersonDetailDto` necesita mostrar (nombre y lead). Se modela como catálogo de sólo lectura (mismo patrón que `IStackCatalog`/`ChapterStackCatalog`, sin agregado ni migración) sembrado con los tres chapters del mock; `Person.ChapterId` ya existe (y ya quedó separado de línea de expertise en el cambio anterior) — sólo faltaba qué resolver con él.
- **`GET /people/{id}/detail`**: la ficha completa — persona (reutiliza el DTO y los derivados de Personas), proveedor y vigencia de contrato (sólo externas), chapter y línea de expertise con sus leads, asignación a célula con compañeros de equipo, identidad DevOps con el balance del sprint en curso (reutiliza `DedicationContext`/`CapacityCalculator`/`BalanceSignalCalculator` de Capacidad para una sola persona), stacks con cobertura del resto del chapter, lectura de costo contra la banda de su nivel, y células sugeridas cuando no tiene célula.
- **`POST /people/{id}/devops-identity`**: vincula el identificador recibido (`identityId`) a `Person.DevOpsUserId` vía `LinkDevOpsIdentity`; 409 si ese identificador ya es de otra persona, nombrándola. No valida contra Azure DevOps real —eso es del segundo cambio—, así que confía en el `identityId` que el cliente ya resolvió con su propia búsqueda.
- **`CostReading` como catálogo cerrado** (`InRange`/`High`/`Low`), con las mismas bandas de costo por nivel del mock, sin endpoint propio para editarlas (no hay uno en el contrato).
- **Semillas**: los tres chapters del mock (uno sin gente, a propósito) y algunas personas ya sembradas asignadas a los dos primeros.
- Fuera de alcance: `GET /devops/users` (segundo cambio, junto con la sincronización de Capacidad) y el scope por chapter (claims), como siempre.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa una parte de lo que `backend-contract`, `backend/oas.json` y `openspec/specs/people/spec.md` (Detalle de persona, Línea de expertise de una persona, Vincular identidad DevOps por correo) ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (`ValueObjects/CostReading.cs`; `IPersonRepository` gana `GetByDevOpsUserIdAsync`), Application (`PersonDetail/CostReadingCalculator.cs`, `PersonDetail/SuggestedSquadCalculator.cs`, DTOs del contrato, dos use cases que reutilizan `PersonMappings`/`PersonDerivedData`/`DedicationContext`), Infrastructure (`IChapterCatalog`/`ChapterDirectoryCatalog` sembrado, sin migración — `Person.ChapterId` ya existe), WebApi (`PersonDetailEndpoints` y ejemplos Swagger).
- `backend/tests`: las bandas de costo, la regla de células sugeridas (sólo sin célula, por cargo, sin nadie de ese cargo ya en el equipo), la cobertura de stacks, el 409 de vincular identidad, y el detalle completo de una persona con y sin célula/identidad/chapter/línea.
- `backend/ENDPOINTS.md`: dos de las tres filas de Detalle de persona a 🟢 (`GET /devops/users` queda 🔴 con nota del segundo cambio), total actualizado.
- Sin cambios al contrato: `backend/oas.json` ya tiene las tres rutas y sus esquemas.
- Sin migración de `People`: `ChapterId` ya existe desde antes de este cambio.
