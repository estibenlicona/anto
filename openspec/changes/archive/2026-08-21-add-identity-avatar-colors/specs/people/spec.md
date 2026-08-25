## MODIFIED Requirements

### Requirement: Listar personas
El sistema SHALL mostrar un listado paginado de las personas registradas, con al menos avatar, nombre, correo corporativo, cargo, rol, seniority y modalidad visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa persona. El avatar SHALL mostrar las iniciales de la persona (primera letra del primer nombre y primera letra del primer apellido, derivadas del nombre completo) sobre un color propio de esa persona, estable en el tiempo y entre pantallas. El correo corporativo SHALL mostrarse bajo el nombre, con menor jerarquía visual que éste. El nombre SHALL ser un enlace a la pantalla de detalle de esa persona. El seniority SHALL mostrarse con el nombre de su nivel en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin mostrar el número del nivel. El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinable con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada persona de esa página, su avatar con iniciales, nombre, correo corporativo, cargo, rol, seniority y modalidad, junto con el total de personas y la navegación entre páginas

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Personas y no existe ninguna persona registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera persona, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las personas falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de personas
- **THEN** el sistema muestra las personas correspondientes a esa página, sin recargar toda la aplicación

#### Scenario: Menú de acciones por fila
- **WHEN** el Chapter Lead abre el menú de acciones de una fila del listado
- **THEN** el sistema muestra las opciones para editar o eliminar esa persona

#### Scenario: Iniciales del avatar
- **WHEN** el sistema muestra el avatar de una persona cuyo nombre completo es "María González"
- **THEN** el avatar muestra las iniciales "MG" (primera letra del primer nombre y primera letra del primer apellido, en mayúsculas)

#### Scenario: Color propio de cada persona
- **WHEN** el Chapter Lead ve el avatar de una persona
- **THEN** el avatar se muestra con un color tomado del vocabulario de color de identidad, y dos personas distintas del listado tienden a recibir colores distintos

#### Scenario: El color no cambia
- **WHEN** el Chapter Lead vuelve a abrir el listado en otra sesión, o ve a la misma persona en otra pantalla, o esa persona cambia de nombre, de cargo o de seniority
- **THEN** el avatar de esa persona conserva el mismo color que tenía antes

#### Scenario: Buscar por nombre o cargo
- **WHEN** el Chapter Lead escribe un texto en el buscador del listado de Personas
- **THEN** el sistema muestra solo las personas cuyo nombre o cargo contiene ese texto (sin distinguir mayúsculas), junto con el total y la paginación recalculados sobre ese subconjunto

#### Scenario: Filtrar por seniority
- **WHEN** el Chapter Lead selecciona uno o más valores en el filtro de Seniority
- **THEN** el sistema muestra solo las personas cuyo seniority está entre los valores seleccionados, junto con el total y la paginación recalculados sobre ese subconjunto

#### Scenario: Filtrar por nivel SFIA
- **WHEN** el Chapter Lead busca el filtro de "Nivel SFIA" que existía como campo separado antes de este cambio
- **THEN** encuentra el mismo filtro bajo el nombre "Seniority" — ambos campos se fusionaron en uno solo (ver el escenario "Filtrar por seniority" de este mismo requisito) y "Nivel SFIA" ya no existe como filtro propio

#### Scenario: Combinar búsqueda y filtros
- **WHEN** el Chapter Lead tiene texto en el buscador y el filtro de seniority activo al mismo tiempo
- **THEN** el sistema muestra solo las personas que cumplen la búsqueda y el filtro a la vez

#### Scenario: Búsqueda o filtro sin resultados
- **WHEN** la búsqueda o el filtro activo no encuentra ninguna persona, pero sí existen personas registradas en el sistema
- **THEN** el sistema muestra un mensaje de "sin resultados" que invita a ajustar la búsqueda o el filtro, distinto del estado vacío que invita a crear la primera persona

#### Scenario: Ir al detalle de una persona
- **WHEN** el Chapter Lead hace clic en el nombre de una persona del listado
- **THEN** el sistema navega a la dirección del detalle de esa persona, identificada por su id

#### Scenario: El nombre se reconoce como enlace
- **WHEN** el Chapter Lead recorre el listado con el mouse o con el teclado
- **THEN** el nombre de cada persona se distingue del texto plano de la fila y es alcanzable con el teclado, de modo que se reconoce como navegable antes de hacer clic

#### Scenario: El detalle todavía no existe
- **WHEN** el Chapter Lead abre el enlace de una persona antes de que la pantalla de detalle esté construida
- **THEN** el sistema muestra su pantalla de "no encontrado", sin errores de consola ni una pantalla en blanco

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas registradas (no sobre la página o el filtro actual del listado): total de personas activas con sus avatares, FTE disponible frente a la capacidad objetivo, y distribución por seniority. Los avatares del resumen SHALL usar el mismo color por persona que el listado.

#### Scenario: Encabezado del módulo
- **WHEN** el Chapter Lead abre la pantalla de Personas
- **THEN** el sistema muestra el título "Personas", su descripción, y el botón para dar de alta una persona

#### Scenario: Resumen de personas activas
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra el total de personas registradas junto con los avatares de algunas de ellas

#### Scenario: Un mismo color en las dos vistas
- **WHEN** una persona aparece tanto en los avatares del resumen como en una fila del listado
- **THEN** su avatar se muestra con el mismo color en ambos lugares

#### Scenario: Resumen de FTE disponible
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra el FTE disponible frente a la capacidad objetivo, con el porcentaje de capacidad asignada

#### Scenario: Distribución por seniority
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra cuántas personas hay en cada uno de los 4 niveles de seniority del catálogo

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos
