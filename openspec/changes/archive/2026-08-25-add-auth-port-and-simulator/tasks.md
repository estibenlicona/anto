## 1. Puerto de sesión

- [x] 1.1 Crear `frontend/src/features/auth-session/` con el tipo de la sesión (identidad, roles, claims, scopes, token) y los nombres de rol del dominio. Los roles se nombran por dominio, no con identificadores de Entra (ver design.md).
- [x] 1.2 Reescribir `AuthContext` para exponer el puerto: sesión, `isLoading`, y los predicados que consumen las pantallas (`isAuthenticated`, tiene rol, tiene scope). Quitar `login(user, token)`, que asume que esta aplicación hace el login.
- [x] 1.3 Actualizar `useAuth` y `useAuthContext` a la forma nueva, y adaptar los consumidores existentes que se rompan.
- [x] 1.4 Tests del puerto: predicados de rol y scope, y estado sin sesión.

## 2. Adaptador del host

- [x] 2.1 Escribir la interfaz de lo que esta aplicación espera recibir del host: un contrato mínimo de suscripción (sesión actual + notificación de cambio). Documentar que el transporte todavía no está definido y que **no se comparte el store del host** (ver design.md - Riesgos).
- [x] 2.2 Implementar el proveedor que traduce esa entrada al puerto, mapeando los claims de Entra a los nombres de rol del dominio, e incluyendo el caso "el host no entregó sesión" (que es sesión anónima, no error). Sin transporte definido todavía, la implementación queda mínima y marcada como pendiente de la integración real.
- [x] 2.3 Adjuntar el token de la sesión a las llamadas salientes en `httpClient`, para que la puerta de enlace pueda validarlo. Sin sesión, la llamada sale sin token — no se inventa uno ni se bloquea la llamada desde el cliente.

## 3. Simulador

- [x] 3.1 Crear `frontend/src/dev/auth-simulator/` con los 4 perfiles (Anonymous, User, Admin, Restricted User). Cada perfil se define **con forma de claims de Entra**, no como un objeto de usuario inventado: es lo que el adaptador real va a leer, y un simulador que entregue los roles por otra vía ejercitaría un camino que en producción no existe (ver design.md - Decisions).
- [x] 3.2 Implementar el proveedor simulado del puerto: elegir perfil, cambiar de usuario, cerrar sesión, y alternar el token entre válido y expirado.
- [x] 3.3 Persistir el perfil activo para que sobreviva a la recarga, con un perfil por defecto que tenga sesión y permisos amplios (ver design.md - Riesgos).
- [x] 3.4 Tests del proveedor simulado: cada perfil produce la sesión esperada, el cambio de perfil se refleja, y cerrar sesión deja el estado anónimo.

## 4. UI de desarrollo

- [x] 4.1 Construir el panel para elegir perfil, cambiar de usuario, cerrar sesión y alternar la validez del token, con tratamiento visual que lo distinga del producto.
- [x] 4.2 Montarlo únicamente cuando el simulador está activo, desde el composition root y nunca desde una pantalla de negocio.

## 5. Composition root y aislamiento

- [x] 5.1 En `App.tsx`, elegir el proveedor según la variable de entorno de build. La condición vive sólo acá: ningún componente de negocio la consulta.
- [x] 5.2 Agregar el script de desarrollo con el simulador habilitado, siguiendo el patrón de `dev:mock`.
- [x] 5.3 Excluir `src/dev/` del build de producción en `vite.config.ts`, igual que se excluye el worker de MSW.
- [x] 5.4 Verificar sobre el artefacto de producción que el simulador no está. **Verificado en el peor caso**: se construyó con `VITE_AUTH_SIMULATOR=true` deliberadamente y aun así ni los nombres de los perfiles ("Ana Administradora", "Rita Restringida"), ni el rótulo del panel, ni `auth-simulator`, ni `Plataforma.ChapterLead` aparecen en ningún archivo de `dist/`. Tampoco se emite un chunk para él.
- [x] 5.5 Verificar que no se puede activar desde el navegador en producción. **Se cumple estructuralmente**: el código no está en el artefacto (ver 5.4), así que no hay nada que un parámetro de URL, `localStorage` o una variable global puedan encender. El literal forzado en `vite.config.ts` deja la rama muerta y Rollup elimina el `import()`.

## 6. Rutas y navegación

- [x] 6.1 Extender `AuthGuard` para exigir roles, distinguiendo "sin sesión" (va a iniciar sesión) de "sin permisos" (avisa, no redirige).
- [x] 6.2 Crear la pantalla de permisos insuficientes a la que caen los usuarios con sesión pero sin rol.
- [x] 6.3 Aplicar el guard a los grupos `/app/admin` y `/app/lead` en `routes.tsx`, con los roles que cada uno exige, y quitar los comentarios que explican por qué no lo tenían.
- [x] 6.4 Filtrar las entradas de navegación de ambos shells según los roles de la sesión.
- [x] 6.5 Actualizar `routes.test.tsx`, que hoy afirma que `/app/admin` y `/app/lead` se renderizan **sin** pasar por `AuthGuard` — esas aserciones pasan a ser lo contrario de lo que se quiere.

## 7. Mocks de 401 y 403

- [x] 7.1 Permitir que los handlers respondan 401 y 403 a demanda, sin alterar su comportamiento por defecto.
- [x] 7.2 Conectar el token expirado del simulador con la respuesta 401 de los mocks, de modo que marcar el token como vencido produzca el 401 sin que la aplicación sepa que hubo un simulador de por medio.
- [x] 7.3 Tests de los handlers en ambos modos.

## 8. Verificación

- [x] 8.1 Ejecutar `npm run lint` y `npx vitest run` en `frontend/`, confirmando que no hay regresiones nuevas frente al baseline conocido (2 fallos preexistentes: `App.test.tsx` por un import faltante y `httpClient.test.ts` por la variable de entorno).
- [x] 8.2 Recorrido manual con el simulador: entrar como Admin sin tocar Entra, cambiar a User, comprobar que el menú y las rutas cambian, entrar a una ruta sin el rol y ver el aviso de permisos, cerrar sesión y comprobar la redirección. Verificado: se entra como Admin con el perfil por defecto y sobrevive a la recarga; al pasar a Chapter Lead el menú cambia y la ruta de Admin lleva al aviso de permisos, que nombra la sesión; sin sesión, una ruta protegida redirige a /auth/login.
- [x] 8.3 Recorrido manual de los casos de error: token expirado produce 401, y un recurso sin permisos produce 403. Verificado: con el token marcado como vencido, `/squads` responde 401 y la pantalla lo muestra con Reintentar; forzando la puerta de enlace a 403, responde 403 con su cuerpo `forbidden` y la pantalla también lo muestra.
- [x] 8.4 Levantar un build de producción y comprobar en el navegador que el simulador no existe ni puede activarse. Verificado sobre `vite build --mode production`: el bundle no contiene el simulador ni MSW, y con `dev:auth-simulator` escrito a mano en localStorage no aparece panel, no hay sesión y el módulo del simulador ni siquiera se puede importar.
