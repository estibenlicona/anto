## MODIFIED Requirements

### Requirement: Comando de instalación visible por componente
Cada página de componente SHALL mostrar en su cabecera el comando de instalación de `@tuya-ui/components` junto con el import del componente, presentado como un bloque copiable junto a los metadatos del componente.

#### Scenario: Ver comando de instalación
- **WHEN** un usuario abre la página de detalle de un componente
- **THEN** el sitio muestra en la cabecera el comando de instalación del paquete y la línea de import de ese componente

#### Scenario: Copiar el comando desde la cabecera
- **WHEN** un usuario usa la acción de copiar del bloque de instalación
- **THEN** el comando y el import se copian al portapapeles sin abandonar la página

### Requirement: Entrada al sitio
La ruta raíz del sitio SHALL mostrar una página de inicio que presente el sistema de diseño e indique cómo instalar y empezar a usar `@tuya-ui/components`, con accesos directos a la documentación de los componentes y a los fundamentos del sistema.

#### Scenario: Llegar al sitio por primera vez
- **WHEN** un usuario abre la ruta raíz del sitio de documentación
- **THEN** ve una introducción al sistema de diseño y el comando de instalación de `@tuya-ui/components`, en vez del listado de componentes

#### Scenario: Acceder a los componentes desde el inicio
- **WHEN** un usuario usa el acceso a los componentes desde la página de inicio
- **THEN** llega a la documentación de un componente, con la categoría de ese componente desplegada en el sidebar

## ADDED Requirements

### Requirement: Página de instalación del paquete
El sitio SHALL incluir una página de instalación que documente los requisitos previos del proyecto anfitrión, el comando para instalar `@tuya-ui/components`, cómo incorporar sus estilos al proyecto, y cómo importar y usar el primer componente.

#### Scenario: Instalar el paquete en un proyecto nuevo
- **WHEN** un usuario abre la página de instalación
- **THEN** encuentra los requisitos del proyecto, el comando de instalación del paquete y el resultado esperado de ejecutarlo

#### Scenario: Consultar cómo incorporar los estilos
- **WHEN** un usuario abre la página de instalación
- **THEN** ve el paso necesario para que los estilos de `@tuya-ui/components` se apliquen en su proyecto

## REMOVED Requirements

### Requirement: Página de instalación
**Reason**: Documentaba el comando de inicialización del CLI, su diálogo y el archivo de configuración que generaba, propios del modelo copy-paste. Ver el nuevo requisito "Página de instalación" en esta misma capability, reescrito para `@tuya-ui/components`.
**Migration**: Ninguna acción del consumidor; la página se reemplaza por su nueva versión en el mismo sitio.

### Requirement: Peso del componente
**Reason**: El peso individual del código que "el CLI copiará" no aplica cuando los componentes se instalan como parte de un paquete compilado; el costo relevante es el del paquete completo, no el de cada componente copiado por separado.
**Migration**: Ninguna; si en el futuro se documenta el peso del paquete, se hará como parte de la página de instalación, no por componente.

### Requirement: Página de referencia del CLI
**Reason**: Documentaba los comandos de listar y agregar componentes por copia, retirados junto con el modelo copy-paste (ver capability `cli-installer`).
**Migration**: Los pasos de instalación restantes quedan documentados en la página de instalación.

### Requirement: Página de anatomía de un proyecto
**Reason**: Documentaba dónde quedaba el código copiado por el CLI en el proyecto consumidor y qué archivos podía editar el equipo. Sin código copiado al repositorio del consumidor, no hay árbol de archivos propio que documentar.
**Migration**: Ninguna acción del consumidor.
