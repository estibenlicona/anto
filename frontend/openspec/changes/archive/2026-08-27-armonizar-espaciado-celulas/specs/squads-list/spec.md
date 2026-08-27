## ADDED Requirements

### Requirement: La vista usa una única medida de separación
Toda la separación entre piezas de la vista de listado de células SHALL ser de 12px (`gap-3`): tanto la vertical entre los bloques del contenido (resumen y listado) —que hoy es de 8px (`gap-2`)— como la que hay entre las cards del resumen —que hoy es de 16px (`gap-4`)—. La pantalla no SHALL mezclar dos medidas distintas de separación, y la medida SHALL ser la misma que usa la vista mensual de ausencias.

#### Scenario: Separación entre resumen y listado
- **WHEN** la vista muestra las cards de resumen y el listado
- **THEN** la separación vertical entre ambos bloques es de 12px

#### Scenario: Separación entre las cards del resumen
- **WHEN** la vista muestra las tres cards de resumen
- **THEN** la separación entre ellas es de 12px, la misma que separa el resumen del listado

#### Scenario: Misma medida que ausencias
- **WHEN** el usuario pasa de `/app/lead/celulas` a `/app/lead/ausencias` o viceversa
- **THEN** la separación entre bloques y entre cards es la misma en las dos vistas

## REMOVED Requirements

### Requirement: La vista usa un espaciado vertical compacto
**Reason**: Fijaba 8px sólo para la separación vertical entre resumen y listado y dejaba sin regla la separación entre cards, que quedó en 16px; la vista mezclaba dos medidas y no coincidía con ausencias, que unificó todo a 12px.
**Migration**: Lo cubre el requisito "La vista usa una única medida de separación": la separación vertical pasa de 8px a 12px y la de las cards de 16px a 12px.
