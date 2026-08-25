## MODIFIED Requirements

### Requirement: Tokens semánticos de color por rol y variante
El sistema SHALL exponer tokens semánticos de color organizados por propiedad (`bg`, `text`, `border`, `icon`), rol (`neutral`, `brand`, `danger`, `warning`, `success`, `info`, `discovery`), énfasis (`subtle`, `default`, `strong`, `bold`) y estado (`hover`, `pressed`, `disabled`, `selected`), de modo que cada combinación tenga un nombre estable y predecible.

El nombre de un token SHALL describir su rol y no su apariencia, de modo que siga siendo cierto cuando cambie el tema.

#### Scenario: Consumo de un token semántico desde un componente
- **WHEN** un componente necesita el fondo de una acción primaria
- **THEN** usa el token semántico de fondo de marca en su énfasis mayor, en vez de un valor de color embebido

#### Scenario: Paso intermedio de la marca
- **WHEN** un componente necesita un relleno de marca de menor intensidad que el principal, sin ser una tinta de fondo
- **THEN** usa el token semántico de fondo de marca en su énfasis `strong`, definido en ambos temas, en vez de aplicar opacidad al énfasis mayor

#### Scenario: El nombre no describe la apariencia
- **WHEN** se inspecciona el nombre de un token semántico de color
- **THEN** nombra su propiedad, su rol, su énfasis y su estado, sin nombrar el color que toma en un tema concreto
