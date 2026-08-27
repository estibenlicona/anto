# absence-registration Specification

## Purpose

Define qué pide el formulario de alta de una ausencia del chapter, cómo se elige el tipo, qué resume antes de enviar y qué comprueba, de modo que registrar una ausencia no obligue a abrir listas para ver tres opciones.

## Requirements

### Requirement: El tipo se elige entre opciones a la vista
El formulario NO SHALL pedir el tipo de ausencia con un desplegable. SHALL mostrar los tres tipos —Vacaciones, Permiso e Incapacidad— como opciones simultáneamente visibles y seleccionables de un solo toque, cada una con su nombre y su icono. SHALL poder elegirse exactamente uno, y la opción elegida SHALL distinguirse por algo más que el color: el estado seleccionado lleva además una marca.

#### Scenario: Elegir el tipo
- **WHEN** el usuario abre el formulario de alta
- **THEN** los tres tipos se ven a la vez, sin desplegar nada
- **AND** al tocar uno queda seleccionado y los otros dos dejan de estarlo

#### Scenario: Distinguir el elegido sin depender del color
- **WHEN** un tipo está seleccionado
- **THEN** además del cambio de color, la opción muestra una marca de selección

#### Scenario: Navegación por teclado
- **WHEN** el usuario recorre el formulario con el teclado
- **THEN** el grupo de tipos se alcanza y se opera con el teclado, y anuncia cuál está seleccionado

### Requirement: Cómo se piden las fechas depende del tipo
El formulario SHALL pedir siempre la persona del chapter y el tipo. Con el tipo Permiso elegido, SHALL ofrecer tres duraciones excluyentes —día completo, medio día y varios días—, con día completo elegida de entrada y la elegida visiblemente marcada. Con día completo o medio día SHALL pedir **un solo día**, sin pedir rango. Con varios días SHALL pedir un rango de fechas y contarlo por días completos, sin ofrecer medio día en sus extremos. Con Vacaciones o Incapacidad, SHALL pedir un rango de fechas y NO SHALL ofrecer medio día ni duración alguna.

#### Scenario: Permiso de un día
- **WHEN** el tipo elegido es Permiso y la duración es día completo o medio día
- **THEN** el formulario pide un único día
- **AND** no pide fecha de inicio y fecha de fin por separado

#### Scenario: Permiso de varios días
- **WHEN** el tipo elegido es Permiso y la duración es varios días
- **THEN** el formulario pide un rango de fechas, como con Vacaciones
- **AND** no ofrece medio día para ninguno de los dos extremos

#### Scenario: Vacaciones o incapacidad
- **WHEN** el tipo elegido es Vacaciones o Incapacidad
- **THEN** el formulario pide un rango de fechas y no ofrece ni duración ni medio día

#### Scenario: La duración elegida se ve marcada
- **WHEN** el usuario elige una de las tres duraciones del permiso
- **THEN** esa opción se muestra marcada y las otras dos no

#### Scenario: Cambiar de duración
- **WHEN** el usuario cambia la duración del permiso entre un solo día y varios días
- **THEN** el formulario cambia lo que pide, y lo que quede de la forma anterior no viaja en el registro

#### Scenario: Cambiar de tipo
- **WHEN** el usuario cambia el tipo entre Permiso y otro
- **THEN** el formulario cambia lo que pide, y lo que quede de la forma anterior no viaja en el registro

### Requirement: El formulario resume los días hábiles antes de enviar
Con las fechas completas, el formulario SHALL mostrar el número de días hábiles que se van a registrar —ya contado el medio día si lo hay— junto a ellas, indicando que son de lunes a viernes y sin festivos. El resumen SHALL actualizarse al cambiar las fechas o cualquier marca de media jornada.

#### Scenario: Elegir medio día cambia el resumen
- **WHEN** el usuario elige un permiso de un día hábil y pasa su duración a medio día
- **THEN** el resumen pasa de 1 a 0.5 días hábiles

#### Scenario: Fecha incompleta
- **WHEN** falta el día del permiso, o alguna de las dos fechas del rango
- **THEN** no se muestra ningún resumen de días

### Requirement: El formulario comprueba lo que envía
Al intentar registrar, el formulario SHALL exigir persona, tipo y fechas completas, SHALL rechazar un fin anterior al inicio, y SHALL rechazar unas fechas que no contengan ningún día hábil que registrar —un permiso sobre un día no hábil, entre ellas—. Cada problema SHALL señalarse en el campo que lo causa.

#### Scenario: Enviar en blanco
- **WHEN** el usuario intenta registrar sin elegir persona ni tipo ni fechas
- **THEN** el formulario no envía nada y señala qué falta en cada campo

#### Scenario: Rango invertido
- **WHEN** el fin es anterior al inicio
- **THEN** el formulario lo señala en el rango y no envía

#### Scenario: Fechas sin días hábiles
- **WHEN** el rango cae entero en fin de semana, o el día elegido para el permiso no es hábil
- **THEN** el formulario lo señala en el campo de fechas y no envía

#### Scenario: Alta correcta
- **WHEN** el formulario está completo y el usuario registra
- **THEN** la ausencia se registra como solicitada, con su medio día si lo tiene, y el formulario se cierra

### Requirement: La persona se pide bajo el título de su sección
El campo de persona NO SHALL mostrar un rótulo propio a la vista: lo nombra el título "Persona" de la sección que lo contiene. El campo SHALL conservar de todos modos un nombre accesible, "Persona", para quien navegue con tecnología de apoyo.

#### Scenario: Abrir el formulario
- **WHEN** el usuario abre el formulario de alta
- **THEN** sobre el selector de persona no se lee "Persona del chapter" ni ningún otro rótulo aparte del título de la sección
- **AND** el selector se anuncia como "Persona" a la tecnología de apoyo
