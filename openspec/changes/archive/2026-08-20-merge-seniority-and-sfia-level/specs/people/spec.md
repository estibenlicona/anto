## RENAMED Requirements

- FROM: `### Requirement: Selección de seniority, nivel SFIA y modalidad desde catálogo`
- TO: `### Requirement: Selección de seniority y modalidad desde catálogo`

## MODIFIED Requirements

### Requirement: Listar personas
El sistema SHALL mostrar un listado paginado de las personas registradas, con al menos avatar, nombre, cargo, rol, seniority y modalidad visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa persona. El avatar SHALL mostrar las iniciales de la persona (primera letra del primer nombre y primera letra del primer apellido, derivadas del nombre completo). El seniority SHALL mostrarse con su etiqueta de la escala Tuya (1 Principiante, 2 Competente, 3 Avanzado, 4 Experto), no como un número aislado. El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinable con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada persona de esa página, su avatar con iniciales, nombre, cargo, rol, seniority y modalidad, junto con el total de personas y la navegación entre páginas

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

### Requirement: Crear persona
El sistema SHALL permitir crear una nueva persona capturando nombre, documento, usuario principal, cargo, rol, seniority, modalidad, FTE disponible, costo mensual y fecha de inicio, validando los mismos límites que aplica el backend antes de enviar la petición.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 200 caracteres), documento (no vacío, máx. 50 caracteres), usuario principal (no vacío, máx. 250 caracteres), cargo (no vacío, máx. 100 caracteres), rol (no vacío, máx. 100 caracteres), selecciona un seniority (1 a 4) y una modalidad válida, ingresa un FTE disponible entre 0.0 y 1.0 y un costo mensual mayor o igual a 0, selecciona una fecha de inicio, y confirma
- **THEN** el sistema crea la persona, la agrega al listado y confirma el éxito de la operación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar el alta sin nombre, documento, usuario principal, cargo, rol, seniority, modalidad o fecha de inicio
- **THEN** el sistema impide el envío y señala qué campos faltan, sin llamar al backend

#### Scenario: Validación de longitud
- **WHEN** el Chapter Lead ingresa un nombre de más de 200 caracteres, un documento de más de 50 caracteres, un usuario principal de más de 250 caracteres, un cargo de más de 100 caracteres o un rol de más de 100 caracteres
- **THEN** el sistema impide el envío y señala el campo que excede el límite, sin llamar al backend

#### Scenario: Validación de FTE y costo
- **WHEN** el Chapter Lead ingresa un FTE disponible fuera del rango 0.0 a 1.0, o un costo mensual negativo
- **THEN** el sistema impide el envío y señala el campo inválido, sin llamar al backend

#### Scenario: Error del servidor al crear
- **WHEN** el Chapter Lead confirma un alta válida en el cliente pero el backend responde con error (400 o 500)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

### Requirement: Editar persona
El sistema SHALL permitir editar los mismos campos del alta en una persona existente, aplicando las mismas reglas de validación.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica uno o más campos de una persona existente con valores válidos y confirma
- **THEN** el sistema actualiza la persona, refleja los nuevos valores en el listado y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de una persona existente
- **THEN** el sistema precarga el formulario con los valores actuales de esa persona

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario

### Requirement: Selección de seniority y modalidad desde catálogo
El sistema SHALL ofrecer seniority y modalidad como selecciones restringidas a los valores vigentes de los catálogos expuestos por el backend (mockeados), no como texto libre. El seniority SHALL mostrarse con su etiqueta de la escala Tuya (1 Principiante, 2 Competente, 3 Avanzado, 4 Experto), no como un número aislado.

#### Scenario: Opciones de seniority
- **WHEN** el Chapter Lead abre el selector de seniority en el formulario de alta o edición
- **THEN** el sistema muestra los cuatro niveles con su etiqueta de la escala Tuya

#### Scenario: Opciones de nivel SFIA
- **WHEN** el Chapter Lead busca el selector de "Nivel SFIA" que existía como campo separado antes de este cambio
- **THEN** encuentra los mismos cuatro niveles dentro del selector de "Seniority" — ambos campos se fusionaron en uno solo y "Nivel SFIA" ya no existe como selector propio

#### Scenario: Opciones de modalidad
- **WHEN** el Chapter Lead abre el selector de modalidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de modalidad vigentes obtenidos del catálogo
