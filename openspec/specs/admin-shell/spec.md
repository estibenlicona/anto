## Purpose

Provee la estructura de navegación y layout (sidebar, topbar, páginas placeholder) para el rol Admin de plataforma, como base visual sobre la que se construirán las pantallas de negocio de administración en changes posteriores.
## Requirements
### Requirement: Navegación lateral del rol Admin
El sistema SHALL mostrar una navegación lateral con exactamente estas 6 entradas, en este orden y agrupación, tomando de `NAV.admin` del mockup de referencia su estructura y su orden pero no su redacción:
- Inicio
- Grupo "Configuración": Sprints, Parámetros, Habilidades, Líneas
- Grupo "DevOps": Ingesta

Cada etiqueta SHALL ser el término más corto que distingue su pantalla de las demás del menú, dado que la navegación se recorre buscando dónde ir y no se lee. El nombre completo de la pantalla SHALL seguir estando en el breadcrumb y en el encabezado de la pantalla, que no forman parte del menú. La entrada "Líneas" SHALL nombrar en el breadcrumb la pantalla completa, "Líneas de expertise", porque el término corto por sí solo no dice de qué líneas se habla.

#### Scenario: Entrar al esqueleto de Admin
- **WHEN** el usuario navega a cualquier ruta bajo `/app/admin`
- **THEN** la navegación lateral muestra las 6 entradas agrupadas como arriba

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las rutas de Admin
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa y las otras no

#### Scenario: El nombre completo no se pierde
- **WHEN** el usuario está en una pantalla cuya entrada de menú es un término corto
- **THEN** el breadcrumb sigue mostrando el nombre completo de esa pantalla, de modo que acortar el menú no deja al usuario sin saber dónde está

#### Scenario: Ir a Líneas de expertise
- **WHEN** el usuario hace clic en la entrada "Líneas" del grupo "Configuración"
- **THEN** el sistema navega a `/app/admin/lineas` sin recargar la aplicación y el breadcrumb muestra "Líneas de expertise"

### Requirement: Navegación entre pantallas de Admin
El sistema SHALL permitir navegar entre las 4 pantallas de Admin haciendo clic en cada entrada de la navegación lateral, sin recargar la aplicación completa.

#### Scenario: Cambiar de pantalla
- **WHEN** el usuario hace clic en una entrada de navegación distinta a la actual
- **THEN** el contenido principal cambia a la pantalla correspondiente y el breadcrumb del topbar refleja el nuevo título

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales, salvo la pantalla de Calendario de sprints, que SHALL cargar y guardar su configuración contra un endpoint mockeado, y las secciones de bandas de talla y de mix de capacidades de Parámetros del modelo, que SHALL cargar y guardar sus datos del mismo modo (ver capability `api-mocking`). El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** el formulario carga y muestra la configuración actual servida por el endpoint mockeado, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Guardar la configuración de sprints exitosamente
- **WHEN** el usuario edita uno o más campos del formulario con valores válidos y hace clic en "Guardar configuración"
- **THEN** el sistema persiste los cambios contra el endpoint mockeado y muestra una confirmación de éxito

#### Scenario: Intentar guardar con valores inválidos
- **WHEN** el usuario ingresa un valor fuera de rango o no numérico en algún campo
- **THEN** el sistema muestra el error de validación junto al campo correspondiente y el botón "Guardar configuración" permanece deshabilitado hasta que el valor sea válido

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al intentar guardar
- **THEN** el sistema muestra un mensaje de error y conserva los valores ingresados por el usuario en el formulario

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** se muestran las cuatro secciones (bandas de talla, mix de capacidades, pool de preguntas, versionado) como pestañas, con datos de marcador de posición salvo las bandas de talla y el mix de capacidades, que se cargan del endpoint mockeado, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

### Requirement: Secciones de "Parámetros del modelo" en pestañas
La pantalla de Parámetros del modelo SHALL presentar sus cuatro secciones como pestañas, con una sola visible a la vez y la primera activa al cargar. Cada pestaña SHALL nombrar su sección con el término más corto que la distingue de las otras tres —Bandas, Capacidades, Preguntas y Versionado— y la sección no SHALL repetir ese nombre en su propio contenido, por la misma razón por la que la pantalla no repite su título: la pestaña activa ya lo identifica.

#### Scenario: Ver una sección a la vez
- **WHEN** el usuario abre la pantalla de Parámetros del modelo
- **THEN** ve la primera sección (bandas de talla) y los rótulos de las otras tres, en vez de las cuatro tablas al mismo tiempo

#### Scenario: Cambiar de sección
- **WHEN** el usuario activa la pestaña de otra sección
- **THEN** se muestra el contenido de esa sección y se oculta el de la anterior

#### Scenario: El rótulo no se duplica
- **WHEN** se muestra una sección
- **THEN** su nombre aparece únicamente en su pestaña, sin repetirse como encabezado dentro del contenido

#### Scenario: Navegación por teclado entre pestañas
- **WHEN** el usuario recorre las pestañas con el teclado
- **THEN** puede moverse entre ellas y activarlas sin usar el mouse, y cada sección se anuncia asociada a la pestaña que la nombra

### Requirement: Presentación de las tablas de Parámetros del modelo
Las tablas de la pantalla de Parámetros del modelo SHALL integrarse a ras del contenedor que las rodea, sin dibujar un borde dentro de otro, SHALL alinear a la derecha sus columnas numéricas con cifras tabulares, y SHALL presentar la columna de talla como una etiqueta de pertenencia con un color propio por talla, estable en toda la pantalla.

#### Scenario: Una tabla dentro de su contenedor
- **WHEN** se muestra cualquiera de las cuatro tablas
- **THEN** se ve un solo borde, el del contenedor, en vez de un borde de la tabla dentro del borde del contenedor

#### Scenario: Columnas numéricas alineadas
- **WHEN** se muestra una tabla con columnas de valores numéricos, como puntaje, persona-mes, conteos o pesos
- **THEN** esas columnas se alinean a la derecha y sus dígitos quedan en columna entre filas, mientras las columnas de texto siguen alineadas a la izquierda

#### Scenario: La talla se muestra como etiqueta
- **WHEN** se muestra la tabla de bandas de talla
- **THEN** cada talla aparece como una etiqueta con un color que la distingue de las demás, sin que ese color implique un estado ni una severidad, y con el texto de la talla siempre presente

### Requirement: Acciones de edición de las bandas de talla
La sección de bandas de talla SHALL ofrecer dos acciones de edición separadas —una para el reparto de porcentajes entre bandas y otra para los datos propios de cada banda— en vez de un único editor que combine ambas cosas. Las dos acciones SHALL presentarse junto a las pestañas de la pantalla y SHALL mostrarse únicamente mientras la sección de bandas de talla es la activa, dado que no aplican a las demás secciones. Cada editor SHALL confirmarse y cancelarse por su cuenta.

#### Scenario: Ver las acciones de la sección
- **WHEN** el usuario tiene abierta la sección de bandas de talla
- **THEN** ve las dos acciones de edición junto a las pestañas, una para el reparto de porcentajes y otra para los datos de las bandas

#### Scenario: Las acciones no aplican a otras secciones
- **WHEN** el usuario cambia a otra de las secciones de la pantalla
- **THEN** las acciones de edición de bandas dejan de mostrarse, en vez de quedar visibles sobre una sección a la que no corresponden

#### Scenario: Cancelar un editor
- **WHEN** el usuario cierra un editor sin confirmar
- **THEN** las bandas quedan como estaban antes de abrirlo, sin afectar lo que el otro editor pudiera cambiar

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al confirmar cualquiera de los dos editores
- **THEN** el sistema muestra un mensaje de error y conserva lo editado, sin cerrar el editor ni perder los cambios

### Requirement: Edición del reparto de porcentajes de las bandas
El editor de reparto SHALL permitir ajustar los límites de porcentaje que separan las bandas, y SHALL presentarlos como una partición de un mismo rango, de modo que mover un límite cambie las dos bandas que separa y ninguna otra. El editor SHALL impedir que una banda quede sin ancho. Este editor SHALL NOT exponer los datos propios de cada banda.

#### Scenario: Mover un límite entre bandas
- **WHEN** el usuario mueve uno de los límites de porcentaje
- **THEN** las dos bandas que ese límite separa cambian de tamaño a la vez, sin que se altere ninguna otra banda y sin que queden huecos ni solapes entre ellas

#### Scenario: Una banda no puede quedar sin ancho
- **WHEN** el usuario acerca un límite a otro más allá de la separación mínima
- **THEN** el límite se detiene, de modo que ninguna banda queda reducida a cero

#### Scenario: Confirmar el reparto
- **WHEN** el usuario confirma un reparto nuevo
- **THEN** el sistema lo persiste contra el endpoint mockeado, cierra el editor y la tabla pasa a mostrar los rangos nuevos

### Requirement: Edición de los datos de las bandas
El editor de datos SHALL permitir ajustar, para cada banda, su rango de persona-mes y su lectura. Este editor SHALL NOT exponer los límites de porcentaje, que se ajustan en el editor de reparto. Un dato inválido SHALL señalarse junto al campo que lo tiene y SHALL impedir confirmar hasta corregirlo.

#### Scenario: Editar los datos de una banda
- **WHEN** el usuario cambia el rango de persona-mes o la lectura de una banda
- **THEN** ese cambio queda registrado en el editor junto con los de las demás bandas, para confirmarse todo junto

#### Scenario: Intentar confirmar con datos inválidos
- **WHEN** algún dato de una banda es inválido, por ejemplo un persona-mes mínimo mayor que su máximo
- **THEN** el sistema muestra el error junto al dato correspondiente y la acción de confirmar permanece deshabilitada hasta corregirlo

#### Scenario: Confirmar los datos
- **WHEN** el usuario confirma datos válidos
- **THEN** el sistema los persiste contra el endpoint mockeado, cierra el editor y la tabla pasa a mostrar los datos nuevos

### Requirement: Edición del mix de capacidades
La sección de mix de capacidades SHALL ofrecer una acción de edición, presentada junto a las pestañas y visible únicamente mientras esa sección es la activa, con el mismo criterio que las acciones de bandas. Esa acción SHALL abrir un editor con la matriz completa —una fila por capacidad y una columna por talla— cuyos cambios se aplican sólo al confirmarlos y se descartan al cancelar.

#### Scenario: Abrir el editor
- **WHEN** el usuario activa la acción de editar en la sección de mix de capacidades
- **THEN** se abre un editor con las capacidades y sus cantidades por talla tal como están guardadas

#### Scenario: La acción no aplica a otras secciones
- **WHEN** el usuario cambia a otra de las secciones de la pantalla
- **THEN** la acción de editar el mix deja de mostrarse, en vez de quedar visible sobre una sección a la que no corresponde

#### Scenario: Editar una cantidad
- **WHEN** el usuario cambia la cantidad de una capacidad para una talla
- **THEN** ese cambio queda registrado en el editor junto con los demás, para confirmarse todo junto

#### Scenario: Cancelar la edición
- **WHEN** el usuario cierra el editor sin confirmar
- **THEN** el mix queda como estaba antes de abrirlo, incluidas las capacidades que hubiera agregado o quitado

#### Scenario: Confirmar y guardar
- **WHEN** el usuario confirma un mix válido
- **THEN** el sistema lo persiste contra el endpoint mockeado, cierra el editor y la tabla pasa a mostrar el mix nuevo

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al confirmar
- **THEN** el sistema muestra un mensaje de error y conserva lo editado, sin cerrar el editor ni perder los cambios

### Requirement: Alta y baja de capacidades
El editor del mix SHALL permitir agregar capacidades nuevas y quitar las existentes, además de editar sus cantidades. El nombre de una capacidad no SHALL quedar vacío ni repetir el de otra, y un nombre inválido SHALL señalarse junto al campo que lo tiene e impedir confirmar hasta corregirlo. Cada fila SHALL conservar una identidad propia, independiente de su nombre, de modo que renombrarla no la confunda con otra.

#### Scenario: Agregar una capacidad
- **WHEN** el usuario agrega una capacidad
- **THEN** aparece una fila nueva con una cantidad por cada talla, lista para completarse

#### Scenario: Quitar una capacidad
- **WHEN** el usuario quita una capacidad del editor
- **THEN** esa fila desaparece del editor, y el cambio se aplica al confirmar como cualquier otro

#### Scenario: Nombre vacío o repetido
- **WHEN** el usuario deja el nombre de una capacidad vacío, o le pone el de otra que ya está
- **THEN** el sistema muestra el error junto a ese campo y la acción de confirmar permanece deshabilitada hasta corregirlo

#### Scenario: Renombrar no confunde filas
- **WHEN** el usuario cambia el nombre de una capacidad que ya existía
- **THEN** sus cantidades siguen siendo las suyas, porque la fila se identifica por algo que el nombre no controla

### Requirement: Las tallas del mix salen de las bandas
Las columnas del mix SHALL corresponder a las tallas definidas en la sección de bandas, y sus cantidades SHALL guardarse indexadas por talla en vez de como campos fijos, de modo que exista una sola definición de qué tallas hay. Mientras las bandas no estén disponibles, la sección de mix SHALL informarlo en vez de mostrar una matriz sin encabezados que la expliquen.

#### Scenario: Las columnas siguen a las bandas
- **WHEN** se muestra la tabla o el editor del mix
- **THEN** sus columnas son las tallas guardadas en la sección de bandas, en el mismo orden

#### Scenario: Sin bandas no hay matriz
- **WHEN** las bandas no se pudieron cargar
- **THEN** la sección de mix informa que no puede mostrarse, en vez de una matriz cuyas columnas no se sabe qué representan

### Requirement: Modelo de preguntas del pool de scoring
La sección Preguntas de Parámetros del modelo SHALL cargar su contenido desde un endpoint mockeado, con cada pregunta identificada por un código propio, su texto, su peso y la dimensión a la que pertenece. Las dimensiones SHALL ser una lista fija de siete —Negocio y cliente, Alcance funcional, Integraciones, Datos, seguridad y cumplimiento, Tecnología y arquitectura, Operación y soporte, e Incertidumbre y dependencias— y este requisito NO SHALL permitir crear, quitar ni renombrar dimensiones: son el eje estructural del modelo, no un dato editable por pregunta.

La tabla de la sección SHALL mostrar, para cada dimensión y en ese orden, su cantidad de preguntas, la suma de sus pesos y el máximo de puntos alcanzable, derivados de las preguntas cargadas. El peso SHALL presentarse como un número entero, no como un porcentaje.

#### Scenario: Carga desde el endpoint mockeado
- **WHEN** se abre la sección Preguntas
- **THEN** la tabla muestra las siete dimensiones con la cantidad de preguntas, el peso total y el máximo de puntos que resultan de las preguntas cargadas, no valores escritos de antemano

#### Scenario: El peso es un número, no un porcentaje
- **WHEN** se muestra el peso total de una dimensión
- **THEN** aparece como un número entero, sin el símbolo `%`

#### Scenario: Las dimensiones no se editan
- **WHEN** se revisa qué puede cambiar un usuario en esta sección
- **THEN** puede cambiar preguntas, pero no la lista de dimensiones ni a cuál de las siete pertenece cada una más allá de asignarla al crearla

### Requirement: Edición del pool de preguntas
La sección Preguntas SHALL ofrecer una acción de edición, visible únicamente mientras esa sección está activa, que abra un editor con las preguntas agrupadas por dimensión. El editor SHALL permitir modificar el texto y el peso de cada pregunta, y agregar o quitar preguntas dentro de una dimensión. Un texto vacío o un peso que no sea un entero positivo SHALL señalarse junto al campo que lo tiene y SHALL impedir confirmar hasta corregirlo. Editar, agregar y quitar SHALL confirmarse juntos, y cancelar SHALL descartar todo lo editado, altas y bajas incluidas.

#### Scenario: Ver la acción de la sección
- **WHEN** el usuario tiene abierta la sección Preguntas
- **THEN** ve la acción "Editar preguntas" junto a las pestañas de la pantalla

#### Scenario: La acción no aplica a otras secciones
- **WHEN** el usuario cambia a otra de las secciones de la pantalla
- **THEN** la acción de editar preguntas deja de mostrarse

#### Scenario: Editar el texto o el peso de una pregunta
- **WHEN** el usuario cambia el texto o el peso de una pregunta existente
- **THEN** ese cambio queda registrado en el editor junto con los de las demás preguntas, para confirmarse todo junto

#### Scenario: Agregar una pregunta
- **WHEN** el usuario agrega una pregunta dentro de una dimensión
- **THEN** la nueva pregunta aparece en esa dimensión, sin texto ni peso todavía, y bloquea la confirmación hasta completarse

#### Scenario: Quitar una pregunta
- **WHEN** el usuario quita una pregunta del editor
- **THEN** esa pregunta deja de estar en la lista a confirmar, sin afectar a las demás

#### Scenario: Intentar confirmar con datos inválidos
- **WHEN** alguna pregunta del editor tiene el texto vacío o un peso que no es un entero positivo
- **THEN** el sistema señala el error junto al campo correspondiente y la acción de confirmar permanece deshabilitada hasta corregirlo

#### Scenario: Cancelar el editor
- **WHEN** el usuario cierra el editor sin confirmar
- **THEN** el pool de preguntas queda como estaba antes de abrirlo, incluidas las altas y bajas hechas durante la edición

#### Scenario: Confirmar cambios válidos
- **WHEN** el usuario confirma un pool de preguntas válido
- **THEN** el sistema lo persiste contra el endpoint mockeado, cierra el editor y la tabla de la sección pasa a mostrar los valores derivados de las preguntas nuevas

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al confirmar
- **THEN** el sistema muestra un mensaje de error y conserva lo editado, sin cerrar el editor ni perder los cambios

### Requirement: Acceso autenticado al esqueleto de Admin
El sistema SHALL exigir sesión autenticada para acceder a las 4 rutas del esqueleto de Admin, y SHALL exigir además el rol de administrador. Un usuario sin sesión SHALL ser llevado a iniciar sesión; uno con sesión pero sin el rol SHALL recibir un aviso de permisos insuficientes.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a una ruta del esqueleto de Admin
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceder con rol de administrador
- **WHEN** un usuario con sesión y con rol de administrador navega a una ruta del esqueleto de Admin
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceder con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin rol de administrador navega a una ruta del esqueleto de Admin
- **THEN** el sistema le indica que no tiene permisos, sin mandarlo a iniciar sesión
