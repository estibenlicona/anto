## ADDED Requirements

### Requirement: Opciones del componente Badge
El componente Badge SHALL representar el estado de un elemento con forma cuadrada (no de píldora, para distinguirse de un control clicable como Chip), SHALL mostrar un punto de color junto al texto en toda variante, y SHALL admitir al menos las variantes semánticas `success`, `info`, `warning`, `danger`, `neutral` y `discovery`. Badge no SHALL usar el rol de color `brand` en ninguna de sus variantes.

#### Scenario: Forma cuadrada distinta de un control
- **WHEN** se renderiza un Badge junto a un Chip
- **THEN** el Badge se distingue del Chip por su forma (esquinas cuadradas en vez de píldora)

#### Scenario: Punto de color obligatorio
- **WHEN** se renderiza un Badge de cualquier variante
- **THEN** muestra un punto de color junto al texto, sin poder omitirlo

#### Scenario: Variante sin color de marca
- **WHEN** se consultan las variantes disponibles de Badge
- **THEN** ninguna usa el rol de color `brand`, de modo que un badge nunca se confunde con la acción primaria de la vista

#### Scenario: Estado no distinguible solo por color
- **WHEN** una persona con dificultad para distinguir colores encuentra un Badge
- **THEN** puede identificar el estado por el texto, no solo por el color del punto o del fondo
