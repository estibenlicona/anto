## MODIFIED Requirements

### Requirement: Opciones del componente Badge
El componente Badge SHALL representar el estado de un elemento con forma cuadrada (no de píldora, para distinguirse de un control clicable como Chip) y SHALL admitir al menos las variantes semánticas `success`, `info`, `warning`, `danger`, `neutral` y `discovery`. Badge no SHALL usar el rol de color `brand` en ninguna de sus variantes.

Badge SHALL mostrar un punto de color junto al texto **por defecto**, y SHALL permitir omitirlo. El punto marca que lo que el badge dice es una condición del elemento —algo que está pasando y que puede dejar de pasar—; cuando lo que el badge lleva no es un estado sino una clasificación fija, como el nivel de una escala, el punto no agrega información y compite con el texto que ya la da. Omitirlo NO SHALL cambiar ninguna otra cosa del badge: conserva su forma, su variante y su relleno.

El punto NO SHALL ser nunca el único canal de la información: con punto o sin él, el texto del badge SHALL decir por sí solo lo que el badge clasifica.

#### Scenario: Forma cuadrada distinta de un control
- **WHEN** se renderiza un Badge junto a un Chip
- **THEN** el Badge se distingue del Chip por su forma (esquinas cuadradas en vez de píldora)

#### Scenario: Punto de color obligatorio
- **WHEN** se renderiza un Badge de cualquier variante sin pedir que se omita el punto
- **THEN** muestra un punto de color junto al texto: sigue sin poder desaparecer por descuido, y omitirlo exige pedirlo

#### Scenario: Badge sin punto
- **WHEN** un consumidor pide un Badge sin punto para clasificar algo que no es un estado
- **THEN** el badge se dibuja sin el punto y conserva su forma, su variante y su relleno

#### Scenario: Variante sin color de marca
- **WHEN** se consultan las variantes disponibles de Badge
- **THEN** ninguna usa el rol de color `brand`, de modo que un badge nunca se confunde con la acción primaria de la vista

#### Scenario: Estado no distinguible solo por color
- **WHEN** una persona con dificultad para distinguir colores encuentra un Badge, con punto o sin él
- **THEN** puede identificar lo que el badge dice por el texto, no solo por el color del punto o del fondo

### Requirement: Opciones del componente CapacityBar
El componente CapacityBar SHALL representar una capacidad asignada frente a una disponible: una cabecera con `asignado / disponible` seguidos de una unidad opcional (formateados con un decimal y cifras tabulares), el porcentaje de ocupación (`asignado / disponible`, 0 cuando la disponible es 0) coloreado por severidad según un umbral de advertencia configurable (por defecto 85: `success` por debajo, `warning` desde el umbral, `danger` al alcanzar o superar el 100 %), una barra apilada cuyas partes se dimensionan sobre la capacidad disponible (SegmentedBar con `total`), una leyenda con punto, etiqueta y cifra por parte, y una lectura final: lo libre ("N libre", con la etiqueta configurable) o, al alcanzar el tope, un texto de tope (por defecto "Al tope") en color `danger`. Cuando la capacidad asignada es 0 y no hay partes, el componente SHALL mostrar la variante vacía: cifra 0.0 atenuada, barra vacía y un texto configurable (por defecto "Sin capacidad asignada"), sin porcentaje.

El color de cada parte SHALL poder salir del vocabulario de **acento** o del **categórico**, y el consumidor SHALL elegir cuál según lo que las partes sean: acento cuando son pasos de una misma escala, y categórico cuando son categorías que no se ordenan entre sí. Obligar al acento hace que dos categorías tomen prestados los tonos de una escala ordinal del sistema y se confundan con ella. Una parte SHALL declarar uno solo de los dos vocabularios. Los dos vocabularios SHALL estar disponibles para el consumidor con un nombre propio: una opción cuyo tipo no se puede nombrar desde afuera no se puede escribir con tipos, y obliga a quien la use a apoyarse en el alias de otro componente.

#### Scenario: Ocupación con margen
- **WHEN** CapacityBar recibe 1.8 asignado sobre 2.0 disponible, partes BAU 1.1 y Transformación 0.7 y el umbral por defecto
- **THEN** muestra "1.8 / 2.0", "90%" en `warning`, dos tramos de 55 % y 35 % del ancho, la leyenda con 1.1 y 0.7, y "0.2 libre"

#### Scenario: Partes que son categorías
- **WHEN** las partes de una CapacityBar son categorías que no se ordenan entre sí
- **THEN** el consumidor las colorea con el vocabulario categórico, y no toman prestados los tonos de ninguna escala ordinal del sistema

#### Scenario: Partes que son pasos de una escala
- **WHEN** las partes son pasos de una misma escala
- **THEN** el consumidor las colorea con el vocabulario de acento, igual que antes de existir esta opción

#### Scenario: Al tope
- **WHEN** la capacidad asignada iguala o supera la disponible
- **THEN** el porcentaje se muestra en `danger` y la lectura final es el texto de tope en `danger`, sin cifra de libre

#### Scenario: Con espacio
- **WHEN** la ocupación está por debajo del umbral de advertencia
- **THEN** el porcentaje se muestra en `success` y la lectura final es lo libre con un decimal

#### Scenario: Vacía
- **WHEN** la capacidad asignada es 0 y no hay partes
- **THEN** muestra la cifra 0.0 atenuada, la barra vacía y el texto de vacío, sin porcentaje ni leyenda

#### Scenario: Disponible en cero
- **WHEN** la capacidad disponible es 0 pero hay partes asignadas
- **THEN** el porcentaje es 0 sin división por cero y las partes se dimensionan sobre su propia suma
