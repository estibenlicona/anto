## MODIFIED Requirements

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

## ADDED Requirements

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
