## MODIFIED Requirements

### Requirement: Listar personas
El sistema SHALL mostrar un listado paginado de las personas registradas, con al menos avatar, nombre, cargo, rol, seniority y modalidad visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa persona. El avatar SHALL mostrar las iniciales de la persona (primera letra del primer nombre y primera letra del primer apellido, derivadas del nombre completo). El seniority SHALL mostrarse con el nombre de su nivel en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin mostrar el número del nivel.

El seniority SHALL mostrarse con el componente de nivel del sistema de diseño —el que presenta el nombre del nivel junto a un medidor de cuatro segmentos teñido según la posición del nivel en la escala— y NO SHALL mostrarse con el componente de estado que el sistema usa para comunicar la situación de un elemento. La representación SHALL ocupar la misma dimensión en todas las filas, cualquiera sea el nivel y tenga o no la persona un nivel asignado, de modo que los niveles de personas distintas queden comparables entre sí de un vistazo. El sistema NO SHALL definir localmente los colores, medidas ni segmentos de esa representación: los toma del componente del sistema de diseño.

El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinable con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada persona de esa página, su avatar con iniciales, nombre, cargo, rol, seniority y modalidad, junto con el total de personas y la navegación entre páginas

#### Scenario: Presentación del seniority en la fila
- **WHEN** el sistema muestra la fila de una persona con seniority "Avanzado"
- **THEN** la celda de seniority presenta el nombre del nivel junto a su medidor de cuatro segmentos, con tres de ellos llenos, y no como una etiqueta de estado

#### Scenario: Los niveles se comparan entre filas
- **WHEN** el listado muestra personas de niveles distintos en filas sucesivas
- **THEN** todas las representaciones de seniority ocupan el mismo ancho y sus medidores quedan alineados, de modo que la diferencia de nivel se lee sin leer las etiquetas

#### Scenario: El seniority no comparte vocabulario con el estado
- **WHEN** una fila muestra a la vez el seniority de la persona y algún dato suyo que sí es un estado
- **THEN** cada uno usa un componente distinto, sin que dos elementos de naturaleza distinta compartan la misma forma en la misma fila

#### Scenario: Una persona sin nivel asignado no desalinea la columna
- **WHEN** el listado muestra una persona cuyo seniority no pertenece a la escala o no está asignado
- **THEN** su celda muestra el estado vacío que define el componente, con la misma dimensión que las demás

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
