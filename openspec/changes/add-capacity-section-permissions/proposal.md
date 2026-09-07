## Why

El acceso hoy se decide en un solo nivel: los roles de plataforma (`Plataforma.*`) dicen qué módulos ve la persona, y dentro de Gestión de Capacidad el sidebar muestra todo lo del shell — `filterNavByRole` existe pero no filtra nada. Falta el segundo nivel del modelo: **permisos por sección** (Iniciativas, Células, Personas, Ausencias, Dedicación, Prefacturación, Competencias, Sprints, Parámetros, Habilidades, Líneas, DevOps), que en Entra viven como **app roles de la app registration de la API del módulo** y viajan en el claim `roles` del access token que el módulo pide — sub-claims por persona, no scopes por aplicación. Sin ellos, el menú ofrece pantallas que la autorización real va a negar.

## What Changes

- **Catálogo de permisos de sección**: un app role de usuario por sección del sidebar de Gestión de Capacidad, con prefijo `Capacidad.`: `Iniciativas`, `Celulas`, `Personas`, `Ausencias`, `Dedicacion`, `Prefacturacion`, `Competencias`, `Sprints`, `Parametros`, `Habilidades`, `Lineas`, `DevOps` (12). "Inicio" no exige permiso: la ve quien entra al módulo.
- **Semilla del directorio local** (`pnpm entra:seed` en `host/`): además de la app del host, crea o reutiliza la app registration **"Gestión de Capacidad API"** (con identifier URI y scope delegado) con los 12 sub-roles, y asigna según el doc de roles: Ana todos; Tomás (líder de expertise) las 7 secciones de su shell; Lucía (líder técnica) Iniciativas, Células, Dedicación y Competencias; Rita ninguno. Imprime también el scope para pedir el token de esa API.
- **`frontend/` (standalone) filtra por permisos**: la sesión expone `permissions` derivadas del claim `roles` del token de la API del módulo — en el simulador propio del front, cada perfil declara sus sub-roles; cuando el front sea módulo del host, saldrán del token real vía `acquireToken`. Cada entrada de los sidebars de Admin y de Líder de Expertise declara su permiso; el menú muestra sólo lo permitido y los grupos vacíos desaparecen; las rutas de sección exigen además el permiso (guard), distinguiendo "sin permiso" de "sin sesión".
- Perfil simulado nuevo o ajustado en el front para ver el filtrado (un líder con permisos parciales).
- El host (`host/`) no cambia: qué módulos se ven sigue siendo cosa de `Plataforma.*`; los sub-claims son del módulo.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `dev-identity-emulator`: el directorio de prueba reproducible incorpora la app registration de la API de Gestión de Capacidad, sus 12 sub-roles de sección y las asignaciones por persona.
- `auth-session`: la sesión expone permisos de sección del módulo derivados de sub-claims; la navegación y las rutas pueden exigir permiso además de rol.
- `admin-shell`: cada entrada del sidebar de Admin declara su permiso de sección y el menú muestra sólo lo permitido.
- `chapter-lead-shell`: ídem para el sidebar del Líder de Expertise.

## Impact

- **`host/scripts/entra-local-seed.mjs`**: app de la API de GC, sub-roles, asignaciones, salida con el scope. Re-ejecutable sobre el directorio ya sembrado.
- **`frontend/src`**: `features/auth-session` (tipos `CapacityPermission`, derivación de permisos, filtro de navegación por permiso), `features/{admin-shell,chapter-lead-shell}/navigation.ts` (permiso por entrada), layouts que pasan el predicado, guards de ruta de sección, perfiles del simulador propio (`dev/auth-simulator`). Sin dependencias nuevas; sin `pnpm install` en `frontend/` (su tarball de tuip 0.1.14 ya no existe en `.local-packages`; instalar de cero fallaría — restricción conocida hasta el change de conversión).
- **`entra-local`**: sin cambios de código (los app roles de usuario ya existen); sólo datos nuevos vía la semilla.
- **`host/`**: sin cambios de código.
