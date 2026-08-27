## Context

`BacklogContainer` apila hoy sus bloques con `gap-5`, empezando por `BacklogHeader`: título "Backlog", una línea de descripción y, a la derecha, un bloque de 20rem con el texto "N clasificadas hoy · quedan M de T" y un `Progress` "Progreso del día". Debajo, un grid `lg:grid-cols-[22rem_1fr]` con `gap-4` reparte la cola (`BacklogQueue`) y el panel de la historia en curso (`CurrentStoryPanel`). `LeadBacklogPage` es un one-liner sin `h1` propio, así que el único encabezado de nivel 1 de la pantalla es el visible del header.

El mecanismo del shell ya existe: `useLeadBreadcrumbActions(node)` publica un `ReactNode` en la franja del breadcrumb mientras el componente está montado y lo limpia al desmontar; fuera del provider es un no-op. `ChapterLeadLayout` pinta la franja como `flex items-center justify-between` con `py-3` y lo publicado dentro de un `flex shrink-0 items-center gap-2`. Células, personas y ausencias ya lo consumen (`compactar-vista-celulas`, `-personas`, `-ausencias`). Este change lo consume; no lo toca. Ver proposal.md — Why.

La diferencia con esas tres: aquí no sube un control sino un dato de solo lectura que depende del estado de carga (`summary` es `null` hasta la primera respuesta) y que cambia con cada mutación. Además `BacklogContainer.test.tsx` usa ese mismo texto como centinela de carga en casi todos sus casos.

## Goals / Non-Goals

**Goals:**
- Recuperar el alto del encabezado para la cola y el panel, sin perder el resumen del día.
- Dejar un único `h1`, `sr-only`, coincidente con el breadcrumb.
- Una sola medida de separación entre bloques (12px) en vertical y en horizontal, igual que ausencias.

**Non-Goals:**
- Tocar el shell (`LeadBreadcrumbContext`, `ChapterLeadLayout`).
- Tocar `BacklogQueue`, `CurrentStoryPanel`, `DecisionCards`, `RejectItemDrawer`, los hooks, el servicio o el adaptador.
- Cambiar el interior de las cards (los `px-5`, `gap-2.5`, `gap-3` propios de cola y panel): son medidas internas, no separación entre bloques de la pantalla.
- Cambiar el flujo de clasificar/saltar/rechazar/deshacer, los atajos de teclado o el filtro `?persona=`.

## Decisions

**1. Se publica el texto del resumen con la barra de progreso estrecha, en línea, a su derecha.**
La franja es una banda de navegación de una línea (`py-3`, botones `size="small"`). El `Progress` de hoy (20rem, apilado bajo el texto en un bloque `flex-col`) le daría dos líneas y rompería la altura que células y personas fijaron. Se conserva la barra —decisión del usuario al revisar la propuesta— pero en una fila `flex items-center gap-2`: primero el texto (`whitespace-nowrap`), luego el `Progress` dentro de un envoltorio `w-32 shrink-0` (8rem), que a la altura de la franja se lee como un indicador y no como un bloque. El ancho va en el envoltorio y no en el `className` de `Progress` porque el componente trae `w-full` de fábrica y no lo anula: visto en la implementación, con `w-32` en el propio `Progress` el porcentaje dentro del flex shrink-to-fit colapsaba el texto a tres líneas y la franja crecía a 90px. La fila lleva `h-8`, la altura del botón `small` que publican las otras pantallas, para que la franja mida lo mismo (56px) en las cuatro. Se mantiene el `label="Progreso del día"` para el `progressbar` accesible. Alternativas descartadas: (a) retirar la barra y dejar sólo el texto — el texto da la proporción, pero se pierde la lectura de un vistazo del avance del día; (b) dejar la barra en el contenido como fila propia sobre el grid — gasta justo la fila que este change quiere recuperar; (c) barra a la izquierda del texto — la cifra es lo que se lee primero, la barra la confirma. El ancho exacto se ajusta en la verificación visual (tasks 4.3) sin tocar la spec, que fija "del orden de 8rem".

**2. `BacklogHeader` se sustituye por un componente pequeño `BacklogDaySummary`, que es lo que se publica.**
El resumen tiene detalle de markup (cifras en `<b>` con `tabular-nums` y color por defecto sobre texto `subtle`, más el `Progress` con su `label`) y hoy tiene su propio test en `BacklogComponents.test.tsx`. Conservarlo como componente propio en `components/` (`BacklogDaySummary`, prop `summary: BacklogSummary`) mantiene ese test aislado —texto y `progressbar`— y deja el contenedor sin markup inline. Se elimina `BacklogHeader.tsx`. Alternativa descartada: inline en el `useLeadBreadcrumbActions` del contenedor — funciona, pero el único test del resumen pasaría a depender del render completo del contenedor.

**3. El nodo publicado depende de `summary`: `null` cuando no hay resumen.**
`useLeadBreadcrumbActions(summary ? <BacklogDaySummary summary={summary} /> : null)`. Publicar `null` es el mismo estado que "sin acciones" para la franja (`ChapterLeadLayout` no pinta nada si `actions` es falsy), así que en la primera carga la franja muestra sólo el breadcrumb, y en cuanto llega el resumen aparece el texto. El hook vuelve a correr en cada render, así que cada `refetch` tras clasificar/saltar/rechazar/deshacer actualiza el texto solo. Sin memoización, igual que en las otras tres pantallas (ver la nota sobre los dos contextos en `LeadBreadcrumbContext`).

**4. `LeadBacklogPage` pasa de one-liner a `div` con `h1` `sr-only`.**
Hoy no envuelve nada porque el `h1` visible del header cubría el landmark; al retirarlo hay que reponerlo, con el texto del breadcrumb ("Gestionar Backlog", `navigation.ts`), igual que `LeadPeoplePage` y `LeadAbsencesPage`. Se añade `LeadBacklogPage.test.tsx` que afirme que es único.

**5. `gap-3` en la raíz y en el grid cola/panel; nada más.**
La raíz pasa de `gap-5` a `gap-3` y el grid `lg:grid-cols-[22rem_1fr]` de `gap-4` a `gap-3`, con lo que vertical y horizontal comparten los 12px que ausencias ya fijó y que el shell usa para su `py-3`. "En todos los sentidos" se interpreta como las dos direcciones de separación entre bloques; los paddings y gaps interiores de `BacklogQueue`, `CurrentStoryPanel` y `DecisionCards` son ritmo interno de cada card y homogeneizarlos a 12px los dejaría más apretados de lo que hoy están sin que lo pidiera nadie. Queda anotado en la spec como fuera de la regla.

**6. Los tests del contenedor montan `LeadBreadcrumbProvider` con una sonda que pinta `actions`.**
No es opcional: `findByText(/clasificadas hoy/)` es el centinela de carga de casi todos los tests de `BacklogContainer.test.tsx` y dos de ellos afirman el texto actualizado tras clasificar. Sin la sonda el texto no se renderiza y toda la suite falla. Se replica `BreadcrumbActionsProbe` de `PeopleContainer.test.tsx`. Los asserts sobre el texto no cambian de contenido ("1 clasificadas hoy · quedan 9 de 10", etc.); sólo su ubicación.

## Risks / Trade-offs

- [Texto más barra en la franja compiten visualmente con el breadcrumb] → Aceptado: es una línea corta en `text-body-sm` `subtle` con las cifras en color por defecto y una barra de 8rem; se verifica en el navegador junto a células y personas. Si pesa demasiado, bajar las cifras a `font-medium` en vez de `<b>` o estrechar la barra son ajustes de una línea.
- [Una barra de 8rem es menos precisa que la de 20rem de hoy] → Aceptado: la cifra exacta está en el texto de al lado; la barra sólo da la lectura de un vistazo.
- [En anchos intermedios el breadcrumb y el resumen pueden pelearse por el espacio] → Lo publicado va en un `shrink-0`; si el breadcrumb se trunca en la revisión manual, la barra es lo primero que se estrecha (una clase), antes que tocar el texto.
- [La franja queda vacía durante la primera carga y "salta" al llegar el resumen] → Aceptado: el breadcrumb ocupa la izquierda y el texto entra a la derecha sin cambiar la altura de la franja (una sola línea `items-center`), así que no hay desplazamiento del contenido.
- [Cuarta copia del patrón `useLeadBreadcrumbActions` + sonda en tests] → Sigue siendo más barata que una abstracción; ya se anotó en ausencias que a la cuarta convenía reconsiderarlo. Se deja para un change aparte si aparece una quinta pantalla o si se quiere unificar las cuatro.
