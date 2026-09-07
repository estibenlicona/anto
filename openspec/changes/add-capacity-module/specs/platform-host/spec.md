## MODIFIED Requirements

### Requirement: Selector y portal de módulos según rol
El host SHALL mantener un registro de módulos — identificador, nombre, descripción, color, ruta base, roles admitidos y, opcionalmente, la ubicación de su remote federado — y SHALL ofrecer sólo los módulos cuyos roles la persona tiene, tanto en el selector de la barra como en el portal de la raíz. Un módulo sin roles declarados SHALL estar disponible para cualquier persona con sesión. Entrar a un módulo SHALL navegar a su ruta base sin recargar la aplicación, y el selector SHALL señalar cuál módulo es el actual mientras la persona está dentro de él.

Cuando el módulo declara un remote, el host SHALL cargarlo bajo su ruta base y entregarle el contrato de montaje — fuente de sesión con referencia estable y suscripción, obtención de tokens por scopes, ruta base y alto de la barra — mostrando un estado de carga mientras llega y, si la carga falla, un aviso de error bajo la barra que permita reintentar, sin romper la barra ni el resto del host.

#### Scenario: El portal muestra los módulos permitidos
- **WHEN** una persona con sesión abre la raíz del host
- **THEN** ve una tarjeta por cada módulo cuyos roles tiene, y ninguna de los que no

#### Scenario: Entrar a un módulo
- **WHEN** la persona activa un módulo desde el portal o desde el selector de la barra
- **THEN** el host navega a la ruta base de ese módulo sin recargar, y el selector lo marca como el módulo actual

#### Scenario: Módulo federado montado
- **WHEN** la persona entra a un módulo cuyo remote está declarado y disponible
- **THEN** el contenido del módulo se muestra bajo la barra del host, recibe el contrato de montaje y la navegación interna del módulo funciona bajo su ruta base

#### Scenario: Remote que no carga
- **WHEN** el remote declarado no puede cargarse
- **THEN** la ruta del módulo muestra, bajo la barra intacta, un aviso de error con la opción de reintentar, y el resto del host sigue funcionando

#### Scenario: Módulo todavía no integrado
- **WHEN** la persona entra a un módulo que no declara remote
- **THEN** la ruta del módulo muestra, bajo la barra, un aviso de que el módulo está pendiente de integrar, con su nombre, en vez de una pantalla vacía o un error

#### Scenario: Sin módulos para ese rol
- **WHEN** la persona tiene sesión pero ningún módulo admite alguno de sus roles
- **THEN** el portal lo dice explícitamente, sin mostrar tarjetas ni fallar
