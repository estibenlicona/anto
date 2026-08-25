## Why

Una célula sostiene un solo trabajo a la vez: puede tener varias iniciativas en evaluación, pero **sólo una activa**. El backend real ya lo hace cumplir —`ChangeInitiativeStatusUseCase` rechaza activar una segunda con "The squad already has an active initiative"—, pero ni el listado de Células ni el módulo de Iniciativas del frontend lo saben.

- **El listado de Células muestra varias.** La columna de Iniciativas presenta todas las "vigentes" —activas y en evaluación—, hasta tres tallas con un "+N" y, debajo, "2 iniciativas" en lugar del nombre. Mezcla lo que la célula está ejecutando con lo que todavía se está dimensionando, y deja al Chapter Lead sin la respuesta que la columna debería dar de un vistazo: *qué está haciendo esta célula*.
- **Nada avisa antes de activar una segunda.** El mock sólo verifica que la iniciativa tenga talla, y el menú ofrece "Activar" habilitado aunque la célula ya tenga una activa. Contra el mock la segunda activación pasa; contra el backend real falla con un error en inglés que el usuario recibe recién después de confirmar. La regla es del dominio y la interfaz no la refleja.

## What Changes

- **La columna de Iniciativas del listado de Células pasa a mostrar la iniciativa activa, y sólo esa.** Una talla y un nombre por fila, con el mismo tratamiento visual que hoy tiene el caso de una sola. Desaparecen las tallas múltiples, el "+N" y el "N iniciativas".
- **Las iniciativas en evaluación salen de la columna.** Una célula sin activa muestra "Sin iniciativa", aunque tenga varias en evaluación: la columna responde por lo que la célula ejecuta, no por lo que está dimensionando. **BREAKING** respecto del comportamiento hoy especificado.
- **La regla "una sola activa por célula" se hace visible antes de activar.** "Activar" queda deshabilitada en el menú de la fila cuando la célula ya tiene una iniciativa activa, con el motivo a la vista; el mock rechaza esa activación igual que el backend, y el mensaje de rechazo se muestra en español dentro de la confirmación, sin cerrarla.

### Fuera de alcance

- La regla del lado del servidor: ya está implementada y probada en `ChangeInitiativeStatusUseCase`; este change no la toca.
- Reasignar, cambiar o cerrar la iniciativa de una célula desde el listado de Células: la columna informa y no ofrece acciones, y eso no cambia.
- Cuántas iniciativas en evaluación puede tener una célula: siguen siendo las que sean.
- La columna de célula del listado de Iniciativas y la pantalla de evaluación.

## Capabilities

### Modified Capabilities

- `squads`: la columna de Iniciativas del listado pasa de mostrar las vigentes (varias) a mostrar únicamente la activa (una o ninguna).
- `initiatives`: activar pasa a exigir, además de la talla, que la célula no tenga ya una iniciativa activa — y esa condición se ve en el menú antes de intentarlo.

## Impact

- **Contrato**: `SquadDto.initiatives: SquadInitiativeDto[]` pasa a `SquadDto.activeInitiative: SquadActiveInitiativeDto | null`. El backend .NET todavía no sirve los campos calculados de la célula (brecha ya documentada), así que el cambio de forma no rompe nada del lado real; el adapter sigue tolerando la ausencia.
- Frontend — Células: `src/features/squads/services/squadService.ts`, `adapters/SquadAdapter.ts`, `components/SquadsList.tsx`.
- Frontend — Iniciativas: `adapters/InitiativeAdapter.ts` (`canActivate`), `components/InitiativesList.tsx` (motivo del deshabilitado), `components/StatusConfirmDialog.tsx`.
- Mocks MSW: `handlers/squads.handlers.ts` (`initiativesOf` deriva hoy todas las no cerradas), `handlers/initiatives.handlers.ts` (`PUT /initiatives/:id/status`) y `initiatives.seeds.ts` si alguna célula quedara sembrada con dos activas.
- Pruebas: `SquadsList.test.tsx`, `SquadAdapter.test.ts`, `InitiativesComponents.test.tsx`, `initiativeHooks.test.ts`, `squads.handler.test.ts` (hoy afirma dos iniciativas en una célula) e `initiatives.handler.test.ts`.
