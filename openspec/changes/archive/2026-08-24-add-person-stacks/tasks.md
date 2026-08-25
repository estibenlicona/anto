## 1. Mock y contrato

- [x] 1.1 `personService.ts`: `PersonStackDto { name, level, isPrimary }`, `PersonDto.stacks`, `PeopleStats.stackCoverage { distinct, atRisk }`, `list(..., stacks?)` con `stack` repetido, `getStackCatalog()`, `replaceStacks(personId, stacks)`.
- [x] 1.2 `people.handlers.ts`: `STACK_CATALOG` (.NET, React, React Native, Angular, Java, Python, Azure, Bus de Integración, MuleSoft, AS400, Kafka, SQL Server, Power BI); seeds de `stacks` por persona (principal primero; AS400 y MuleSoft con una sola persona); filtro `stack`; `GET /people/stacks`; `PUT /people/:id/stacks` con 400 (fuera de catálogo, >1 principal, sin principal con stacks); `stackCoverage` en `/people/stats`; `getPeopleSnapshot` incluye stacks.
- [x] 1.3 `personDetailService.ts` / `personDetail.handlers.ts`: `PersonStackDto` del detalle (`name`, `level`, `isPrimary`, `otherCoverers`, `coverers[]`) derivado de los stacks de la persona y del snapshot; borrar `CAPABILITIES_BY_PERSON` y `defaultCapabilityFor` de `personDetail.seeds.ts`.
- [x] 1.4 Tests: `people.handler.test` (filtro por stack, catálogo, PUT válido/400s, stats con cobertura y `atRisk`), `personDetail.handler.test` (stacks derivados con coverers; siguen al PUT).

## 2. Adapters y hooks

- [x] 2.1 `PersonAdapter`: `Person.stacks` ordenados con el principal primero; `PersonDetailAdapter`: `stacks` con `busFactorOne` y `levelLabel` (reemplaza `capabilities`).
- [x] 2.2 `usePeople`: `stacks` / `setStacks` (vuelve a página 1); `useStackCatalog()`; `usePersonStacksMutation()`; `stacksValidation.ts` (`validateStacks`).
- [x] 2.3 Tests de adapters, `usePeople` con filtro por stack, y `validateStacks`.

## 3. Listado y resumen

- [x] 3.1 `PeopleList`: columna **Stacks** con `Tag` (principal primero, 3 + "+N", guion sin stacks) en lugar de **Rol**; `FilterButton label="Stack"` junto al de seniority; `PeopleContainer` pasa catálogo y selección.
- [x] 3.2 `PeopleStatsCards`: card **Cobertura por stack** (`Card`: cifra de stacks distintos, `Badge warning` por stack en riesgo, texto neutro si no hay) en lugar de la de FTE disponible.
- [x] 3.3 Tests de `PeopleList` (Tags y "+N", sin columna Rol, filtro por stack llama con la selección), `PeopleStatsCards` (cobertura con y sin riesgo), `PeopleContainer` con el mock real (filtrar por stack reduce el total).

## 4. Detalle: panel y drawer

- [x] 4.1 `PersonStacksPanel.tsx` (reemplaza `PersonCapabilitiesPanel`): por stack, `SeniorityCard` compacto con etiqueta, `Badge` neutro "Principal", `AvatarGroup max=3` + "N más lo cubren" o `Badge danger` "Bus factor 1"; estado vacío con acción; "Editar" abre el drawer.
- [x] 4.2 `EditStacksDrawer.tsx`: `Combobox multiple` del catálogo para agregar; lista con `SegmentedControl` de nivel por fila y quitar (`Button subtle` + `Icon close`); `Select` de principal; `Alert warning` cuando se quita un stack sin otra cobertura; errores de `validateStacks`; `Guardar` primario; `serverError`.
- [x] 4.3 `PersonDetailContainer`: estado del drawer (`key` por apertura), `usePersonStacksMutation`, toast y `refetch` al guardar.
- [x] 4.4 Tests: panel (principal, coverers, bus factor, vacío, Editar), drawer (agregar desde el catálogo, cambiar nivel, quitar con aviso, principal obligatorio, submit con la lista), container con el mock real (editar stacks se refleja en el panel).

## 5. Verificación

- [x] 5.1 `npx vitest run`, typecheck y lint (sólo baseline); prettier en archivos tocados.
- [x] 5.2 Navegador: Personas (columna Stacks, filtro por stack, card de cobertura), detalle de María (panel Stacks con AS400 en bus factor), drawer (agregar React Native, cambiar principal, quitar AS400 con aviso, guardar) y efecto en listado y card.
- [x] 5.3 Anotar en `proposal.md` (Impact) las brechas de tuip detectadas.
