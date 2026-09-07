## MODIFIED Requirements

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales, salvo la pantalla de Calendario de sprints, que SHALL cargar y guardar su configuración contra un endpoint mockeado, y las secciones de bandas de talla y de mix de capacidades de Parámetros del modelo, que SHALL cargar y guardar sus datos del mismo modo (ver capability `api-mocking`). El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

El formulario del **Calendario de sprints** SHALL tener exactamente dos campos, *Semanas por sprint* y *Sprints por quarter*. SHALL NOT ofrecer horas por semana ni tolerancia de reporte, ni mostrar tarjetas o textos que describan un reporte de horas o una conversión de horas a FTE: la plataforma no registra horas.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** el formulario carga y muestra la configuración actual servida por el endpoint mockeado —semanas por sprint y sprints por quarter, sin campos de horas ni de tolerancia—, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Guardar la configuración de sprints exitosamente
- **WHEN** el usuario edita uno o más campos del formulario con valores válidos y hace clic en "Guardar configuración"
- **THEN** el sistema persiste los cambios contra el endpoint mockeado y muestra una confirmación de éxito

#### Scenario: Intentar guardar con valores inválidos
- **WHEN** el usuario ingresa un valor fuera de rango o no numérico en algún campo
- **THEN** el sistema muestra el error de validación junto al campo correspondiente y el botón "Guardar configuración" permanece deshabilitado hasta que el valor sea válido

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al intentar guardar
- **THEN** el sistema muestra un mensaje de error y conserva los valores ingresados por el usuario en el formulario

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** se muestran las cuatro secciones (bandas de talla, mix de capacidades, pool de preguntas, versionado) como pestañas, con datos de marcador de posición salvo las bandas de talla y el mix de capacidades, que se cargan del endpoint mockeado, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb
