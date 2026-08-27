## Purpose

Define cómo se separan entre sí las piezas del detalle de una persona del chapter —encabezado, cards de resumen, columnas y paneles— y qué alto de relleno comparten las filas de sus paneles, para que el detalle se lea con la misma medida que el listado del que se llega.

## ADDED Requirements

### Requirement: El detalle usa una única medida de separación
Toda la separación entre piezas del detalle de persona SHALL ser de 12px (`gap-3`): entre los bloques del contenido (encabezado, cards de resumen y zona de paneles), entre las cards de resumen, entre las dos columnas de paneles y entre los paneles apilados dentro de cada columna. El detalle no SHALL mezclar medidas distintas de separación entre piezas, y la medida SHALL ser la misma que usa el listado de personas. El relleno interior de una card o de un panel no es separación entre piezas y queda fuera de esta regla.

#### Scenario: Separación entre bloques
- **WHEN** el detalle muestra el encabezado, las cards de resumen y los paneles
- **THEN** la separación vertical entre cada bloque y el siguiente es de 12px

#### Scenario: Separación entre cards y entre paneles
- **WHEN** el detalle muestra las cards de resumen y las dos columnas de paneles
- **THEN** la separación entre las cards, entre las dos columnas y entre los paneles de una misma columna es de 12px, la misma que separa los bloques

#### Scenario: Misma medida que el listado
- **WHEN** el usuario entra al detalle de una persona desde `/app/lead/personas`
- **THEN** la separación entre bloques y entre cards es la misma que acaba de ver en el listado

### Requirement: Las filas de los paneles comparten alto de relleno
Las filas de los paneles del detalle —cada stack, cada célula sugerida, la señal de asignación y cada dato del perfil— SHALL llevar el mismo relleno vertical de 12px (`py-3`), el mismo que la cabecera de cada panel. Los estados vacíos de un panel, que son bloques centrados y no filas, no SHALL contar como filas.

#### Scenario: Filas de stacks y de células sugeridas
- **WHEN** el panel de stacks o el de persona sin célula lista sus filas
- **THEN** cada fila tiene 12px de relleno arriba y abajo, como las filas del perfil y la cabecera del panel

#### Scenario: Señal de asignación
- **WHEN** el panel de asignación muestra su señal de estado (al día o con alerta)
- **THEN** la caja de la señal tiene 12px de relleno arriba y abajo

#### Scenario: Estado vacío de un panel
- **WHEN** un panel no tiene stacks o no tiene horas que mostrar
- **THEN** su estado vacío conserva su propio relleno centrado, sin ajustarse al de las filas
