## ADDED Requirements

### Requirement: Selector de tema claro/oscuro
El sitio SHALL ofrecer un control explícito para alternar entre tema claro y tema oscuro, además de aplicar por defecto la preferencia de tema del sistema operativo del usuario cuando no haya una elección previa. La elección del usuario SHALL persistir entre visitas.

#### Scenario: Alternar tema manualmente
- **WHEN** un usuario hace clic en el control de tema del header
- **THEN** toda la interfaz del sitio (colores, superficies, texto) cambia al tema opuesto usando los tokens de modo claro/oscuro de Tuya UI

#### Scenario: Persistencia de la elección de tema
- **WHEN** un usuario elige un tema y luego recarga el sitio o vuelve en una visita posterior
- **THEN** el sitio se muestra en el tema elegido anteriormente, sin volver a la preferencia del sistema

#### Scenario: Sin elección previa
- **WHEN** un usuario visita el sitio por primera vez sin haber elegido un tema
- **THEN** el sitio se muestra según la preferencia de tema del sistema operativo del usuario

### Requirement: Navegación de dos niveles
El sitio SHALL presentar una navegación compuesta por un header superior (identidad del sitio y control de tema) y un sidebar lateral persistente que liste las secciones de contenido (componentes agrupados por categoría, y la sección de tokens).

#### Scenario: Navegar desde el sidebar
- **WHEN** un usuario hace clic en un componente o en "Tokens" dentro del sidebar
- **THEN** el sitio navega a esa página manteniendo el sidebar visible

#### Scenario: Resaltado de la sección activa
- **WHEN** un usuario se encuentra en la página de un componente o en la de tokens
- **THEN** el sidebar indica visualmente cuál es la sección actualmente activa

## MODIFIED Requirements

### Requirement: Código fuente visible y copiable
Cada página de componente SHALL mostrar el código fuente del componente con una presentación estilo editor de código (barra de título con el nombre del archivo, resaltado de sintaxis según el lenguaje, y numeración de línea), usando un tema de resaltado coherente con el tema activo del sitio (claro u oscuro), y SHALL permitir copiarlo al portapapeles.

#### Scenario: Copiar código de un componente
- **WHEN** un usuario hace clic en la acción de copiar código en la página de detalle de un componente
- **THEN** el código fuente completo del componente se copia al portapapeles del usuario

#### Scenario: Resaltado de sintaxis
- **WHEN** un usuario visualiza el código fuente de un componente (TSX)
- **THEN** el código se muestra con resaltado de sintaxis coloreado según su lenguaje, con una apariencia consistente con el tema de Visual Studio Code correspondiente al tema activo del sitio

#### Scenario: Barra de título del archivo
- **WHEN** un usuario visualiza el bloque de código fuente de un componente
- **THEN** el bloque muestra una barra superior con el nombre del archivo (ej. `components/ui/button.tsx`), imitando la barra de pestañas de un editor de código

#### Scenario: El tema del código sigue al tema del sitio
- **WHEN** un usuario cambia el sitio de tema oscuro a tema claro
- **THEN** el visor de código fuente cambia a un tema de resaltado claro con buen contraste, en vez de mantener un tema oscuro fijo

### Requirement: Identidad visual de Tuya CA
El sitio SHALL aplicar la identidad visual de marca de Tuya CA (colores, tipografía y logotipo) en su propia interfaz, SHALL identificarse como "Tuip - Tuya UI Platform" tanto en el título del navegador como en el wordmark del header, y SHALL reflejar el tema claro u oscuro actualmente activo.

#### Scenario: Sitio refleja la marca
- **WHEN** un usuario visita cualquier página del sitio de documentación
- **THEN** los colores y tipografía visibles corresponden a los design tokens de marca de Tuya CA del tema activo, no a un tema genérico

#### Scenario: Título del sitio
- **WHEN** un usuario abre el sitio de documentación en el navegador
- **THEN** la pestaña del navegador muestra el título "Tuip - Tuya UI Platform"

#### Scenario: Wordmark del header
- **WHEN** un usuario visita cualquier página del sitio
- **THEN** el header muestra el nombre "Tuip - Tuya UI Platform" (o su forma abreviada visualmente equivalente) junto al logotipo
