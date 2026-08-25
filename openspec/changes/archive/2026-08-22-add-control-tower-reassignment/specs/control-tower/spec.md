## Purpose

La capacidad `control-tower` es la pantalla de inicio del Chapter Lead: resume la capacidad del chapter, muestra qué personas tienen margen y qué células necesitan gente, y permite asignar o reasignar a una persona viendo el resultado antes de aplicarlo.

## ADDED Requirements

### Requirement: Resumen de capacidad del chapter
El sistema SHALL mostrar en la raíz de Chapter Lead una Torre de control con un encabezado ("Torre de control" y su descripción) y tres indicadores calculados sobre todas las personas y células registradas: el FTE del chapter repartido en BAU, Transformación y libre (con el porcentaje sin asignar); cuántas personas tienen margen, distinguiendo sin célula y con dedicación parcial; y cuántas células están al tope y cuántas sin equipo. Una persona tiene margen cuando no tiene célula o cuando su dedicación es menor al 100 %; una célula está al tope cuando su FTE asignado alcanza o supera el FTE disponible de su equipo.

#### Scenario: Indicadores con datos
- **WHEN** el Chapter Lead abre la raíz de Chapter Lead con personas y células registradas
- **THEN** ve el FTE del chapter con su reparto BAU / Transformación / libre y el porcentaje sin asignar, el total de personas con margen con cuántas no tienen célula y cuántas tienen dedicación parcial, y cuántas células están al tope y sin equipo

#### Scenario: Chapter sin personas
- **WHEN** no hay personas registradas
- **THEN** los indicadores muestran ceros sin errores de cálculo y los paneles muestran sus estados vacíos

#### Scenario: Error al cargar
- **WHEN** la petición del resumen falla
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar, sin pantalla en blanco

### Requirement: Personas con margen
El sistema SHALL listar en la Torre de control a las personas con margen: primero las que no tienen célula (marcadas como "Sin célula", con su FTE disponible como margen y la acción "Asignar"), luego las de dedicación parcial ordenadas por margen descendente (con su célula, su dedicación y desglose BAU / Transformación, el margen en FTE y la acción "Reasignar"). Las personas al 100 % NO SHALL aparecer; el pie del panel SHALL decir cuántas quedan fuera por estar al tope. El panel SHALL enlazar al listado de Personas.

#### Scenario: Orden del panel
- **WHEN** hay personas sin célula y personas con dedicación parcial
- **THEN** las sin célula aparecen primero y el resto ordenado de mayor a menor margen

#### Scenario: Fila de una persona sin célula
- **WHEN** una persona no tiene asignación
- **THEN** su fila muestra "Sin célula", su FTE disponible como margen y el botón "Asignar"

#### Scenario: Fila de una persona con dedicación parcial
- **WHEN** una persona tiene 60 % en una célula
- **THEN** su fila muestra la célula, 60 % con su desglose BAU / Transformación, 40 % de margen y el botón "Reasignar"

#### Scenario: Nadie con margen
- **WHEN** todas las personas están al 100 % en su célula
- **THEN** el panel muestra un estado vacío que lo dice, sin tabla

### Requirement: Ocupación por célula
El sistema SHALL listar en la Torre de control todas las células con su criticidad, cantidad de personas y la misma representación de capacidad del listado de Células (asignado / disponible, porcentaje, barra y libre o "Al tope"), ordenadas con las que necesitan gente primero (sin equipo, luego al tope, luego por menor margen). El panel SHALL enlazar al listado de Células.

#### Scenario: Orden del panel
- **WHEN** hay células sin equipo, al tope y con margen
- **THEN** aparecen en ese orden

#### Scenario: Célula sin equipo
- **WHEN** una célula no tiene asignaciones
- **THEN** su fila muestra "Sin equipo" y la lectura "Necesita equipo primero"

### Requirement: Asignar o reasignar a una persona desde la Torre
El sistema SHALL permitir, desde la fila de una persona con margen, abrir un panel lateral que muestra su situación actual (célula, dedicación, desglose y margen, o "sin célula"), captura qué hacer con el margen — para una persona con célula: mover a otra célula o subir la dedicación donde está; para una persona sin célula: asignar a una célula —, la célula destino (ordenadas por necesidad: sin equipo, al tope, resto), la dedicación y su desglose BAU / Transformación con las mismas validaciones que el alta de asignación, y un bloque "Así queda" con la persona y las células afectadas antes y después, avisando cuando la célula origen quedaría sin equipo. Al confirmar, el sistema SHALL aplicar el cambio sobre las asignaciones (quitar y crear al mover; editar al subir; crear al asignar), refrescar la Torre y confirmar el éxito; ante un error del servidor SHALL mostrar el motivo sin perder lo ingresado. Una persona NO SHALL quedar con asignación en dos células.

#### Scenario: Mover a otra célula
- **WHEN** el Chapter Lead elige "Mover a otra célula", una célula destino y una dedicación válida, y confirma
- **THEN** el sistema quita la asignación actual, crea la nueva en la célula destino, muestra el éxito y la Torre refleja el cambio

#### Scenario: Subir la dedicación
- **WHEN** el Chapter Lead elige "Subir la dedicación" e ingresa una dedicación mayor a la actual con un desglose válido, y confirma
- **THEN** el sistema actualiza la asignación existente y la Torre refleja el nuevo margen

#### Scenario: Asignar a una persona sin célula
- **WHEN** el Chapter Lead abre "Asignar" para una persona sin célula, elige una célula y una dedicación válida, y confirma
- **THEN** el sistema crea la asignación y la persona deja de aparecer como sin célula

#### Scenario: Vista previa del resultado
- **WHEN** el Chapter Lead completa destino y dedicación
- **THEN** el bloque "Así queda" muestra la persona antes y después, y las células origen y destino con su FTE asignado antes y después, marcando si el origen queda sin equipo

#### Scenario: Validación
- **WHEN** la dedicación está fuera de 1–100, el desglose no suma la dedicación, o falta la célula destino
- **THEN** el sistema impide confirmar y señala el campo, sin llamar al backend

#### Scenario: Error del servidor
- **WHEN** el backend responde con error al aplicar
- **THEN** el sistema muestra el motivo y conserva lo ingresado; si el movimiento ya quitó la asignación origen y falla la creación, lo informa explícitamente para que el usuario la vuelva a crear
