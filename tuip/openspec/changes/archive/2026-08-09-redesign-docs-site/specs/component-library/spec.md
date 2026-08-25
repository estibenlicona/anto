## ADDED Requirements

### Requirement: Props públicas documentadas
Cada componente SHALL declarar sus props públicas mediante tipos explícitos, y cada prop propia del componente SHALL llevar una descripción legible por herramientas de generación de documentación, de modo que la documentación de API pueda derivarse del código sin escritura manual.

#### Scenario: Descripción disponible para la documentación
- **WHEN** una herramienta lee las definiciones de tipos de un componente para generar su documentación de API
- **THEN** obtiene, por cada prop propia del componente, su nombre, su tipo, si es requerida y su descripción

#### Scenario: Componente nuevo agregado al catálogo
- **WHEN** se agrega un componente nuevo al catálogo
- **THEN** sus props públicas quedan declaradas con tipos explícitos y descritas, igual que las de los componentes ya existentes

### Requirement: Opciones del componente Button
El componente Button SHALL ofrecer variantes de énfasis (acción primaria, secundaria, sutil, destructiva y de tipo enlace), al menos tres tamaños, la posibilidad de acompañar la etiqueta con un ícono antes o después, y un estado de carga que impida activar la acción mientras está en curso.

#### Scenario: Variante destructiva
- **WHEN** se usa la variante destructiva de Button
- **THEN** el botón se presenta con los colores del rol `danger` del sistema de diseño, incluidos sus estados de interacción

#### Scenario: Tamaños
- **WHEN** se usa Button en un tamaño distinto del predeterminado
- **THEN** cambian su altura, su espaciado interno y su tamaño de texto de forma proporcionada, sin alterar sus colores ni su variante

#### Scenario: Botón con ícono
- **WHEN** se pasa un ícono junto a la etiqueta del botón
- **THEN** el ícono se renderiza alineado con el texto, con separación consistente, y se oculta a las tecnologías de asistencia por ser decorativo

#### Scenario: Botón en estado de carga
- **WHEN** el botón está en estado de carga
- **THEN** muestra un indicador de progreso, no dispara eventos de click, y su estado se comunica a las tecnologías de asistencia

#### Scenario: Botón sin etiqueta visible
- **WHEN** un botón contiene únicamente un ícono, sin texto visible
- **THEN** requiere un nombre accesible explícito para que su acción pueda anunciarse
