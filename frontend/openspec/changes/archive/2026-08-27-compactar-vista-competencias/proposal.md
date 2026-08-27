## Why

La vista de competencias (`/app/lead/competencias`) abre con un encabezado de módulo —título "Competencias", tres líneas de descripción y, a la derecha, el contador "N brechas a la vista"— que repite lo que el shell ya dice: el breadcrumb muestra "Competencias" y la entrada del menú queda activa. Ese bloque, más un `space-y-6` entre encabezado, cards de resumen, controles y matriz, empuja la matriz hacia abajo. Es la réplica del patrón ya aplicado en Células, Personas y Ausencias (`compactar-vista-*`); dejarla como está rompe la consistencia entre las pantallas del lead.

El contador de brechas, además, está mal ubicado: es una cifra que sigue al recorte de habilidades (el propio comentario del código lo dice), pero vive en el encabezado, lejos de los controles que la cambian, y a la altura de la card de brechas críticas, con la que se confunde. Y cuando la matriz está acotada, la fila de controles ya muestra a la derecha "Los totales cuentan sólo las 5 habilidades a la vista, de 9": dos frases con "a la vista" en la misma pantalla diciendo cosas parecidas.

## What Changes

- Se retira el encabezado visible del módulo (título "Competencias", descripción y el contador). Las cards de resumen pasan a ser lo primero que se ve en el contenido.
- El contador "N brechas a la vista" baja a la **fila de controles** (Habilidades visibles / Orden), alineado a la derecha: junto a lo que decide qué está a la vista, como el "Mostrando N" de una tabla. Cuando la matriz está acotada, contador y aviso de recorte se leen como **una sola frase** ("6 brechas a la vista. Los totales cuentan sólo las 5 habilidades visibles, de 9."), sin repetir "a la vista".
- Se retira el botón "Abrir evaluaciones" que acompaña al aviso de evaluaciones pendientes ("N personas sin evaluación cerrada. Sin evaluación cerrada no hay brecha que medir."). El aviso se conserva; el camino para evaluar ya existe donde corresponde: el detalle de cada celda ofrece "Evaluar a <persona>" para esa persona y esa competencia, que es más preciso que mandar al listado de Personas. Decisión del usuario al proponer el change.
- No se publica nada en la franja del breadcrumb: Competencias no tiene una acción primaria (el "Ir a Personas" del estado vacío se queda donde está). La franja se ve como en cualquier pantalla sin acciones.
- La página gana un `h1` `sr-only` "Competencias" —hoy `LeadCareerPlanPage` es un one-liner y el único `h1` es el visible—, siguiendo el patrón de `LeadPeoplePage` y `LeadSquadsPage`.
- El espaciado vertical entre bloques del contenido baja de `space-y-6` a `gap-2`, igual que en células, personas y ausencias.

## Capabilities

### New Capabilities
- `span-matrix-view`: disposición de la vista de competencias (matriz de brechas) — qué bloques la componen, en qué orden, dónde vive el contador de brechas a la vista y cómo se mantiene el encabezado accesible sin título visible.

### Modified Capabilities
<!-- Ninguna. `lead-shell-page-actions` no cambia: esta vista no publica acciones,
     y la spec ya contempla la franja sin ellas. -->

## Impact

- `src/features/career-plan/SpanMatrixContainer.tsx`: deja de renderizar el bloque de encabezado (título, descripción, contador) y el botón "Abrir evaluaciones" del aviso de pendientes; `space-y-6` → `flex flex-col gap-2`.
- `src/features/career-plan/components/SpanControls.tsx`: pasa a mostrar el contador a la derecha, fundido con el aviso de recorte cuando lo hay. Ya recibe `span`, así que no cambia su firma.
- `src/pages/LeadCareerPlanPage/LeadCareerPlanPage.tsx`: `div` con `h1` `sr-only` "Competencias" más el contenedor.
- Tests: `SpanMatrixContainer.test.tsx` (el contador se busca dentro de la fila de controles; el assert del aviso de recorte cambia de texto; asserts de ausencia del título y la descripción; el test "ofrece abrir las evaluaciones que faltan" se invierte: el aviso sigue, el botón no, y el camino es el "Evaluar a …" del detalle de celda que ya está cubierto). Nuevo `LeadCareerPlanPage.test.tsx`.
- No se toca el shell, `SpanSummaryCards`, `SpanMatrixTable`, la columna de apoyo, los hooks, el adaptador ni el contrato con el backend. El detalle de persona (`competencias/:personId`, `PersonPlanHeader`) queda fuera de alcance.
