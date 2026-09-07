# Backend: separar las escalas (Level y Seniority) y servir sus catálogos

## Why

Primer ajuste del backend real hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Hoy el .NET tiene **una sola escala**: su value object `Seniority` es en realidad la escala Tuya de 4 (1 Principiante … 4 Experto) — nuestro **Level** — y `/catalogs/seniorities` la sirve bajo el nombre equivocado. El contrato exige dos campos separados en la persona (`level` 1–4 y `seniority` Junior/Intermediate/Senior) y dos catálogos (`/catalogs/levels` y `/catalogs/seniorities`). Es el cimiento: Personas, Asignaciones, Competencias y Capacidad se apoyan en estas escalas.

## What Changes

- **Domain**: el value object `Seniority` se renombra `Level` (mismos valores 1–4 y etiquetas); nace el value object `Seniority` nuevo (`Junior`/`Intermediate`/`Senior`, etiquetas Junior/Intermedio/Senior). `Person` renombra su propiedad a `Level` y gana `Seniority` como campo propio y editable.
- **Application**: `PersonDto` pasa a `Level`/`LevelLabel` + `Seniority`/`SeniorityLabel`; requests de alta/edición llevan ambos campos con validación (level 1–4, seniority del catálogo); mappings y use cases al día.
- **Infrastructure**: `PersonConfiguration` mapea las dos columnas (converter `Level`↔int y `Seniority`↔string); `PersonRepository` renombra el filtro numérico a `levels` y suma el filtro `seniorities` (por slug).
- **WebApi**: `GET /catalogs/levels` sirve la escala de 4; `GET /catalogs/seniorities` pasa a servir Junior/Intermedio/Senior; `GET /people` acepta `level` y `seniority` como claves repetidas; ejemplos de Swagger al día.
- **Base de datos en memoria + semillas (code-first)**: nueva estrategia de persistencia `InMemory` junto a las existentes (SqlServer/MongoDb), elegible por `Persistence:Provider` y activa por defecto en Development; al arrancar con ella se crea el esquema desde las configuraciones EF (code-first, sin migraciones) y un **seeder** puebla personas de ejemplo — espejo de las semillas del mock del frontend, con `Level` y `Seniority` derivado (1–2 Junior, 3 Intermedio, 4 Senior) — para correr la API sin infraestructura.
- **BREAKING** (pre-productivo, sin datos reales): cambia el contrato del .NET actual — quien leyera `seniority` numérico debe leer `level`; el semáforo de `backend/ENDPOINTS.md` se actualiza (catálogos a 🟢; `/people` sigue 🟡 sólo por lo que falta: stacks, utilization, líder técnico, stats).
- Fuera de alcance: el resto del módulo Personas (stacks, stats, technical-leads), y cualquier otro módulo del semáforo.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — este cambio implementa lo que `backend-contract` y `backend/oas.json` ya exigen; no cambia ningún requirement. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: `GestionCapacidad.Domain` (ValueObjects `Level` nuevo + `Seniority` nuevo, `Person`, eventos), `Application` (PersonDto, mappings, use cases y validadores de Create/Update), `Infrastructure` (PersonConfiguration, PersonRepository, estrategia `InMemory`, seeder), `WebApi` (PeopleEndpoints: catálogos y filtros, ejemplos Swagger, arranque con esquema+semillas en Development, `appsettings.Development.json`).
- Paquete nuevo: `Microsoft.EntityFrameworkCore.InMemory` (versión central en `Directory.Packages.props`).
- `backend/tests`: `SeniorityTests` → `LevelTests` + tests del `Seniority` nuevo; tests de Person y de use cases con los dos campos.
- `backend/ENDPOINTS.md` (semáforo) — `backend/oas.json` no cambia (ya es el objetivo).
- Sin migraciones de datos: no hay base productiva; el esquema agrega la columna `Seniority` (string). Regla de derivación para semillas o datos previos: 1–2 → Junior, 3 → Intermedio, 4 → Senior (la misma de los mocks).
- El frontend no se toca (sigue en mocks hasta apuntar la baseURL).
