# skill-assessment Specification

## Purpose
TBD - created by archiving change add-skill-assessment. Update Purpose after archive.
## Requirements
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

### Requirement: Elegir el nivel leyendo los criterios
Por cada habilidad, el sistema SHALL mostrar sus cuatro niveles con la lista completa de criterios de cada uno, sin asumir una cantidad: un nivel puede tener más o menos criterios que otro de la misma habilidad. Cada criterio SHALL poder marcarse como cumplido, y cada nivel SHALL mostrar cuántos cumple sobre su total.

El nivel evaluado lo SHALL elegir el Chapter Lead de forma explícita; el sistema SHALL NOT derivarlo automáticamente de los criterios marcados. Los criterios marcados SHALL guardarse junto con el nivel, de modo que la decisión quede sustentada.

#### Scenario: Marcar criterios y elegir nivel
- **WHEN** el Chapter Lead marca los criterios que la persona cumple y elige un nivel
- **THEN** cada nivel muestra su contador de cumplidos sobre su total, y la habilidad queda con ese nivel y esas marcas guardadas

#### Scenario: Cantidades distintas por nivel
- **WHEN** una habilidad tiene 6 criterios en Avanzado y 4 en Experto
- **THEN** cada nivel muestra los suyos y su propio contador, sin recortar ni rellenar

#### Scenario: El sistema no decide el nivel
- **WHEN** la persona cumple todos los criterios de un nivel
- **THEN** el sistema no cambia el nivel elegido por su cuenta; el contador queda como evidencia de la decisión

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

### Requirement: Cierre de una evaluación
El sistema SHALL permitir guardar la evaluación en curso y retomarla después. Cerrarla SHALL requerir que todas las habilidades activas tengan nivel; al cerrarse, el sistema SHALL estampar la versión del catálogo usada y congelar niveles, criterios marcados y brechas.

Cerrar SHALL requerir una confirmación explícita del Chapter Lead antes de ejecutarse. La confirmación SHALL decir qué queda fijado, que a partir de ahí se abre el plan de carrera, y que la acción no se deshace. SHALL ofrecer una salida que no cierre nada, y esa salida SHALL ser la que ocurre si el Chapter Lead descarta el diálogo sin decidir.

El aviso sobre lo que implica cerrar NO SHALL ocupar lugar permanente en la pantalla: una advertencia que se lee siempre deja de leerse, y el momento en que importa es aquel en que se está por apretar.

Una evaluación cerrada SHALL ser de sólo lectura y SHALL NOT recalcularse cuando el catálogo cambia. Corregirla SHALL hacerse evaluando de nuevo, y la anterior queda como historia.

#### Scenario: Cerrar completa
- **WHEN** todas las habilidades activas tienen nivel y el Chapter Lead confirma el cierre
- **THEN** la evaluación queda cerrada, con la versión del catálogo estampada y sus cifras congeladas

#### Scenario: Pedir confirmación antes de cerrar
- **WHEN** el Chapter Lead pide cerrar la evaluación
- **THEN** el sistema le muestra qué queda fijado y que no se deshace, y no cierra nada hasta que lo confirme

#### Scenario: Desistir del cierre
- **WHEN** descarta la confirmación sin aceptarla
- **THEN** la evaluación sigue en curso, con los niveles y los criterios tal como estaban

#### Scenario: Cerrar incompleta
- **WHEN** intenta cerrar con habilidades sin nivel
- **THEN** el sistema lo impide y le indica cuáles faltan

#### Scenario: Retomar más tarde
- **WHEN** guarda y vuelve después
- **THEN** encuentra los niveles y los criterios marcados como los dejó

#### Scenario: El catálogo cambia después del cierre
- **WHEN** se publica una versión nueva del catálogo
- **THEN** la evaluación cerrada conserva los criterios, los niveles esperados y las brechas con los que se cerró
