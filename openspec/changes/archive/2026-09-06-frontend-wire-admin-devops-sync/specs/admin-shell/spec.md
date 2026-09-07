## MODIFIED Requirements

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales, salvo la pantalla de Calendario de sprints, que SHALL cargar y guardar su configuración contra un endpoint mockeado; las secciones de bandas de talla y de mix de capacidades de Parámetros del modelo, que SHALL cargar y guardar sus datos del mismo modo (ver capability `api-mocking`); y el botón "Ejecutar ingesta ahora" de la pantalla de Conexión y job de ingesta, que SHALL disparar una sincronización real contra Azure DevOps reutilizando el mismo endpoint que ya usa el botón "Actualizar" de Dedicación real, sin pedir ni transmitir ningún secreto o credencial desde el frontend. El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

El formulario del **Calendario de sprints** SHALL tener exactamente seis campos:

- *Semanas por sprint*
- *Sprints por quarter*
- *Horas por sprint* (80 por defecto, entre 20 y 400): las horas que un colaborador a jornada completa tiene disponibles en un sprint sin descuentos. Es el factor con el que Dedicación real expresa la capacidad en horas; SHALL NOT usarse para pedir ni registrar horas trabajadas.
- *Hora de cierre del sprint* (hora local en formato de 24 horas, "23:00" por defecto): el momento del último día del sprint en que se **sella el snapshot** de lo comprometido y lo completado, antes de que los equipos limpien o cierren las historias de usuario.
- *Ventana de histórico* (en sprints; 6 por defecto, entre 3 y 12): cuántos sprints cerrados y sellados entran en la mediana histórica y en la tendencia del colaborador y de su célula.
- *Mínimo de sprints para evaluar* (3 por defecto, entre 2 y 6, y nunca mayor que la ventana de histórico): cuántos sprints sellados necesita un colaborador para que su señal de balance se pueda calcular; por debajo de ese mínimo su señal es "No evaluable".

El formulario SHALL NOT ofrecer *Puntos por FTE por sprint*, horas por semana ni tolerancia de reporte, ni mostrar tarjetas o textos que describan un reporte de horas o una conversión de puntos a FTE: la plataforma no registra horas —las horas por sprint son un factor de lectura de la capacidad, no un parte de trabajo— y el FTE se usa sólo como capacidad. La tarjeta de qué usa el calendario SHALL nombrar Dedicación real, que con estos valores decide cuándo sellar el snapshot de cada sprint, sobre qué ventana calcula el histórico y la señal de balance, y con cuántas horas expresa la capacidad.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** el formulario carga y muestra la configuración actual servida por el endpoint mockeado —semanas por sprint, sprints por quarter, horas por sprint, hora de cierre del sprint, ventana de histórico y mínimo de sprints para evaluar, sin campos de puntos por FTE ni de reporte de horas—, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Guardar la configuración de sprints exitosamente
- **WHEN** el usuario edita uno o más campos del formulario con valores válidos y hace clic en "Guardar configuración"
- **THEN** el sistema persiste los cambios contra el endpoint mockeado y muestra una confirmación de éxito

#### Scenario: Intentar guardar con valores inválidos
- **WHEN** el usuario ingresa un valor fuera de rango o no numérico en algún campo, una hora de cierre con formato inválido, o un mínimo de sprints mayor que la ventana de histórico
- **THEN** el sistema muestra el error de validación junto al campo correspondiente y el botón "Guardar configuración" permanece deshabilitado hasta que el valor sea válido

#### Scenario: Cambiar la ventana de histórico recalcula el balance
- **WHEN** el Administrador cambia la ventana de histórico de 6 a 10 sprints y guarda
- **THEN** las medianas históricas, las tendencias y las señales de balance de Dedicación real se recalculan sobre la ventana nueva, sin que cambien los datos de ningún sprint

#### Scenario: Cambiar las horas por sprint cambia sólo la lectura en horas
- **WHEN** el Administrador cambia las horas por sprint de 80 a 100 y guarda
- **THEN** la capacidad en horas de Dedicación real se recalcula sobre el valor nuevo, y ni el FTE disponible, ni las evidencias, ni las señales de balance cambian

#### Scenario: Error al guardar
- **WHEN** el endpoint mockeado responde con un error al intentar guardar
- **THEN** el sistema muestra un mensaje de error y conserva los valores ingresados por el usuario en el formulario

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** se muestran las cuatro secciones (bandas de talla, mix de capacidades, pool de preguntas, versionado) como pestañas, con datos de marcador de posición salvo las bandas de talla y el mix de capacidades, que se cargan del endpoint mockeado, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición — salvo el estado de "Última ejecución" tras una ingesta real y el propio botón de ingesta —, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb, y sin ningún campo que pida o muestre una credencial o secreto

#### Scenario: Ejecutar la ingesta manualmente
- **WHEN** el usuario hace clic en "Ejecutar ingesta ahora"
- **THEN** el sistema dispara la misma sincronización que el botón "Actualizar" de Dedicación real, sin enviar ni pedir ningún secreto o credencial; mientras corre, el botón muestra su estado de carga y al finalizar exitosamente "Última ejecución" refleja la hora real devuelta

#### Scenario: Error al ejecutar la ingesta
- **WHEN** la sincronización disparada por "Ejecutar ingesta ahora" falla (por ejemplo, Azure DevOps no responde)
- **THEN** el sistema muestra una alerta de error con una acción para reintentar, y conserva el valor anterior de "Última ejecución"
