## Context

Lo que se encontró al analizar el proyecto, porque contradice la premisa con la que se pidió este change:

- **No hay MSAL.** Ninguna dependencia `@azure/msal-*` en `frontend/package.json`, ninguna referencia en el código. Nadie lo sacó: la plantilla nunca lo trajo.
- **El backend no autentica, y es deliberado.** `backend/ARCHITECTURE.md` tiene una sección "Authentication Boundary" que lo declara: *"Authentication and authorization are intentionally external to this template... Use an API Gateway, APIM, ingress, platform identity layer... to authenticate callers before traffic reaches the service."* Ni siquiera acepta `Authorization` en los CORS por defecto. Así que la ausencia de `UseAuthentication` o de `[Authorize]` no es un hueco: **APIM valida al llamador antes de que el tráfico llegue al servicio**. Su `Azure.Identity` es para llamadas salientes (`ManagedIdentityCredential`) y para leer Azure App Configuration, no para validar usuarios.
- **La especificación del proyecto ya define la arquitectura de identidad**: OAuth 2.0 con identidades federadas y Entra ID, expuesto vía APIM ante AKS, con la implementación concreta declarada pendiente.
- **La pregunta de dónde salen los roles estaba registrada como decisión abierta del proyecto** (A-03, impacto alto: *"¿Los roles vienen como claims resueltos desde APIM/Entra ID, o hay una tabla de roles/permisos local?"*). **El usuario la resolvió durante la elaboración de este change: los claims, permisos y autorizaciones se manejan todos con Entra ID.** No hay tabla de roles local.
- **`EntraObjectId` en `PersonDto` es un campo de datos**, no una integración: guarda quién es esa persona en Entra. El formulario de Personas ni lo captura.
- **El módulo de login de la plantilla es un cascarón.** `features/authentication/` tiene contenedor, formulario, adapter, hooks, modelo, servicio y tests — pero `authService` hace `httpClient.post("")` contra URLs vacías. `UserEntity` tiene un solo campo `role: "admin" | "user"`, sin claims ni scopes.
- **`@reduxjs/toolkit` y `react-redux` están instalados y no se usan**: no hay `configureStore`, ni `createSlice`, ni `<Provider>` en ninguna parte. Otra dependencia muerta de la plantilla.
- **El seam de autenticación ya existe**: `AuthContext` + `AuthProvider` en `app/providers/`, consumido por `useAuth()`, usado por `AuthGuard`. Es el punto natural donde enchufar el puerto.
- **`App.tsx` es el composition root** y declara en su propio comentario que "NO está configurada como microfrontend remoto" — es decir, el estado actual es transitorio y conocido.

El dato que reordena todo lo llegó el usuario: **esta aplicación será un microfrontend y el host será dueño de la autenticación**. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Que las pantallas puedan depender de quién es el usuario, hoy, sin host y sin usuarios reales.
- Que el contrato entre esta aplicación y el host quede escrito desde el lado de esta aplicación, antes de que el host lo defina.
- Que el simulador no pueda llegar a producción ni activarse desde el navegador.

**Non-Goals:**
- **No se instala MSAL, y por lo tanto no se usa `loadExternalTokens()`.** Ver Decisions: es la petición explícita que este change no cumple, y el motivo.
- No se implementa el adaptador del host: su contrato de handoff todavía no existe. Se deja la interfaz escrita y sin implementación.
- No se agrega autenticación al backend. Los 401 y 403 salen de los mocks; hacerlos reales es otro change, en otro proyecto.
- No se construye una pantalla de administración de usuarios ni de roles: los roles llegan con la sesión, no se editan acá.

## Decisions

- **El puerto se diseña con la forma que necesita esta aplicación, no con la de MSAL ni con la del host.** Alternativa considerada: exponer directamente las APIs de MSAL, que es lo que pedía el criterio de aceptación original ("los roles disponibles mediante las APIs normales de MSAL"). Se descarta porque ata cada pantalla a que el host sea siempre MSAL; el día que el host cambie de mecanismo habría que tocar todo el código de negocio en vez de un adaptador. El costo de la decisión es que el criterio original no se cumple tal como estaba escrito — se cumple su intención: los roles están disponibles por la vía normal de la aplicación.

- **No se instala `@azure/msal-browser` ni siquiera para el simulador.** `loadExternalTokens()` vive en ese paquete, así que usarlo obliga a instalarlo. Dos razones para no hacerlo: un microfrontend con su propio `PublicClientApplication` compite con el del host por el cache de tokens y por la sesión, que es precisamente el problema que trae alojar dos instancias de MSAL en la misma página; y traerlo sólo para el simulador metería una dependencia pesada en el proyecto para alimentar una herramienta de desarrollo. Si más adelante el host resulta compartir su instancia de MSAL, la idea original se vuelve viable y se implementa entonces como un adaptador más — el puerto no cambia.

- **La sesión es reactiva, no un valor leído una vez.** El usuario indicó que el host maneja su estado con zustand o redux, lo que implica que la sesión puede cambiar mientras esta aplicación está montada: el host cierra sesión, renueva el token, o cambia de usuario. Por eso el puerto se expone como contexto de React con estado, y no como una función que devuelve la sesión actual. El `AuthProvider` existente ya funciona así, así que la forma no es nueva.

- **La selección de implementación se hace por variable de entorno de build, no por configuración en tiempo de ejecución.** Es lo que hace verificable que el simulador no pueda activarse desde el navegador: si la decisión se tomara leyendo `localStorage` o un parámetro de URL, cualquiera podría activarlo en producción. El repo ya tiene este patrón resuelto para el worker de MSW en `add-browser-mock-mode` (`VITE_USE_MOCKS`, script `dev:mock`, exclusión del build), y este change lo sigue en vez de inventar otro.

- **El simulador vive en `src/dev/`, fuera de `src/features/`.** No es una feature del producto y no debe leerse como tal. La separación por carpeta es además lo que hace evidente en revisión de código si alguien importa el simulador desde negocio: el import cruza de `dev/` a `features/`, que es visible de un vistazo.

- **El módulo de login de la plantilla se deja donde está, sin borrarlo.** Alternativa considerada: eliminar `features/authentication/` completo, ya que como microfrontend esta aplicación no hará login. Se descarta para este change porque `AuthGuard` redirige a `/auth/login` y esa pantalla tiene que existir para que la redirección lleve a algún lado; además borrarlo arrastraría sus tests y su ruta, ampliando el alcance sin necesidad. Queda anotado como deuda: cuando el host defina cómo se inicia sesión, ese módulo probablemente sobra.

- **Los roles se nombran en términos del dominio (administrador, Chapter Lead), no con los identificadores de Entra.** El mapeo entre lo que entrega el host y esos nombres pertenece al adaptador del host. Si las pantallas compararan contra el identificador crudo de un grupo de Entra, un cambio de nomenclatura en el directorio rompería el código de negocio.

- **Los roles llegan como claims del token, no de una llamada al backend.** Con A-03 resuelta a favor de Entra ID, la autorización de negocio se resuelve con lo que ya viaja en el token: no hay tabla local de roles ni endpoint de permisos que consultar. Consecuencia para el simulador: sus perfiles deben tener **forma de claims**, no de un objeto de usuario inventado, porque eso es lo que el adaptador real va a leer. Un simulador que entregue roles por otra vía ejercitaría un camino que en producción no existe.

- **El token se adjunta a las llamadas al backend para que APIM lo valide, y de APIM vienen el 401 y el 403.** No del backend, que por diseño no mira la cabecera `Authorization` —de hecho su CORS por defecto ni la admite—. Esto cambia qué imitan los mocks: no simulan un backend que valida, simulan **la puerta de enlace que hay delante**. En desarrollo no hay APIM, así que ese lugar queda vacío y lo ocupan los handlers.

## Risks / Trade-offs

- [**El adaptador del host se escribe a ciegas**: cómo el host entrega la sesión al microfrontend sigue sin definirse, aunque ya se sepa que el contenido son claims de Entra] → Mitigado en parte por diseñar el puerto desde las necesidades de esta aplicación y no adivinando la forma del host: lo que se escribe ahora es "qué necesito", que no cambia aunque cambie el "cómo me lo das". Lo que A-03 sí fija es el *contenido* (claims de Entra), que es la mitad que más influye en el puerto; lo que queda abierto es el *transporte*. El riesgo remanente cae sobre un solo archivo, que es exactamente donde se lo quiere.

- [**El transporte de la sesión sigue sin decidirse.** Se sabe que el host maneja estado con zustand o redux, y que `@module-federation/vite` está instalado en este proyecto aunque todavía sin configurar — pero nada de eso fija el mecanismo] → El adaptador se escribe contra un contrato mínimo de suscripción (obtener la sesión actual, y notificar cuando cambia), que es lo que cualquiera de esos mecanismos puede satisfacer. **No se comparte el store del host**: hacerlo acoplaría los dos lados en la forma del estado, la librería, su versión, los middlewares y la serialización, y le daría a este microfrontend acceso a estado del host que no le incumbe.
- [**Proteger cinco pantallas que hoy están abiertas puede frenar a quien esté trabajando en ellas**: a partir de este change no se entra sin elegir un perfil en el simulador] → Es el costo de tener autorización de verdad. Se mitiga haciendo que el perfil elegido sobreviva a la recarga, para que sea una elección por sesión de trabajo y no por refresco de página.
- [**401 y 403 quedan simulados, no reales.** El backend responde 200 a todo, así que lo que se ejercita es la reacción de la aplicación, no la validación del servidor] → Aceptado y declarado en el spec de `api-mocking`. Vale la pena tenerlo presente al leer el criterio de aceptación original: "probar 401 y 403 contra el backend" se cumple contra los mocks, no contra la WebApi.
- [**Cinco capacidades pierden su requisito de acceso abierto a la vez.** Si el simulador tuviera un defecto, las cinco pantallas quedan inaccesibles en desarrollo] → Por eso el perfil por defecto del simulador debe ser uno con sesión y permisos amplios: el caso normal de desarrollo es "quiero ver la pantalla", no "quiero probar el guard".
- [**El simulador puede divergir del host** y dar una falsa sensación de cobertura: que algo funcione con perfiles simulados no prueba que funcione con la sesión real] → No hay mitigación dentro de este change, porque no hay host contra el cual contrastar. Queda como límite conocido: la primera integración real con el host es una verificación pendiente, no un trámite.
