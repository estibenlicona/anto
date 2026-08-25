## MODIFIED Requirements

### Requirement: Opciones del componente Switch
El componente Switch SHALL aplicar su cambio de estado de inmediato, sin requerir una acción de confirmación posterior, y SHALL exponerse a las tecnologías de asistencia con el rol de interruptor y no el de casilla de verificación. El track encendido SHALL usar el color de marca de fondo; el track apagado SHALL usar un gris neutro, sin ningún tinte de marca. El thumb SHALL ser blanco (`neutral-0`) en ambos estados. Un Switch deshabilitado SHALL verse igual esté marcado o no, con el mismo tratamiento visual de deshabilitado que el resto de los controles del catálogo, sin el color de marca del track encendido.

#### Scenario: El cambio se aplica al instante
- **WHEN** un usuario activa un Switch
- **THEN** el efecto de ese cambio ocurre de inmediato, sin esperar una acción de guardado

#### Scenario: Rol distinto del de Checkbox
- **WHEN** una tecnología de asistencia encuentra un Switch
- **THEN** lo anuncia con un rol de interruptor, distinguible del rol que usa Checkbox

#### Scenario: Color del track encendido
- **WHEN** un Switch está encendido
- **THEN** su track usa el color de marca de fondo

#### Scenario: Track apagado sin tinte de marca
- **WHEN** un Switch está apagado
- **THEN** su track usa un gris neutro, sin ningún tinte del color de marca

#### Scenario: Thumb blanco en ambos estados
- **WHEN** un Switch cambia entre encendido y apagado
- **THEN** su thumb permanece blanco (`neutral-0`) en los dos estados

#### Scenario: Deshabilitado no se confunde con habilitado
- **WHEN** un Switch marcado se deshabilita
- **THEN** su track y su thumb toman el tratamiento visual de deshabilitado, sin el color de marca que tendría el mismo Switch marcado y habilitado
