## Purpose

Provee un sitio web navegable (React + Vite) donde el equipo de Tuya CA puede explorar visualmente cada componente de Tuya UI, ver y copiar su código fuente, y consultar los design tokens de marca disponibles.

## ADDED Requirements

### Requirement: Catálogo navegable de componentes
El sitio SHALL listar todos los componentes disponibles en Tuya UI y permitir navegar a la página de detalle de cada uno.

#### Scenario: Navegar al catálogo
- **WHEN** un usuario abre el sitio de documentación
- **THEN** ve una lista de todos los componentes disponibles con acceso a su página de detalle

### Requirement: Vista previa visual de componente
Cada página de componente SHALL mostrar una vista previa renderizada en vivo del componente, incluyendo sus variantes y estados principales.

#### Scenario: Ver variantes de un componente
- **WHEN** un usuario abre la página de detalle de Button
- **THEN** el sitio muestra el componente renderizado con sus variantes (ej. primario, secundario) y estados (ej. deshabilitado)

### Requirement: Código fuente visible y copiable
Cada página de componente SHALL mostrar el código fuente del componente con una presentación estilo editor de código (barra de título con el nombre del archivo, resaltado de sintaxis según el lenguaje, y numeración de línea) y SHALL permitir copiarlo al portapapeles.

#### Scenario: Copiar código de un componente
- **WHEN** un usuario hace clic en la acción de copiar código en la página de detalle de un componente
- **THEN** el código fuente completo del componente se copia al portapapeles del usuario

#### Scenario: Resaltado de sintaxis
- **WHEN** un usuario visualiza el código fuente de un componente (TSX)
- **THEN** el código se muestra con resaltado de sintaxis coloreado según su lenguaje, con una apariencia consistente con el tema oscuro de Visual Studio Code

#### Scenario: Barra de título del archivo
- **WHEN** un usuario visualiza el bloque de código fuente de un componente
- **THEN** el bloque muestra una barra superior con el nombre del archivo (ej. `components/ui/button.tsx`), imitando la barra de pestañas de un editor de código

### Requirement: Comando de instalación visible por componente
Cada página de componente SHALL mostrar el comando del CLI necesario para agregarlo a un proyecto React.

#### Scenario: Ver comando de instalación
- **WHEN** un usuario abre la página de detalle de un componente
- **THEN** el sitio muestra el comando exacto de `tuya-ui` para agregar ese componente a un proyecto

### Requirement: Página de design tokens
El sitio SHALL incluir una sección que muestre visualmente los design tokens de marca de Tuya CA (paleta de color, tipografía, espaciado, radios, sombras).

#### Scenario: Consultar paleta de color
- **WHEN** un usuario navega a la sección de tokens del sitio
- **THEN** ve la paleta de colores de marca de Tuya CA con su valor y nombre de token correspondiente

### Requirement: Identidad visual de Tuya CA
El sitio SHALL aplicar la identidad visual de marca de Tuya CA (colores, tipografía y logotipo) en su propia interfaz.

#### Scenario: Sitio refleja la marca
- **WHEN** un usuario visita cualquier página del sitio de documentación
- **THEN** los colores y tipografía visibles corresponden a los design tokens de marca de Tuya CA, no a un tema genérico
