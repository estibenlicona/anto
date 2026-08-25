## REMOVED Requirements

### Requirement: Componentes distribuidos como código fuente
**Reason**: Reemplazado por la distribución como paquete npm compilado y versionado (`@tuya-ui/components`), que resuelve el problema de gobierno de componentes divergentes entre consumidores. Ver el nuevo requisito "Componentes distribuidos como paquete publicado" en esta misma capability.
**Migration**: Instalar `@tuya-ui/components` en vez de copiar el código fuente del componente al repositorio. El código fuente sigue siendo consultable en el sitio de documentación con fines de referencia.

## ADDED Requirements

### Requirement: Componentes distribuidos como paquete publicado
El sistema SHALL distribuir el catálogo completo de componentes como parte de `@tuya-ui/components`, un paquete npm compilado y versionado que el proyecto consumidor instala como dependencia de runtime. Un componente SHALL poder declarar dependencias de runtime de terceros más allá de React, siempre que se distribuyan como paquetes de npm que el consumidor instala, y no como código que el paquete genera u oculta.

#### Scenario: Instalar el paquete trae el componente listo para usar
- **WHEN** un consumidor instala `@tuya-ui/components` e importa el componente Card
- **THEN** obtiene el componente compilado y tipado, sin que su código fuente se copie ni se agregue como archivo al repositorio del consumidor

#### Scenario: Actualizar el paquete actualiza el componente
- **WHEN** se publica una corrección de un componente y el consumidor actualiza la versión instalada de `@tuya-ui/components`
- **THEN** el componente actualizado se refleja en la aplicación del consumidor sin que el consumidor tenga que editar ningún archivo propio

#### Scenario: Un componente con dependencia de terceros
- **WHEN** `@tuya-ui/components` incluye un componente cuyo código importa una librería headless de terceros
- **THEN** esa librería se declara como dependencia del paquete y se instala automáticamente junto con `@tuya-ui/components`, sin que el consumidor deba instalarla ni conocerla por separado

#### Scenario: El código sigue siendo consultable como referencia
- **WHEN** un consumidor quiere entender cómo está implementado un componente
- **THEN** puede consultar su código fuente en el sitio de documentación, aunque ese código ya no se copie a su propio repositorio
