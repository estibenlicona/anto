## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: La persona se pide bajo el título de su sección
El campo de persona NO SHALL mostrar un rótulo propio a la vista: lo nombra el título "Persona" de la sección que lo contiene. El campo SHALL conservar de todos modos un nombre accesible, "Persona", para quien navegue con tecnología de apoyo.

#### Scenario: Abrir el formulario
- **WHEN** el usuario abre el formulario de alta
- **THEN** sobre el selector de persona no se lee "Persona del chapter" ni ningún otro rótulo aparte del título de la sección
- **AND** el selector se anuncia como "Persona" a la tecnología de apoyo
