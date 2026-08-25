## MODIFIED Requirements

### Requirement: Evaluación de una persona
El sistema SHALL permitir al Chapter Lead abrir la evaluación de una persona del chapter para un ciclo, en `/app/lead/personas/:id/evaluacion`. La evaluación SHALL recorrer todas las habilidades **activas** del catálogo vigente, agrupadas en humanas y técnicas, mostrando en un índice cuáles ya tienen nivel y cuáles faltan, y su avance ("6 de 9 habilidades evaluadas").

El índice SHALL distinguir los tres estados de una habilidad —evaluada, la que se está evaluando, y pendiente— y SHALL nombrar en palabras la que se está evaluando y las pendientes, con una marca visual propia que no dependa de leer el texto de la fila. La ya evaluada SHALL distinguirse con su propia marca, sin repetir la palabra: en una lista de nueve, lo que se busca es lo que falta.

SHALL existir a lo sumo una evaluación en curso por persona y ciclo. Al abrirla, el sistema SHALL indicar qué nivel pide el cargo de esa persona en cada habilidad, tomándolo del catálogo, y SHALL decirlo también cuando el cargo no declara ninguno, en vez de callar el caso.

#### Scenario: Abrir la evaluación
- **WHEN** el Chapter Lead abre la evaluación de una persona
- **THEN** ve las habilidades activas agrupadas, cuántas llevan nivel, y para la habilidad abierta el nivel que pide el cargo de esa persona

#### Scenario: Los estados del índice se distinguen de un vistazo
- **WHEN** el Chapter Lead recorre el índice con habilidades evaluadas, una en curso y varias pendientes
- **THEN** cada uno de los tres estados se reconoce por su propia marca y no por el peso del texto de la fila

#### Scenario: El rol no declara nivel
- **WHEN** el cargo de esa persona no tiene nivel declarado en la habilidad abierta
- **THEN** la pantalla lo dice explícitamente, en vez de dejar el espacio vacío

#### Scenario: Una sola evaluación en curso
- **WHEN** ya hay una evaluación en curso para esa persona y ciclo
- **THEN** el sistema abre esa en vez de crear una segunda

#### Scenario: Habilidad desactivada
- **WHEN** el catálogo tiene una habilidad desactivada
- **THEN** la evaluación no la ofrece, y las evaluaciones anteriores que la usaron la siguen mostrando

### Requirement: Brecha derivada de los criterios sin marcar
Cuando el nivel evaluado de una habilidad queda por debajo del que pide el cargo de esa persona, el sistema SHALL registrar una brecha con la diferencia de niveles y con **los criterios sin marcar del nivel exigido** como contenido, sin pedir que se escriban de nuevo. El evaluador SHALL poder agregar una nota, obligatoria cuando hay brecha y opcional cuando no la hay.

Cuando el nivel evaluado alcanza o supera el que pide el cargo, el sistema SHALL indicar que no hay brecha. Cuando el cargo no tiene nivel declarado para esa habilidad, el sistema SHALL indicarlo y NOT registrar brecha.

#### Scenario: Brecha con su contenido
- **WHEN** una persona queda en Competente y su cargo pide Avanzado
- **THEN** la evaluación registra una brecha de un nivel y lista los criterios de Avanzado que quedaron sin marcar

#### Scenario: Sin brecha
- **WHEN** el nivel evaluado alcanza o supera el que pide el cargo
- **THEN** la evaluación lo indica como sin brecha y la nota queda opcional

#### Scenario: La nota es obligatoria con brecha
- **WHEN** hay brecha y el evaluador intenta pasar a la habilidad siguiente sin nota
- **THEN** el sistema se lo exige y no avanza

#### Scenario: Rol sin nivel declarado
- **WHEN** el cargo de la persona no tiene nivel declarado en esa habilidad
- **THEN** la evaluación lo muestra como sin definir y no registra brecha

