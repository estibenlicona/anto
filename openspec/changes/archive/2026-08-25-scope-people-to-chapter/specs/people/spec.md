## MODIFIED Requirements

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas **a cargo del Chapter Lead** (no sobre la página ni el filtro actual del listado, y no sobre todas las personas del sistema): total de personas activas con sus avatares, FTE disponible frente a la capacidad objetivo, y distribución por seniority. Los avatares del resumen SHALL usar el mismo color por persona que el listado.

La distribución por seniority SHALL pintar cada nivel con el mismo color con que el listado representa ese nivel — el vocabulario ordinal del sistema de diseño —, tanto en los segmentos de la barra como en los puntos de su leyenda, de modo que un solo código de color describa el nivel en toda la pantalla. El sistema NO SHALL definir localmente esos colores: los toma del sistema de diseño, y un cambio de matiz en la escala SHALL reflejarse en la card sin tocar el código de la aplicación.

Debajo de la distribución, la card SHALL mostrar dos lecturas calculadas de las mismas cifras: el porcentaje del total que está en el nivel Avanzado o superior, y cuántas personas están en el nivel que requiere acompañamiento (Principiante) — de modo que el estado general del equipo se lea de un vistazo sin sumar mentalmente la leyenda.

#### Scenario: Los indicadores cuentan sólo lo que el lead tiene a cargo
- **WHEN** el sistema registra personas de más de un chapter y el Chapter Lead abre la pantalla
- **THEN** los tres indicadores se calculan únicamente sobre las personas a su cargo, y no sobre el total del sistema

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

#### Scenario: Lectura de avanzado o superior
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra el porcentaje del total que está en Avanzado o Experto, calculado sobre las mismas cifras que muestra la distribución

#### Scenario: Lectura de acompañamiento
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra cuántas personas están en el nivel Principiante, presentadas como las que requieren acompañamiento

#### Scenario: El nivel viste el mismo color en la card y en el listado
- **WHEN** el Chapter Lead compara el segmento o el punto de leyenda de un nivel en la card de distribución con el medidor de ese mismo nivel en una fila del listado
- **THEN** ambos usan el mismo matiz del vocabulario ordinal del sistema de diseño, sin que la pantalla tenga dos códigos de color para el mismo dato

#### Scenario: Un cambio de matiz en la escala llega solo
- **WHEN** el sistema de diseño cambia el matiz de un nivel de la escala ordinal
- **THEN** la card de distribución refleja el matiz nuevo con la sola actualización del paquete, sin que se modifique el código de la aplicación

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos

### Requirement: Listar personas
El sistema SHALL mostrar un listado paginado de las personas **a cargo del Chapter Lead**, con al menos avatar, nombre, correo corporativo, cargo, rol, seniority y modalidad visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa persona. El avatar SHALL mostrar las iniciales de la persona (primera letra del primer nombre y primera letra del primer apellido, derivadas del nombre completo) sobre un color propio de esa persona, estable en el tiempo y entre pantallas. El correo corporativo SHALL mostrarse bajo el nombre, con menor jerarquía visual que éste. El seniority SHALL mostrarse con el nombre de su nivel en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin mostrar el número del nivel.

El nombre SHALL ser un enlace a la pantalla de detalle de esa persona. Ese enlace NO SHALL mostrarse en el color de marca: SHALL tomar el color de texto neutro del listado, de modo que la primera columna no quede teñida por repetir un enlace destacado en cada fila. En reposo el nombre NO SHALL distinguirse del texto plano de la fila; SHALL revelar su condición de enlace al pasar el puntero sobre él y al recibir el foco por teclado. El sistema NO SHALL definir localmente el tratamiento visual del enlace: lo toma del componente de enlace del sistema de diseño, eligiendo su tono neutro.

El seniority SHALL mostrarse con el componente de nivel del sistema de diseño —el que presenta el nombre del nivel junto a un medidor de cuatro segmentos teñido según la posición del nivel en la escala— y NO SHALL mostrarse con el componente de estado que el sistema usa para comunicar la situación de un elemento. La representación SHALL ocupar la misma dimensión en todas las filas, cualquiera sea el nivel y tenga o no la persona un nivel asignado, de modo que los niveles de personas distintas queden comparables entre sí de un vistazo. El sistema NO SHALL definir localmente los colores, medidas ni segmentos de esa representación: los toma del componente del sistema de diseño.

El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinable con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

La **utilización** de cada fila SHALL mostrarse como una cantidad: el medidor del sistema de diseño relleno con el tono azul de la escala de acento sobre la pista neutra, sin cambiar de color por umbral (ni al 85 % ni al 100 %); la cifra es la señal numérica. Es el mismo azul que el resto de la pantalla usa para la escala ordinal.

Los **stacks** SHALL mostrarse con el componente de etiqueta categórica del sistema de diseño (no con el de estado): el principal primero, hasta tres por fila y un indicador "+N" con el resto; una persona sin stacks SHALL mostrar un guion neutro.

Cada fila SHALL mostrar además el FTE disponible de la persona como número, y su utilización — el porcentaje de esa capacidad que sus asignaciones ocupan, calculado por el sistema y entregado en el contrato de la persona — como una barra pequeña acompañada del porcentaje en texto. El listado NO SHALL permitir editar el FTE ni la utilización: la edición del FTE sigue en el formulario de la persona y las asignaciones en su propia pantalla.

#### Scenario: El listado sólo contiene lo que el lead tiene a cargo
- **WHEN** el sistema registra personas de más de un chapter
- **THEN** el listado del Chapter Lead contiene únicamente las de su chapter, y las demás no llegan a la respuesta

#### Scenario: Utilización al tope sin señal de estado
- **WHEN** una persona tiene 100 % de utilización
- **THEN** su medidor se rellena completo en el azul de acento y la cifra muestra "100%", sin pasar a advertencia ni peligro

El nombre SHALL ser un enlace a la pantalla de detalle de esa persona. Ese enlace NO SHALL mostrarse en el color de marca: SHALL tomar el color de texto neutro del listado, de modo que la primera columna no quede teñida por repetir un enlace destacado en cada fila. En reposo el nombre NO SHALL distinguirse del texto plano de la fila; SHALL revelar su condición de enlace al pasar el puntero sobre él y al recibir el foco por teclado. El sistema NO SHALL definir localmente el tratamiento visual del enlace: lo toma del componente de enlace del sistema de diseño, eligiendo su tono neutro.

El seniority SHALL mostrarse con el componente de nivel del sistema de diseño —el que presenta el nombre del nivel junto a un medidor de cuatro segmentos teñido según la posición del nivel en la escala— y NO SHALL mostrarse con el componente de estado que el sistema usa para comunicar la situación de un elemento. La representación SHALL ocupar la misma dimensión en todas las filas, cualquiera sea el nivel y tenga o no la persona un nivel asignado, de modo que los niveles de personas distintas queden comparables entre sí de un vistazo. El sistema NO SHALL definir localmente los colores, medidas ni segmentos de esa representación: los toma del componente del sistema de diseño.

El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinable con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Stacks en la fila
- **WHEN** una persona tiene cinco stacks con ".NET" como principal
- **THEN** la fila muestra ".NET" primero, dos más y "+2", como etiquetas categóricas y no como estados

#### Scenario: Filtrar por stack
- **WHEN** el Chapter Lead elige "Azure" y "MuleSoft" en el filtro de stack
- **THEN** el listado muestra sólo las personas que tienen alguno de los dos, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada persona de esa página, su avatar con iniciales, nombre, correo corporativo, cargo, rol, seniority y modalidad, junto con el total de personas y la navegación entre páginas

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

#### Scenario: El nombre no lleva el color de marca
- **WHEN** el Chapter Lead ve el listado de Personas
- **THEN** los nombres se muestran en el color de texto neutro del listado, sin el rojo de marca, y la primera columna no se distingue del resto de la tabla por su color

#### Scenario: El nombre se revela como enlace al interactuar
- **WHEN** el Chapter Lead pasa el puntero sobre el nombre de una persona, o lo alcanza con el teclado
- **THEN** el nombre muestra un subrayado y, al llegar por teclado, un indicador de foco visible, de modo que se reconoce como navegable antes de hacer clic

#### Scenario: El nombre no se distingue en reposo
- **WHEN** el Chapter Lead ve una fila del listado sin puntero encima y sin foco
- **THEN** el nombre se ve igual que el texto plano de las demás columnas — es la contrapartida aceptada de quitarle el color de marca — y sigue siendo alcanzable con el teclado y anunciado como enlace por un lector de pantalla

#### Scenario: Abrir el detalle en otra pestaña
- **WHEN** el Chapter Lead hace clic con el botón central del mouse, o con la tecla modificadora de su sistema, sobre el nombre de una persona
- **THEN** el navegador abre el detalle de esa persona en otra pestaña, sin perder la página del listado en la que estaba

#### Scenario: El detalle todavía no existe
- **WHEN** el Chapter Lead abre el enlace de una persona antes de que la pantalla de detalle esté construida
- **THEN** el sistema muestra su pantalla de "no encontrado", sin errores de consola ni una pantalla en blanco

#### Scenario: Columna de FTE
- **WHEN** el Chapter Lead ve la fila de una persona con FTE disponible 0.8
- **THEN** la columna de FTE muestra 0.8 como número, sin control de edición

#### Scenario: Barra de utilización con su porcentaje
- **WHEN** el Chapter Lead ve la fila de una persona con utilización 40%
- **THEN** la celda de utilización muestra una barra rellena en proporción al porcentaje y el texto "40%" junto a ella

#### Scenario: Umbrales de estado de la utilización
- **WHEN** el listado muestra personas con utilización 0%, 60%, 100% y 120%
- **THEN** ninguna cambia de color por cruzar un umbral: todas se rellenan en el azul de acento en proporción a su porcentaje —la de 0% sin relleno y la de 120% saturada al ancho completo—, y quién está al tope o sobrecargado se lee en la cifra, no en el color

#### Scenario: Una persona recién creada arranca sin utilización
- **WHEN** el Chapter Lead crea una persona y el listado se actualiza
- **THEN** su fila muestra la utilización en 0%, porque todavía no tiene asignaciones
