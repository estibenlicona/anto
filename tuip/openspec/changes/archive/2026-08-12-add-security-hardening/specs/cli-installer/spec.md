## ADDED Requirements

### Requirement: Contención de las escrituras dentro del proyecto
El CLI SHALL escribir únicamente dentro del proyecto sobre el que se lo invoca. Todo destino de escritura SHALL resolverse por completo antes de usarse y SHALL verificarse contra la raíz de ese proyecto, incluso cuando provenga de la configuración del propio proyecto — el CLI corre en la máquina de otra persona, sobre un repositorio que esa persona pudo haber clonado, así que su configuración no es una entrada confiable. Un destino que quede fuera SHALL rechazarse informando el motivo, y el rechazo SHALL ocurrir antes de escribir cualquier archivo de la operación.

#### Scenario: Configuración que apunta fuera del proyecto
- **WHEN** la configuración del proyecto define una raíz de componentes que, una vez resuelta, queda fuera del proyecto
- **THEN** el CLI rechaza la operación indicando cuál es el destino ofensivo y no escribe ningún archivo

#### Scenario: Ningún archivo escrito a medias
- **WHEN** se agregan varios componentes en una sola invocación y uno de los destinos queda fuera del proyecto
- **THEN** no se escribe ninguno de los archivos de esa invocación, ni siquiera los de los componentes cuyos destinos eran válidos

#### Scenario: Un nombre de directorio que empieza igual que la raíz
- **WHEN** un destino resuelve a un directorio hermano cuyo nombre comienza con el nombre de la raíz del proyecto
- **THEN** el CLI lo considera fuera del proyecto, porque la verificación compara rutas resueltas y no prefijos de texto

#### Scenario: Ruta anidada legítima
- **WHEN** la configuración define una raíz de componentes anidada varios niveles dentro del proyecto
- **THEN** el CLI escribe normalmente, sin que la verificación interfiera con un uso legítimo
