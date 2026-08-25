## ADDED Requirements

### Requirement: Opciones del componente Select
El componente Select SHALL presentar una lista cerrada de opciones en un desplegable con semántica de listbox, navegable por teclado, y SHALL mostrar un estado de carga dentro del propio desplegable cuando sus opciones provienen de una fuente asíncrona, en vez de presentarse vacío mientras se resuelven.

#### Scenario: Elegir una opción por teclado
- **WHEN** un usuario abre el Select con el teclado y usa las flechas para recorrer las opciones
- **THEN** cada opción se resalta al recorrerla y Enter la confirma sin usar el mouse

#### Scenario: Opciones que llegan del backend
- **WHEN** un Select abre su desplegable mientras sus opciones todavía se están resolviendo
- **THEN** el desplegable muestra un estado de carga en vez de aparecer vacío o sin abrir

#### Scenario: Cerrar sin elegir
- **WHEN** un usuario abre el Select y presiona Escape
- **THEN** el desplegable se cierra sin cambiar la opción seleccionada, y el foco vuelve al control

### Requirement: Opciones del componente Combobox
El componente Combobox SHALL filtrar sus opciones a medida que el usuario escribe, SHALL permitir confirmar una opción de la lista filtrada por teclado, y SHALL admitir selección múltiple con las opciones elegidas visibles como elementos removibles dentro del propio campo.

#### Scenario: Filtrar mientras se escribe
- **WHEN** un usuario escribe en el Combobox
- **THEN** la lista de opciones se reduce a las que coinciden con el texto escrito, sin exigir una coincidencia exacta

#### Scenario: Selección múltiple visible en el campo
- **WHEN** un usuario elige más de una opción en un Combobox de selección múltiple
- **THEN** cada opción elegida aparece como un elemento dentro del campo, removible sin reabrir la lista

#### Scenario: Sin resultados
- **WHEN** el texto escrito no coincide con ninguna opción
- **THEN** el Combobox lo indica explícitamente en vez de mostrar una lista vacía sin explicación

### Requirement: Vocabulario del estado de madurez
El campo de madurez de un componente SHALL expresarse en inglés con los valores `stable` y `beta`, siguiendo la nomenclatura de canal de publicación estándar del ecosistema — la misma distinción que un dist-tag de npm o que usan Radix y MUI —, en vez de una traducción propia del sistema.

#### Scenario: El valor se reconoce sin traducir
- **WHEN** alguien familiarizado con el ecosistema de componentes de código abierto lee el estado de madurez de un componente
- **THEN** reconoce el valor (`stable` o `beta`) sin necesitar traducirlo primero

### Requirement: Umbral entre radios, Select y Combobox
La documentación SHALL orientar sobre cuál de los tres patrones de selección de opción única corresponde según el volumen de opciones: un grupo de radios para hasta seis, Select para entre siete y veinte, y Combobox para más de veinte.

#### Scenario: Consultar qué patrón corresponde
- **WHEN** alguien construye un formulario y necesita elegir entre radios, Select y Combobox para un campo con un número conocido de opciones
- **THEN** la documentación del componente le indica el umbral y por qué

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select y Combobox.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select y Combobox aparecen como componentes instalables

### Requirement: Componentes distribuidos como código fuente
El sistema SHALL distribuir cada componente como código fuente (TypeScript/TSX) legible y editable, no como una dependencia de runtime compilada obligatoria, de modo que el CLI pueda copiarlo al repositorio consumidor. Un componente SHALL poder declarar dependencias de runtime de terceros más allá de React, siempre que se distribuyan como paquetes de npm que el consumidor instala, y no como código que el CLI genera u oculta.

#### Scenario: Código fuente copiado es editable
- **WHEN** el CLI agrega el componente Card a un proyecto consumidor
- **THEN** el archivo fuente del componente queda disponible en el repositorio del consumidor y puede modificarse libremente sin afectar a otros consumidores

#### Scenario: Un componente con dependencia de terceros
- **WHEN** el CLI agrega un componente cuyo código fuente importa una librería headless de terceros
- **THEN** el CLI indica qué paquete de npm debe instalar el consumidor para que el componente funcione, igual que ya hace con `react`
