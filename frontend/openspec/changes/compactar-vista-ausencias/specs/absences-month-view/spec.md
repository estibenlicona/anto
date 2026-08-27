## Purpose

Define cómo se compone la vista mensual de ausencias del chapter lead: qué bloques la forman, en qué orden aparecen, dónde viven el navegador de mes y la acción de registrar, y cómo se mantiene el encabezado accesible sin ocupar espacio visible.

## ADDED Requirements

### Requirement: La vista abre con el resumen, sin encabezado de módulo visible
La vista mensual de ausencias NO SHALL mostrar un título de módulo ni una descripción visibles: el nombre de la pantalla ya lo da el breadcrumb del shell ("Gestionar Ausencias"). Con ausencias en el mes, el primer bloque visible del contenido SHALL ser el resumen (cards del mes), seguido de la tabla.

#### Scenario: Primer pantallazo con ausencias en el mes
- **WHEN** el usuario entra a `/app/lead/ausencias` y el mes visible tiene ausencias
- **THEN** no se muestra ningún texto "Ausencias" ni "Vacaciones, permisos e incapacidades del chapter…" como encabezado de la vista
- **AND** las cards del mes son el primer bloque visible del contenido, y la tabla va inmediatamente después

### Requirement: La página conserva un único encabezado de nivel 1 accesible
La página SHALL exponer exactamente un encabezado de nivel 1 con el texto "Gestionar Ausencias", disponible para tecnologías de asistencia pero no visible en pantalla.

#### Scenario: Navegación por encabezados con lector de pantalla
- **WHEN** un lector de pantalla enumera los encabezados de `/app/lead/ausencias`
- **THEN** encuentra un único encabezado de nivel 1, con el texto "Gestionar Ausencias"
- **AND** ese encabezado no ocupa espacio visible en la vista

### Requirement: El navegador de mes y la acción de registrar viven en la franja del breadcrumb
Mientras la vista de ausencias está montada dentro del shell, SHALL publicar en la franja del breadcrumb un bloque con el navegador de mes (ir al mes anterior, el mes visible, ir al mes siguiente) y, a su derecha, la acción primaria "Registrar ausencia". El bloque SHALL mostrarse a la derecha de la franja y a la altura del breadcrumb, y SHALL estar disponible en todos los estados de la vista (cargando, con error, con ausencias y sin ausencias en el mes).

#### Scenario: Registrar desde la franja del breadcrumb
- **WHEN** el usuario está en `/app/lead/ausencias`
- **THEN** el navegador de mes y el botón "Registrar ausencia" aparecen en la franja del breadcrumb, a la derecha, con el navegador antes que el botón
- **AND** al pulsar el botón se abre el formulario de registro de ausencia

#### Scenario: Cambiar de mes desde la franja
- **WHEN** el usuario pulsa "Mes anterior" o "Mes siguiente" en la franja del breadcrumb
- **THEN** la vista pasa a mostrar ese mes y el mes visible que anuncia el navegador se actualiza
- **AND** el mes visible sigue quedando registrado en la dirección de la pantalla, de modo que un enlace compartido abre el mismo mes

#### Scenario: Controles disponibles durante la carga o el error
- **WHEN** el mes está cargando o muestra un error de carga
- **THEN** el navegador de mes y el botón "Registrar ausencia" siguen presentes en la franja del breadcrumb

#### Scenario: Mes sin ausencias
- **WHEN** el mes visible no tiene ninguna ausencia
- **THEN** se muestra el estado vacío del mes con su propio botón "Registrar ausencia", además del de la franja
- **AND** cualquiera de los dos abre el mismo formulario de registro

#### Scenario: Salir de la vista
- **WHEN** el usuario navega a otro módulo
- **THEN** el navegador de mes y el botón "Registrar ausencia" dejan de mostrarse en la franja del breadcrumb

### Requirement: La vista no muestra el aviso de alcance al pie
La vista NO SHALL mostrar el aviso informativo sobre el registro único de la ausencia y sus efectos pendientes (descuento en la factura del proveedor y ajuste de capacidad de célula y sprint).

#### Scenario: Pie de la vista con ausencias
- **WHEN** el mes visible tiene ausencias y el usuario llega al final de la tabla
- **THEN** no se muestra ningún aviso que empiece por "La ausencia se registra una sola vez"

### Requirement: La card de impacto se lee como sus cards hermanas
La card "Impacto en capacidad" NO SHALL mostrar el texto que nombra la célula más afectada ni el que avisa de que no hay nada aprobado. SHALL usar la misma anatomía que las otras cards del resumen: rótulo arriba, la cifra del descuento sola, y al pie la unidad con su referencia contra el FTE del chapter.

#### Scenario: Mes con ausencias aprobadas
- **WHEN** el mes visible tiene ausencias aprobadas que descuentan capacidad
- **THEN** la card de impacto muestra el descuento como cifra sola, y al pie su referencia contra el FTE del chapter
- **AND** ese pie queda a la misma altura que el de las otras cards del resumen
- **AND** no muestra ningún texto sobre qué célula pierde más ni sobre qué ausencias cuentan

#### Scenario: Mes sin nada aprobado
- **WHEN** el mes visible no tiene ninguna ausencia aprobada
- **THEN** la card de impacto muestra el descuento en cero, con la unidad al pie y sin ninguna frase sobre lo aprobado

### Requirement: La vista usa una única medida de separación
Toda la separación entre piezas de la vista SHALL ser de 12px (`gap-3`): tanto la vertical entre los bloques del contenido —que hoy es de 24px (`gap-6`)— como la que hay entre las cards del resumen —que hoy es de 16px—. La pantalla no SHALL mezclar dos medidas distintas de separación.

#### Scenario: Separación entre resumen y tabla
- **WHEN** la vista muestra las cards del mes y la tabla
- **THEN** la separación vertical entre ambos bloques es de 12px

#### Scenario: Separación entre las cards del resumen
- **WHEN** la vista muestra las tres cards del mes
- **THEN** la separación entre ellas es de 12px, la misma que separa el resumen de la tabla
