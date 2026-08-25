## ADDED Requirements

### Requirement: Línea de expertise de una persona
Cada persona SHALL pertenecer a lo sumo a una línea de expertise, o a ninguna. El panel **Ficha** del detalle de persona SHALL mostrar la línea real a la que pertenece y el nombre de su lead, tomados del maestro de líneas y no de un valor fijo. Cuando la persona no pertenece a ninguna línea, la Ficha SHALL decirlo explícitamente en vez de mostrar una línea que no es suya, y SHALL enlazar a la pantalla de Líneas de expertise para asignarla. Cuando la línea de la persona no tiene lead designado, la Ficha SHALL mostrar la línea e indicar que está sin lead.

La línea de una persona SHALL cambiarse desde la pantalla de Líneas de expertise, que es donde se ve el reparto completo; el formulario de alta y edición de persona SHALL NOT capturarla, para que no existan dos lugares que la editen con distinta información a la vista.

#### Scenario: Persona con línea y lead
- **WHEN** se abre el detalle de una persona que pertenece a una línea con lead designado
- **THEN** la Ficha muestra el nombre de esa línea y el nombre de su lead

#### Scenario: Persona sin línea
- **WHEN** se abre el detalle de una persona que no pertenece a ninguna línea
- **THEN** la Ficha indica que no tiene línea de expertise asignada y ofrece ir a la pantalla de Líneas para asignarla, sin mostrar un nombre de línea ni de lead

#### Scenario: Línea sin lead
- **WHEN** se abre el detalle de una persona cuya línea todavía no tiene lead
- **THEN** la Ficha muestra el nombre de la línea e indica que está sin lead, en vez de dejar el dato en blanco

#### Scenario: La persona es el lead de su línea
- **WHEN** se abre el detalle de la persona que lidera su propia línea
- **THEN** la Ficha muestra la línea y señala que ella misma es su lead, sin repetir su nombre como si fuera otra persona

#### Scenario: La ficha sigue al maestro
- **WHEN** una persona se mueve a otra línea, o su línea cambia de nombre o de lead
- **THEN** la Ficha de esa persona muestra el valor nuevo la próxima vez que se abre, sin que haya que tocar la persona

#### Scenario: El formulario de persona no captura la línea
- **WHEN** el Chapter Lead abre el alta o la edición de una persona
- **THEN** el formulario no ofrece elegir la línea de expertise, y guardar la persona no cambia la línea a la que pertenece
