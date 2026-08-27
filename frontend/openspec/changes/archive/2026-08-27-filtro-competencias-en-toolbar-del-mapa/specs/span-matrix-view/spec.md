## MODIFIED Requirements

### Requirement: El filtro de habilidades va pegado al mapa y el orden es fijo por brechas
El filtro de habilidades visibles (Todas / Técnicas / Humanas) SHALL mostrarse como la barra superior de la card del mapa —dentro de su mismo marco, encima de las cabeceras y separado de ellas por una línea— de modo que el marco del mapa y las cards de la columna de apoyo arranquen a la misma altura. La matriz SHALL ordenarse siempre por brechas, de mayor a menor, y NO SHALL ofrecer un control para cambiar el orden.

#### Scenario: Filtro sobre el mapa
- **WHEN** la matriz se muestra
- **THEN** el filtro de habilidades aparece dentro de la card del mapa, en una barra encima de las cabeceras de columna, y no como una fila suelta entre la fila de notas y la card

#### Scenario: Mapa y columna de apoyo alineados
- **WHEN** la matriz se muestra junto a la columna de apoyo
- **THEN** el borde superior de la card del mapa y el de la primera card de la columna de apoyo quedan a la misma altura

#### Scenario: Acotar desde la barra
- **WHEN** el usuario elige "Técnicas" en la barra del mapa
- **THEN** la matriz recorta sus columnas al grupo, la barra sigue en su sitio y la columna fija de personas sigue funcionando al desplazar

#### Scenario: Sin control de orden
- **WHEN** la matriz se muestra
- **THEN** no hay opción "Por brechas" / "Por nombre"; las filas van de más brechas a menos, como antes por defecto

### Requirement: La vista usa un espaciado vertical compacto
El espacio entre los bloques de la vista SHALL ser uniforme, de 12px (`gap-3`): entre las cards de resumen, entre el resumen, la fila de notas y la zona del mapa, entre el mapa y la columna de apoyo, y entre las cards de esa columna. Ningún bloque SHALL usar una separación distinta, de modo que la pantalla se lea con un solo ritmo.

#### Scenario: Separación entre bloques
- **WHEN** la vista muestra las cards de resumen, la fila de notas, el mapa y la columna de apoyo
- **THEN** todas las separaciones entre bloques consecutivos y entre columnas son de 12px
