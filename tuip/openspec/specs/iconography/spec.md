## Purpose

Provee el vocabulario visual del sistema: un set propio de iconos construidos sobre una misma retícula y unas mismas reglas de trazo, con nombres por concepto, para que la interfaz señale acciones y estados de forma uniforme y para cubrir el vocabulario de dominio que ninguna librería abierta tiene.

## Requirements

### Requirement: Librería de iconos del sistema
El sistema SHALL publicar una librería de iconos que cubra la navegación, las acciones, los estados, los datos, las personas y el vocabulario de dominio propio. Cada icono SHALL identificarse por un nombre en kebab-case que designe su concepto y no su dibujo, de modo que el nombre sobreviva a un rediseño de la forma.

#### Scenario: Consumir un icono por su nombre
- **WHEN** una interfaz necesita el icono de una acción del sistema
- **THEN** lo referencia por su nombre de concepto y obtiene el icono correspondiente de la librería

#### Scenario: El nombre no describe el dibujo
- **WHEN** alguien inspecciona el nombre de un icono que representa la capacidad de una célula
- **THEN** lee un nombre que enuncia el concepto, no la forma dibujada

#### Scenario: Vocabulario de dominio cubierto
- **WHEN** una interfaz necesita representar un concepto propio de la gestión de capacidad que ninguna librería abierta define
- **THEN** encuentra un icono para ese concepto dentro de la librería

### Requirement: Construcción uniforme del icono
Todo icono de la librería SHALL construirse sobre una retícula cuadrada con un margen exterior intocable, ocupando el área viva disponible, con un grosor de trazo uniforme que no se escala con el tamaño, terminales y uniones redondas, y solo contorno. El único relleno admitido SHALL ser el punto de estado.

#### Scenario: El trazo no cambia con el tamaño
- **WHEN** un mismo icono se renderiza en el tamaño menor y en el mayor de los admitidos
- **THEN** el grosor de su trazo es el mismo en ambos

#### Scenario: Un icono nuevo se integra sin destacar
- **WHEN** se agrega un icono a la librería y se lo coloca al lado de otros en el tamaño menor
- **THEN** no se distingue de ellos por peso, tamaño ni densidad

### Requirement: Tamaños admitidos del icono
La librería SHALL admitir un conjunto cerrado de tamaños, cada uno con un uso previsto, y SHALL no admitir tamaños intermedios que degraden la nitidez del trazo.

#### Scenario: Elegir el tamaño según el contexto
- **WHEN** quien construye una interfaz necesita un icono dentro de un botón
- **THEN** la documentación le indica qué tamaño corresponde a ese contexto

#### Scenario: Un tamaño fuera del conjunto
- **WHEN** alguien intenta usar un tamaño que no pertenece al conjunto admitido
- **THEN** el sistema no lo ofrece como opción

### Requirement: El icono hereda el color del texto
Un icono SHALL heredar el color del texto al que acompaña y SHALL no traer color propio ni aplicar un rol semántico distinto al del bloque que lo contiene.

#### Scenario: Icono dentro de un bloque de un rol semántico
- **WHEN** un icono acompaña a un texto de un rol semántico determinado
- **THEN** el icono se muestra en el mismo color que ese texto, sin definir un color propio

### Requirement: Accesibilidad del icono
Un icono decorativo que acompaña a un texto SHALL quedar oculto para las tecnologías de asistencia. Un icono que es la única etiqueta de un control SHALL exponer una etiqueta accesible. Ningún icono SHALL ser el único portador de una información: el estado SHALL comunicarse además por texto o por fondo.

#### Scenario: Icono decorativo junto a texto
- **WHEN** un lector de pantalla recorre un control cuya etiqueta es texto acompañado de un icono
- **THEN** anuncia solo el texto, sin nombrar el icono

#### Scenario: Icono como única etiqueta de un control
- **WHEN** un lector de pantalla llega a un control cuyo contenido visible es únicamente un icono
- **THEN** anuncia una etiqueta que describe la acción del control

#### Scenario: El estado no depende solo del icono
- **WHEN** un usuario que no distingue ciertos colores consulta un estado señalado con un icono
- **THEN** puede leer ese estado por su texto o por su fondo, sin depender del icono ni de su color

### Requirement: Método para incorporar un icono nuevo
El sistema SHALL documentar el método para incorporar un icono a la librería, que SHALL incluir la verificación previa de que el concepto no está ya cubierto, la elección del nombre antes del dibujo, la construcción a partir de las figuras guía, la reutilización de elementos existentes, un límite de elementos por icono, y la comprobación de que el icono resultante no desentona junto a los existentes.

#### Scenario: Un concepto ya cubierto
- **WHEN** alguien propone un icono para un matiz de un concepto que la librería ya representa
- **THEN** el método lo dirige a reutilizar el icono existente en vez de dibujar uno nuevo

#### Scenario: Un icono que no se entiende en el tamaño menor
- **WHEN** un icono propuesto no resulta legible en el tamaño menor admitido
- **THEN** el método lo rechaza en vez de incorporarlo

### Requirement: Distribución de los iconos
Los iconos y el componente que los renderiza SHALL distribuirse al proyecto anfitrión por el mismo mecanismo que el resto del código del sistema, de modo que el equipo sea dueño del código resultante.

#### Scenario: Traer los iconos a un proyecto
- **WHEN** un usuario agrega la iconografía a su proyecto con el CLI
- **THEN** el código de los iconos y de su componente queda dentro de su repositorio, como el de cualquier otro componente

### Requirement: El módulo de iconos generado contiene solo geometría
La extracción de iconos SHALL admitir únicamente un conjunto cerrado de elementos y atributos de dibujo, y SHALL rechazar el icono que traiga cualquier cosa fuera de ese conjunto en vez de copiarla al módulo generado. El rechazo SHALL informar qué icono y qué elemento o atributo lo motivó, y SHALL no repararse en silencio: el documento de diseño se edita a mano, y algo inesperado ahí es un problema del documento que conviene ver, no limpiar. El módulo generado SHALL no contener nada que pueda interpretarse como código al importarlo, cualquiera sea el contenido del documento de origen.

#### Scenario: Un icono con un atributo de evento
- **WHEN** un icono del documento de origen trae un atributo que ejecuta código ante un evento
- **THEN** la extracción lo rechaza nombrando el icono y el atributo, y ese contenido no llega al módulo generado

#### Scenario: Un elemento fuera del conjunto admitido
- **WHEN** un icono del documento de origen trae un elemento que no pertenece al conjunto de figuras de dibujo admitidas
- **THEN** la extracción lo rechaza en vez de incorporarlo al módulo generado

#### Scenario: Contenido que en el módulo generado sería código
- **WHEN** el cuerpo de un icono contiene una secuencia que, escrita tal cual en el módulo generado, se interpretaría como una expresión a evaluar en lugar de como texto
- **THEN** el módulo generado la contiene como texto literal, sin que se evalúe al importarlo

#### Scenario: Los iconos existentes siguen extrayéndose
- **WHEN** se corre la extracción sobre el documento de diseño vigente
- **THEN** todos los iconos que la librería ya publica se extraen sin ser rechazados, porque el conjunto admitido se derivó del set existente
