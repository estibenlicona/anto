## MODIFIED Requirements

### Requirement: Estado de madurez del componente
La navegación y la página de detalle de cada componente SHALL exponer el estado de madurez del componente (`stable` o `beta`), de modo que un usuario distinga qué componentes puede adoptar sin reservas antes de abrir su página.

#### Scenario: Estado visible en la navegación
- **WHEN** un usuario recorre la lista de componentes en el sidebar
- **THEN** los componentes que no están en `stable` muestran junto a su nombre una insignia que lo indica

#### Scenario: Estado en la página del componente
- **WHEN** un usuario abre la página de detalle de un componente en `beta`
- **THEN** la cabecera de la página indica que su estado es `beta`
