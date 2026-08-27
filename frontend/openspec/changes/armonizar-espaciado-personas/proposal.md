## Why

El módulo de personas es el que queda por armonizar. Su listado (`/app/lead/personas`) mezcla todavía dos medidas de separación —8px (`gap-2`) entre resumen y tabla, 16px (`gap-4`) entre las cards del resumen— cuando células, ausencias, iniciativas, backlog y facturación ya usan una sola de 12px (`gap-3`); `armonizar-espaciado-celulas` lo dejó anotado como "change gemelo". Y el detalle de persona (`/app/lead/personas/:id`) va por libre: 24px entre bloques, 16px entre cards y entre columnas, y filas de panel de 10px de alto de relleno (`py-2.5`) junto a cabeceras de 12px (`py-3`). Son medidas heredadas, no decisiones, y al pasar de una pantalla a otra se nota.

## What Changes

- **Listado de personas**: la separación vertical entre resumen y listado sube de 8px a 12px (`gap-2` → `gap-3`) y la separación entre las tres cards del resumen baja de 16px a 12px (`gap-4` → `gap-3`). Misma regla y misma redacción que `squads-list`.
- **Detalle de persona**: toda la separación entre piezas pasa a 12px (`gap-3`): entre los bloques del contenido (encabezado, cards, paneles; hoy `gap-6`), entre las cards de resumen (hoy `gap-4`), entre las dos columnas de paneles y entre los paneles apilados en cada columna (hoy `gap-4`).
- **Filas de los paneles del detalle**: el relleno vertical de las filas de stacks, de células sugeridas y de la señal de asignación pasa de 10px a 12px (`py-2.5` → `py-3`), el mismo que ya llevan la cabecera de panel y las filas del perfil.
- No cambia: el relleno interior de las cards y de los paneles (`p-4`, `gap-2`), los estados vacíos de stacks y de horas por sprint (`py-4`, `py-6`: son bloques centrados, no filas), el pill del encabezado (`py-0.5`), el encabezado del detalle por dentro (`gap-6`/`gap-4` entre avatar, nombre y acciones: medidas de una pieza, no separación entre bloques), y los drawers de edición.

## Capabilities

### New Capabilities
- `person-detail-layout`: disposición del detalle de persona — la única medida de separación entre sus bloques, cards, columnas y paneles, y el alto de relleno de las filas de sus paneles.

### Modified Capabilities
- `people-list`: se retira "La vista usa un espaciado vertical compacto" (8px sólo en vertical) y se añade "La vista usa una única medida de separación" (12px en vertical y entre cards), igual que en `squads-list`.

## Impact

- `src/features/people/PeopleContainer.tsx`: raíz `gap-2` → `gap-3`.
- `src/features/people/components/PeopleStatsCards.tsx`: grid `gap-4` → `gap-3` (se conservan `sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]`).
- `src/features/people/PersonDetailContainer.tsx`: raíz `gap-6` → `gap-3`; grid `xl:grid-cols-[7fr_5fr]` `gap-4` → `gap-3`; las dos columnas `flex flex-col gap-4` → `gap-3`.
- `src/features/people/components/detail/PersonDetailStatsCards.tsx`: grid `gap-4` → `gap-3`.
- `src/features/people/components/detail/PersonStacksPanel.tsx`, `PersonUnassignedPanel.tsx`: filas `py-2.5` → `py-3`. `PersonAssignmentPanel.tsx`: la caja `Signal` `py-2.5` → `py-3`.
- Tests: asserts de clase en `PeopleContainer.test.tsx`, `PeopleStatsCards.test.tsx`, `PersonDetailContainer.test.tsx` y `PersonDetailComponents.test.tsx` (hoy ninguno afirma sobre `gap-*` ni `py-*` en el módulo).
- Fuera de alcance: el detalle de célula (`SquadDetailContainer`, `gap-6`), que sigue con su propia anatomía; los drawers (`PersonFormDrawer`, `EditStacksDrawer`, `ReassignPersonDrawer`); cualquier servicio, hook o contrato.
