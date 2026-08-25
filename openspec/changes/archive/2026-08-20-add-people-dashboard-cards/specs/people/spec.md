## ADDED Requirements

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas registradas (no sobre la página o el filtro actual del listado): total de personas activas con sus avatares, FTE disponible frente a la capacidad objetivo, y distribución por seniority.

#### Scenario: Encabezado del módulo
- **WHEN** el Chapter Lead abre la pantalla de Personas
- **THEN** el sistema muestra el título "Personas", su descripción, y el botón para dar de alta una persona

#### Scenario: Resumen de personas activas
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra el total de personas registradas junto con los avatares de algunas de ellas

#### Scenario: Resumen de FTE disponible
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra el FTE disponible frente a la capacidad objetivo, con el porcentaje de capacidad asignada

#### Scenario: Distribución por seniority
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra cuántas personas hay en cada uno de los 4 niveles de seniority del catálogo

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos
