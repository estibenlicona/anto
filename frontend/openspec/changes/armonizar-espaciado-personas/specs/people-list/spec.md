## ADDED Requirements

### Requirement: La vista usa una única medida de separación
Toda la separación entre piezas de la vista de listado de personas SHALL ser de 12px (`gap-3`): tanto la vertical entre los bloques del contenido (resumen y listado) —que hoy es de 8px (`gap-2`)— como la que hay entre las cards del resumen —que hoy es de 16px (`gap-4`)—. La pantalla no SHALL mezclar dos medidas distintas de separación, y la medida SHALL ser la misma que usan las vistas de células y de ausencias.

#### Scenario: Separación entre resumen y listado
- **WHEN** la vista muestra las cards de resumen y el listado
- **THEN** la separación vertical entre ambos bloques es de 12px

#### Scenario: Separación entre las cards del resumen
- **WHEN** la vista muestra las tres cards de resumen
- **THEN** la separación entre ellas es de 12px, la misma que separa el resumen del listado

#### Scenario: Misma medida que células y ausencias
- **WHEN** el usuario pasa de `/app/lead/personas` a `/app/lead/celulas` o a `/app/lead/ausencias`
- **THEN** la separación entre bloques y entre cards es la misma en las tres vistas

## REMOVED Requirements

### Requirement: La vista usa un espaciado vertical compacto
**Reason**: Fijaba 8px sólo para la separación vertical entre resumen y listado y dejaba sin regla la separación entre cards, que quedó en 16px; la vista mezclaba dos medidas y era la única de listado que no coincidía con células y ausencias, unificadas a 12px.
**Migration**: Lo cubre el requisito "La vista usa una única medida de separación": la separación vertical pasa de 8px a 12px y la de las cards de 16px a 12px.
