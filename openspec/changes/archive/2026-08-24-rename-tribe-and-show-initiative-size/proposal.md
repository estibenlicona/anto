## Why

El listado de Células dice de cada célula quién la agrupa, qué tan crítica es, quiénes la integran y cuánta capacidad tiene ocupada. No dice **de qué trabajo** está hecha esa ocupación. La talla de una iniciativa es justamente la cifra que anticipa cuánta capacidad va a pedir —el modelo de evaluación deriva de ella el FTE esperado—, y hoy sólo vive en la pantalla de Iniciativas. Quien mira una célula al 90 % tiene que salir de la pantalla para saber si ese 90 % está sosteniendo una XS o una XL.

Y la palabra **Tribu** no es la que usa la organización: es **Equipo**. Cambiarla no es cosmético, porque la palabra "Equipo" ya está ocupada en este mismo módulo con otro significado —las personas asignadas a la célula—, y dejar las dos conviviendo produce dos columnas contiguas con el mismo nombre y distinto contenido.

## What Changes

- **El listado de Células gana una columna con la talla de las iniciativas de cada célula**, junto a la de capacidad, porque es la que explica. Muestra la talla como dato principal y la iniciativa debajo, con el mismo patrón de nombre y subtítulo que ya usa la primera columna.
- **La columna "Tribu" pasa a llamarse "Equipo"**, y con ella el buscador, el campo del formulario de alta y edición, sus mensajes de validación, el indicador del resumen y el encabezado del detalle.
- **Lo que hoy se llama "Equipo" —las personas asignadas— pasa a llamarse "Personas"**: la columna del listado, el indicador y la sección del detalle, y las lecturas derivadas ("Sin equipo" pasa a "Sin personas", en la fila y en la leyenda del resumen). Sin esto, el cambio anterior deja dos nombres iguales con dos significados.
- **BREAKING** — **el contrato también cambia**: el atributo `tribe` de una célula pasa a `team`, en el DTO, en el handler de mock, en las semillas y en el formulario. Es un acuerdo con quien implemente el backend, no un cambio de etiqueta.

### Fuera de alcance

- **La palabra "tribu" en el detalle de una persona**, y con ella el atributo `squadTribe` de ese contrato. El panel de Asignación muestra el valor sin etiqueta —quien lo lee nunca ve la palabra—, y los dos requisitos que lo describen (`people` → *Detalle de persona*, `api-mocking` → *Handler de mock para el detalle de una persona*) tienen **deltas pendientes que divergen entre sí**: `add-backlog-triage` agrega un escenario que `add-person-stacks` no tiene y viceversa. Escribir ahí una unión obligaría a inventar una fusión que ningún change sancionó, y todo para cambiar una palabra que nadie ve. Se hace cuando esos changes se archiven; hasta entonces el atributo conserva su nombre, para que ninguna spec describa un dato que ya no se llama así.
- Elegir o editar la iniciativa de una célula desde el listado: la columna informa, no gestiona.
- La pantalla de Iniciativas, que ya muestra la talla y no cambia.

## Capabilities

### Modified Capabilities

- `squads`: el listado gana la columna de iniciativas con su talla; la agrupación pasa a llamarse Equipo y las personas asignadas pasan a llamarse Personas, en el listado, el resumen, el detalle y el formulario.
- `allocations`: la sección del detalle donde se gestionan las asignaciones deja de llamarse "Equipo" y pasa a llamarse "Personas".
- `api-mocking`: el handler de células expone `team` en vez de `tribe`, filtra por él, lo valida, y agrega a cada célula sus iniciativas con la talla.

## Impact

- **Contrato de API** — **BREAKING**: `tribe` pasa a `team` en la célula (lectura, alta y edición, y el filtro de búsqueda). Y el recurso de células pasa a incluir, por célula, sus iniciativas vigentes con nombre, estado y talla; hoy esa relación existe sólo en sentido contrario (la iniciativa conoce su célula).
- **Contrato, segundo sentido de `team`**: dentro del mismo DTO, `teamAvailableFte` y `withoutTeamCount` ya usaban `team` con el sentido *las personas asignadas*. Pasan a `peopleAvailableFte` y `withoutPeopleCount` para que `team` signifique una sola cosa. No sale del módulo: los DTOs de la torre de control y del detalle de persona declaran ese campo por su cuenta.
- **Datos**: en las semillas hay 5 células repartidas en 4 equipos. Tres tienen **dos** iniciativas vigentes cada una —y en dos de esas tres, una está en evaluación y todavía no tiene talla—; una tiene una sola iniciativa y está **cerrada**, así que no cuenta; y una no tiene ninguna. Los cuatro casos —una, varias, sin evaluar y ninguna— ya están en el dato, y son estados que la columna tiene que resolver, no excepciones.
- Frontend: `features/squads` (listado, resumen, detalle, formulario, validación, adapter y servicio), `mocks/handlers/squads.handlers.ts` y sus semillas. La columna reutiliza `Tag` de tuip y el mapa `tallaColor` que ya existe en `features/initiatives`, igual que `people` ya reutiliza `MIX_COLORS` de `features/squads`; **no hace falta trabajo en tuip**.
- **Orden**: `squads`, `allocations` y `api-mocking` ya existen en `openspec/specs`, así que no hay dependencias de archivado. Pero tres requisitos de este change tienen deltas pendientes sin archivar —*Listar células*, *Resumen del módulo de Células* y *Handler de mock para células* en `compact-squads-summary`, y *Detalle de célula* en `fuse-capacity-cards-in-cell-detail`—, y sus deltas parten de ese texto pendiente, no del principal.
