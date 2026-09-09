## ADDED Requirements

### Requirement: Raíz de Parámetros del modelo
La pantalla de Parámetros del modelo SHALL presentar los modelos de estimación agrupados por modelo, y bajo cada uno sus versiones con número, estado, vigencia y cuántas estimaciones calculó cada una. La pantalla SHALL ofrecer, junto a cada versión, la acción que corresponde a su estado: seguir editando un borrador, o crear una versión nueva a partir de una publicada.

La pantalla SHALL dar acceso al historial de cambios de la versión seleccionada y al tablero de calibración histórica, sin cuya entrada esa pantalla no se alcanza desde ningún lado.

#### Scenario: Ver los modelos y sus versiones
- **WHEN** el usuario navega a Parámetros del modelo
- **THEN** ve los modelos con su fase y, bajo cada uno, sus versiones con estado, vigencia y cantidad de estimaciones, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Una versión publicada ofrece salida
- **WHEN** el usuario mira una versión que ya calculó estimaciones
- **THEN** la pantalla indica que no es editable y ofrece crear una versión nueva a partir de ella, en lugar de dejar la fila sin acción

### Requirement: Editor de una versión del modelo
El editor de una versión SHALL presentar cinco secciones —dimensiones y preguntas, drivers y pesos, reglas de talla, mix de capacidades, y publicar— con una sola visible a la vez y la primera activa al abrir. Cada sección SHALL nombrarse con el término más corto que la distingue de las otras, y SHALL NOT repetir ese nombre dentro de su contenido.

El editor SHALL mostrar en todo momento a qué modelo y versión pertenece lo que se está editando, su estado, y cuántos cambios lleva sin publicar. Cuando la versión no es un borrador, el editor SHALL mostrar su contenido sin controles de edición.

#### Scenario: Recorrer las secciones del editor
- **WHEN** el usuario abre una versión en borrador y activa otra sección
- **THEN** se muestra el contenido de esa sección, se oculta el de la anterior, y la barra de contexto sigue diciendo qué modelo y versión se está editando

#### Scenario: Abrir una versión publicada
- **WHEN** el usuario abre una versión vigente o archivada
- **THEN** las cinco secciones muestran su contenido sin controles de edición, y la única acción ofrecida es crear una versión nueva a partir de ella

#### Scenario: Navegación por teclado entre secciones
- **WHEN** el usuario recorre las secciones con el teclado
- **THEN** puede moverse entre ellas y activarlas sin usar el mouse, y cada sección se anuncia asociada al rótulo que la nombra

### Requirement: Los impedimentos de publicación llevan a donde se arreglan
La sección de publicar SHALL listar cada resultado de la validación con su estado, qué falta y una acción que lleve a la sección donde se corrige. La acción de publicar SHALL permanecer deshabilitada mientras quede al menos un impedimento, y SHALL decir cuántos quedan.

#### Scenario: Ir a arreglar un impedimento
- **WHEN** el usuario activa la acción de un impedimento de la validación
- **THEN** el editor abre la sección donde se corrige ese impedimento

#### Scenario: Saber por qué no se puede publicar
- **WHEN** la validación deja impedimentos sin resolver
- **THEN** la acción de publicar está deshabilitada y dice cuántos impedimentos faltan, en lugar de quedar gris sin explicación

## MODIFIED Requirements

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales, salvo la pantalla de Calendario de sprints, que SHALL cargar y guardar su configuración contra un endpoint mockeado; la pantalla de Parámetros del modelo, que SHALL cargar y guardar los modelos de estimación, sus versiones y el contenido de cada versión del mismo modo (ver capabilities `estimation-model` y `api-mocking`); y el botón "Ejecutar ingesta ahora" de la pantalla de Conexión y job de ingesta, que SHALL disparar una sincronización real contra Azure DevOps reutilizando el mismo endpoint que ya usa el botón "Actualizar" de Dedicación real, sin pedir ni transmitir ningún secreto o credencial desde el frontend. El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

El formulario del **Calendario de sprints** SHALL tener exactamente seis campos:

- *Semanas por sprint*
- *Sprints por quarter*
- *Horas por sprint* (80 por defecto, entre 20 y 400): las horas que un colaborador a jornada completa tiene disponibles en un sprint sin descuentos. Es el factor con el que Dedicación real expresa la capacidad en horas; SHALL NOT usarse para pedir ni registrar horas trabajadas.
- *Hora de cierre del sprint* (hora local en formato de 24 horas, "23:00" por defecto): el momento del último día del sprint en que se **sella el snapshot** de lo comprometido y lo completado, antes de que los equipos limpien o cierren las historias de usuario.
- *Ventana de histórico* (en sprints; 6 por defecto, entre 3 y 12): cuántos sprints cerrados y sellados entran en la mediana histórica y en la tendencia del colaborador y de su célula.
- *Mínimo de sprints para evaluar* (3 por defecto, entre 2 y 6, y nunca mayor que la ventana de histórico): cuántos sprints sellados necesita un colaborador para que su señal de balance se pueda calcular; por debajo de ese mínimo su señal es "No evaluable".

El formulario SHALL NOT ofrecer *Puntos por FTE por sprint*, horas por semana ni tolerancia de reporte, ni mostrar tarjetas o textos que describan un reporte de horas o una conversión de puntos a FTE: la plataforma no registra horas —las horas por sprint son un factor de lectura de la capacidad, no un parte de trabajo— y el FTE se usa sólo como capacidad. La tarjeta de qué usa el calendario SHALL nombrar Dedicación real, que con estos valores decide cuándo sellar el snapshot de cada sprint, sobre qué ventana calcula el histórico y la señal de balance, y con cuántas horas expresa la capacidad.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** el formulario carga y muestra la configuración actual servida por el endpoint mockeado —semanas por sprint, sprints por quarter, horas por sprint, hora de cierre del sprint, ventana de histórico y mínimo de sprints para evaluar, sin campos de puntos por FTE ni de reporte de horas—, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Guardar la configuración de sprints exitosamente
- **WHEN** el usuario edita uno o más campos del formulario con valores válidos y hace clic en "Guardar configuración"
- **THEN** el sistema persiste los cambios contra el endpoint mockeado y muestra una confirmación de éxito

#### Scenario: Intentar guardar con valores inválidos
- **WHEN** el usuario ingresa un valor fuera de rango o no numérico en algún campo, una hora de cierre con formato inválido, o un mínimo de sprints mayor que la ventana de histórico
- **THEN** el sistema muestra el error de validación junto al campo correspondiente y el botón "Guardar configuración" permanece deshabilitado hasta que el valor sea válido

#### Scenario: Cambiar la ventana de histórico recalcula el balance
- **WHEN** el Administrador cambia la ventana de histórico de 6 a 10 sprints y guarda
- **THEN** las medianas históricas, las tendencias y las señales de balance de Dedicación real se recalculan sobre la ventana nueva, sin que cambien los datos de ningún sprint

#### Scenario: Cambiar las horas por sprint cambia sólo la lectura en horas
- **WHEN** el Administrador cambia las horas por sprint de 80 a 100 y guarda
- **THEN** la capacidad en horas de Dedicación real se recalcula sobre el valor nuevo, y ni el FTE disponible, ni las evidencias, ni las señales de balance cambian

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al intentar guardar
- **THEN** el sistema muestra un mensaje de error y conserva los valores ingresados por el usuario en el formulario

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** ya no ve un esqueleto: se muestran los modelos de estimación con sus versiones, cargados del endpoint, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición — salvo el estado de "Última ejecución" tras una ingesta real y el propio botón de ingesta —, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb, y sin ningún campo que pida o muestre una credencial o secreto

#### Scenario: Ejecutar la ingesta manualmente
- **WHEN** el usuario hace clic en "Ejecutar ingesta ahora"
- **THEN** el sistema dispara la misma sincronización que el botón "Actualizar" de Dedicación real, sin enviar ni pedir ningún secreto o credencial; mientras corre, el botón muestra su estado de carga y al finalizar exitosamente "Última ejecución" refleja la hora real devuelta

#### Scenario: Error al ejecutar la ingesta
- **WHEN** la sincronización disparada por "Ejecutar ingesta ahora" falla (por ejemplo, Azure DevOps no responde)
- **THEN** el sistema muestra una alerta de error con una acción para reintentar, y conserva el valor anterior de "Última ejecución"

### Requirement: Presentación de las tablas de Parámetros del modelo
Las tablas de la pantalla de Parámetros del modelo y de las secciones del editor de una versión SHALL integrarse a ras del contenedor que las rodea, sin dibujar un borde dentro de otro, SHALL alinear a la derecha sus columnas numéricas con cifras tabulares, y SHALL presentar la columna de talla como una etiqueta de pertenencia con un color propio por talla, estable en toda la pantalla.

#### Scenario: Una tabla dentro de su contenedor
- **WHEN** se muestra cualquiera de las tablas de Parámetros del modelo o del editor de una versión
- **THEN** se ve un solo borde, el del contenedor, en vez de un borde de la tabla dentro del borde del contenedor

#### Scenario: Columnas numéricas alineadas
- **WHEN** se muestra una tabla con columnas de valores numéricos, como puntaje, persona-mes, conteos o pesos
- **THEN** esas columnas se alinean a la derecha y sus dígitos quedan en columna entre filas, mientras las columnas de texto siguen alineadas a la izquierda

#### Scenario: La talla se muestra como etiqueta
- **WHEN** se muestra una tabla con una columna de talla, como la de reglas de talla o la del mix
- **THEN** cada talla aparece como una etiqueta con un color que la distingue de las demás, sin que ese color implique un estado ni una severidad, y con el texto de la talla siempre presente

## REMOVED Requirements

### Requirement: Secciones de "Parámetros del modelo" en pestañas
**Reason**: La pantalla deja de tener cuatro secciones fijas: su raíz pasa a ser la lista de modelos y versiones, y las secciones son las del editor de una versión.
**Migration**: Las cuatro pestañas se reemplazan por la lista de versiones y, dentro de una versión, por las cinco secciones del editor descritas en la requirement "Editor de una versión del modelo".

### Requirement: Acciones de edición de las bandas de talla
**Reason**: Editar las bandas deja de ser una acción sobre una tabla suelta y pasa a ser una sección del editor de una versión en borrador.
**Migration**: Ver "Editor de una versión del modelo" acá y la requirement "Reglas de talla y parámetros de esfuerzo" de `estimation-model`.

### Requirement: Edición del reparto de porcentajes de las bandas
**Reason**: El reparto de umbrales se edita ahora dentro de una versión en borrador, y una versión publicada no se edita.
**Migration**: Ver la requirement "Reglas de talla y parámetros de esfuerzo" de `estimation-model`, que conserva la contigüidad de los umbrales.

### Requirement: Edición de los datos de las bandas
**Reason**: Los datos de la banda cambian de forma: el esfuerzo esperado pasa a ser un parámetro propio y no el punto medio del rango.
**Migration**: Ver la requirement "Reglas de talla y parámetros de esfuerzo" de `estimation-model`.

### Requirement: Edición del mix de capacidades
**Reason**: El mix deja de expresarse en personas por talla y pasa a porcentaje de participación, con modificadores por driver.
**Migration**: Ver las requirements "Mix de capacidades en porcentaje" y "Modificadores de mix por driver" de `estimation-model`.

### Requirement: Alta y baja de capacidades
**Reason**: Alta y baja de capacidades pasan a ser parte de la sección de mix del editor de una versión, sujetas a que la columna siga sumando 100.
**Migration**: Ver la requirement "Mix de capacidades en porcentaje" de `estimation-model`.

### Requirement: Modelo de preguntas del pool de scoring
**Reason**: Una pregunta deja de ser texto, dimensión y un peso escalar: gana tipo, driver, opciones de respuesta y un peso por cada salida.
**Migration**: Ver las requirements "Tipo de pregunta y opciones de respuesta", "Drivers" y "Pesos por salida" de `estimation-model`.

### Requirement: Edición del pool de preguntas
**Reason**: El pool deja de editarse como una lista suelta y pasa a ser la sección de dimensiones y preguntas del editor de una versión.
**Migration**: Ver "Editor de una versión del modelo" acá y las requirements de preguntas y pesos de `estimation-model`.
