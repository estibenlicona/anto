## MODIFIED Requirements

### Requirement: Detalle de célula
El sistema SHALL exponer una página de detalle por célula, accesible desde el nombre de la célula en el listado, que concentra la información y la gestión de esa célula: un encabezado con el nombre, la criticidad en español (con el mismo componente y rol de color que el listado), la tribu, la descripción, un enlace de vuelta al listado y las acciones de editar la célula, asignar una persona y eliminar la célula; un resumen de 2 indicadores del equipo de esa célula; y una sección "Equipo" con el listado de sus asignaciones y su gestión (ver capacidad `allocations`).

Los 2 indicadores SHALL ser: **Equipo** (total de personas asignadas, sus avatares con el mismo color e iniciales que en Personas, y cuántas son de nivel Experto y cuántas de nivel Principiante); y **Capacidad** (una sola card que fusiona la capacidad asignada con su mix, porque el total del mix es la capacidad asignada: el FTE asignado frente al FTE disponible del equipo, el porcentaje de ocupación marcado por severidad — advertencia cerca del tope, peligro por encima —, la barra apilada cuyas partes son BAU y Transformación en los tonos del mix y cuyo track vacío es lo libre, la lectura del FTE libre, y el porcentaje del FTE asignado que va a BAU). El sistema NO SHALL repetir la cifra de capacidad asignada en un indicador aparte del mix. Las cifras SHALL calcularse sobre todas las asignaciones de la célula, no sobre la página, la búsqueda o el filtro del listado de equipo.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño y su etiqueta en español, con el mismo rol de color que en el listado. Editar y eliminar SHALL usar los mismos formularios, validaciones y diálogos de confirmación que el listado de Células; tras eliminar, el sistema SHALL volver al listado.

#### Scenario: Abrir el detalle desde el listado
- **WHEN** el Chapter Lead hace clic en el nombre de una célula en el listado
- **THEN** el sistema navega a la página de detalle de esa célula sin recargar la aplicación, y muestra su nombre, criticidad en español, tribu y descripción en el encabezado

#### Scenario: Volver al listado
- **WHEN** el Chapter Lead usa el enlace de vuelta del encabezado del detalle
- **THEN** el sistema navega al listado de Células sin recargar la aplicación

#### Scenario: Célula inexistente
- **WHEN** el Chapter Lead navega directamente al detalle con un identificador que no corresponde a ninguna célula
- **THEN** el sistema muestra un estado de "célula no encontrada" con un enlace al listado, sin pantalla en blanco ni error no controlado

#### Scenario: Error al cargar la célula
- **WHEN** la petición para obtener la célula falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga

#### Scenario: Resumen del equipo
- **WHEN** la célula tiene 4 personas asignadas, 2 de nivel Experto y 1 de nivel Principiante, con 2.7 FTE asignados (1.7 BAU y 1.0 Transformación) y un FTE disponible del equipo de 3.8
- **THEN** el detalle muestra 4 en Equipo con la lectura "2 expertos · 1 requiere acompañamiento", y una única card de Capacidad con 2.7 / 3.8 FTE, 71% de ocupación, la barra apilada con 1.7 de BAU y 1.0 de Transformación, 1.1 libre y "63% del esfuerzo va a operación" — sin una segunda card que repita el 2.7

#### Scenario: Célula sin equipo
- **WHEN** la célula no tiene ninguna asignación
- **THEN** el resumen muestra 0 personas y la card de Capacidad en su estado vacío (0.0 / 0.0 FTE, 0% sin división por cero, sin partes que apilar), y la sección Equipo muestra el estado vacío que invita a asignar la primera persona

#### Scenario: El resumen se actualiza tras gestionar el equipo
- **WHEN** el Chapter Lead asigna, edita o quita una persona desde el detalle
- **THEN** los 2 indicadores vuelven a calcularse y reflejan el nuevo estado

#### Scenario: Resumen no disponible
- **WHEN** la petición del resumen del equipo falla o está en carga
- **THEN** el encabezado y la sección Equipo siguen mostrándose y operando con normalidad

#### Scenario: Editar la célula desde el detalle
- **WHEN** el Chapter Lead elige "Editar célula" y confirma cambios válidos
- **THEN** el sistema actualiza la célula y el encabezado refleja los nuevos valores sin salir del detalle

#### Scenario: Eliminar la célula desde el detalle
- **WHEN** el Chapter Lead elige "Eliminar célula" y confirma en el diálogo
- **THEN** el sistema elimina la célula y navega al listado de Células

#### Scenario: La entrada de navegación sigue activa en el detalle
- **WHEN** el Chapter Lead está en el detalle de una célula
- **THEN** la entrada "Células" de la navegación lateral se muestra como activa y el breadcrumb muestra "Gestionar Células" seguido del nombre de la célula
