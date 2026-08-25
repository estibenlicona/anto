## MODIFIED Requirements

### Requirement: Opciones del componente SegmentedBar
El componente SegmentedBar SHALL representar una distribución como una barra dividida en segmentos proporcionales a su valor, y cada segmento SHALL colorearse por uno de tres vocabularios excluyentes entre sí: un rol de estado (`info`/`warning`/`success`/`danger`, consistente en toda la aplicación), un color categórico (el mismo vocabulario de seis tonos sin significado de estado que ya usan Avatar y Tag), o un tono de acento (el mismo vocabulario ordinal de cuatro matices que usa el medidor de nivel), nunca más de uno a la vez en el mismo segmento. El componente SHALL aceptar además una opción para separar visualmente los segmentos entre sí, redondeando cada uno por separado; por defecto los pinta como una barra continua.

La documentación del componente SHALL distinguir cuándo corresponde cada vocabulario: el rol de estado cuando el color afirma algo (salud, riesgo), el categórico cuando sólo distingue miembros de un conjunto sin orden, y el de acento cuando los segmentos representan los pasos de una escala ordinal — de modo que una distribución por nivel use los mismos matices con que el sistema pinta ese nivel en cualquier otra pieza.

#### Scenario: Suma de segmentos
- **WHEN** SegmentedBar recibe una lista de segmentos con sus valores
- **THEN** el ancho de cada segmento es proporcional a su valor respecto a la suma total de los segmentos

#### Scenario: Color por rol de estado
- **WHEN** un segmento especifica un rol de estado (`info`/`warning`/`success`/`danger`)
- **THEN** el segmento se colorea con el color de ese rol, igual que en el resto del sistema

#### Scenario: Color categórico
- **WHEN** un segmento especifica un color categórico (`gray`/`green`/`blue`/`amber`/`red`/`purple`) en vez de un rol de estado
- **THEN** el segmento se colorea con ese tono, sin implicar ningún significado de estado

#### Scenario: Tono de acento
- **WHEN** un segmento especifica un tono de acento (`slate`/`blue`/`teal`/`purple`) en vez de un rol de estado o un color categórico
- **THEN** el segmento se tiñe con el mismo paso de relleno de ese matiz que usa el medidor de nivel, de modo que el mismo dato viste el mismo color en la barra y en el medidor

#### Scenario: Los vocabularios no se mezclan en un segmento
- **WHEN** un segmento intenta especificar más de un vocabulario de color a la vez
- **THEN** el contrato del componente lo impide: cada segmento declara rol, color categórico o tono de acento, sólo uno

#### Scenario: Segmentos separados
- **WHEN** SegmentedBar recibe la opción de separar sus segmentos
- **THEN** cada segmento se dibuja como una pieza propia, con espacio entre él y el siguiente y con sus esquinas redondeadas, conservando la proporción de su valor

#### Scenario: La barra continua es el comportamiento por defecto
- **WHEN** SegmentedBar se usa sin especificar la opción de separación
- **THEN** los segmentos se pintan pegados entre sí dentro de un único contenedor redondeado, como hasta ahora

### Requirement: Opciones del componente SeniorityCard
El componente SeniorityCard SHALL mostrar el nivel de seniority de una persona como una etiqueta con el nombre del nivel y, debajo, un medidor de cuatro segmentos que indica la posición del nivel dentro de la escala.

SeniorityCard NO SHALL dibujar fondo, borde ni sombra: es un bloque de contenido que se apoya en la superficie donde se lo coloque, no una superficie propia. En consecuencia NO SHALL componerse sobre la superficie Card, que existe justamente para aportar esos tres.

La escala SHALL ser cerrada de cuatro niveles —Principiante, Competente, Avanzado y Experto— y NO SHALL admitir un quinto nivel ni etiquetas libres. Un valor fuera de la escala SHALL renderizar un estado vacío documentado: ni un tono inventado, ni una etiqueta arbitraria, ni un fallo silencioso que deje la celda en blanco sin explicación.

La etiqueta SHALL usar el color de texto neutro del sistema en todos los niveles, y NO SHALL teñirse con el matiz del nivel. El único elemento que toma el color del nivel SHALL ser el medidor: la correspondencia entre nivel y matiz SHALL avanzar de gris a azul, a turquesa y a morado, de modo que la progresión se lea como avance de dominio y no como escala de riesgo. El rojo de marca NO SHALL participar de la escala.

SeniorityCard SHALL construirse componiendo LevelMeter como medidor, y NO SHALL reimplementar por su cuenta la lógica de los segmentos.

El componente SHALL exportarse desde el paquete publicado y SHALL declararse en el manifiesto del catálogo con su estado de madurez y sus dependencias internas.

#### Scenario: Nivel dentro de la escala
- **WHEN** SeniorityCard recibe uno de los cuatro niveles de la escala
- **THEN** muestra su nombre como etiqueta y llena en el medidor la cantidad de segmentos que corresponde a su posición

#### Scenario: Sin superficie propia
- **WHEN** se renderiza una SeniorityCard sobre cualquier superficie
- **THEN** no dibuja fondo, borde ni sombra: se ve la superficie que la contiene

#### Scenario: Valor fuera de la escala
- **WHEN** SeniorityCard recibe un valor que no pertenece a la escala de cuatro niveles
- **THEN** renderiza el estado vacío documentado, sin inventar un tono ni fallar en silencio

#### Scenario: La etiqueta no se tiñe
- **WHEN** se comparan las cuatro cards de la escala una junto a otra
- **THEN** las cuatro etiquetas comparten el mismo color de texto neutro, y lo único que cambia de color entre ellas es el medidor

#### Scenario: Un matiz por nivel en el medidor
- **WHEN** se comparan los medidores de los cuatro niveles
- **THEN** cada uno tiñe sus segmentos llenos con un matiz distinto, y los cuatro avanzan de gris a morado en el orden de la escala

#### Scenario: El rojo de marca queda fuera
- **WHEN** se inspeccionan todos los niveles de SeniorityCard
- **THEN** ninguno usa el rol de color de marca, que sigue reservado a la acción primaria de la vista

#### Scenario: Composición sobre la pieza existente
- **WHEN** cambia el aspecto de los segmentos en LevelMeter
- **THEN** SeniorityCard refleja ese cambio sin que su propio código se modifique

#### Scenario: Presente en el inventario del sistema
- **WHEN** se consulta el manifiesto del catálogo de componentes
- **THEN** SeniorityCard figura con su nombre, su descripción, su estado de madurez y sus dependencias internas, entre ellas LevelMeter
