## Context

`PeopleContainer` apila resumen y listado con `gap-2` (8px), fijado por la spec `people-list` en `compactar-vista-personas`; `PeopleStatsCards` pinta sus tres cards con `grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]` (16px). Es exactamente el punto de partida que tenía células antes de `armonizar-espaciado-celulas`, que lo dejó anotado como change gemelo.

`PersonDetailContainer` apila encabezado, `PersonDetailStatsCards` y la zona de paneles con `gap-6` (24px); la zona es un `grid items-start gap-4 xl:grid-cols-[7fr_5fr]` con dos columnas `flex flex-col gap-4`; las cards de resumen van en `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. Dentro de los paneles (`DetailPanel`), la cabecera lleva `px-4 py-3` y las filas del perfil (`PersonProfilePanel`) `px-4 py-3`, pero las filas de `PersonStacksPanel` y `PersonUnassignedPanel` llevan `py-2.5`, y la caja `Signal` de `PersonAssignmentPanel` `px-3 py-2.5`. Los estados vacíos van con `py-4` (stacks) y `py-6` (horas por sprint).

Todas son clases de Tailwind sobre el elemento; no hay token compartido ni ningún test que afirme sobre ellas. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Que el listado de personas se lea igual que células y ausencias (12px en vertical y entre cards).
- Que el detalle de persona use esa misma medida entre sus piezas, y que sus filas de panel compartan el `py-3` que ya tienen la cabecera y el perfil.
- Dejar ambas reglas cubiertas por asserts de clase, como hizo células.

**Non-Goals:**
- Tocar el detalle de célula (`SquadDetailContainer`, `SquadTeamStatsCards`): sigue en `gap-6`/`gap-4`; si se quiere, es un change gemelo de éste.
- Cambiar el relleno interior de cards y paneles (`p-4`, `gap-2`), los estados vacíos, el pill del encabezado ni las medidas internas de `PersonDetailHeader`.
- Tocar drawers (`PersonFormDrawer`, `EditStacksDrawer`, `ReassignPersonDrawer`) ni el modal de DevOps.
- Introducir una constante o componente compartido de "vista de listado/detalle".

## Decisions

**1. Se cambian los literales en su sitio, sin abstraer.**
Son ocho clases en seis archivos. Una constante compartida entre cinco módulos seguiría sin justificar el acoplamiento (misma decisión que `armonizar-espaciado-celulas`); la spec de cada módulo es donde la medida queda escrita.

**2. "Separación entre piezas" en el detalle son cuatro sitios, y sólo esos.**
Raíz del contenedor (`gap-6`), grid de cards (`gap-4`), grid de dos columnas (`gap-4`) y las dos pilas de paneles (`gap-4`). Los `gap-6`/`gap-4` de `PersonDetailHeader` separan avatar, nombre y acciones dentro de una pieza, y el `gap-4 p-4` de `PersonAssignmentPanel`/`PersonUnassignedPanel` es relleno interior: la spec lo excluye a propósito, con la misma frontera que trazó backlog ("medidas internas, no separación entre bloques").

**3. `py-3` es la medida de fila porque ya es la mayoritaria, no porque sea nueva.**
`DetailPanel` (cabecera) y `PersonProfilePanel` (filas) ya llevan `py-3`; las tres `py-2.5` son las que desentonan. Se sube la minoría a la medida existente en vez de bajar todo a 10px, que además rompería la alineación con la cabecera del panel. La caja `Signal` entra en la regla porque ocupa el mismo sitio que una fila (primera línea del panel de asignación) y se lee como tal.

**4. Los estados vacíos se quedan como están.**
`py-4` (stacks sin datos) y `py-6` (sin horas) son bloques centrados con icono/mensaje, no filas; llevarlos a `py-3` los apretaría contra el borde del panel sin ganar nada. La spec los deja fuera explícitamente para que nadie los "corrija" después.

**5. Se añaden asserts de clase, no de píxeles.**
jsdom no calcula layout. Se afirma `gap-3` en la raíz de `PeopleContainer`, en el grid de `PeopleStatsCards`, en la raíz y en el grid de columnas de `PersonDetailContainer`, y en el grid de `PersonDetailStatsCards`; y `py-3` en una fila de stacks y una de células sugeridas. Es lo que hizo `SquadsContainer.test.tsx`.

## Risks / Trade-offs

- [El detalle pierde 12px entre bloques y entre columnas] → Es la misma densidad que ya tiene el listado; se revisa en el navegador que el encabezado del detalle no quede pegado a las cards y que las dos columnas no se lean como una sola.
- [Las filas de stacks crecen 4px en total] → Un panel con muchos stacks se alarga proporcionalmente; es el precio de alinearlas con el perfil, y el panel no tiene alto máximo que se desborde.
- [El detalle de célula queda como único detalle en `gap-6`] → Aceptado y anotado en el proposal; change gemelo si se quiere.
