## RENAMED Requirements

- FROM: `### Requirement: Resumen de capacidad del chapter`
- TO: `### Requirement: Resumen de capacidad`

## MODIFIED Requirements

### Requirement: Resumen de capacidad
El sistema SHALL mostrar en la raíz de Chapter Lead una Torre de control con un encabezado ("Torre de control" y su descripción) y tres indicadores calculados sobre todas las personas y células registradas, sin acotar por quién mira: el FTE total repartido en BAU, Transformación y libre (con el porcentaje sin asignar); cuántas personas tienen margen, distinguiendo sin célula y con dedicación parcial; y cuántas células están al tope y cuántas sin equipo. Una persona tiene margen cuando no tiene célula o cuando su dedicación es menor al 100 %; una célula está al tope cuando su FTE asignado alcanza o supera el FTE disponible de su equipo.

#### Scenario: Indicadores con datos
- **WHEN** el Chapter Lead abre la raíz de Chapter Lead con personas y células registradas
- **THEN** ve el FTE total con su reparto BAU / Transformación / libre y el porcentaje sin asignar, el total de personas con margen con cuántas no tienen célula y cuántas tienen dedicación parcial, y cuántas células están al tope y sin equipo

#### Scenario: Chapter sin personas
- **WHEN** no hay personas registradas
- **THEN** los indicadores muestran ceros sin errores de cálculo y los paneles muestran sus estados vacíos

#### Scenario: Error al cargar
- **WHEN** la petición del resumen falla
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar, sin pantalla en blanco

