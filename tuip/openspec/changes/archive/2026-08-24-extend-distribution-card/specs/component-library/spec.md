## MODIFIED Requirements

### Requirement: Opciones del componente DistributionCard
El componente DistributionCard SHALL presentar una distribución dentro de una Card: un título en estilo de rótulo, un total con su sustantivo en el slot derecho de la cabecera, una SegmentedBar (separada por defecto) con los segmentos recibidos —cada uno con etiqueta, valor y uno de los vocabularios de color de SegmentedBar, incluido el de intensidad—, una leyenda en dos columnas con un punto del mismo color que el segmento, la etiqueta y el valor en negrita con cifras tabulares, y un pie opcional, separado por un borde superior y alineado al fondo de la card, para una lectura derivada de las mismas cifras. Los segmentos con valor 0 NO SHALL pintar tramo en la barra pero SHALL aparecer en la leyenda. El punto de leyenda de un segmento de intensidad `low` SHALL llevar borde para seguir visible sobre la card.

La card SHALL poder abrir con una cifra titular (`headline`: valor y lectura) entre el rótulo y la barra, en el mismo tamaño de métrica que las demás cards de resumen; SHALL aceptar una acción (`action`) que ocupa el slot derecho de la cabecera en lugar del total; y SHALL ofrecer la leyenda en línea (`legend="inline"`), una fila que envuelve con punto, etiqueta y cifra, además de las disposiciones en dos columnas y en lista. El total SHALL ser opcional.

#### Scenario: Cifra titular con acción y leyenda en línea
- **WHEN** DistributionCard recibe `headline`, `action` y `legend="inline"`
- **THEN** muestra la cifra con su lectura bajo el rótulo, la acción en la cabecera sin el total, la barra y una leyenda en una sola fila con el conteo junto a cada etiqueta

#### Scenario: Distribución con pie
- **WHEN** DistributionCard recibe cuatro segmentos (2, 1, 1, 1) con vocabulario de intensidad, el total 5 y un pie
- **THEN** muestra la barra con cuatro tramos proporcionales, la leyenda con los cuatro valores, "5" junto a su sustantivo en la cabecera y el pie al fondo

#### Scenario: Segmento en cero
- **WHEN** un segmento tiene valor 0
- **THEN** no aparece en la barra pero sí en la leyenda, con su valor 0

#### Scenario: Mismo color en barra y leyenda
- **WHEN** un segmento usa cualquiera de los vocabularios de color
- **THEN** su tramo y su punto de leyenda usan la misma clase de relleno

#### Scenario: Sin pie
- **WHEN** DistributionCard se usa sin pie
- **THEN** la card termina en la leyenda, sin borde ni espacio reservado
