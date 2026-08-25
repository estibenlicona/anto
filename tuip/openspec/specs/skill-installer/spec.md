# skill-installer Specification

## Purpose

Provee el comando que copia la Skill de Claude del sistema de diseño Tuya UI, ya empaquetada dentro de `@tuya-ui/components`, al directorio `.claude/skills/` del proyecto consumidor, para que Claude Code la detecte sin un paso de configuración manual.

## Requirements

### Requirement: Comando de instalación de la Skill
`@tuya-ui/components` SHALL exponer un comando ejecutable vía `npx` que copie los archivos de la Skill empaquetados en el paquete al directorio `.claude/skills/` del proyecto sobre el que se invoca.

#### Scenario: Instalar la Skill en un proyecto consumidor
- **WHEN** un usuario con `@tuya-ui/components` instalado ejecuta el comando de instalación de la Skill
- **THEN** los archivos de la Skill (`SKILL.md` y sus referencias) quedan copiados en `.claude/skills/` de ese proyecto

#### Scenario: Sin instalar el paquete, el comando no está disponible
- **WHEN** un proyecto no tiene `@tuya-ui/components` instalado
- **THEN** el comando no puede invocarse desde ese proyecto, porque no existe fuente desde la cual copiar la Skill

### Requirement: Prevención de sobrescritura accidental
El comando SHALL advertir antes de sobrescribir una Skill ya instalada en el proyecto consumidor, en vez de reemplazarla en silencio.

#### Scenario: La Skill ya existe en el proyecto
- **WHEN** el proyecto consumidor ya tiene una versión de la Skill instalada y se vuelve a ejecutar el comando
- **THEN** el comando pide confirmación antes de sobrescribir los archivos existentes

### Requirement: Contención de las escrituras dentro del proyecto
El comando SHALL escribir únicamente dentro del proyecto sobre el que se lo invoca. El destino de escritura SHALL resolverse por completo antes de usarse y SHALL verificarse contra la raíz de ese proyecto, sin apoyarse en que la ruta de destino luzca correcta a simple vista.

#### Scenario: Ningún archivo fuera del proyecto
- **WHEN** se ejecuta el comando de instalación de la Skill
- **THEN** todos los archivos copiados quedan dentro de la raíz del proyecto sobre el que se invocó, sin excepción

### Requirement: Sin dependencias adicionales para el consumidor
El comando SHALL funcionar con lo que ya trae la instalación de `@tuya-ui/components`, sin requerir que el proyecto consumidor instale un paquete adicional para poder copiar la Skill.

#### Scenario: Ejecutar el comando sin instalar nada más
- **WHEN** un proyecto que ya instaló `@tuya-ui/components` ejecuta el comando de instalación de la Skill
- **THEN** el comando se ejecuta con éxito sin que el usuario tenga que instalar ningún otro paquete primero
