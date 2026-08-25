## Why

Dos piezas del catálogo obligan hoy a decir algo que no siempre es cierto.

**`Badge` dibuja un punto en toda variante, y no se puede omitir.** El requisito lo pide explícitamente. Tiene sentido para un badge de **estado** —"En curso", "Cerrada"—, donde el punto es la marca de que algo está pasando. Pero el mismo componente se usa para clasificaciones que no son estados: la criticidad de una célula es un nivel de una escala, no una condición que cambia. Ahí el punto no agrega información y sí ruido: cinco filas con un punto cada una, todos distintos, compitiendo con el texto que ya dice el nivel.

**`CapacityBar` obliga a colorear sus partes con el vocabulario de acento.** Su tipo lo impone —`tone: AccentTone`, obligatorio— y el comentario lo justifica: "las partes son pasos de un mismo todo, no estados". Pero BAU y Transformación **no son pasos de una escala**: son dos categorías, y el acento se documenta como el vocabulario que distingue pasos ordinales sin afirmar nada sobre su estado. El resultado se ve en pantalla: BAU y Transformación usan `sky` y `violet`, los mismos tonos que la escala de seniority, y se confunden con ella. El vocabulario categórico existe justo para esto y el componente no lo acepta.

## What Changes

- **El punto de `Badge` pasa de obligatorio a opcional**, con el punto puesto por defecto: ningún badge existente cambia. El requisito se modifica para decir cuándo corresponde omitirlo —cuando lo que el badge clasifica no es un estado— en vez de prohibirlo.
- **`CapacityBar` acepta el vocabulario categórico en sus partes**, además del de acento, con el mismo criterio que `SegmentedBar`: acento cuando las partes son pasos de una escala, categórico cuando son categorías que no se ordenan entre sí.
- La documentación de los dos dice **cuál elegir y por qué**, que es lo que evita que la próxima pantalla vuelva a tomar prestado el vocabulario equivocado.

### Fuera de alcance

- Cambiar el aspecto de ningún badge ni de ninguna barra existente. Los dos cambios son opciones nuevas con el comportamiento actual como valor por defecto.
- Elegir qué par de colores usan BAU y Transformación: eso es de la pantalla, y va en el change de la app.
- `FilterButton`. Se lo había señalado como el causante de que el filtro se cierre al elegir una opción; se comprobó que no lo es —en aislamiento conserva el popover abierto—, y la causa está en la app.

## Capabilities

### Modified Capabilities

- `component-library`: `Badge` deja de exigir el punto en toda variante y pasa a permitir omitirlo; `CapacityBar` deja de exigir el vocabulario de acento en sus partes y pasa a admitir también el categórico.

## Impact

- tuip: `Badge` y `CapacityBar`, sus pruebas y su documentación.
- **Ningún consumidor cambia de aspecto**: las dos opciones nacen con el comportamiento de hoy como valor por defecto.
- Habilita el change de la app que separa BAU y Transformación de la escala de seniority, y el que saca el punto de los badges de criticidad.
