# Backend: módulo Admin (parámetros del modelo) al contrato

## Why

Sexto ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Admin está 0🟢 0🟡 8🔴: los cuatro parámetros del modelo —calendario de sprints, bandas de talla, mix de capacidades y pool de preguntas— sólo existen en los mocks del frontend, y son la **fuente** de dos módulos que vienen detrás: Iniciativas arma su modelo de evaluación (`/initiatives/evaluation-model`) desde bandas + mix + pool, y Capacidad lee del calendario las horas por sprint, la ventana de histórico, el mínimo para evaluar y la hora de cierre. Cerrar Admin ahora evita que Iniciativas nazca con un proveedor estático que después hay que reemplazar, y deja los cuatro parámetros editables y persistidos como la pantalla ya los edita.

## What Changes

- **Domain — cuatro agregados de configuración, uno por parámetro**, cada uno con a lo sumo una fila y reemplazo en bloque: `SprintConfiguration` (semanas 1–4, sprints por quarter 4–8, horas por sprint 20–400, hora de cierre `HH:mm`, ventana de histórico 3–12, mínimo para evaluar 2–6 y nunca mayor que la ventana), `TallaBandSet` (4 cortes estrictamente crecientes con al menos 5 puntos entre sí y contra 0/100, y exactamente 5 bandas con talla no vacía y única, persona-mes `pmMin ≥ 0` y `pmMin ≤ pmMax`, lectura no vacía), `CapabilityMix` (filas con `id` estable y único, nombre de capacidad no vacío y único sin distinguir mayúsculas, cantidades por talla enteras ≥ 0) y `QuestionPool` (preguntas con código estable y único, dimensión de la lista fija de 7, texto no vacío y peso entero ≥ 1). Las reglas son las que hoy hacen cumplir los handlers del mock; `TallaBands.boundaries`/`bands` y `CapabilityMixRow.porTalla` conservan el orden en que se envían.
- **Valores por defecto sin sembrar**: mientras nadie haya guardado un parámetro, `GET` responde el valor de referencia del mock (2 semanas / 6 sprints / 80 h / 23:00 / 6 / 3; cortes 20-40-60-80 con XS…XL y sus persona-mes y lecturas; Backend Dev / QA Engineer / Arquitecto; las 30 preguntas del modelo v7) sin persistirlo. El primer `PUT` crea la fila; los siguientes la reemplazan. Así los endpoints responden también en SQL Server/Mongo sin seeder, y el seeder de InMemory no cambia.
- **Endpoints del contrato**: `GET/PUT /admin/sprint-config` (`SprintConfig`), `GET/PUT /admin/talla-bands` (`TallaBands`), `GET/PUT /admin/capability-mix` (`CapabilityMixRow[]`), `GET/PUT /admin/question-pool` (`QuestionPoolRow[]`). Cada `PUT` valida el cuerpo completo (400 con el motivo en español, un mensaje por regla violada) y responde 200 con lo guardado, en el mismo orden. Nombres de propiedad del contrato tal cual (`capacidad`, `porTalla`, `texto`, `peso`, `talla`, `lectura`).
- **Lectura para otros módulos**: los repositorios de los cuatro agregados quedan en Domain y los valores por defecto en Application, de modo que el módulo de Iniciativas componga el modelo de evaluación desde acá (y Capacidad lea el calendario) sin duplicar datos.
- Fuera de alcance: el módulo de Iniciativas (su `IEvaluationModelProvider` y las piezas del modelo que Admin no administra — tipo y escala por pregunta, tamizaje, acción por talla), Capacidad, validación cruzada entre parámetros (que las tallas del mix existan en las bandas: el mock tampoco lo exige y el front las lee como cero), versionado/histórico de parámetros (la pestaña "Versionado" de la pantalla es marcador de posición) y autorización por rol (transversal, gateway).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y las reglas de validación ya fijadas en `admin-shell` exigen; el cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (4 agregados nuevos con sus entidades poseídas — `TallaBand`, `CapabilityMixRow`, `PoolQuestion` — y el value object `QuestionDimension`; un contrato de repositorio de fila única), Application (DTOs del contrato, valores por defecto, 8 use cases, 4 validadores, registro en DI), Infrastructure (4 `IEntityTypeConfiguration` con colecciones poseídas y columnas JSON para `boundaries` y `porTalla`, repositorio genérico de fila única, `DbSet`s nuevos, registro en DI), WebApi (`AdminEndpoints` con los 8 endpoints y ejemplos Swagger).
- `backend/tests`: invariantes de los 4 agregados, validadores (cada 400), use cases (default sin fila / crear / reemplazar conservando orden), registro en DI.
- `backend/ENDPOINTS.md`: Admin hacia 8🟢 y total actualizado. `backend/oas.json` no cambia.
- **Cambio abierto `backend-modulo-iniciativas`**: su decisión de servir el modelo desde un `StaticEvaluationModelProvider` espejo de los mocks queda superada — con este cambio el proveedor compone el modelo desde los agregados de Admin (o sus valores por defecto) más las piezas estáticas que Admin no administra. Conviene actualizar ese cambio (`/opsx:update`) antes de aplicarlo.
- Sin migraciones ni datos que migrar (tablas nuevas, vacías hasta el primer `PUT`). No es breaking: no existía nada bajo `/admin`.
