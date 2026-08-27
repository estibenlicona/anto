## MODIFIED Requirements

### Requirement: La franja y el contenido usan padding vertical corto
La franja del breadcrumb y la columna de contenido del shell SHALL usar un padding vertical de 12px cada una, de modo que entre el breadcrumb y el primer bloque de la pantalla haya 24px en total, el mismo paso de 12px con el que las pantallas separan sus bloques.

#### Scenario: Distancia entre el breadcrumb y el contenido
- **WHEN** se muestra cualquier pantalla del shell del chapter lead
- **THEN** el primer bloque del contenido arranca 24px por debajo del borde inferior de la franja del breadcrumb
