## MODIFIED Requirements

### Requirement: Componentes basados en design tokens
Cada componente SHALL usar exclusivamente los design tokens de Tuya CA (vía clases de Tailwind o CSS Variables) para color, tipografía, espaciado, radio y sombra — sin valores de estilo embebidos que no provengan de un token.

El cumplimiento SHALL verificarse de forma automática y NO SHALL quedar librado a la revisión manual: la verificación SHALL fallar el build cuando el código de un componente contenga un valor de color literal en vez del token equivalente. La verificación SHALL alcanzar al código y no a los comentarios, de modo que una explicación pueda seguir citando el valor concreto de un token sin que eso se confunda con usarlo.

#### Scenario: Cambio de token de marca se refleja en el componente
- **WHEN** un token de color usado por Button cambia de valor
- **THEN** el Button renderizado refleja el nuevo color sin modificar el código del componente

#### Scenario: Un color literal falla el build
- **WHEN** el código de un componente introduce un valor de color literal donde existe un token equivalente
- **THEN** la verificación automática falla y reporta el archivo y la línea donde aparece

#### Scenario: Un comentario puede citar el valor de un token
- **WHEN** un comentario del código de un componente menciona el valor concreto de un token para explicar una decisión
- **THEN** la verificación automática pasa, porque ese valor no participa del estilo renderizado

## ADDED Requirements

### Requirement: Opciones del componente LevelMeter
El componente LevelMeter SHALL representar una posición dentro de una escala ordinal discreta como una fila de segmentos de igual ancho, donde los segmentos hasta la posición alcanzada aparecen llenos y los restantes vacíos. SHALL aceptar la cantidad de pasos de la escala, con cuatro como valor por defecto, de modo que una escala futura de otra longitud lo reutilice sin bifurcarlo.

Los segmentos SHALL repartir el ancho disponible entre sí con una separación uniforme tomada de los alias de espaciado del sistema, nunca de un valor suelto. Los segmentos llenos SHALL usar el paso de relleno del matiz de acento que el componente recibe; los vacíos SHALL dibujarse sobre la superficie neutra con un aro que los mantenga distinguibles del fondo sobre el que se los coloque.

LevelMeter NO SHALL dibujar fondo ni borde propios alrededor de la fila de segmentos: se apoya en lo que lo contenga, que es lo que le permite ir dentro de otra pieza sin recortarla.

LevelMeter NO SHALL comunicar su valor únicamente por color: SHALL exponer a tecnologías de asistencia la posición alcanzada y el total de pasos de la escala.

El componente SHALL exportarse desde el paquete publicado y SHALL declararse en el manifiesto del catálogo con su estado de madurez, de modo que aparezca en el inventario del sistema junto con los demás componentes.

#### Scenario: Posición dentro de la escala
- **WHEN** LevelMeter recibe una posición dentro de una escala de cuatro pasos
- **THEN** muestra llenos los segmentos hasta esa posición y vacíos los restantes, todos del mismo ancho

#### Scenario: Escala de otra longitud
- **WHEN** LevelMeter recibe una cantidad de pasos distinta de la de por defecto
- **THEN** dibuja esa cantidad de segmentos, repartiendo entre ellos el mismo ancho disponible

#### Scenario: Los segmentos se distinguen del fondo que los sostiene
- **WHEN** LevelMeter se coloca sobre cualquiera de las superficies del sistema, en tema claro u oscuro
- **THEN** tanto el relleno de los segmentos llenos como el aro de los vacíos alcanzan al menos 3:1 contra esa superficie

#### Scenario: El valor llega a tecnologías de asistencia
- **WHEN** un lector de pantalla recorre un LevelMeter
- **THEN** anuncia la posición alcanzada y el total de pasos, sin depender de que el usuario perciba el color de los segmentos

#### Scenario: Presente en el inventario del sistema
- **WHEN** se consulta el manifiesto del catálogo de componentes
- **THEN** LevelMeter figura con su nombre, su descripción, su estado de madurez y sus dependencias internas

### Requirement: Distinción de uso entre LevelMeter y SegmentedBar
El sistema SHALL mantener LevelMeter y SegmentedBar como piezas distintas, y la documentación SHALL establecer cuál corresponde a cada caso: LevelMeter cuenta pasos de una escala ordinal cerrada, donde los segmentos son iguales entre sí y lo que varía es cuántos están llenos; SegmentedBar reparte un total entre categorías, donde lo que varía es el ancho de cada segmento. NO SHALL usarse LevelMeter para representar proporciones ni SegmentedBar para representar un nivel dentro de una escala.

#### Scenario: Representar un nivel alcanzado
- **WHEN** una interfaz necesita mostrar en qué paso de una escala cerrada se encuentra algo
- **THEN** usa LevelMeter, cuyos segmentos son de ancho igual y se llenan hasta la posición alcanzada

#### Scenario: Representar una distribución
- **WHEN** una interfaz necesita mostrar cómo se reparte un total entre varias categorías
- **THEN** usa SegmentedBar, cuyos segmentos toman un ancho proporcional a su valor

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

### Requirement: Dimensión fija de SeniorityCard
SeniorityCard SHALL ocupar un ancho fijo, idéntico en los cuatro niveles, y ese ancho NO SHALL variar con el nivel mostrado ni con la longitud de su etiqueta: la etiqueta más larga de la escala SHALL entrar sin recorte, y las cortas SHALL dejar aire en vez de encoger la pieza. El alto SHALL ser fijo también, con un valor para la densidad amplia y otro para la compacta, y ambas medidas SHALL incluir el borde dentro de la caja en vez de sumarlo por fuera.

Ese ancho constante es lo que permite comparar el nivel de una fila con el de otra de un vistazo; un ancho que dependa del texto convertiría la comparación en una ilusión. El alto constante es lo que mantiene parejas las filas de un listado, incluidas las que no tienen dato.

#### Scenario: El ancho no depende del nivel
- **WHEN** se renderizan las cuatro cards de la escala, una por nivel
- **THEN** las cuatro miden exactamente el mismo ancho

#### Scenario: La etiqueta más larga entra sin recorte
- **WHEN** se renderiza la card del nivel cuya etiqueta es la más larga de la escala
- **THEN** la etiqueta se muestra completa, sin truncamiento ni ajuste a dos líneas, dentro del mismo ancho que las demás

#### Scenario: Alto por densidad
- **WHEN** se renderiza la misma card en densidad amplia y en densidad compacta
- **THEN** cada una toma el alto fijo de su densidad, con el borde contenido dentro de esa medida en ambos casos

#### Scenario: Comparación entre filas
- **WHEN** varias cards de niveles distintos aparecen en filas sucesivas de un listado
- **THEN** todas se alinean en el mismo ancho, de modo que sus medidores queden comparables entre sí

#### Scenario: El estado vacío conserva la dimensión
- **WHEN** una fila sin nivel asignado aparece entre filas que sí lo tienen
- **THEN** su card ocupa exactamente la misma dimensión, sin desalinear la columna

### Requirement: Accesibilidad de SeniorityCard
SeniorityCard NO SHALL comunicar el nivel únicamente por color. La etiqueta textual con el nombre del nivel SHALL acompañar siempre al medidor; cuando una variante de ancho reducido omita la etiqueta visible, el nombre del nivel SHALL viajar igualmente en el nombre accesible del componente y en su tooltip.

El contraste SHALL verificarse de forma automatizada y no en la revisión manual: la etiqueta SHALL alcanzar al menos 4.5:1 contra las superficies del sistema sobre las que la card puede quedar apoyada, y los segmentos y sus aros SHALL alcanzar al menos 3:1 contra esas mismas superficies.

#### Scenario: La etiqueta acompaña al medidor
- **WHEN** se renderiza una SeniorityCard en su forma habitual
- **THEN** el nombre del nivel aparece como texto, y el color del medidor no es el único canal

#### Scenario: Variante sin etiqueta visible
- **WHEN** se renderiza la variante de ancho reducido, que no muestra la etiqueta
- **THEN** el nombre del nivel sigue disponible en el nombre accesible del componente y en su tooltip

#### Scenario: Contraste de la etiqueta verificado automáticamente
- **WHEN** corre la verificación automatizada sobre las superficies donde la card puede apoyarse
- **THEN** el color de texto de la etiqueta alcanza al menos 4.5:1 contra cada una, y la verificación falla si no llega

#### Scenario: Contraste de los segmentos verificado automáticamente
- **WHEN** corre la verificación automatizada sobre los cuatro matices y esas mismas superficies
- **THEN** los segmentos y sus aros alcanzan al menos 3:1, y la verificación falla si alguno no llega
