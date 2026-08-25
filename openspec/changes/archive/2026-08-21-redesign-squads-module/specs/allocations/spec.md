## MODIFIED Requirements

### Requirement: Elegir una célula para administrar su equipo
El sistema SHALL permitir al Chapter Lead elegir, entre las células ya registradas, una célula para ver y administrar sus asignaciones, y SHALL aceptar que la célula llegue preseleccionada desde la URL de la pantalla de Capacidades, para que otras pantallas puedan enlazar directamente al equipo de una célula.

#### Scenario: Elegir una célula
- **WHEN** el Chapter Lead abre la pantalla de Capacidades y selecciona una célula
- **THEN** el sistema muestra las asignaciones vigentes de esa célula

#### Scenario: Célula preseleccionada desde la URL
- **WHEN** el Chapter Lead llega a la pantalla de Capacidades con el identificador de una célula registrada en la URL
- **THEN** el selector aparece con esa célula ya elegida y el sistema muestra sus asignaciones sin que el usuario tenga que seleccionarla

#### Scenario: Identificador de célula desconocido en la URL
- **WHEN** la URL trae un identificador que no corresponde a ninguna célula registrada
- **THEN** el sistema muestra la pantalla como si no hubiera célula preseleccionada, sin error

#### Scenario: Cambiar la célula preseleccionada
- **WHEN** el Chapter Lead llegó con una célula preseleccionada y elige otra en el selector
- **THEN** el sistema muestra las asignaciones de la nueva célula y la URL refleja la célula elegida

#### Scenario: Sin células registradas
- **WHEN** el Chapter Lead abre la pantalla de Capacidades y no existe ninguna célula registrada
- **THEN** el sistema muestra un estado vacío que invita a crear una célula primero, sin mostrar un selector vacío
