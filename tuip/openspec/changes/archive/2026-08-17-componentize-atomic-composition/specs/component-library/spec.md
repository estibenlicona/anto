## ADDED Requirements

### Requirement: Composición atómica de componentes compuestos
Todo componente compuesto del catálogo SHALL exponer sus partes estructurales internas como componentes nombrados, importables por separado, además de su componente de nivel superior de uso directo. El componente de nivel superior SHALL seguir funcionando sin cambios para quien ya lo usa, componiéndose internamente a partir de esas mismas partes.

#### Scenario: Recomponer con las partes atómicas
- **WHEN** un consumidor necesita una disposición que el componente de nivel superior no contempla (un disparador propio, un ítem con contenido distinto al de por defecto)
- **THEN** puede importar las partes atómicas del componente por separado y recomponerlas, sin forkear el código fuente del componente

#### Scenario: El componente de nivel superior sigue funcionando igual
- **WHEN** se agregan las partes atómicas de un componente que antes era monolítico
- **THEN** el uso existente del componente de nivel superior, con las mismas props que ya tenía, se sigue comportando exactamente igual que antes

### Requirement: Partes atómicas del componente Select
El componente Select SHALL exponer `SelectTrigger` y `SelectItem` como partes atómicas, además de `Select` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Ítem con contenido propio
- **WHEN** un consumidor usa `SelectItem` directamente dentro de la estructura de Select
- **THEN** puede darle contenido propio (por ejemplo, un ícono junto a la etiqueta) más allá de la etiqueta de texto simple que acepta `options` en `Select`

#### Scenario: Select sigue aceptando `options`
- **WHEN** se usa `Select` con su prop `options` como hasta ahora
- **THEN** internamente renderiza un `SelectItem` por cada opción, sin cambiar el comportamiento que el consumidor ya observaba

### Requirement: Partes atómicas del componente Combobox
El componente Combobox SHALL exponer `ComboboxTrigger` y `ComboboxItem` como partes atómicas, además de `Combobox` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Ítem con contenido propio
- **WHEN** un consumidor usa `ComboboxItem` directamente
- **THEN** puede darle contenido propio más allá de la etiqueta de texto simple que acepta `options` en `Combobox`

#### Scenario: Combobox sigue aceptando `options`
- **WHEN** se usa `Combobox` con su prop `options` como hasta ahora
- **THEN** internamente renderiza un `ComboboxItem` por cada opción, sin cambiar el comportamiento que el consumidor ya observaba

### Requirement: Partes atómicas del componente Pagination
El componente Pagination SHALL exponer `PaginationPrevious`, `PaginationNext`, `PaginationItem` y `PaginationEllipsis` como partes atómicas, además de `Pagination` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Disposición de paginación propia
- **WHEN** un consumidor necesita una disposición de paginación distinta a la que arma `Pagination` (por ejemplo, sin los controles anterior/siguiente)
- **THEN** puede componer `PaginationItem`, `PaginationEllipsis`, `PaginationPrevious` y `PaginationNext` directamente, en el orden y agrupación que necesite

#### Scenario: Pagination sigue aceptando `page`, `pageCount` y `onPageChange`
- **WHEN** se usa `Pagination` con sus props actuales
- **THEN** se comporta exactamente igual que antes, incluida la colapsación con puntos suspensivos

### Requirement: Partes atómicas del componente Navbar
El componente Navbar SHALL exponer `NavbarBrand`, `NavbarSearch` y `NavbarUtilities` como partes atómicas correspondientes a sus tres zonas fijas, además de `Navbar` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Navbar sigue componiendo sus tres zonas en orden fijo
- **WHEN** se usa `Navbar` con sus props actuales
- **THEN** internamente sigue componiendo `NavbarBrand`, `NavbarSearch` y `NavbarUtilities` en el mismo orden fijo que ya tenía (marca a la izquierda, búsqueda al centro, utilidades y sesión a la derecha)

#### Scenario: Reutilizar una zona fuera de Navbar
- **WHEN** un consumidor necesita la misma zona de búsqueda o de marca en un contexto distinto al de la barra completa
- **THEN** puede importar `NavbarSearch` o `NavbarBrand` por separado

### Requirement: Partes atómicas del componente Sidebar
El componente Sidebar SHALL exponer `SidebarGroup` y `SidebarItem` como partes atómicas, además de `Sidebar` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Sidebar sigue aceptando `groups`
- **WHEN** se usa `Sidebar` con su prop `groups` como hasta ahora
- **THEN** internamente renderiza un `SidebarGroup` por cada grupo y un `SidebarItem` por cada ítem, sin cambiar el comportamiento que el consumidor ya observaba, incluidas las tres señales del ítem activo

#### Scenario: Componer una navegación con agrupación propia
- **WHEN** un consumidor necesita una agrupación o un orden de ítems que la prop `groups` no expresa directamente
- **THEN** puede componer `SidebarGroup` y `SidebarItem` directamente dentro de Sidebar

### Requirement: Partes atómicas del componente DateField
El componente DateField SHALL exponer `DateFieldCalendar` como parte atómica correspondiente a su calendario desplegable, además de `DateField` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: DateField sigue ofreciendo el calendario como ayuda opcional
- **WHEN** se usa `DateField` con sus props actuales
- **THEN** internamente sigue componiendo `DateFieldCalendar` de la misma forma que ya tenía, sin cambiar el comportamiento observable

#### Scenario: Reutilizar el calendario fuera del campo de texto
- **WHEN** un consumidor necesita el mismo calendario de selección de fecha única en una superficie distinta a la del campo de texto de DateField
- **THEN** puede importar `DateFieldCalendar` por separado

### Requirement: Partes atómicas del componente DateRangeField
El componente DateRangeField SHALL exponer `DateRangeFieldCalendar` como parte atómica correspondiente a su calendario desplegable de rango, además de `DateRangeField` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: DateRangeField sigue ofreciendo el calendario como ayuda opcional
- **WHEN** se usa `DateRangeField` con sus props actuales
- **THEN** internamente sigue componiendo `DateRangeFieldCalendar` de la misma forma que ya tenía, sin cambiar el comportamiento observable

#### Scenario: Reutilizar el calendario de rango fuera del campo de texto
- **WHEN** un consumidor necesita el mismo calendario de selección de rango en una superficie distinta a la del campo de texto de DateRangeField
- **THEN** puede importar `DateRangeFieldCalendar` por separado

### Requirement: Partes atómicas del componente FileUploader
El componente FileUploader SHALL exponer `FileUploaderRow` como parte atómica correspondiente a la fila de un archivo, además de `FileUploader` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: FileUploader sigue renderizando una fila por archivo
- **WHEN** se usa `FileUploader` con su prop `files` como hasta ahora
- **THEN** internamente renderiza un `FileUploaderRow` por cada archivo, sin cambiar el comportamiento que el consumidor ya observaba

#### Scenario: Reutilizar la fila de archivo en una lista propia
- **WHEN** un consumidor arma una lista de archivos con una disposición distinta a la zona de arrastre de FileUploader
- **THEN** puede importar `FileUploaderRow` por separado y reutilizarla dentro de su propia lista
