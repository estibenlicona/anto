## MODIFIED Requirements

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales, salvo la pantalla de Calendario de sprints, que SHALL cargar y guardar su configuración contra un endpoint mockeado, y las secciones de bandas de talla y de mix de capacidades de Parámetros del modelo, que SHALL cargar y guardar sus datos del mismo modo (ver capability `api-mocking`). El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

El formulario del **Calendario de sprints** SHALL tener exactamente cinco campos:

- *Semanas por sprint*
- *Sprints por quarter*
- *Hora de cierre del sprint* (hora local en formato de 24 horas, "23:00" por defecto): el momento del último día del sprint en que se **sella el snapshot** de lo comprometido y lo completado, antes de que los equipos limpien o cierren las historias de usuario.
- *Ventana de histórico* (en sprints; 6 por defecto, entre 3 y 12): cuántos sprints cerrados y sellados entran en la mediana histórica y en la tendencia del colaborador y de su célula.
- *Mínimo de sprints para evaluar* (3 por defecto, entre 2 y 6, y nunca mayor que la ventana de histórico): cuántos sprints sellados necesita un colaborador para que su señal de balance se pueda calcular; por debajo de ese mínimo su señal es "No evaluable".

El formulario SHALL NOT ofrecer *Puntos por FTE por sprint*, horas por semana ni tolerancia de reporte, ni mostrar tarjetas o textos que describan un reporte de horas o una conversión de puntos a FTE: la plataforma no registra horas y el FTE se usa sólo como capacidad. La tarjeta de qué usa el calendario SHALL nombrar Dedicación real, que con estos valores decide cuándo sellar el snapshot de cada sprint y sobre qué ventana calcula el histórico y la señal de balance.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** el formulario carga y muestra la configuración actual servida por el endpoint mockeado —semanas por sprint, sprints por quarter, hora de cierre del sprint, ventana de histórico y mínimo de sprints para evaluar, sin campos de horas ni de puntos por FTE—, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Guardar la configuración de sprints exitosamente
- **WHEN** el usuario edita uno o más campos del formulario con valores válidos y hace clic en "Guardar configuración"
- **THEN** el sistema persiste los cambios contra el endpoint mockeado y muestra una confirmación de éxito

#### Scenario: Intentar guardar con valores inválidos
- **WHEN** el usuario ingresa un valor fuera de rango o no numérico en algún campo, una hora de cierre con formato inválido, o un mínimo de sprints mayor que la ventana de histórico
- **THEN** el sistema muestra el error de validación junto al campo correspondiente y el botón "Guardar configuración" permanece deshabilitado hasta que el valor sea válido

#### Scenario: Cambiar la ventana de histórico recalcula el balance
- **WHEN** el Administrador cambia la ventana de histórico de 6 a 10 sprints y guarda
- **THEN** las medianas históricas, las tendencias y las señales de balance de Dedicación real se recalculan sobre la ventana nueva, sin que cambien los datos de ningún sprint

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al intentar guardar
- **THEN** el sistema muestra un mensaje de error y conserva los valores ingresados por el usuario en el formulario

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** se muestran las cuatro secciones (bandas de talla, mix de capacidades, pool de preguntas, versionado) como pestañas, con datos de marcador de posición salvo las bandas de talla y el mix de capacidades, que se cargan del endpoint mockeado, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb
