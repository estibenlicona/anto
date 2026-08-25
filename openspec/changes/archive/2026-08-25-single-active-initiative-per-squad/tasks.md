## 1. Contrato y mock de Células

- [x] 1.1 En `squadService.ts`: reemplazar `SquadInitiativeDto` por `SquadActiveInitiativeDto` (`{ id, name, talla }`, sin `status`, `talla` no nullable) y `SquadDto.initiatives: SquadInitiativeDto[]` por `SquadDto.activeInitiative: SquadActiveInitiativeDto | null`, con el comentario que explique por qué es uno o ninguno.
- [x] 1.2 En `SquadAdapter.ts`: `initiatives` → `activeInitiative: dto.activeInitiative ?? null`, tratando como `null` una activa sin talla.
- [x] 1.3 En `mocks/handlers/squads.handlers.ts`: `initiativesOf` → `activeInitiativeOf`, que busca la iniciativa de la célula con `status === "Active"` y devuelve `{ id, name, talla }` o `null`; actualizar `enrich`.
- [x] 1.4 Revisar `initiatives.seeds.ts`: ninguna célula puede quedar sembrada con dos iniciativas activas; si alguna lo está, dejar una activa y la otra en evaluación.
- [x] 1.5 Actualizar `mocks/handlers/__test__/squads.handler.test.ts` (hoy afirma dos iniciativas en una célula) y `adapters/__test__/SquadAdapter.test.ts` (hoy borra `initiatives` para probar la tolerancia).

## 2. Columna del listado de Células

- [x] 2.1 En `SquadsList.tsx`: eliminar `INITIATIVE_SAMPLE_SIZE`, el `slice`, el `+N`, la rama `"N iniciativas"` y la rama `Sin evaluar`; la celda queda en `Tag` con la talla más el nombre como enlace neutro a `evaluationPath`, o `Sin iniciativa`.
- [x] 2.2 Cambiar el encabezado de la columna de **Iniciativas** a **Iniciativa**.
- [x] 2.3 Actualizar `components/__test__/SquadsList.test.tsx`: célula con activa (talla + nombre enlazado), célula sin activa pero con dos en evaluación (muestra "Sin iniciativa", no cuenta las que están en evaluación), y que ninguna fila muestre "+N" ni "N iniciativas".

## 3. Regla al activar — servicio y mock de Iniciativas

- [x] 3.1 En `mocks/handlers/initiatives.handlers.ts`, en `PUT /:id/status`: al activar, rechazar con 400 y `"La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra."` si existe otra iniciativa de la misma célula, distinta de ésta, con `status === "Active"`.
- [x] 3.2 Agregar `squadHasOtherActive: boolean` a cada fila de `GET /initiatives`, calculado contra todas las iniciativas del mock (no contra la página ni el filtro), y declararlo en el DTO de `initiativeService.ts`.
- [x] 3.3 Cubrir en `mocks/handlers/__test__/initiatives.handler.test.ts`: la segunda activación devuelve 400 con ese mensaje y no cambia estados; reactivar la que ya está activa no choca consigo misma; `squadHasOtherActive` es correcto con la lista paginada y filtrada.

## 4. Regla al activar — interfaz de Iniciativas

- [x] 4.1 En `InitiativeAdapter.ts`: `canActivate` pasa a exigir talla **y** `!squadHasOtherActive`.
- [x] 4.2 `InitiativesList.tsx` no cambia: "Activar" queda deshabilitado por `canActivate`, sin motivo, igual que hoy para una iniciativa sin talla. (Decidido durante la implementación: el motivo exigiría una variante de `MenuItem` que tuip no tiene, para una explicación que no se pidió.)
- [x] 4.3 Verificar que `StatusConfirmDialog` muestra el mensaje del servidor sin cerrarse cuando la activación se rechaza (no traducir ni mapear el texto del backend).
- [x] 4.4 Actualizar `components/__test__/InitiativesComponents.test.tsx` y `hooks/__test__/initiativeHooks.test.ts`: "Activar" deshabilitado cuando la célula ya tiene una activa, habilitado cuando se libera.

## 5. Cierre

- [x] 5.1 Correr las pruebas del frontend y el type-check; no debe quedar ninguna referencia a `SquadDto.initiatives`.
- [ ] 5.2 Recorrer a mano el listado de Células y el de Iniciativas contra los mocks: célula con activa, célula con varias en evaluación y ninguna activa, e intento de activar una segunda en una célula ocupada.
