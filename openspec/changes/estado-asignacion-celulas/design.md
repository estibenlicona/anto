## Context

Ver `proposal.md` — Why. Lo relevante para el cómo:

- **La demanda ya existe por iniciativa**: la evaluación guarda `fteExpected`, `fteMin` y `fteMax` (`InitiativeEvaluationDto`), derivados de las bandas de talla (persona-mes ÷ plazo objetivo). Las bandas son parametrizables en Admin.
- **La cobertura ya existe por célula**: `SquadDto.allocatedFte` = Σ dedicación de sus asignaciones (calculado por `squads.handlers` desde el snapshot de allocations vía `enrich`).
- **La regla vieja vive en cuatro lugares**: el DTO (`squadHasOtherActive`), el adapter (`canActivate`), el mock (`initiatives.handlers` rechaza la segunda activación con 400) y el backend real (`ChangeInitiativeStatusUseCase`, fuera de alcance).
- **`squads.handlers` ya importa el snapshot de iniciativas** (`getInitiativesSnapshot`) para calcular `activeInitiativeOf`: el cálculo nuevo es una generalización de lo que hay.
- `dedicationService.ts` declara `activeInitiative` en un DTO que ninguna pantalla consume.

## Goals / Non-Goals

**Goals:**
- Estado de asignación legible por fila del listado de Células, sin peticiones extra (viaja en el mismo `SquadDto`).
- Varias iniciativas activas por célula, con el mismo ciclo Activar/Cerrar de siempre.

**Non-Goals:**
- Backend .NET (mock-first; la alineación de `ChangeInitiativeStatusUseCase` es un change `backend-modulo-*` aparte).
- Cards de resumen de Células e Iniciativas, torre de control, detalle de célula (sus indicadores no cambian).
- Filtrar u ordenar el listado por estado de asignación (posible follow-up).

## Decisions

1. **El contrato de la fila cambia de `activeInitiative` a `activeInitiatives: Array<{ id, name, talla, fteMin, fteMax }>`.** La demanda viaja por iniciativa (no pre-agregada) para que la celda pueda listar cada activa con su talla y el tooltip pueda desglosar; el estado se deriva en el adapter. Alternativa descartada: un campo agregado `assignmentStatus` calculado en el mock — duplicaría en el servidor una regla de presentación y obligaría a otro campo más para el tooltip.
2. **El estado se calcula en `SquadAdapter.toEntity`**: `demandMin = Σ fteMin`, `demandMax = Σ fteMax`, `covered = allocatedFte`. `sin-demanda` si no hay activas; `sub` si `covered < demandMin`; `sobre` si `covered > demandMax`; `en-rango` en el resto (extremos incluidos). Cifras redondeadas con `round1` (el mismo criterio de un decimal del resto de la fila); la comparación se hace sobre los valores sin redondear.
3. **Columna "Asignación" con el mismo tratamiento que `BalanceSignalIcon` de Dedicación**, contigua a Capacidad: sólo el icono (`Tooltip` + span `role=img` enfocable), `trend-up` en peligro Sub-asignada, `check` en éxito En rango, `trend-down` en advertencia Sobre-asignada (advertencia como la holgura del balance: decisión de carga, no contexto), `status-empty` en neutro Sin demanda; el tooltip y el nombre accesible llevan el veredicto entero: etiqueta, desvío ("faltan/sobran N FTE") y "Demanda X–Y FTE · Asignado Z FTE". Sin componente nuevo de tuip.
4. **Columna de iniciativas: una línea por activa** (talla + nombre enlazado), mismo tratamiento visual actual; sin contador ni colapso. El caso típico son 1–3 activas y la fila ya crece por otras columnas. Sin activas: guion + "Sin iniciativa", como hoy.
5. **`canActivate = status !== "Active" && evaluation !== null`**: se borra `squadHasOtherActive` del DTO, del adapter y del mock (el rechazo 400 y el cómputo). Los mensajes del diálogo de confirmación no cambian: activar ya decía "pasará a contar como demanda".
6. **`squads.handlers` generaliza `activeInitiativeOf` → `activeInitiativesOf`**: filtra el snapshot de iniciativas por `squadId` y `status === "Active"`, ordena por nombre (estable entre renders) y proyecta `{ id, name, talla, fteMin, fteMax }` desde la evaluación guardada. Una activa sin evaluación no existe por regla; si apareciera, se omite de la lista (misma tolerancia que hoy tiene el adapter con la talla vacía).
7. **`dedicationService.ts` alinea su tipo** (`activeInitiative` → `activeInitiatives`) sin tocar pantallas: nadie lo consume; se mantiene el mock coherente con un solo contrato de célula.

## Risks / Trade-offs

- [El backend real sigue rechazando la segunda activación] → la app corre 100 % sobre MSW; el change backend de alineación debe salir antes de cablear el módulo real. Queda dicho en proposal y tasks.
- [Filas más altas con varias activas] → aceptado: la información es el punto; el truncado por nombre y el máximo práctico de activas lo acotan.
- [Σ de rangos como demanda agregada suaviza extremos por iniciativa] → aceptado para el listado: es una lectura de célula; el detalle por iniciativa vive en Iniciativas.
- [Estados calculados en el cliente divergen del futuro backend] → el contrato transporta datos crudos (rangos por iniciativa), no el veredicto: cuando el backend exista, servirá lo mismo y el criterio queda en un solo lugar (adapter, con tests).

## Migration Plan

1. Mock e infraestructura de datos (`initiatives.handlers` sin la regla; `squads.handlers` con `activeInitiatives`).
2. Contratos y adapters (initiatives y squads) con sus tests.
3. UI del listado (columna de iniciativas múltiple + columna de estado) con sus tests.
4. Suites completas del front en verde. Rollback: git revert; no hay datos persistidos ni contratos externos afectados.

## Open Questions

- Ninguna bloqueante. Filtrar por estado de asignación queda como posible follow-up si el listado crece.
