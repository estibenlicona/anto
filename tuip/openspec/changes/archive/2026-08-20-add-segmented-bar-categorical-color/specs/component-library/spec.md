## MODIFIED Requirements

### Requirement: Opciones del componente SegmentedBar
El componente SegmentedBar SHALL representar una distribución como una barra dividida en segmentos proporcionales a su valor, y cada segmento SHALL colorearse por uno de dos vocabularios excluyentes entre sí: un rol de estado (`info`/`warning`/`success`/`danger`, consistente en toda la aplicación) o un color categórico (el mismo vocabulario de seis tonos sin significado de estado que ya usan Avatar y Tag), nunca ambos a la vez en el mismo segmento.

#### Scenario: Suma de segmentos
- **WHEN** SegmentedBar recibe una lista de segmentos con sus valores
- **THEN** el ancho de cada segmento es proporcional a su valor respecto a la suma total de los segmentos

#### Scenario: Color por rol de estado
- **WHEN** un segmento especifica un rol de estado (`info`/`warning`/`success`/`danger`)
- **THEN** el segmento se colorea con el color de ese rol, igual que en el resto del sistema

#### Scenario: Color categórico
- **WHEN** un segmento especifica un color categórico (`gray`/`green`/`blue`/`amber`/`red`/`purple`) en vez de un rol de estado
- **THEN** el segmento se colorea con ese tono, sin implicar ningún significado de estado
