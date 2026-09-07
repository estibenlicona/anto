## Why

La asignación nace en Iniciativas: al activar una iniciativa sobre una célula, la célula hereda esa demanda de FTE (calculada en la evaluación) y el resto de su capacidad se lee como BAU. Pero el listado de Células no dice nada de eso: muestra cuánta capacidad tiene asignada cada célula contra el FTE de sus personas, sin compararla nunca con lo que sus iniciativas exigen. El Chapter Lead no puede ver de un vistazo qué células ya están cubiertas, cuáles se quedaron cortas y cuáles tienen holgura. Además, la regla actual de "una sola iniciativa activa por célula" contradice la operación real: una célula sostiene varias iniciativas a la vez, y mientras la regla exista la demanda por célula nunca podrá sumar más de una.

## What Changes

- **BREAKING (regla de dominio): una célula puede tener varias iniciativas activas a la vez.** Se elimina la restricción de activación "la célula ya tiene una activa" en la pantalla de Iniciativas, en el mock y en su contrato (`squadHasOtherActive` deja de existir); "Activar" pasa a exigir sólo evaluación guardada. El backend real hace cumplir hoy la regla vieja en su caso de uso de cambio de estado: alinearlo es un change backend aparte (convención `backend-modulo-*`), esta app corre sobre mocks.
- **El listado de Células muestra las iniciativas activas de cada célula** (todas, ya no "la activa"), cada una con su talla y su nombre como enlace a la evaluación.
- **Nueva lectura de estado de asignación por célula en el listado**: compara el FTE total asignado a la célula (suma de dedicación de sus capacidades) contra la demanda de sus iniciativas activas (suma de los rangos FTE mín–máx que salen de la evaluación). Estados: **Sub-asignada** (por debajo del mínimo, con cuánto falta), **En rango**, **Sobre-asignada** (por encima del máximo, con cuánto sobra; el excedente se lee como BAU) y **Sin demanda** (sin iniciativas activas).
- El contrato de la fila de célula (mock) cambia: `activeInitiative` (uno o ninguno) → `activeInitiatives` (lista) con la demanda FTE mín–máx de cada una.
- Los tests de Iniciativas y Células que codificaban la regla vieja se reescriben.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `initiatives`: se retira la regla "una célula sostiene como mucho una iniciativa activa"; activar exige sólo evaluación guardada. Cambian los escenarios de activación y los estados deshabilitados del menú.
- `squads`: la columna de iniciativa del listado pasa de "la activa" a "las activas" (talla + nombre por iniciativa), y el listado gana el estado de asignación por célula (demanda de las activas contra el FTE asignado, con los cuatro estados y sus cifras).

## Impact

- **`frontend/src/features/initiatives`**: adapter (`canActivate` sin `squadHasOtherActive`), servicio (DTO sin el campo), diálogo de confirmación y tests de la regla.
- **`frontend/src/features/squads`**: servicio y adapter (`activeInitiatives` con demanda), `SquadsList` (columna de iniciativas múltiple + columna/lectura de estado de asignación), tests.
- **`frontend/src/mocks/handlers`**: `initiatives.handlers` (retirar el rechazo de segunda activación y `squadHasOtherActive`), `squads.handlers` (calcular `activeInitiatives` y la demanda desde el store de iniciativas), tests de handlers.
- **`frontend/src/features/dedication/services/dedicationService.ts`**: declara `activeInitiative` en un DTO que ninguna pantalla consume; se alinea el tipo sin impacto visual.
- **Backend .NET**: fuera de alcance; `ChangeInitiativeStatusUseCase` mantiene la regla vieja hasta su change `backend-modulo-*` de alineación (el front corre sobre MSW).
- **Fuera de alcance**: cards de resumen de Células e Iniciativas (sus indicadores no cambian), torre de control, detalle de célula.
