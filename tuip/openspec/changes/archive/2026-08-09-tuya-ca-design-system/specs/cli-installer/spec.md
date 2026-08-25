## Purpose

Provee `tuya-ui`, un CLI instalable globalmente vía npm que permite a cualquier aplicación React inicializar los design tokens de Tuya CA y agregar componentes individuales copiando su código fuente al repositorio del consumidor.

## ADDED Requirements

### Requirement: Instalación global vía npm
El sistema SHALL distribuirse como un paquete npm instalable de forma global (`npm install -g tuya-ui`) o ejecutable puntualmente vía `npx tuya-ui`.

#### Scenario: Instalación global exitosa
- **WHEN** un usuario ejecuta `npm install -g tuya-ui`
- **THEN** el comando `tuya-ui` queda disponible en la terminal del usuario

### Requirement: Inicialización de proyecto consumidor
El CLI SHALL proveer un comando de inicialización que configure Tailwind CSS y los design tokens de Tuya CA en una aplicación React existente.

#### Scenario: Inicialización en app sin configuración previa
- **WHEN** el usuario ejecuta el comando de inicialización dentro de una app React que no tiene Tailwind ni tokens configurados
- **THEN** el CLI agrega la configuración de Tailwind necesaria y el archivo de CSS Variables de tokens al proyecto

#### Scenario: Inicialización en app ya inicializada
- **WHEN** el usuario ejecuta el comando de inicialización en un proyecto donde ya existe configuración de tokens de Tuya CA
- **THEN** el CLI informa que el proyecto ya está inicializado y no sobrescribe archivos sin confirmación explícita

### Requirement: Listado de componentes disponibles
El CLI SHALL proveer un comando para listar los componentes disponibles en el catálogo de Tuya UI.

#### Scenario: Listar componentes
- **WHEN** el usuario ejecuta el comando de listado de componentes
- **THEN** el CLI muestra los nombres de todos los componentes disponibles para instalar

### Requirement: Agregar componentes individualmente
El CLI SHALL permitir agregar uno o más componentes específicos a la vez, copiando su código fuente al repositorio del proyecto consumidor en una ruta configurable.

#### Scenario: Agregar un componente
- **WHEN** el usuario ejecuta el comando para agregar el componente Button
- **THEN** el código fuente de Button se copia al directorio de componentes del proyecto consumidor

#### Scenario: Agregar un componente inexistente
- **WHEN** el usuario intenta agregar un componente que no existe en el catálogo
- **THEN** el CLI informa el error indicando que el componente no fue encontrado y no realiza ningún cambio en el proyecto

### Requirement: Resolución de dependencias entre componentes
El CLI SHALL copiar automáticamente cualquier componente interno del que dependa el componente solicitado.

#### Scenario: Componente con dependencia interna
- **WHEN** el usuario agrega un componente que internamente reutiliza otro componente del catálogo
- **THEN** el CLI copia también el componente del que depende, sin requerir que el usuario lo solicite por separado

### Requirement: Prevención de sobrescritura accidental
El CLI SHALL advertir al usuario antes de sobrescribir un archivo de componente ya existente en el proyecto consumidor.

#### Scenario: Componente ya existe en el proyecto
- **WHEN** el usuario intenta agregar un componente cuyo archivo ya existe en el proyecto
- **THEN** el CLI solicita confirmación antes de sobrescribir el archivo existente
