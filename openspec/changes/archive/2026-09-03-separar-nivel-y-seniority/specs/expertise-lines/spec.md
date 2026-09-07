## MODIFIED Requirements

### Requirement: Personas de una línea
El detalle de la línea SHALL listar las personas que agrupa, con su nombre, cargo, nivel (la escala de 4), FTE disponible y la célula a la que está asignada o "Sin célula", y SHALL señalar cuál de ellas es el lead. Una persona SHALL pertenecer a lo sumo a una línea, y puede no pertenecer a ninguna. Asignar a la línea SHALL permitir elegir una o varias personas a la vez, distinguiendo en el selector las que hoy no tienen línea de las que están en otra —para estas últimas el sistema SHALL avisar de qué línea saldrán antes de confirmar. El selector SHALL ofrecer un buscador por nombre, con la misma mecánica que el índice de líneas: con el chapter entero disponible para elegir, encontrar a alguien no puede depender de recorrer la lista con la vista. La búsqueda SHALL conservar la separación entre quienes no tienen línea y quienes están en otra, y SHALL conservar lo ya seleccionado aunque deje de coincidir — de otro modo, buscar a la segunda persona desmarca a la primera. Cambiar a alguien de línea SHALL NOT modificar su asignación a células ni su dedicación: la línea y la célula son ejes distintos.

#### Scenario: Ver las personas de la línea
- **WHEN** el Admin abre una línea con personas
- **THEN** ve el listado de sus personas con cargo, nivel, FTE disponible y célula o "Sin célula", con el lead señalado

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
