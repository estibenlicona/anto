## MODIFIED Requirements

### Requirement: Pantalla de Líneas de expertise
El sistema SHALL exponer una pantalla de Administración en `/app/admin/lineas`, con la entrada "Líneas" activa en la navegación lateral y el nombre completo de la pantalla en el breadcrumb. La pantalla SHALL presentar a la izquierda el índice de líneas y a la derecha el detalle de la línea abierta, con la primera línea del índice abierta al cargar. La pantalla SHALL encabezarse con su título, una descripción de qué es una línea de expertise, y la acción de dar de alta una — el mismo encabezado que presentan los demás módulos del producto. La regla anterior decía lo contrario: que el título no se repitiera porque la navegación y el breadcrumb ya identifican la pantalla. Se revierte a propósito. El argumento era correcto sobre la identificación y equivocado sobre lo demás: un encabezado no está sólo para decir dónde está uno, sino para decir qué se hace acá y ofrecer la acción principal. Sin él, la pantalla abre con la acción de alta flotando sobre un espacio vacío, y era la única de seis así.

El **índice** SHALL listar las líneas activas y, separadas de ellas, las archivadas, mostrando por línea su nombre, su código corto, cuántas personas agrupa y la marca de incompleta cuando corresponda. El índice SHALL permitir buscar por nombre o código.

Mientras carga, la pantalla SHALL mostrar un estado de carga sin desplazar la estructura. Si la carga falla, SHALL mostrar un estado de error con la acción de reintentar.

Las acciones de una línea SHALL distinguirse por lo que hacen y no sólo por su texto: la que edita, la que designa lead y la que archiva NO SHALL compartir el mismo tratamiento visual. Archivar cambia el estado de una línea y saca a sus personas de la vista habitual; que se vea igual que "Editar" hace que la diferencia entre las dos dependa de leer bien, y eso se paga una sola vez.

#### Scenario: Abrir la pantalla de Líneas
- **WHEN** el Admin navega a `/app/admin/lineas`
- **THEN** ve el encabezado de la pantalla con su título, su descripción y la acción de alta, y debajo el índice con las líneas activas y las archivadas por separado, con la primera línea activa abierta en el detalle

#### Scenario: La pantalla se presenta como las demás
- **WHEN** el Admin compara esta pantalla con cualquier otro módulo del producto
- **THEN** encuentra el mismo encabezado —título, descripción y acción primaria—, y no una pantalla que abre con un botón suelto

#### Scenario: Abrir otra línea
- **WHEN** el Admin selecciona otra línea del índice
- **THEN** el detalle de la derecha pasa a mostrar esa línea y el índice marca cuál está abierta

#### Scenario: Buscar en el índice
- **WHEN** el Admin escribe un texto en el buscador del índice
- **THEN** el índice muestra sólo las líneas cuyo nombre o código contiene ese texto, y avisa cuando ninguna coincide

#### Scenario: Lo que archiva no se ve como lo que edita
- **WHEN** el Admin mira las acciones de una línea
- **THEN** la que archiva se distingue de la que edita por su tratamiento visual y no sólo por su palabra

#### Scenario: Todavía no hay líneas
- **WHEN** el Admin abre la pantalla y no existe ninguna línea registrada
- **THEN** el sistema muestra un estado vacío que explica qué es una línea de expertise y ofrece crear la primera

### Requirement: Personas de una línea
El detalle de la línea SHALL listar las personas que agrupa, con su nombre, cargo, seniority, FTE disponible y la célula a la que está asignada o "Sin célula", y SHALL señalar cuál de ellas es el lead. Una persona SHALL pertenecer a lo sumo a una línea, y puede no pertenecer a ninguna. Asignar a la línea SHALL permitir elegir una o varias personas a la vez, distinguiendo en el selector las que hoy no tienen línea de las que están en otra —para estas últimas el sistema SHALL avisar de qué línea saldrán antes de confirmar. El selector SHALL ofrecer un buscador por nombre, con la misma mecánica que el índice de líneas: con el chapter entero disponible para elegir, encontrar a alguien no puede depender de recorrer la lista con la vista. La búsqueda SHALL conservar la separación entre quienes no tienen línea y quienes están en otra, y SHALL conservar lo ya seleccionado aunque deje de coincidir — de otro modo, buscar a la segunda persona desmarca a la primera. Cambiar a alguien de línea SHALL NOT modificar su asignación a células ni su dedicación: la línea y la célula son ejes distintos.

#### Scenario: Ver las personas de la línea
- **WHEN** el Admin abre una línea con personas
- **THEN** ve el listado de sus personas con cargo, seniority, FTE disponible y célula o "Sin célula", con el lead señalado

#### Scenario: Asignar personas sin línea
- **WHEN** el Admin elige una o varias personas sin línea y confirma
- **THEN** las personas pasan a pertenecer a esa línea, aparecen en su listado y el resumen de capacidad se recalcula

#### Scenario: Buscar a alguien en el selector
- **WHEN** el Admin escribe un nombre en el buscador del selector de personas
- **THEN** el selector muestra sólo las coincidencias, manteniendo separadas las que no tienen línea de las que están en otra, y avisa cuando ninguna coincide

#### Scenario: Buscar no pierde lo elegido
- **WHEN** el Admin marca a una persona, busca otra y la marca también
- **THEN** las dos quedan seleccionadas: filtrar la lista no desmarca lo que ya estaba elegido

#### Scenario: Traer a alguien de otra línea
- **WHEN** el Admin elige a una persona que hoy pertenece a otra línea
- **THEN** el sistema avisa de qué línea saldrá antes de confirmar, y al confirmar la persona queda sólo en la línea destino y desaparece del listado de la de origen

#### Scenario: Mover no toca la célula
- **WHEN** una persona asignada a una célula cambia de línea
- **THEN** su célula, su dedicación y su desglose BAU / Transformación quedan exactamente como estaban

#### Scenario: Quitar a alguien de la línea
- **WHEN** el Admin quita a una persona de la línea y confirma
- **THEN** la persona queda sin línea, deja de contar en el resumen de capacidad de esa línea y pasa a estar disponible para asignarse a otra

#### Scenario: Quitar al lead de su propia línea
- **WHEN** el Admin intenta quitar de la línea a la persona que la lidera
- **THEN** el sistema no lo permite y explica que primero hay que designar otro lead o quitarle el rol de lead

#### Scenario: Línea sin personas
- **WHEN** el Admin abre una línea a la que no pertenece nadie
- **THEN** el listado muestra un estado vacío con la acción de asignar la primera persona

### Requirement: Resumen de capacidad de una línea
El detalle de la línea SHALL mostrar su capacidad calculada sobre las personas que agrupa: cuántas personas son, el FTE disponible total de la línea, cuánto de ese FTE está asignado a células y cuánto queda libre, con el porcentaje sin asignar. El FTE disponible de la línea SHALL ser la suma del FTE disponible de sus personas, y el FTE asignado la suma de sus porcentajes de dedicación dividida entre cien — el mismo criterio con el que la Torre de control y el listado de Células calculan el FTE asignado, para que una línea y la Torre no digan números distintos sobre las mismas personas. El índice SHALL mostrar por línea las personas y el FTE disponible, de modo que dos líneas se puedan comparar sin abrirlas.

Esas cifras SHALL presentarse con el mismo tratamiento de indicador que usan los resúmenes del resto del producto, y NO SHALL quedar como datos sueltos sobre el fondo de la página: son el resumen de la línea, y presentarlas sin la forma que el sistema le da a un resumen las hace leer como cuatro números sin relación entre sí.

#### Scenario: Ver la capacidad de una línea
- **WHEN** el Admin abre una línea con personas, algunas asignadas a células
- **THEN** ve el número de personas, el FTE disponible total, el FTE asignado, el libre y el porcentaje sin asignar

#### Scenario: La capacidad se lee como un resumen
- **WHEN** el Admin abre una línea y mira sus cifras de capacidad
- **THEN** las encuentra presentadas como los indicadores de los demás módulos, y no como cuatro datos sueltos sobre el fondo de la página

#### Scenario: Comparar líneas desde el índice
- **WHEN** el Admin recorre el índice
- **THEN** cada línea muestra sus personas y su FTE disponible, sin necesidad de abrirla

#### Scenario: Línea sin personas
- **WHEN** el Admin abre una línea a la que no pertenece nadie
- **THEN** el resumen muestra cero personas y cero FTE, sin errores de división ni porcentajes vacíos

#### Scenario: El FTE asignado puede superar al disponible
- **WHEN** la línea agrupa personas con FTE disponible menor a 1.0 asignadas al 100 % de dedicación
- **THEN** el FTE asignado que muestra la línea es el mismo que la Torre de control calcula sobre esas personas, aunque supere al FTE disponible, y el FTE libre se muestra en cero en vez de en negativo

#### Scenario: La capacidad sigue a las personas
- **WHEN** una persona entra a la línea, sale de ella, o cambia su dedicación a una célula
- **THEN** el resumen de la línea se recalcula sin recargar la aplicación
