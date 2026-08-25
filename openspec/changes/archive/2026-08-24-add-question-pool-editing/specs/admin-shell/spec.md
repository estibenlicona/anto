## ADDED Requirements

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
