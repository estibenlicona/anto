## Context

`SpanMatrixContainer` apila con `space-y-6`: un bloque de encabezado (h1 "Competencias", descripción de tres líneas y, a la derecha, "N brechas a la vista"), el `Alert` opcional de error del resumen, `SpanSummaryCards`, y luego —cuando hay matriz— `SpanControls`, el aviso de pendientes con su botón "Abrir evaluaciones" (navega a `/app/lead/personas`) y la zona de matriz + columna de apoyo. `LeadCareerPlanPage` es un one-liner sin `h1` propio.

`SpanControls` ya recibe `span` completo y ya tiene un lado derecho: cuando `span.narrowed`, muestra "Los totales cuentan sólo las {k} habilidades a la vista, de {total}." con un comentario que justifica decirlo junto al control que lo provoca. El contador del encabezado usa `span.totalGaps`, que también sigue al recorte. `SpanCellDetail` ofrece "Evaluar a <nombre>" desde cada celda (`onAssess`).

El mecanismo de la franja del breadcrumb (`useLeadBreadcrumbActions`) existe y lo usan Células, Personas y Ausencias; esta vista no lo necesita. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Misma silueta que las otras pantallas del lead: sin encabezado, resumen arriba, `gap-2`, `h1` accesible con el texto del breadcrumb.
- El contador de brechas junto a lo que lo cambia, y una sola frase cuando hay recorte.
- Un solo camino para evaluar: el detalle de la celda.

**Non-Goals:**
- Publicar algo en la franja del breadcrumb (no hay acción primaria).
- Tocar `SpanSummaryCards`, `SpanMatrixTable`, `SpanCellDetail`, `SpanFocusSkills`, `SpanPendingWork` ni el detalle de persona (`competencias/:personId`).
- Cambiar el aviso de pendientes más allá de quitarle el botón.

## Decisions

**1. El contador va al lado derecho de `SpanControls`, sin props nuevas.**
`SpanControls` ya recibe `span` y ya es dueño del lado derecho de esa fila; `totalGaps` está ahí. Alternativas: (a) franja del breadcrumb — lo aleja de los controles que lo cambian y lo pone donde otras pantallas ponen su acción, que no es; (b) dentro de la card de brechas críticas — esa card cuenta el span entero a propósito (hay un test que lo defiende) y mezclar las dos cifras es el error que el rótulo "a la vista" evita. La fila de controles es el "Mostrando N" de esta tabla.

**2. Contador y aviso de recorte se funden en una frase; el aviso deja de decir "a la vista".**
Con recorte, poner "6 brechas a la vista" junto a "Los totales cuentan sólo las 5 habilidades a la vista, de 9." repite la locución en una línea. Texto resultante: sin recorte, `{n} brecha(s) a la vista`; con recorte, `{n} brecha(s) a la vista. Los totales cuentan sólo las {k} habilidades visibles, de {total}.` Un único `<p>`; el test del recorte cambia su regex de "a la vista, de 9" a "visibles, de 9". Se conserva el comentario que explica por qué el aviso vive junto al control.

**3. Se quita sólo el botón del aviso de pendientes; el aviso se queda.**
El aviso informa de cuántas personas no tienen evaluación cerrada; el botón mandaba al listado de Personas, donde todavía había que encontrar a quién evaluar. El detalle de la celda ya ofrece "Evaluar a <nombre>" para la persona concreta: es el camino correcto y ya tiene prueba. El comentario del código que defendía el botón ("enterarse … y no poder ir a abrirlas deja al lector con el problema y sin el camino") se reescribe para señalar dónde está el camino ahora. El test "ofrece abrir las evaluaciones que faltan" pasa a afirmar el aviso sin botón.

**4. `h1` sr-only en `LeadCareerPlanPage` con el texto "Competencias".**
Es lo que dice el breadcrumb (`leadRouteTitles["lead-competencias"]`), a diferencia de Células/Personas/Ausencias donde el breadcrumb lleva "Gestionar …". Patrón de `LeadPeoplePage`.

**5. `space-y-6` → `flex flex-col gap-2` en la raíz.**
Mismo valor que los otros tres módulos. Los hijos condicionales (`Alert`, `Skeleton`, `EmptyState`, el fragmento de controles + aviso + matriz) ya son bloques directos, así que el cambio de `space-y` a `gap` no altera el orden ni exige envolver nada.

**6. La leyenda pasa del pie del mapa al final de la columna de apoyo.**
Ajuste pedido tras la revisión visual: la leyenda era una card suelta debajo de la matriz, que con muchas filas quedaba fuera de la vista justo cuando hace falta y, como única card al pie, parecía otra sección. En la columna de apoyo va última —detalle de celda, brechas concentradas, pendientes y leyenda—, porque es referencia y no acción, y la zona del mapa se queda sólo con la tabla. `SpanLegend` no cambia; su nota ya cabe en los 20rem de la columna.

**7. Se quita el control de orden; el orden queda fijo por brechas.**
Ajuste pedido tras la revisión visual. "Por brechas" era el valor por defecto y es lo que la matriz existe para mostrar; "Por nombre" era una decisión más sin una tarea que la pidiera. `SpanControls` se queda con el recorte de habilidades; el contenedor pasa `sort: "gaps"` constante al hook y el adaptador conserva `SpanSort` por si vuelve. Reemplaza lo que la decisión 1 decía del "lado derecho de `SpanControls`".

**8. Fila de notas sobre el mapa; el filtro, dentro de la columna del mapa.**
También pedido tras la revisión: el aviso de pendientes y el contador de brechas a la vista comparten una fila (`justify-between`, contador con `ml-auto` para quedar a la derecha aunque no haya pendientes), y el filtro de habilidades baja a la columna del mapa, justo encima de la tabla y con su `gap-2`, porque recorta las columnas que se ven debajo. El contador sale de `SpanControls` a `SpanVisibleGaps` (mismo texto y misma frase fundida) para que cada pieza tenga un solo lugar. Sustituye a las decisiones 1 y 2 en cuanto a ubicación; el texto no cambia.

**9. La columna de apoyo es elástica: `flex-1` + rejilla `auto-fit`.**
Pedido tras la revisión: con `lg:w-80` fijo, todo lo que el mapa no usaba a la derecha quedaba en blanco. Ahora el `aside` toma el resto de la fila (`flex-1 min-w-[20rem]`) y reparte sus cards con `grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]` e `items-start`: una columna en 20–36rem, dos o tres cuando hay sitio. El `flex-wrap` del padre sigue mandándola debajo del mapa cuando ni 20rem caben al lado, y ahí la rejilla se reparte igual. El detalle de celda entra en la rejilla como una card más; `items-start` evita que estire a sus vecinas.

## Risks / Trade-offs

- [Alguien busca "Abrir evaluaciones" desde el aviso] → El detalle de cualquier celda de una persona sin evaluación lo ofrece; se verifica en la revisión visual.
- [El contador a la derecha compite con el aviso de recorte en anchos estrechos] → Es un único `<p>` con `text-body-sm`; con `flex-wrap` en la fila baja de línea entero, no se parte por la mitad.
- [Tests que localizan el contador por texto suelto] → El único (`/6 brechas a la vista/`) sigue encontrándolo; se añade un assert de que está dentro de la fila de controles.
