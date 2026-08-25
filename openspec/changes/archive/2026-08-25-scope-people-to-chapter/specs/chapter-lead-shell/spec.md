## ADDED Requirements

### Requirement: El Chapter Lead sólo ve las personas a su cargo
Toda pantalla del rol Chapter Lead que enumere, cuente o resuma personas SHALL considerar únicamente las personas del chapter que ese Chapter Lead lidera. Alcanza al listado de Personas y a sus indicadores, a la matriz del span, al equipo de cada célula, a la ocupación de la torre de control, al calendario de ausencias y a las asignaciones.

El acotado SHALL hacerlo el **servidor**, resolviendo la responsabilidad a partir del titular del token. La interfaz SHALL consumir lo que recibe y SHALL NOT filtrar por su cuenta: filtrar en el cliente una respuesta que ya trae los datos ajenos no restringe el acceso —los datos igual viajaron—, y además obliga a repetir la misma regla en cada pantalla, donde tarde o temprano una queda afuera.

Una persona SHALL pertenecer a un chapter, y ese chapter SHALL tener un Chapter Lead. La relación entre una persona y quien la tiene a cargo SHALL ser una sola en todo el sistema: si además existe otra jerarquía que nombre un responsable —una línea de expertise con su líder, por ejemplo—, lo que el sistema muestre como el Chapter Lead de una persona SHALL salir de la misma relación que decide qué ve ese lead. Dos jerarquías de responsabilidad en paralelo terminan contradiciéndose, y la contradicción aparece como una persona que figura a cargo de alguien que no la ve en su listado.

Todo total, promedio o porcentaje que la interfaz presente como "del chapter" SHALL calcularse sobre ese mismo conjunto acotado.

#### Scenario: El listado no incluye personas de otro chapter
- **WHEN** el sistema registra personas de más de un chapter y el Chapter Lead abre cualquier pantalla que enumere personas
- **THEN** sólo aparecen las de su chapter, y las de los demás no llegan siquiera en la respuesta del servidor

#### Scenario: La interfaz no filtra por su cuenta
- **WHEN** una pantalla del Chapter Lead recibe una lista de personas del servidor
- **THEN** la muestra tal como llega, sin descartar filas por responsabilidad, porque esa decisión ya se tomó donde están los datos

#### Scenario: Los totales acompañan al alcance
- **WHEN** una pantalla muestra un total, un promedio o un porcentaje descrito como "del chapter"
- **THEN** la cifra se calcula sobre las personas a cargo de ese Chapter Lead y no sobre todas las del sistema

#### Scenario: Una sola relación de responsabilidad
- **WHEN** la ficha de una persona muestra quién es su Chapter Lead
- **THEN** es el mismo lead que la ve en sus pantallas, porque el dato sale de la relación que decide el alcance y no de otra jerarquía en paralelo

#### Scenario: Un lead sin personas a cargo
- **WHEN** el chapter de ese Chapter Lead no tiene ninguna persona
- **THEN** las pantallas muestran su estado vacío, y no el de todo el sistema ni un error
