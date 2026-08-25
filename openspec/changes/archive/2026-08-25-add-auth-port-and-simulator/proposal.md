## Why

Esta aplicación va a vivir como microfrontend dentro de un host que es dueño de la autenticación con Entra ID. Eso deja dos huecos que hoy bloquean el desarrollo:

1. **No hay forma de tener una sesión al desarrollar en standalone.** Sin host no hay identidad, así que no se puede ejercitar nada que dependa de quién es el usuario. Por eso las cinco pantallas de negocio construidas hasta ahora se declararon explícitamente accesibles sin sesión — no fue una decisión de producto, fue lo único posible.
2. **No hay contrato de qué necesita esta aplicación del host.** El módulo de autenticación que trajo la plantilla es un login de usuario y contraseña que apunta a URLs vacías (`httpClient.post("")`); no describe lo que un microfrontend necesita recibir.

Este change cierra los dos: define el contrato en términos de lo que esta aplicación necesita, y provee una implementación simulada que permite desarrollar y probar autorización sin host y sin usuarios reales de Entra.

## What Changes

- **Definir un puerto de autenticación propio de la aplicación**: quién es el usuario, si hay sesión, sus roles, claims y scopes, y cómo obtener el token para llamar al backend. El puerto se diseña según lo que consumen las pantallas, **no con la forma de MSAL ni la del host** — así, el día que el host cambie de mecanismo, se reescribe un adaptador y el código de negocio no se entera.
- **Dos implementaciones del puerto, elegidas en el composition root** (`App.tsx`): un adaptador que traduce la sesión que entrega el host, y un simulador. La aplicación consume siempre el puerto, nunca un adaptador concreto.
- **El adaptador del host queda como interfaz documentada, sin implementar.** El contrato de handoff todavía no está definido; lo que sí está definido es qué necesita esta aplicación. Se implementa cuando el host lo publique, sin tocar nada más.
- **Simulador con perfiles** (Anonymous, User, Admin, Restricted User) y una UI de desarrollo para elegir perfil, cambiar de usuario, cerrar sesión y forzar un token expirado.
- **Aislamiento del simulador**: vive fuera de la capa de negocio, se activa sólo por variable de entorno de desarrollo, y **se excluye del build de producción** — el mismo patrón que ya usa el repo para el worker de MSW (`VITE_USE_MOCKS`, `pnpm dev:mock`, exclusión en build de producción).
- **Extender `AuthGuard`** para exigir además roles, y **aplicarlo a `/app/admin` y `/app/lead`**, que hoy quedan fuera de todo guard.
- **Handlers de mock para 401 y 403**, que imitan a **APIM**, no al backend. La autenticación es externa al servicio por diseño —APIM valida al llamador antes de que el tráfico llegue a AKS— así que en producción esos códigos los devuelve la puerta de enlace. En desarrollo no hay APIM delante, de modo que los mocks ocupan ese lugar.
- **No se instala MSAL.** El host es dueño de la sesión; un microfrontend con su propio `PublicClientApplication` competiría con el del host por el cache de tokens. Por eso tampoco se usa `loadExternalTokens()`: esa API pertenece a `@azure/msal-browser`, que no está ni debe estar en este proyecto.

## Capabilities

### New Capabilities
- `auth-session`: el puerto de autenticación que consume la aplicación, sus dos implementaciones (host y simulador), la protección de rutas por sesión y por rol, y las reglas de aislamiento del simulador respecto del build de producción.

### Modified Capabilities
- `admin-shell`: reemplaza "Acceso sin autenticación al esqueleto de Admin" por acceso sujeto a sesión y rol.
- `chapter-lead-shell`: reemplaza "Acceso sin autenticación al shell de Chapter Lead" por lo mismo.
- `people`: reemplaza "Acceso sin autenticación a la pantalla de Personas".
- `squads`: reemplaza "Acceso sin autenticación a la pantalla de Células".
- `allocations`: reemplaza "Acceso sin autenticación a la pantalla de Capacidades".
- `api-mocking`: suma la capacidad de responder 401 y 403 para ejercitar el manejo de esos casos.

## Impact

- `frontend/src/features/auth-session/` (nuevo): el puerto, el adaptador del host y los tipos de perfil.
- `frontend/src/dev/auth-simulator/` (nuevo): el simulador y su UI, aislados del árbol de features.
- `frontend/src/app/App.tsx`: elige la implementación según la variable de entorno.
- `frontend/src/app/providers/AuthProvider.tsx` y `AuthContext.tsx`: pasan a exponer el puerto nuevo; hoy exponen `login(user, token)`, que asume que esta aplicación hace el login — cosa que como microfrontend no hará.
- `frontend/src/app/router/guards/AuthGuard.tsx` y `routes.tsx`: guard con roles, aplicado a los grupos `/app/admin` y `/app/lead`.
- `frontend/src/features/authentication/`: el login de la plantilla queda obsoleto — ver design.md, que decide qué hacer con él.
- `frontend/src/mocks/handlers/`: handlers de 401/403 y de token expirado.
- `frontend/vite.config.ts`: exclusión del simulador en el build de producción.
- Sin cambios en el backend.
