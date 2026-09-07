## Purpose

Define lo que el emulador de identidad local (un reemplazo MSAL-compatible de Entra ID para desarrollo) debe ofrecer a la plataforma para que el host inicie sesión y reciba roles exactamente como lo hará contra Entra ID en producción, y cómo se reproduce el directorio de prueba de la plataforma sobre él.

## ADDED Requirements

### Requirement: App roles asignables a usuarios
El emulador SHALL permitir declarar en una app registration app roles cuyos tipos de miembro admitidos incluyan `User`, además del tipo `Application` existente, a través de su API de administración. Un app role SHALL conservar su valor, nombre visible, tipos de miembro y estado habilitado/deshabilitado; el valor SHALL ser único dentro de la app.

#### Scenario: Declarar un rol de usuario
- **WHEN** se crea en una app un app role con valor `Plataforma.Admin` y tipos de miembro `["User"]`
- **THEN** el rol queda registrado con ese valor y tipo, y aparece al listar los roles de la app

#### Scenario: Valor repetido
- **WHEN** se intenta crear en la misma app un segundo rol con un valor ya existente
- **THEN** el emulador rechaza la operación indicando el conflicto y el rol original queda intacto

### Requirement: Asignación de app roles a usuarios y grupos
El emulador SHALL permitir asignar un app role de una app a un usuario o a un grupo del directorio, listar las asignaciones de la app y retirarlas, a través de su API de administración y del portal. Una asignación a un usuario o a un grupo SHALL exigir que el rol admita el tipo `User`; el principal SHALL existir en el directorio; la misma combinación de rol y principal NO SHALL asignarse dos veces.

#### Scenario: Asignar un rol a una persona
- **WHEN** se asigna el rol `Plataforma.ChapterLead` de la app del host a una usuaria existente
- **THEN** la asignación aparece al listar las asignaciones de la app con el rol, el tipo de principal y su nombre

#### Scenario: Asignar un rol a un grupo
- **WHEN** se asigna un rol de tipo `User` a un grupo
- **THEN** la asignación se registra para el grupo y aplica a todos sus miembros al emitir tokens

#### Scenario: Rol que no admite usuarios
- **WHEN** se intenta asignar a una persona un rol cuyos tipos de miembro sólo incluyen `Application`
- **THEN** el emulador rechaza la operación explicando que el rol no admite principales de tipo usuario

#### Scenario: Asignación duplicada
- **WHEN** se intenta asignar a la misma persona un rol que ya tiene asignado
- **THEN** el emulador rechaza la operación indicando el conflicto y sigue existiendo una única asignación

#### Scenario: Retirar una asignación
- **WHEN** se elimina una asignación existente
- **THEN** deja de aparecer en el listado y los tokens emitidos después ya no incluyen ese rol por esa vía

### Requirement: Claim `roles` en los tokens de usuario
Al emitir tokens en flujos de usuario (código de autorización y renovación), el emulador SHALL incluir el claim `roles` con los valores de los app roles habilitados asignados a la persona, ya sea directamente o a través de sus grupos, sin duplicados: en el ID token los roles de la app cliente, y en el access token delegado los roles de la app recurso a la que va dirigido. Cuando la persona no tiene ningún rol para esa app, el claim SHALL omitirse. Los tokens de aplicación (client credentials) SHALL seguir comportándose como hasta ahora. La vista previa de token del portal SHALL reflejar el mismo claim que se emitiría.

#### Scenario: Roles directos en el ID token
- **WHEN** una persona con el rol `Plataforma.Admin` asignado directamente inicia sesión en la app del host
- **THEN** el ID token contiene `roles: ["Plataforma.Admin"]`

#### Scenario: Roles heredados por grupo, sin duplicados
- **WHEN** una persona tiene el rol `Plataforma.TechLead` asignado directamente y también por un grupo al que pertenece
- **THEN** el ID token contiene `Plataforma.TechLead` una sola vez

#### Scenario: Rol deshabilitado
- **WHEN** un rol asignado a la persona está deshabilitado en la app
- **THEN** ese valor no aparece en `roles`

#### Scenario: Sin roles
- **WHEN** una persona sin asignaciones inicia sesión
- **THEN** el ID token no lleva el claim `roles` y el resto de sus claims no cambia

#### Scenario: Token de aplicación intacto
- **WHEN** una aplicación obtiene un token con client credentials
- **THEN** su claim `roles` sigue saliendo de los roles de tipo `Application` del recurso, como antes

### Requirement: Directorio de prueba de la plataforma reproducible
La plataforma SHALL contar con una herramienta que, contra la API de administración del emulador, cree o reutilice la app registration del host (cliente público con su URI de retorno local), sus app roles de negocio (`Plataforma.Admin`, `Plataforma.ChapterLead`, `Plataforma.TechLead`), y personas de prueba con sus asignaciones: una administradora, una líder de expertise, una líder técnica y una persona sin rol. La herramienta SHALL ser idempotente — ejecutarla de nuevo no duplica nada — y SHALL imprimir los valores de configuración que el host necesita, sin escribir archivos versionados.

#### Scenario: Primera ejecución
- **WHEN** se ejecuta la herramienta contra un emulador recién sembrado
- **THEN** existen la app del host, sus tres roles, las cuatro personas y sus asignaciones, y la salida muestra el identificador de la app, el inquilino y la autoridad a configurar

#### Scenario: Segunda ejecución
- **WHEN** se vuelve a ejecutar la herramienta sin cambios
- **THEN** termina sin error y el número de apps, roles, personas y asignaciones es el mismo que antes

#### Scenario: Emulador apagado
- **WHEN** el emulador no responde en la URL configurada
- **THEN** la herramienta termina con un error que nombra la URL y cómo levantar el emulador
