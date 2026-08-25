## MODIFIED Requirements

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas registradas (no sobre la página o el filtro actual del listado), todos de la misma altura y cada uno abriendo con la cifra que manda: **personas activas** (total, cuántas están asignadas y en cuántas células, avatares, y un enlace neutro a Células), **stacks sin respaldo** (cuántos dependen de una sola persona, de cuántos registrados, con una barra de dos tramos —con respaldo en rol de éxito, sin respaldo en rol de advertencia— y su leyenda en línea), y **distribución por seniority** (el porcentaje en avanzado o superior con su lectura, la barra por nivel y la leyenda en línea). Los avatares del resumen SHALL usar el mismo color por persona que el listado.

La distribución por seniority SHALL pintar cada nivel con el mismo color con que el listado representa ese nivel — el vocabulario ordinal del sistema de diseño —, tanto en los segmentos de la barra como en los puntos de su leyenda, de modo que un solo código de color describa el nivel en toda la pantalla. El sistema NO SHALL definir localmente esos colores: los toma del sistema de diseño, y un cambio de matiz en la escala SHALL reflejarse en la card sin tocar el código de la aplicación.

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
- **WHEN** el Chapter Lead ve la card de distribución
- **THEN** abre con el porcentaje del total que está en Avanzado o Experto y la lectura "N de M en avanzado o superior", calculados sobre las mismas cifras que muestra la barra

#### Scenario: Lectura de acompañamiento
- **WHEN** el Chapter Lead ve la leyenda de la card de distribución
- **THEN** encuentra cuántas personas están en el nivel Principiante junto a su etiqueta, en la misma fila que los demás niveles

#### Scenario: El nivel viste el mismo color en la card y en el listado
- **WHEN** el Chapter Lead compara el segmento o el punto de leyenda de un nivel en la card de distribución con el medidor de ese mismo nivel en una fila del listado
- **THEN** ambos usan el mismo matiz del vocabulario ordinal del sistema de diseño, sin que la pantalla tenga dos códigos de color para el mismo dato

#### Scenario: Un cambio de matiz en la escala llega solo
- **WHEN** el sistema de diseño cambia el matiz de un nivel de la escala ordinal
- **THEN** la card de distribución refleja el matiz nuevo con la sola actualización del paquete, sin que se modifique el código de la aplicación

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos
