## Purpose

Define que los controles de elección compartidos —radio, casilla e interruptor— muestren su estado marcado en cualquier pantalla de la aplicación, sin que dependa de qué otras utilidades de estilo genere la aplicación para sus propias pantallas.

## ADDED Requirements

### Requirement: El control marcado se ve marcado
Un radio, una casilla o un interruptor SHALL mostrar su estado marcado con su marca propia —el punto del radio, el check de la casilla, la posición del interruptor— además del cambio de color del contorno o del fondo. La marca SHALL aparecer al marcar y desaparecer al desmarcar, en cualquier pantalla de la aplicación.

#### Scenario: Marcar un radio
- **WHEN** el usuario elige una opción de un grupo de radios
- **THEN** esa opción muestra el punto interior y las demás no

#### Scenario: Marcar una casilla
- **WHEN** el usuario marca una casilla
- **THEN** la casilla muestra el check sobre su fondo

#### Scenario: Cambiar la elección
- **WHEN** el usuario elige otra opción del mismo grupo de radios
- **THEN** el punto pasa a la nueva opción y deja la anterior

### Requirement: El estado de un control prevalece sobre las utilidades base de la aplicación
La hoja de estilos publicada del catálogo SHALL garantizar que las reglas que expresan el estado de un control (marcado, deshabilitado, con foco, al pasar el cursor) prevalezcan sobre cualquier utilidad base que toque la misma propiedad, la publique el catálogo o la genere la aplicación por usarla en otra pantalla. Lo que la aplicación escribe por su cuenta sobre un componente SHALL seguir ganando a la utilidad base con que el componente se dibuja.

#### Scenario: La aplicación usa por su cuenta una utilidad que el control también usa
- **WHEN** una pantalla de la aplicación usa una utilidad de estilo que el control usa para su estado en reposo
- **THEN** el control sigue mostrando su marca al marcarse, igual que si la aplicación no la usara

#### Scenario: La aplicación ajusta un componente
- **WHEN** una pantalla pasa a un componente una utilidad base que compite con una del propio componente
- **THEN** la de la pantalla sigue ganando, como hasta ahora
