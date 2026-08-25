## MODIFIED Requirements

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas registradas (no sobre la página o el filtro actual del listado): total de personas activas con sus avatares, FTE disponible frente a la capacidad objetivo, y distribución por seniority. Los avatares del resumen SHALL usar el mismo color por persona que el listado.

La distribución por seniority SHALL presentarse como una fila por cada nivel del catálogo, en el orden de la escala, y cada fila SHALL mostrar: el nombre del nivel, un descriptor corto de lo que ese nivel significa, una barra horizontal cuya longitud es proporcional al conteo del nivel sobre un eje común a las cuatro filas, el porcentaje que ese conteo representa del total, y el conteo. El eje SHALL mostrar marcas numéricas desde cero hasta un máximo redondeado por encima del mayor conteo, de modo que las barras se comparen contra una misma escala. El encabezado de la card SHALL mostrar el total de personas sobre el que se calculan los porcentajes.

Debajo de las filas, la card SHALL mostrar dos lecturas calculadas de la misma distribución: el porcentaje del total que está en el nivel Avanzado o superior, y cuántas personas están en el nivel que requiere acompañamiento (Principiante).

Cada barra SHALL pintarse con el mismo color con que el listado representa ese nivel — el vocabulario ordinal del sistema de diseño —, de modo que un solo código de color describa el nivel en toda la pantalla. El sistema NO SHALL definir localmente esos colores: los toma del sistema de diseño, y un cambio de matiz en la escala SHALL reflejarse en la card sin tocar el código de la aplicación.

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
- **THEN** el sistema muestra una fila por cada uno de los 4 niveles del catálogo, con el nombre del nivel, su descriptor, una barra proporcional a su conteo, el porcentaje del total y el conteo

#### Scenario: Las barras comparten un eje
- **WHEN** el Chapter Lead compara las barras de dos niveles con conteos distintos
- **THEN** sus longitudes son proporcionales a los conteos sobre el mismo eje, cuyas marcas van de cero a un máximo redondeado por encima del mayor conteo

#### Scenario: Lectura de avanzado o superior
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra el porcentaje del total que está en Avanzado o Experto, calculado sobre las mismas cifras que muestran las filas

#### Scenario: Lectura de acompañamiento
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra cuántas personas están en el nivel Principiante, presentadas como las que requieren acompañamiento — la misma lectura que el descriptor de ese nivel anuncia

#### Scenario: El nivel viste el mismo color en la card y en el listado
- **WHEN** el Chapter Lead compara la barra de un nivel en la card de distribución con el medidor de ese mismo nivel en una fila del listado
- **THEN** ambos usan el mismo matiz del vocabulario ordinal del sistema de diseño, sin que la pantalla tenga dos códigos de color para el mismo dato

#### Scenario: Un cambio de matiz en la escala llega solo
- **WHEN** el sistema de diseño cambia el matiz de un nivel de la escala ordinal
- **THEN** la card de distribución refleja el matiz nuevo con la sola actualización del paquete, sin que se modifique el código de la aplicación

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos
