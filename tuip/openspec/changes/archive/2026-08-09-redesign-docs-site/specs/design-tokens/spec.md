## MODIFIED Requirements

### Requirement: Tokens de estado de interacción
El sistema SHALL definir variantes `hover` y `pressed` para los tokens semánticos de fondo de los roles `brand`, `neutral` y `danger`, que son los roles usados por componentes interactivos (botones, campos, elementos seleccionables y acciones destructivas).

#### Scenario: Estado hover de una acción primaria
- **WHEN** un usuario pasa el cursor sobre un elemento que usa `color.background.brand.bold`
- **THEN** el elemento cambia a `color.background.brand.bold.hover` sin que el componente defina ese color de forma independiente

#### Scenario: Estado hover de una acción destructiva
- **WHEN** un usuario pasa el cursor sobre un elemento que usa `color.background.danger.bold`
- **THEN** el elemento cambia a `color.background.danger.bold.hover`, y el texto sobre ese fondo sigue cumpliendo el contraste mínimo exigido
