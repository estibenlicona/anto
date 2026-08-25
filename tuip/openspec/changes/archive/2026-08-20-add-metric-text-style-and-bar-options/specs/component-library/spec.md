## MODIFIED Requirements

### Requirement: Opciones del componente Progress
El componente Progress SHALL representar un valor de avance entre 0 y 100 como una barra horizontal, SHALL saturar su color a la severidad `danger` en vez de desbordar visualmente la barra cuando el valor supera 100, y SHALL aceptar una opción de relleno de marca que reemplaza el color de severidad por el degradado de marca del sistema. Esa opción SHALL ser explícita: por defecto el componente conserva el relleno por severidad.

#### Scenario: Valor dentro de rango
- **WHEN** Progress recibe un valor entre 0 y 100
- **THEN** la porción rellena de la barra es proporcional a ese valor

#### Scenario: Valor sobre el límite
- **WHEN** Progress recibe un valor mayor a 100
- **THEN** la barra se muestra completamente llena con el color de severidad `danger`, sin desbordar su contenedor

#### Scenario: Relleno de marca
- **WHEN** Progress recibe la opción de relleno de marca
- **THEN** la porción rellena usa el degradado de marca en vez del color de severidad

#### Scenario: El relleno por severidad es el comportamiento por defecto
- **WHEN** Progress se usa sin especificar la opción de relleno de marca
- **THEN** conserva el relleno por severidad, sin que el consumidor tenga que pedirlo

### Requirement: Opciones del componente SegmentedBar
El componente SegmentedBar SHALL representar una distribución como una barra dividida en segmentos proporcionales a su valor, y cada segmento SHALL colorearse por uno de dos vocabularios excluyentes entre sí: un rol de estado (`info`/`warning`/`success`/`danger`, consistente en toda la aplicación) o un color categórico (el mismo vocabulario de seis tonos sin significado de estado que ya usan Avatar y Tag), nunca ambos a la vez en el mismo segmento. El componente SHALL aceptar además una opción para separar visualmente los segmentos entre sí, redondeando cada uno por separado; por defecto los pinta como una barra continua.

#### Scenario: Suma de segmentos
- **WHEN** SegmentedBar recibe una lista de segmentos con sus valores
- **THEN** el ancho de cada segmento es proporcional a su valor respecto a la suma total de los segmentos

#### Scenario: Color por rol de estado
- **WHEN** un segmento especifica un rol de estado (`info`/`warning`/`success`/`danger`)
- **THEN** el segmento se colorea con el color de ese rol, igual que en el resto del sistema

#### Scenario: Color categórico
- **WHEN** un segmento especifica un color categórico (`gray`/`green`/`blue`/`amber`/`red`/`purple`) en vez de un rol de estado
- **THEN** el segmento se colorea con ese tono, sin implicar ningún significado de estado

#### Scenario: Segmentos separados
- **WHEN** SegmentedBar recibe la opción de separar sus segmentos
- **THEN** cada segmento se dibuja como una pieza propia, con espacio entre él y el siguiente y con sus esquinas redondeadas, conservando la proporción de su valor

#### Scenario: La barra continua es el comportamiento por defecto
- **WHEN** SegmentedBar se usa sin especificar la opción de separación
- **THEN** los segmentos se pintan pegados entre sí dentro de un único contenedor redondeado, como hasta ahora
