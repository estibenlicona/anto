# Backend: módulo Capacidad (dedicación) — modelo y lectura

## Why

Undécimo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Capacidad (dedicación) es el módulo más grande que queda: FTE disponible por sprint, referencia histórica (mediana propia y de célula), snapshot sellado al cierre, y una señal de balance sintetizada de seis evidencias concurrentes. Es también el único que depende de una integración real con Azure DevOps para mantenerse actualizado — algo que este backend todavía no tiene con ningún proveedor externo real (el cliente de `CompanyRegistry` ya existe como patrón, pero contra un `BaseAddress` de ejemplo).

Por decisión explícita, este cambio se divide en dos: **éste** entrega el modelo completo de capacidad — Sprint, snapshot por colaborador, FTE disponible, referencia histórica y señal de balance — y los dos endpoints de **lectura** (`GET /dedication/collaborators`, `GET /dedication/collaborators/{personId}`), asumiendo que los snapshots sellados ya existen (sembrados, como en todos los módulos anteriores). Un segundo cambio, posterior, agregará la sincronización real con Azure DevOps (`POST .../sync`, `POST .../collaborators/sync`) con un cliente HTTP del mismo patrón que `CompanyRegistry` — interfaz real, `BaseAddress` de ejemplo hasta que exista una organización real que configurar.

## What Changes

- **Domain — agregado `Sprint`**: nombre único, fechas de inicio y fin, festivos (de calendario, sembrados — la plataforma no administra un calendario de festivos todavía). "Sprint actual" se deriva de la fecha de hoy contra sus fechas, nunca se marca a mano.
- **Domain — agregado `SprintSnapshot`**: la foto de un colaborador en un sprint. Procedencia (`Sealed`/`Provisional`/`Missing`) y fecha de sellado; SP comprometidos al inicio y agregados durante el sprint (de los que se derivan comprometidos totales, no completados y proporción no planificada); SP completados y carry-over (sólo tienen sentido sellado); HUs abiertas a la vez (`wip`, nulo si no se pudo reconstruir — depende de DevOps, fuera de alcance acá); iniciativas concurrentes por épica (congeladas: id y título de la épica, iniciativa mapeada si la hay, puntos); las historias del sprint y el mapa de actividad por día, también congelados. **Sellar** es un método del agregado (quien llama a sellar y cuándo —el job de cierre— es del segundo cambio); acá sólo existe la capacidad de tener snapshots ya sellados.
- **FTE disponible reutiliza `BusinessDayMath` y Ausencias**: días hábiles del sprint menos festivos, vacaciones y ausencias aprobadas (con medias jornadas) que lo tocan, más las "otras indisponibilidades" que trae el propio snapshot (todavía no administradas por la plataforma). El FTE declarado en la asignación a la célula se sigue leyendo, pero no participa en ningún cálculo.
- **Referencia histórica**: mediana (no promedio) de SP comprometidos en los últimos `historyWindowSprints` sprints **sellados** del propio colaborador (parámetro ya existente del Calendario de sprints de Admin), con `sufficient` cuando alcanza `minHistorySprints`; mediana de la célula como SP comprometidos por colaborador de esa célula en la misma ventana, sólo como contexto — nunca sustituto.
- **Señal de balance**: puerto literal de la lógica ya validada del frontend (`balanceSignal.ts`) — seis evidencias (demanda vs histórico propio, demanda por FTE disponible, cumplimiento, carry-over, trabajo no planificado, multitarea), cada una con dirección y umbral; **ningún indicador solo decide**: hace falta una evidencia fuerte o dos concordantes para una señal accionable, y direcciones opuestas caen a "Carga habitual". El contexto de célula (`SameDirection`) se anota y nunca atenúa la señal.
- **Identidad DevOps mínima**: `Person` gana un identificador de Azure DevOps opcional, sólo para saber si hay identidad vinculada (`hasIdentity`) y resolver la señal "No evaluable: sin identidad". El flujo real de **buscar y vincular** una identidad (`GET /devops/users`, `POST /people/{id}/devops-identity`, con su 409 si ya es de otra persona) es de **Detalle de persona**, todavía sin construir; acá el campo se puebla sólo por semilla.
- **Endpoints del contrato**: `GET /dedication/collaborators?sprint=&page=&pageSize=&search=&squadId=` (una fila por persona del chapter en el sprint elegido — el vigente si no se indica —, con los cuatro indicadores resumen y el navegador de sprint), `GET /dedication/collaborators/{personId}?sprint=` (404 si la persona no existe; la cabecera del sprint elegido con capacidad, ejecución, referencia, foco y señal, más la tendencia de la ventana de histórico).
- Fuera de alcance (quedan para el segundo cambio o para otros módulos): `POST /dedication/collaborators/{personId}/sync` y `POST /dedication/collaborators/sync` (integración real con Azure DevOps); el job que sella un snapshot al cierre de un sprint; la reconstrucción del `wip` desde el historial de revisiones de work item; el flujo de vincular identidad DevOps (Detalle de persona); el mapeo real épica↔iniciativa (acá las iniciativas concurrentes viajan congeladas dentro del snapshot, no resueltas contra un catálogo vivo); un calendario de festivos administrable; scope por chapter (pendiente en todos los módulos anteriores).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/real-dedication/spec.md` ya exigen para sus partes de lectura. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregados `Sprint` y `SprintSnapshot` con sus colecciones poseídas, value objects `SnapshotStatus`/`BalanceSignal`/`SquadContext`/`NotEvaluableReason`/`EvidenceDirection`/`EvidenceId`, campo de identidad DevOps en `Person`, contratos de repositorio), Application (cálculo de FTE disponible, referencia histórica, señal de balance —puerto literal de `balanceSignal.ts`—, DTOs del contrato, dos use cases, registro en DI), Infrastructure (configuración EF, repositorios, semillas con sprints y snapshots que cubren cada señal y cada motivo de "no evaluable"), WebApi (`DedicationEndpoints` y ejemplos Swagger).
- `backend/tests`: FTE disponible con festivos/vacaciones/ausencias/medias jornadas, mediana histórica con ventana insuficiente, cada evidencia de la señal con sus umbrales exactos del frontend, la agregación (una fuerte vs. dos concordantes vs. direcciones opuestas), el contexto de célula, y los use cases con cada motivo de "no evaluable".
- `backend/ENDPOINTS.md`: las dos filas de lectura de Capacidad hacia 🟢 (las dos de sincronización siguen 🔴, para el segundo cambio), total actualizado.
- Sin cambios al contrato: `backend/oas.json` ya tiene las 4 rutas y sus esquemas; este cambio implementa 2 de las 4.
- Migración nueva (tablas `Sprints`, `SprintSnapshots` y sus colecciones poseídas, más el campo de identidad DevOps en `People`; vacías salvo por las semillas de desarrollo).
