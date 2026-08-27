## 1. Listado de personas

- [x] 1.1 En `src/features/people/PeopleContainer.tsx`, cambiar el `gap-2` del `div` raíz (`flex flex-col gap-2`) por `gap-3`
- [x] 1.2 En `src/features/people/components/PeopleStatsCards.tsx`, cambiar el `gap-4` del grid del resumen por `gap-3`, conservando `sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]`
- [x] 1.3 Ajustar el comentario de `PeopleContainer.tsx` / `PeopleStatsCards.tsx` si alguno menciona la medida vieja (sólo si hace falta)

## 2. Detalle de persona: separación entre piezas

- [x] 2.1 En `src/features/people/PersonDetailContainer.tsx`, cambiar el `gap-6` del `div` raíz por `gap-3`
- [x] 2.2 En `PersonDetailContainer.tsx`, cambiar el `gap-4` del `grid items-start xl:grid-cols-[7fr_5fr]` y el `gap-4` de las dos columnas `flex flex-col` por `gap-3`
- [x] 2.3 En `src/features/people/components/detail/PersonDetailStatsCards.tsx`, cambiar el `gap-4` del grid de cards por `gap-3`, conservando `sm:grid-cols-2 lg:grid-cols-3`

## 3. Detalle de persona: filas de panel

- [x] 3.1 En `src/features/people/components/detail/PersonStacksPanel.tsx`, cambiar el `py-2.5` de cada `li` por `py-3` (dejar el estado vacío en `py-4`)
- [x] 3.2 En `src/features/people/components/detail/PersonUnassignedPanel.tsx`, cambiar el `py-2.5` de cada `li` por `py-3`
- [x] 3.3 En `src/features/people/components/detail/PersonAssignmentPanel.tsx`, cambiar el `py-2.5` de la caja `Signal` por `py-3`

## 4. Tests

- [x] 4.1 En `src/features/people/__test__/PeopleContainer.test.tsx`, añadir un assert de que el `div` raíz de la vista lleva `gap-3` y no `gap-2`
- [x] 4.2 En `src/features/people/components/__test__/PeopleStatsCards.test.tsx`, añadir un assert de que el grid de las tres cards lleva `gap-3` y no `gap-4`
- [x] 4.3 En `src/features/people/__test__/PersonDetailContainer.test.tsx`, añadir asserts de que la raíz del detalle y el grid de dos columnas llevan `gap-3` (y no `gap-6`/`gap-4`)
- [x] 4.4 En `src/features/people/components/detail/__test__/PersonDetailComponents.test.tsx`, añadir asserts de que el grid de `PersonDetailStatsCards` lleva `gap-3`, y de que una fila de `PersonStacksPanel` y una de `PersonUnassignedPanel` llevan `py-3` y no `py-2.5`

## 5. Verificación

- [x] 5.1 `pnpm test` (suites de people) en verde y `pnpm lint` sin errores nuevos
- [x] 5.2 Revisar en el navegador `/app/lead/personas`, `/app/lead/celulas` y `/app/lead/ausencias` en la misma sesión: misma separación entre resumen y tabla y entre cards en las tres vistas; comprobar que las cards de personas (con `lg:grid-cols-[1fr_1fr_1.3fr]`) no se aprietan al perder 4px
- [x] 5.3 Revisar en el navegador `/app/lead/personas/:id` con una persona asignada y con una sin célula: encabezado, cards y paneles a 12px; filas de stacks, células sugeridas y señal de asignación alineadas con la cabecera del panel; estados vacíos intactos
- [x] 5.4 Confirmar que el detalle de célula (`/app/lead/celulas/:id`) no cambió (fuera de alcance, ver proposal.md — Impact)
