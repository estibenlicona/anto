## ADDED Requirements

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
Cada página de componente SHALL documentar su comportamiento de accesibilidad: interacción por teclado, roles y atributos ARIA que aplica, y consideraciones para lectores de pantalla.

#### Scenario: Consultar el comportamiento de teclado
- **WHEN** un usuario abre la sección de accesibilidad de la página de Input
- **THEN** ve cómo se opera el componente con el teclado y qué atributos de accesibilidad aplica

### Requirement: Secciones del componente en pestañas enlazables
La página de detalle de un componente SHALL organizar su contenido en pestañas (ejemplos, código fuente, props, uso y accesibilidad), y la pestaña activa SHALL quedar reflejada en la URL, de modo que se pueda compartir o guardar un enlace directo a una pestaña concreta.

#### Scenario: Cambiar de pestaña
- **WHEN** un usuario selecciona la pestaña de props en la página de un componente
- **THEN** el sitio muestra la tabla de props de ese componente sin recargar la página

#### Scenario: Enlace directo a una pestaña
- **WHEN** un usuario abre una URL que apunta a la pestaña de accesibilidad de un componente
- **THEN** la página se abre con esa pestaña ya activa

#### Scenario: Operación por teclado de las pestañas
- **WHEN** un usuario mueve el foco a la lista de pestañas y usa las flechas del teclado
- **THEN** puede recorrer y activar las pestañas sin usar el mouse

### Requirement: Búsqueda de componentes
El sitio SHALL ofrecer una búsqueda accesible desde el header y mediante un atajo de teclado, que filtre componentes y secciones del sitio por nombre y descripción, y permita navegar directamente al resultado elegido.

#### Scenario: Buscar por nombre
- **WHEN** un usuario abre la búsqueda y escribe parte del nombre de un componente
- **THEN** ve los componentes cuyo nombre o descripción coincide y puede navegar a uno de ellos

#### Scenario: Abrir la búsqueda por teclado
- **WHEN** un usuario presiona el atajo de teclado de búsqueda desde cualquier página del sitio
- **THEN** la búsqueda se abre con el foco puesto en el campo de texto

#### Scenario: Búsqueda sin resultados
- **WHEN** un usuario busca un término que no coincide con ningún componente ni sección
- **THEN** el sitio informa explícitamente que no hay resultados, en vez de mostrar una lista vacía sin explicación

#### Scenario: Cerrar la búsqueda
- **WHEN** un usuario presiona Escape con la búsqueda abierta
- **THEN** la búsqueda se cierra y el foco vuelve al punto desde el que se abrió

### Requirement: Página de inicio del sitio
La ruta raíz del sitio SHALL mostrar una página de inicio que presente el sistema de diseño e indique cómo instalar y empezar a usar el CLI, con accesos directos al catálogo de componentes y a los design tokens.

#### Scenario: Llegar al sitio por primera vez
- **WHEN** un usuario abre la ruta raíz del sitio de documentación
- **THEN** ve una introducción al sistema de diseño y el comando de instalación del CLI, en vez del listado de componentes

#### Scenario: Acceder al catálogo desde el inicio
- **WHEN** un usuario usa el acceso al catálogo desde la página de inicio
- **THEN** llega a la página de catálogo de componentes

### Requirement: Índice de la página actual
Las páginas con múltiples secciones SHALL mostrar un índice con enlaces a las secciones de esa página, que indique cuál es la sección visible en ese momento y permita saltar directamente a cualquiera de ellas.

#### Scenario: Saltar a una sección
- **WHEN** un usuario hace clic en una entrada del índice de la página de tokens
- **THEN** la vista se desplaza hasta esa sección de la página

#### Scenario: Sección visible resaltada
- **WHEN** un usuario se desplaza por una página que tiene índice
- **THEN** el índice resalta la sección que está visible en ese momento

#### Scenario: Índice en la página de un componente
- **WHEN** un usuario abre la página de un componente y está viendo sus ejemplos
- **THEN** el índice lista los ejemplos de ese componente y permite saltar a cualquiera de ellos

## MODIFIED Requirements

### Requirement: Catálogo navegable de componentes
El sitio SHALL ofrecer una página de catálogo, en su propia ruta, que liste todos los componentes disponibles en Tuya UI y permita navegar a la página de detalle de cada uno. Cada entrada del catálogo SHALL incluir una vista previa renderizada en vivo del componente, además de su nombre y su descripción.

#### Scenario: Navegar al catálogo
- **WHEN** un usuario abre la página de catálogo de componentes
- **THEN** ve una lista de todos los componentes disponibles con acceso a su página de detalle

#### Scenario: Vista previa en la entrada del catálogo
- **WHEN** un usuario ve la entrada de Button en el catálogo
- **THEN** la entrada muestra el componente Button renderizado en vivo, no solo su nombre y su descripción

### Requirement: Navegación de dos niveles
El sitio SHALL presentar una navegación compuesta por un header superior (identidad del sitio, búsqueda y control de tema) y un sidebar lateral persistente, organizado en secciones de primer nivel desplegables que agrupan el contenido del sitio (introducción, fundamentos y componentes). Dentro de la sección de componentes, estos SHALL presentarse agrupados bajo encabezados de categoría.

El sidebar SHALL permanecer visible mientras se desplaza el contenido de la página. Cada sección de primer nivel, y cada componente que tenga ejemplos, SHALL ofrecer un control propio para desplegar o contraer su contenido, independiente del enlace que navega a la página. El elemento correspondiente a la página actual SHALL destacarse visualmente del resto, y el componente que se está viendo SHALL aparecer desplegado.

#### Scenario: Navegar desde el sidebar
- **WHEN** un usuario hace clic en un componente o en "Tokens" dentro del sidebar
- **THEN** el sitio navega a esa página manteniendo el sidebar visible

#### Scenario: Resaltado de la sección activa
- **WHEN** un usuario se encuentra en la página de un componente o en la de tokens
- **THEN** el sidebar indica visualmente cuál es la sección actualmente activa

#### Scenario: El sidebar acompaña el desplazamiento
- **WHEN** un usuario se desplaza hasta el final de una página larga
- **THEN** el sidebar sigue visible y utilizable, en vez de quedar fuera de pantalla

#### Scenario: Sub-elementos del componente activo
- **WHEN** un usuario abre la página de un componente
- **THEN** el sidebar muestra desplegados, bajo ese componente, sus ejemplos, y permite saltar a cualquiera de ellos

#### Scenario: Desplegar el contenido de otro componente
- **WHEN** un usuario acciona el control de despliegue de un componente distinto del que está viendo
- **THEN** ese componente muestra sus ejemplos sin que el sitio navegue a su página

#### Scenario: Contraer una sección de primer nivel
- **WHEN** un usuario acciona el control de despliegue de una sección de primer nivel
- **THEN** todo el contenido de esa sección se oculta y el control refleja que la sección está contraída

#### Scenario: Componentes agrupados por categoría
- **WHEN** un usuario despliega la sección de componentes
- **THEN** los componentes aparecen bajo el encabezado de su categoría, que los rotula sin ser en sí mismo un enlace ni un control desplegable

### Requirement: Vista previa visual de componente
Cada página de componente SHALL mostrar un conjunto de ejemplos de uso enfocados. Cada ejemplo SHALL tener un título, el componente renderizado en vivo, y un fragmento de código copiable que corresponde exactamente al código que produce ese render.

#### Scenario: Ver variantes de un componente
- **WHEN** un usuario abre la página de detalle de Button
- **THEN** el sitio muestra el componente renderizado con sus variantes (ej. primario, secundario) y estados (ej. deshabilitado)

#### Scenario: Cada ejemplo expone su propio código
- **WHEN** un usuario ve un ejemplo en la página de detalle de un componente
- **THEN** junto al render del ejemplo puede ver y copiar el fragmento de código que lo produce, sin tener que leer el archivo fuente completo del componente

#### Scenario: El código mostrado corresponde al render
- **WHEN** se modifica el código de un ejemplo
- **THEN** tanto el render como el fragmento de código mostrado reflejan esa modificación, sin posibilidad de que queden desincronizados

### Requirement: Selector de tema claro/oscuro
El sitio SHALL ofrecer en el header un control de tema que abre un panel con las opciones de modo de color disponibles, presentadas como un grupo de opciones excluyentes con una vista previa de cada modo y la actual marcada como seleccionada. El sitio SHALL aplicar por defecto la preferencia de tema del sistema operativo del usuario cuando no haya una elección previa, y la elección del usuario SHALL persistir entre visitas.

#### Scenario: Alternar tema manualmente
- **WHEN** un usuario abre el control de tema del header y elige el modo opuesto al actual
- **THEN** toda la interfaz del sitio (colores, superficies, texto) cambia a ese modo usando los tokens de modo claro/oscuro de Tuya UI

#### Scenario: Modo actual indicado en el panel
- **WHEN** un usuario abre el control de tema
- **THEN** el panel indica cuál de los modos está activo en ese momento

#### Scenario: Cerrar el panel de tema
- **WHEN** un usuario presiona Escape o hace clic fuera del panel de tema abierto
- **THEN** el panel se cierra sin cambiar el tema seleccionado

#### Scenario: Persistencia de la elección de tema
- **WHEN** un usuario elige un tema y luego recarga el sitio o vuelve en una visita posterior
- **THEN** el sitio se muestra en el tema elegido anteriormente, sin volver a la preferencia del sistema

#### Scenario: Sin elección previa
- **WHEN** un usuario visita el sitio por primera vez sin haber elegido un tema
- **THEN** el sitio se muestra según la preferencia de tema del sistema operativo del usuario

### Requirement: Código fuente visible y copiable
Cada página de componente SHALL mostrar, en su propia pestaña, el código fuente completo del componente con una presentación estilo editor de código (barra de título con el nombre del archivo, resaltado de sintaxis según el lenguaje, y numeración de línea), usando un tema de resaltado coherente con el tema activo del sitio (claro u oscuro), y SHALL permitir copiarlo al portapapeles. Los fragmentos de código de los ejemplos SHALL usar esa misma presentación.

#### Scenario: Copiar código de un componente
- **WHEN** un usuario hace clic en la acción de copiar código en la página de detalle de un componente
- **THEN** el código fuente completo del componente se copia al portapapeles del usuario

#### Scenario: Resaltado de sintaxis
- **WHEN** un usuario visualiza el código fuente de un componente (TSX)
- **THEN** el código se muestra con resaltado de sintaxis coloreado según su lenguaje, con una apariencia consistente con el tema de Visual Studio Code correspondiente al tema activo del sitio

#### Scenario: Barra de título del archivo
- **WHEN** un usuario visualiza el bloque de código fuente de un componente
- **THEN** el bloque muestra una barra superior con el nombre del archivo (ej. `components/ui/button.tsx`), imitando la barra de pestañas de un editor de código

#### Scenario: El tema del código sigue al tema del sitio
- **WHEN** un usuario cambia el sitio de tema oscuro a tema claro
- **THEN** el visor de código fuente cambia a un tema de resaltado claro con buen contraste, en vez de mantener un tema oscuro fijo
