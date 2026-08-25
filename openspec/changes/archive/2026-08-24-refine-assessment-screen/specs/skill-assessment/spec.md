## MODIFIED Requirements

### Requirement: Evaluación de una persona
El sistema SHALL permitir al Chapter Lead abrir la evaluación de una persona del chapter para un ciclo, en `/app/lead/personas/:id/evaluacion`. La evaluación SHALL recorrer todas las habilidades **activas** del catálogo vigente, agrupadas en humanas y técnicas, mostrando en un índice cuáles ya tienen nivel y cuáles faltan, y su avance ("6 de 9 habilidades evaluadas").

El índice SHALL distinguir los tres estados de una habilidad —evaluada, la que se está evaluando, y pendiente— y SHALL nombrar en palabras la que se está evaluando y las pendientes, con una marca visual propia que no dependa de leer el texto de la fila. La ya evaluada SHALL distinguirse con su propia marca, sin repetir la palabra: en una lista de nueve, lo que se busca es lo que falta.

SHALL existir a lo sumo una evaluación en curso por persona y ciclo. Al abrirla, el sistema SHALL indicar qué nivel pide el rol de esa persona en cada habilidad, tomándolo del catálogo, y SHALL decirlo también cuando el rol no declara ninguno, en vez de callar el caso.

#### Scenario: Abrir la evaluación
- **WHEN** el Chapter Lead abre la evaluación de una persona
- **THEN** ve las habilidades activas agrupadas, cuántas llevan nivel, y para la habilidad abierta el nivel que pide el rol de esa persona

#### Scenario: Los estados del índice se distinguen de un vistazo
- **WHEN** el Chapter Lead recorre el índice con habilidades evaluadas, una en curso y varias pendientes
- **THEN** cada uno de los tres estados se reconoce por su propia marca y no por el peso del texto de la fila

#### Scenario: El rol no declara nivel
- **WHEN** el rol de esa persona no tiene nivel declarado en la habilidad abierta
- **THEN** la pantalla lo dice explícitamente, en vez de dejar el espacio vacío

#### Scenario: Una sola evaluación en curso
- **WHEN** ya hay una evaluación en curso para esa persona y ciclo
- **THEN** el sistema abre esa en vez de crear una segunda

#### Scenario: Habilidad desactivada
- **WHEN** el catálogo tiene una habilidad desactivada
- **THEN** la evaluación no la ofrece, y las evaluaciones anteriores que la usaron la siguen mostrando

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
