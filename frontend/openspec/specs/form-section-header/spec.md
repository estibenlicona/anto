# form-section-header Specification

## Purpose

Define el encabezado que separa las zonas de un formulario en drawer —el icono en pastilla y el título de la zona— y cómo se relacionan entre sí, para que todos los formularios de la aplicación lo muestren igual.

## Requirements

### Requirement: El título de sección y su icono comparten eje
El icono en pastilla y el título de una sección de formulario SHALL quedar centrados uno respecto del otro: sus centros verticales coinciden. La fila del encabezado NO SHALL crecer por encima del alto de la pastilla.

#### Scenario: Encabezado de una sección
- **WHEN** se muestra una sección de formulario con su icono y su título
- **THEN** el centro vertical del título coincide con el centro vertical de la pastilla del icono
- **AND** la fila del encabezado mide lo que mide la pastilla, no más

#### Scenario: Todos los formularios que lo usan
- **WHEN** se abre cualquier formulario de la aplicación que separe sus zonas con este encabezado
- **THEN** el encabezado se ve con la misma alineación en todos ellos
