## Context

Ver `proposal.md` — Why. Lo que condiciona el diseño es el estado actual del dato:

- `Person` ya declara `chapterId: string | null` en `personService.ts`, y las semillas lo dejan siempre en `null`. No hay nada que lo escriba ni nada que lo lea.
- `personDetailService`/`PersonDetailAdapter` ya declaran `chapterName` y `chapterLeadName`, y el handler los llena desde `CHAPTER = { name: "Backend", leadName: "Esteban Licona" }` en `personDetail.seeds.ts`. El contrato de cara a la pantalla ya existe; lo que no existe es de dónde sale.
- La plataforma es frontend-first contra mocks MSW: cada capability nueva llega con su handler y sus semillas, y el backend la incorpora después. La pantalla de Habilidades (`features/skills`) es el precedente más cercano: service → adapter → hooks → contenedor, con índice a la izquierda y detalle a la derecha.
- Los handlers de mock ya se leen entre sí en un solo sentido: `chapter.handlers` lee los snapshots de `people`, `allocations` y `squads` para la Torre de control. Ese es el patrón para no duplicar estado.
- La navegación de Admin ya tiene el grupo "Configuración" con Sprints, Parámetros y Habilidades.

## Goals / Non-Goals

**Goals:**

- Que exista un único dueño de "a qué línea pertenece cada persona", y que el resto de la plataforma lo lea de ahí.
- Que la pantalla de Líneas no sea un formulario: que muestre el reparto de la gente y la capacidad que eso implica, con las acciones donde se ve el efecto.
- Que la capacidad de una línea y la de la Torre de control salgan de la misma fórmula.
- Dejar el contrato listo para que el backend lo implemente sin renegociarlo.

**Non-Goals:**

- Persistencia real: no hay tabla ni endpoint de backend en este change.
- Segmentar por línea las pantallas existentes (Personas, Células, Torre). El dato queda disponible; usarlo es otro change.
- Autorización por línea. Ver `proposal.md` — Fuera de alcance.

## Decisions

### El handler de líneas es dueño de la pertenencia, no `people.handlers`

El campo `chapterId` vive hoy en el DTO de persona. La tentación es que `people.handlers` lo escriba con un `PUT` de persona. Se decide lo contrario: `expertise-lines.handlers` guarda el mapa `personId → lineId` y `people.handlers` no lo toca.

Por qué: la regla que hace correcto el dato —una persona en una sola línea, el lead pertenece a la línea que lidera, una línea archivada no recibe gente— es una regla del conjunto de líneas, no de una persona. Si la escribieran dos handlers, cada uno tendría media regla. Lo mismo vale para el backend después: el agregado es la línea.

Consecuencia práctica: `chapterId` del DTO de persona pasa a derivarse del mapa (se resuelve al construir la respuesta), y el `POST`/`PUT` de persona lo sigue ignorando, que es lo que hace hoy. Por eso la spec de `people` dice explícitamente que el formulario de persona no captura la línea: dos editores del mismo dato con distinta información a la vista es cómo se llega a que ninguno de los dos tenga razón.

*Alternativa descartada:* que `people.handlers` sea el dueño y el handler de líneas sólo lea. Deja las reglas de unicidad del lead y del archivado sin dónde vivir.

### El detalle de línea trae sus personas y su resumen en un solo `GET`

Mismo criterio que el detalle de persona (`personDetail.handlers`): una respuesta con todo lo que la pantalla necesita, en vez de que el contenedor cruce tres llamadas.

Por qué: el resumen de capacidad es una agregación sobre las mismas personas que se listan. Calcularlo en el cliente obliga a que la pantalla sepa la fórmula, y esa fórmula ya la tiene el servidor para la Torre. Que la sepan los dos es cómo empiezan a discrepar los números.

*Alternativa descartada:* `GET /lines/:id` + `GET /lines/:id/people` + cálculo en el adapter. Más llamadas y la fórmula duplicada.

### La fórmula de FTE se comparte con `chapter.handlers`, tal como está

FTE disponible de la línea = Σ `availableFte`. FTE asignado = Σ `dedicationPercentage` / 100. Ambos con el mismo `round1` que ya usan `chapter.handlers` y `squads.handlers`. Se extrae a un módulo compartido de los mocks en vez de reescribirse.

Por qué: la spec promete que la línea y la Torre no dan números distintos. Prometerlo y copiar la fórmula es prometerlo hasta el primer cambio.

**El criterio heredado tiene una rareza conocida y se adopta igual.** El FTE asignado no mira el `availableFte` de la persona: alguien de 0.8 FTE al 100 % de dedicación aporta 1.0 de asignado, no 0.8. Como el disponible sí suma `availableFte`, el asignado puede superar al disponible y el libre se acota a cero. Se decidió replicarlo en vez de corregirlo acá: corregirlo cambia los números de la Torre de control y del listado de Células, que son pantallas que este change no toca, y hacerlo de paso convertiría una pantalla nueva en una migración de tres. Si se corrige, se corrige en un change propio y en los tres lugares a la vez — que es exactamente para lo que sirve tener la fórmula en un solo módulo.

*Alternativa descartada:* usar `availableFte × dedicación / 100` sólo en la línea. Es el número correcto, pero deja a la línea y a la Torre discrepando sobre la misma gente, que es el problema que esta decisión existía para evitar.

### Archivar, no borrar

Un `DELETE` de línea deja huérfano el `chapterId` de quien la tuvo y borra la respuesta a "¿de dónde venía esta persona?". Se archiva, y archivar exige la línea vacía: así el estado archivado nunca convive con gente adentro y la regla es verificable de un vistazo.

El código es único entre **todas** las líneas, incluidas las archivadas; el nombre sólo entre las activas. Razón: el código es lo que se muestra como etiqueta corta en listados, y una etiqueta que significó QA no puede volver a significar otra cosa. Un nombre, en cambio, se puede reutilizar cuando la línea vieja ya no está vigente.

### Un lead pertenece a la línea que lidera

Designar lead incorpora a la persona a la línea (moviéndola de la que tuviera) en la misma operación, en vez de exigir dos pasos y fallar si el orden es el otro. Y quitar de la línea al lead se rechaza: obliga a resolver primero quién responde por la línea.

Por qué así y no un `leadId` suelto: un lead que no pertenece a su línea no cuenta en su FTE ni aparece en su listado, y entonces la línea miente sobre a quién agrupa.

### La pantalla: índice + detalle, y "sin línea" como parte de la pantalla

Se replica la anatomía de Habilidades (índice a la izquierda, detalle a la derecha) por consistencia y porque el índice es también la comparación entre líneas: personas y FTE por fila.

Las personas sin línea no son un estado vacío, son trabajo pendiente. Van en la propia pantalla, con su contador, porque el momento en que alguien se entera de que hay gente sin línea es el momento en que puede repartirla. Ponerlo en otra pantalla es garantizar que no se mire.

### `chapterName`/`chapterLeadName` pasan a poder ser `null`

El contrato del detalle de persona ya tiene los campos como `string`. Pasan a `string | null` y `PersonDetailHeader`/la Ficha contemplan los tres casos: sin línea, línea sin lead, y la persona es su propio lead. Es un cambio de tipo que el compilador señala en cada sitio de uso — se prefiere eso a devolver `""` o `"Sin asignar"`, que le pide a la vista adivinar si es un dato o un mensaje.

### Nomenclatura: "línea de expertise" en la UI, `chapter` en el código

La UI dice "línea de expertise" porque es como el negocio la nombra en la especificación del modelo. El código existente ya dice `chapter` (`chapterId`, `chapterName`, `chapter.handlers`, rol `chapter-lead`) y no se renombra en este change: sería un refactor transversal sin valor observable. La feature nueva se llama `expertise-lines` y su service traduce en el borde.

*Riesgo asumido:* dos nombres para lo mismo. Se documenta en el service de la feature nueva, que es donde se cruzan.

### Icono `team` para la entrada de menú

`expertise` ya lo usa Habilidades, y dos entradas del mismo grupo con el mismo icono se vuelven una sola al escanear el menú. `team` está publicado en tuip (familia `objects`), así que no hace falta crear nada en el sistema de diseño antes.

## Risks / Trade-offs

- **La delta de `admin-shell` choca con la de `add-skills-catalog`, que aún no se archiva** → Ambas modifican "Navegación lateral del rol Admin". Esta delta se escribió sobre el estado que ya corre en el frontend (5 entradas, con Habilidades) y declara 6, así que archivar en cualquier orden deja el resultado correcto. Si `add-skills-catalog` se archivara después de este change, habría que revisar que su delta no vuelva a bajar a 5.
- **Repartir personas a mano es tedioso con muchas personas** → La asignación es multi-selección y la lista de "sin línea" está a la vista con su contador. No se hace importación masiva en este change; si el reparto inicial duele, se ve en la primera sesión de uso real.
- **La Torre de control sigue agregando sobre todas las personas** → Queda una lectura por línea (la pantalla nueva) y una global (la Torre) que no se contradicen pero tampoco se relacionan. Es deliberado: segmentar la Torre es un change propio y hacerlo aquí ampliaría el alcance a una pantalla que este change no toca.
- **El mock es la única fuente de verdad del contrato** → Si el backend después modela la línea distinto (por ejemplo con histórico de pertenencia), el service y el adapter absorben la diferencia. El contrato se escribió sin histórico a propósito para no comprometer al backend con algo que la pantalla todavía no muestra.
- **Mover a alguien de línea no toca su célula** → Correcto por diseño, pero puede sorprender a quien espere que reasignar la línea reacomode el equipo. Se cubre con un escenario explícito en la spec y con el aviso al traer a alguien de otra línea.

## Migration Plan

No hay datos productivos que migrar: la pertenencia hoy es `null` para todos. Las semillas del mock reparten a las personas ya sembradas entre las líneas y dejan a propósito algunas sin línea, para que el estado de "reparto incompleto" sea visible desde el primer arranque.

Al archivar el change, `openspec/specs/expertise-lines/spec.md` se crea con el Purpose de la delta, y las deltas de `admin-shell`, `people` y `api-mocking` se funden en sus specs.
