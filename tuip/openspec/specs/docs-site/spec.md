## Purpose

Provee un sitio web navegable (React + Vite) donde el equipo de Tuya CA puede explorar cada componente de Tuya UI —sus ejemplos, su API, sus guías de uso y su comportamiento de accesibilidad—, ver y copiar su código fuente, y consultar los design tokens de marca disponibles.

## Requirements
### Requirement: Búsqueda de componentes
El sitio SHALL ofrecer una búsqueda presentada como un campo siempre visible en el header, que indica su atajo de teclado, y que también se abre mediante ese atajo. La búsqueda SHALL filtrar componentes y secciones del sitio por nombre y descripción, y permitir navegar directamente al resultado elegido.

#### Scenario: Buscar por nombre
- **WHEN** un usuario abre la búsqueda y escribe parte del nombre de un componente
- **THEN** ve los componentes cuyo nombre o descripción coincide y puede navegar a uno de ellos

#### Scenario: Abrir la búsqueda por teclado
- **WHEN** un usuario presiona el atajo de teclado de búsqueda desde cualquier página del sitio
- **THEN** la búsqueda se abre con el foco puesto en el campo de texto

#### Scenario: Atajo visible en el campo
- **WHEN** un usuario mira el header sin haber abierto la búsqueda
- **THEN** el campo de búsqueda muestra cuál es el atajo de teclado que la abre

#### Scenario: Búsqueda sin resultados
- **WHEN** un usuario busca un término que no coincide con ningún componente ni sección
- **THEN** el sitio informa explícitamente que no hay resultados, en vez de mostrar una lista vacía sin explicación

#### Scenario: Cerrar la búsqueda
- **WHEN** un usuario presiona Escape con la búsqueda abierta
- **THEN** la búsqueda se cierra y el foco vuelve al punto desde el que se abrió

### Requirement: Índice de la página actual
Las páginas con múltiples secciones SHALL mostrar un índice con enlaces a las secciones de esa página, que indique cuál es la sección visible en ese momento y permita saltar directamente a cualquiera de ellas.

#### Scenario: Saltar a una sección
- **WHEN** un usuario hace clic en una entrada del índice de una página con varias secciones
- **THEN** la vista se desplaza hasta esa sección de la página

#### Scenario: Sección visible resaltada
- **WHEN** un usuario se desplaza por una página que tiene índice
- **THEN** el índice resalta la sección que está visible en ese momento

#### Scenario: Índice en la página de un componente
- **WHEN** un usuario abre la página de un componente y está viendo sus ejemplos
- **THEN** el índice lista los ejemplos de ese componente y permite saltar a cualquiera de ellos

### Requirement: Identidad visual de Tuya CA
El sitio SHALL aplicar la identidad visual de marca de Tuya CA (colores, tipografía y logotipo) en su propia interfaz, y SHALL identificarse como "Tuip - Tuya UI Platform" tanto en el título del navegador como en el wordmark del header. El color de marca SHALL reservarse para señalar la acción o el elemento primario de cada contexto, de modo que no compita consigo mismo.

#### Scenario: Sitio refleja la marca
- **WHEN** un usuario visita cualquier página del sitio de documentación
- **THEN** los colores y tipografía visibles corresponden a los design tokens de marca de Tuya CA, no a un tema genérico

#### Scenario: Título del sitio
- **WHEN** un usuario abre el sitio de documentación en el navegador
- **THEN** la pestaña del navegador muestra el título "Tuip - Tuya UI Platform"

#### Scenario: Wordmark del header
- **WHEN** un usuario visita cualquier página del sitio
- **THEN** el header muestra el nombre "Tuip - Tuya UI Platform" (o su forma abreviada visualmente equivalente) junto al logotipo

#### Scenario: El color de marca señala lo primario
- **WHEN** un usuario observa cualquier pantalla del sitio
- **THEN** el color de marca aparece solo en el elemento primario de ese contexto (la entrada activa de navegación, la acción principal), no repartido entre elementos secundarios

### Requirement: Secciones del componente en pestañas enlazables
La página de detalle de un componente SHALL organizar su contenido en pestañas —uso, anatomía, API, código y accesibilidad—, y la pestaña activa SHALL quedar reflejada en la URL, de modo que se pueda compartir o guardar un enlace directo a una pestaña concreta.

La pestaña de uso SHALL reunir los ejemplos del componente junto con la orientación de cuándo usarlo y cuándo no. La pestaña de API SHALL contener la tabla de props. La pestaña de código SHALL contener el archivo fuente completo.

#### Scenario: Cambiar de pestaña
- **WHEN** un usuario selecciona la pestaña de API en la página de un componente
- **THEN** el sitio muestra la tabla de props de ese componente sin recargar la página

#### Scenario: Enlace directo a una pestaña
- **WHEN** un usuario abre una URL que apunta a la pestaña de accesibilidad de un componente
- **THEN** la página se abre con esa pestaña ya activa

#### Scenario: Operación por teclado de las pestañas
- **WHEN** un usuario mueve el foco a la lista de pestañas y usa las flechas del teclado
- **THEN** puede recorrer y activar las pestañas sin usar el mouse

#### Scenario: Ejemplos y orientación juntos
- **WHEN** un usuario abre la pestaña de uso de un componente
- **THEN** ve los ejemplos del componente y, en la misma pestaña, la orientación de cuándo no corresponde usarlo

### Requirement: Vista previa visual de componente
Cada página de componente SHALL mostrar un conjunto de ejemplos de uso enfocados. Cada ejemplo SHALL presentarse sobre un lienzo visualmente distinguido del fondo de la página, y SHALL tener un título, el componente renderizado en vivo, un pie que describe qué varía en ese ejemplo, y un fragmento de código copiable que corresponde exactamente al código que produce ese render.

#### Scenario: Ver variantes de un componente
- **WHEN** un usuario abre la página de detalle de un componente de acción
- **THEN** el sitio muestra el componente renderizado con sus variantes y estados

#### Scenario: El lienzo delimita el ejemplo
- **WHEN** un usuario ve un ejemplo en la página de un componente
- **THEN** el componente renderizado aparece sobre un lienzo que lo separa visualmente del texto de la página

#### Scenario: El pie explica la variación
- **WHEN** un usuario ve un ejemplo que muestra varias variantes del componente
- **THEN** el pie del lienzo nombra qué propiedad varía entre las piezas mostradas

#### Scenario: Cada ejemplo expone su propio código
- **WHEN** un usuario ve un ejemplo en la página de detalle de un componente
- **THEN** junto al render del ejemplo puede ver y copiar el fragmento de código que lo produce, sin tener que leer el archivo fuente completo del componente

#### Scenario: El código mostrado corresponde al render
- **WHEN** se modifica el código de un ejemplo
- **THEN** tanto el render como el fragmento de código mostrado reflejan esa modificación, sin posibilidad de que queden desincronizados

### Requirement: Tabla de props por componente
Cada página de componente SHALL documentar su API pública en forma de tabla, con el nombre de cada prop, su tipo, su valor por defecto, si es requerida y su descripción. Esta información SHALL derivarse de las definiciones de tipos del propio componente, de modo que no pueda quedar desactualizada respecto del código.

#### Scenario: Consultar la API de un componente
- **WHEN** un usuario abre la sección de props de la página de Button
- **THEN** ve una fila por cada prop pública de Button con su tipo, su valor por defecto, si es requerida y su descripción

#### Scenario: Props heredadas del DOM excluidas
- **WHEN** un componente extiende los atributos HTML nativos de su elemento (por ejemplo, todos los atributos de `<button>`)
- **THEN** la tabla lista solo las props propias del componente, no los atributos DOM heredados

#### Scenario: Cambio en la API se refleja en la documentación
- **WHEN** se agrega o se renombra una prop en el código de un componente
- **THEN** la tabla de props del sitio refleja ese cambio sin requerir edición manual de la documentación

### Requirement: Guías de uso por componente
Cada página de componente SHALL incluir orientación de uso: en qué situaciones corresponde usar el componente, en qué situaciones conviene otra opción, y ejemplos contrastados de aplicación recomendada frente a desaconsejada.

#### Scenario: Consultar cuándo usar un componente
- **WHEN** un usuario abre la sección de uso de la página de un componente
- **THEN** ve los casos en los que corresponde usarlo y los casos en los que conviene otra opción

#### Scenario: Ver un par de uso recomendado y desaconsejado
- **WHEN** un usuario revisa la orientación de uso de un componente
- **THEN** ve al menos un par contrastado que distingue una aplicación recomendada de una desaconsejada, cada una con su justificación

### Requirement: Notas de accesibilidad por componente
Cada página de componente SHALL documentar su comportamiento de accesibilidad en forma de tabla, con una fila por aspecto (interacción por teclado, foco, roles y atributos ARIA aplicados, y contraste), indicando en cada fila el valor concreto que el componente aplica y la explicación de por qué.

#### Scenario: Consultar el comportamiento de teclado
- **WHEN** un usuario abre la sección de accesibilidad de la página de un componente de entrada
- **THEN** ve cómo se opera el componente con el teclado y qué atributos de accesibilidad aplica

#### Scenario: Valor concreto por aspecto
- **WHEN** un usuario consulta la tabla de accesibilidad de un componente
- **THEN** cada aspecto muestra el valor concreto que el componente aplica (por ejemplo, el atributo ARIA o la razón de contraste medida), no solo una descripción general

### Requirement: Comando de instalación visible por componente
Cada página de componente SHALL mostrar en su cabecera el comando de instalación de `@tuya-ui/components` junto con el import del componente, presentado como un bloque copiable junto a los metadatos del componente.

#### Scenario: Ver comando de instalación
- **WHEN** un usuario abre la página de detalle de un componente
- **THEN** el sitio muestra en la cabecera el comando de instalación del paquete y la línea de import de ese componente

#### Scenario: Copiar el comando desde la cabecera
- **WHEN** un usuario usa la acción de copiar del bloque de instalación
- **THEN** el comando y el import se copian al portapapeles sin abandonar la página

### Requirement: Encabezado uniforme de página
Toda página del sitio SHALL abrir con un encabezado compuesto por una ruta de migas que nombra la sección de navegación a la que pertenece y el título de la página, el título de la página, y un párrafo de entrada que resume de qué trata la página antes de su primera sección.

#### Scenario: Ubicación dentro del sitio
- **WHEN** un usuario abre cualquier página del sitio
- **THEN** ve, sobre el título, la sección de navegación a la que esa página pertenece

#### Scenario: Resumen antes del contenido
- **WHEN** un usuario abre una página del sitio
- **THEN** lee bajo el título un párrafo de entrada que resume el tema de la página, antes de la primera sección de contenido

### Requirement: Navegación secuencial entre páginas
Cada página SHALL ofrecer al pie un par de accesos a la página anterior y a la página siguiente según el orden lineal de la navegación, cada uno rotulado con el nombre de la página destino. En el primer y el último elemento del orden, el acceso que no tiene destino SHALL indicarse como no disponible en vez de navegar a otra parte.

#### Scenario: Avanzar a la página siguiente
- **WHEN** un usuario llega al pie de una página y usa el acceso a la página siguiente
- **THEN** el sitio navega a la página que sigue en el orden de la navegación

#### Scenario: Destino visible antes de navegar
- **WHEN** un usuario mira el pie de una página
- **THEN** cada acceso muestra el nombre de la página a la que lleva, no solo la palabra "anterior" o "siguiente"

#### Scenario: Extremos del recorrido
- **WHEN** un usuario está en la primera página del orden de navegación
- **THEN** el acceso a la página anterior se muestra como no disponible

### Requirement: Estado de madurez del componente
La navegación y la página de detalle de cada componente SHALL exponer el estado de madurez del componente (`stable` o `beta`), de modo que un usuario distinga qué componentes puede adoptar sin reservas antes de abrir su página.

#### Scenario: Estado visible en la navegación
- **WHEN** un usuario recorre la lista de componentes en el sidebar
- **THEN** los componentes que no están en `stable` muestran junto a su nombre una insignia que lo indica

#### Scenario: Estado en la página del componente
- **WHEN** un usuario abre la página de detalle de un componente en `beta`
- **THEN** la cabecera de la página indica que su estado es `beta`

### Requirement: Anatomía del componente
Cada página de componente SHALL documentar, en su propia sección, la anatomía del componente: sus partes, las medidas que las relacionan expresadas en tokens de espaciado y tamaño, y su apariencia en cada estado de interacción (reposo, hover, foco y deshabilitado).

#### Scenario: Consultar las medidas de un componente
- **WHEN** un usuario abre la sección de anatomía de la página de un componente
- **THEN** ve el componente renderizado acompañado de las medidas de sus partes expresadas en tokens, no solo en píxeles sueltos

#### Scenario: Ver los estados de interacción
- **WHEN** un usuario abre la sección de anatomía de un componente interactivo
- **THEN** ve el componente representado en reposo, hover, foco y deshabilitado, uno junto a otro

### Requirement: Notas destacadas de contenido
Las páginas del sitio SHALL poder destacar una regla o advertencia en un bloque diferenciado del texto corrido, con un tono semántico (informativo, de precaución o de riesgo), un título corto que enuncia la regla y una explicación de su motivo. El tono SHALL comunicarse además del color, mediante el propio título, para no depender únicamente del color.

#### Scenario: Regla destacada del texto corrido
- **WHEN** un usuario lee una página que enuncia una regla de uso del sistema
- **THEN** la regla aparece en un bloque visualmente diferenciado del texto corrido, con su título y su motivo

#### Scenario: Tono no depende solo del color
- **WHEN** un usuario que no distingue colores lee una nota destacada
- **THEN** el título de la nota enuncia por sí mismo la condición, sin requerir la lectura del color para entenderla

### Requirement: Página de instalación del paquete
El sitio SHALL incluir una página de instalación que documente los requisitos previos del proyecto anfitrión, el comando para instalar `@tuya-ui/components`, cómo incorporar sus estilos al proyecto, y cómo importar y usar el primer componente.

#### Scenario: Instalar el paquete en un proyecto nuevo
- **WHEN** un usuario abre la página de instalación
- **THEN** encuentra los requisitos del proyecto, el comando de instalación del paquete y el resultado esperado de ejecutarlo

#### Scenario: Consultar cómo incorporar los estilos
- **WHEN** un usuario abre la página de instalación
- **THEN** ve el paso necesario para que los estilos de `@tuya-ui/components` se apliquen en su proyecto

### Requirement: Páginas de fundamentos
El sitio SHALL documentar los fundamentos del sistema en páginas separadas por tema —tipografía, color y tokens, y espaciado y layout—, cada una accesible desde la sección de fundamentos de la navegación. Cada página SHALL presentar los valores del tema junto con el nombre del token que los expresa y la orientación de cuándo aplicar cada uno.

La página de espaciado y layout SHALL documentar además la estructura de página que comparten las aplicaciones del sistema, sus puntos de quiebre, las alturas de control, los anchos máximos por tipo de contenido y las capas de superposición.

La página de color SHALL distinguir la paleta de marca de las paletas semánticas, y SHALL documentar el modo oscuro como conjunto propio de valores.

La página de color SHALL documentar además los vocabularios de color que no son semánticos, presentándolos como categoría aparte y no como una familia más de la escala semántica. Para la paleta de acento, SHALL mostrar sus cuatro matices con el nombre del token de cada uno y su contraste medido contra las superficies del sistema sobre las que puede quedar apoyado, expresado como razón concreta. La página SHALL afirmar de forma explícita que un matiz de acento no comunica estado y no reemplaza a los roles `success`, `warning`, `danger` ni `info`, en vez de dejar esa distinción implícita en la separación visual de las tablas.

#### Scenario: Consultar la escala tipográfica
- **WHEN** un usuario abre la página de tipografía
- **THEN** ve las familias tipográficas del sistema y la escala completa, con el tamaño, el interlineado, el peso y el uso previsto de cada paso

#### Scenario: Consultar la paleta de color
- **WHEN** un usuario abre la página de color y tokens
- **THEN** ve la paleta base y las paletas semánticas, cada color con su valor y el nombre del token que lo expresa

#### Scenario: Consultar la escala de espaciado
- **WHEN** un usuario abre la página de espaciado
- **THEN** ve los alias de espaciado con su valor y la relación entre elementos que cada uno expresa

#### Scenario: Fundamentos accesibles desde la navegación
- **WHEN** un usuario despliega la sección de fundamentos en el sidebar
- **THEN** ve las páginas de tipografía, color y espaciado como entradas independientes

#### Scenario: Consultar la estructura de una página
- **WHEN** un usuario abre la página de espaciado y layout
- **THEN** ve la anatomía que comparten las aplicaciones del sistema, con la medida de cada zona

#### Scenario: Consultar el comportamiento responsive
- **WHEN** un usuario abre la página de espaciado y layout
- **THEN** ve los puntos de quiebre con lo que cambia en cada rango

#### Scenario: Consultar el modo oscuro
- **WHEN** un usuario abre la página de color y tokens
- **THEN** ve los valores del modo oscuro y la explicación de por qué no son la inversión de los del modo claro

#### Scenario: Consultar la paleta de acento
- **WHEN** un usuario abre la página de color y tokens
- **THEN** ve los cuatro matices de acento con el nombre de su token y el contraste medido de cada uno contra las superficies donde puede usarse

#### Scenario: El acento se presenta aparte de lo semántico
- **WHEN** un usuario recorre la página de color y tokens
- **THEN** encuentra la paleta de acento en una sección propia, con una advertencia explícita de que no comunica estado y no reemplaza a los roles semánticos

### Requirement: Página de iconografía
El sitio SHALL incluir una página de iconografía que presente la librería completa agrupada por familia, con el nombre de cada icono junto a su dibujo, las reglas de construcción y de tamaño, el comportamiento de color y accesibilidad, y el método para incorporar un icono nuevo.

#### Scenario: Encontrar un icono por su concepto
- **WHEN** un usuario abre la página de iconografía buscando un icono para una acción
- **THEN** ve los iconos agrupados por familia con el nombre de cada uno junto a su dibujo

#### Scenario: Consultar las reglas de construcción
- **WHEN** un usuario abre la página de iconografía
- **THEN** encuentra la retícula, el grosor de trazo, los tamaños admitidos y su uso previsto

#### Scenario: Saber cómo agregar un icono
- **WHEN** un usuario necesita un icono que la librería no tiene
- **THEN** la página le da el método a seguir antes de dibujarlo

### Requirement: Reglas de aplicación en las páginas de fundamentos
Las páginas de fundamentos SHALL enunciar, junto a cada escala, las reglas que gobiernan su aplicación —entre ellas la regla de escasez del color de marca y la relación entre la separación dentro de un grupo y la separación entre grupos—, presentadas como notas destacadas del texto corrido.

#### Scenario: Consultar la regla del color de marca
- **WHEN** un usuario abre la página de color
- **THEN** lee que el color de marca señala una sola acción por vista, y por qué

#### Scenario: Consultar la regla de pertenencia del espacio
- **WHEN** un usuario abre la página de espaciado
- **THEN** lee que el salto dentro de un grupo debe ser menor que el salto entre grupos, y qué comunica esa diferencia

### Requirement: Navegación del sitio
El sitio SHALL presentar una navegación compuesta por un header superior y un sidebar lateral persistente.

El header SHALL contener la identidad del sitio (logotipo, wordmark y versión publicada del paquete), un campo de búsqueda siempre visible que indica su atajo de teclado, y un conjunto de enlaces de navegación global a las áreas principales del sitio.

El sidebar SHALL listar las páginas del sitio agrupadas bajo encabezados de sección que las rotulan sin ser en sí mismos enlaces ni controles. El sidebar SHALL permanecer visible mientras se desplaza el contenido de la página. El elemento correspondiente a la página actual SHALL destacarse visualmente del resto.

Dentro de la sección de componentes, los componentes SHALL agruparse por categoría, y cada grupo de categoría SHALL ser un control que despliega y contrae su contenido sin navegar. Los grupos SHALL presentarse contraídos, salvo el que contiene la página actual, que SHALL aparecer desplegado.

Los tres niveles de la navegación —sección, grupo de categoría e ítem— SHALL distinguirse entre sí por sangría y por tratamiento tipográfico, de modo que la jerarquía se lea sin necesidad de desplegar nada ni de recurrir al color.

#### Scenario: Navegar desde el sidebar
- **WHEN** un usuario hace clic en una entrada del sidebar
- **THEN** el sitio navega a esa página manteniendo el sidebar visible

#### Scenario: Resaltado de la página activa
- **WHEN** un usuario se encuentra en cualquier página del sitio
- **THEN** el sidebar indica visualmente cuál es la entrada correspondiente a esa página

#### Scenario: El sidebar acompaña el desplazamiento
- **WHEN** un usuario se desplaza hasta el final de una página larga
- **THEN** el sidebar sigue visible y utilizable, en vez de quedar fuera de pantalla

#### Scenario: Entradas agrupadas por sección
- **WHEN** un usuario recorre el sidebar
- **THEN** las entradas aparecen bajo el encabezado de su sección, que las rotula sin ser en sí mismo un enlace ni un control

#### Scenario: Componentes agrupados por categoría
- **WHEN** un usuario recorre la sección de componentes del sidebar
- **THEN** ve los nombres de las categorías del catálogo en vez de la lista completa de componentes

#### Scenario: Desplegar una categoría no navega
- **WHEN** un usuario acciona el control de despliegue de una categoría
- **THEN** esa categoría muestra los componentes que contiene sin que el sitio cambie de página

#### Scenario: La categoría de la página actual llega abierta
- **WHEN** un usuario abre la página de un componente por un enlace directo
- **THEN** el sidebar muestra desplegada la categoría a la que ese componente pertenece

#### Scenario: Jerarquía legible de un vistazo
- **WHEN** un usuario mira el sidebar sin interactuar con él
- **THEN** distingue qué entradas son secciones, cuáles son categorías y cuáles son páginas, por su sangría y su tipografía

#### Scenario: Navegación global desde el header
- **WHEN** un usuario usa uno de los enlaces de navegación global del header
- **THEN** el sitio navega al área correspondiente sin que el usuario tenga que recorrer el sidebar

#### Scenario: Versión publicada visible
- **WHEN** un usuario visita cualquier página del sitio
- **THEN** el header muestra la versión publicada del paquete junto al wordmark

### Requirement: Entrada al sitio
La ruta raíz del sitio SHALL mostrar una página de inicio que presente el sistema de diseño e indique cómo instalar y empezar a usar `@tuya-ui/components`, con accesos directos a la documentación de los componentes y a los fundamentos del sistema.

#### Scenario: Llegar al sitio por primera vez
- **WHEN** un usuario abre la ruta raíz del sitio de documentación
- **THEN** ve una introducción al sistema de diseño y el comando de instalación de `@tuya-ui/components`, en vez del listado de componentes

#### Scenario: Acceder a los componentes desde el inicio
- **WHEN** un usuario usa el acceso a los componentes desde la página de inicio
- **THEN** llega a la documentación de un componente, con la categoría de ese componente desplegada en el sidebar

### Requirement: Rótulo estable de cada página
El nombre de una página SHALL leerse igual en el sidebar, en la ruta de migas, en el título de la página y en el pager. El sitio SHALL respetar la grafía del nombre que designa, sin transformaciones de mayúsculas que alteren identificadores ni palabras funcionales.

#### Scenario: Un identificador conserva su grafía
- **WHEN** un usuario ve una página cuyo nombre incluye un identificador en minúscula, como el del binario del CLI
- **THEN** lo lee con su grafía real en el sidebar, en las migas, en el título y en el pager, en vez de con cada palabra capitalizada

#### Scenario: El nombre de un componente se presenta igual en todas partes
- **WHEN** un usuario compara la entrada de un componente en el sidebar con el título de su página
- **THEN** lee el mismo rótulo en ambos lugares

### Requirement: Posición de lectura al cambiar de página
Al navegar a una página distinta, el sitio SHALL presentarla desde su inicio, sin conservar el desplazamiento que tenía la página anterior. El salto a una sección dentro de la misma página no SHALL verse afectado por esta regla.

#### Scenario: Cambiar de página desde el pie
- **WHEN** un usuario se desplaza hasta el final de una página larga y usa el pager para ir a la siguiente
- **THEN** la página nueva se muestra desde su encabezado, no desde la altura a la que estaba la anterior

#### Scenario: Saltar a una sección de la misma página
- **WHEN** un usuario usa el índice "En esta página" para ir a una sección
- **THEN** la vista se desplaza hasta esa sección, sin volver al inicio de la página

### Requirement: Código fuente del componente
Cada página de componente SHALL mostrar, en su propia pestaña, el código fuente completo del componente con una presentación estilo editor de código (barra de título con el nombre del archivo, resaltado de sintaxis según el lenguaje, y numeración de línea), y SHALL permitir copiarlo al portapapeles. Los fragmentos de código de los ejemplos SHALL usar esa misma presentación.

#### Scenario: Copiar código de un componente
- **WHEN** un usuario hace clic en la acción de copiar código en la página de detalle de un componente
- **THEN** el código fuente completo del componente se copia al portapapeles del usuario

#### Scenario: Resaltado de sintaxis
- **WHEN** un usuario visualiza el código fuente de un componente (TSX)
- **THEN** el código se muestra con resaltado de sintaxis coloreado según su lenguaje

#### Scenario: Barra de título del archivo
- **WHEN** un usuario visualiza el bloque de código fuente de un componente
- **THEN** el bloque muestra una barra superior con el nombre del archivo (ej. `components/ui/button.tsx`), imitando la barra de pestañas de un editor de código

#### Scenario: Confirmación de copia
- **WHEN** un usuario copia un bloque de código
- **THEN** el control de copia confirma visualmente que el contenido se copió, y vuelve a su estado inicial después
