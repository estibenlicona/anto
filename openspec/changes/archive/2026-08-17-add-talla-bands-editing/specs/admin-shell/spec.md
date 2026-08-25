## MODIFIED Requirements

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales, salvo la pantalla de Calendario de sprints, que SHALL cargar y guardar su configuración contra un endpoint mockeado, y la sección de bandas de talla de Parámetros del modelo, que SHALL cargar y guardar sus bandas del mismo modo (ver capability `api-mocking`). El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

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
- **THEN** se muestran las cuatro secciones (bandas de talla, mix de capacidades, pool de preguntas, versionado) como pestañas, con datos de marcador de posición salvo las bandas de talla, que se cargan del endpoint mockeado, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

## ADDED Requirements

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
