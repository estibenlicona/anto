## Why

Hoy los tests que ejercitan llamadas HTTP (`authService.test.ts`, `useLogin.integration.test.ts`, etc.) mockean el módulo `httpClient` o directamente los métodos de `authService` con `vi.mock`/`vi.spyOn`. Esto prueba la lógica interna de cada función aislada, pero no ejercita el flujo real de una petición (construcción de la URL, headers, el interceptor que inyecta el token desde `localStorage`, el manejo de errores HTTP tal como los devuelve axios) ni permite escribir un test que recorra un flujo completo de UI → hook → servicio → red → respuesta sin tocar un backend real. A medida que se agreguen más features con llamadas HTTP (como la de `add-squads-screen`, pendiente de reimplementarse), cada una repetiría el mismo patrón frágil de mocks por archivo. Se necesita una capa de mocking a nivel de red, reutilizable entre features, para poder escribir pruebas de punta a punta del front sin depender de que el backend esté levantado.

## What Changes

- Se agrega **MSW (Mock Service Worker)** como dependencia de desarrollo, interceptando las peticiones HTTP a nivel de red (no a nivel de módulo) durante los tests de Vitest.
- Se crea una estructura de **handlers de mock** reutilizable en `frontend/src/mocks/` (o equivalente), con un handler inicial para los endpoints de autenticación (`POST /login`, `POST /logout`, `GET /me` o el path real que exponga `authService`), incluyendo casos de éxito y de error (401, 500).
- Se integra el servidor de mocks (`setupServer` de MSW) en `vitest-setup.ts`, arrancando/reseteando/cerrando el servidor en los hooks de ciclo de vida globales, para que **cualquier test** de la suite pueda usarlo sin configuración adicional por archivo.
- Se documenta el patrón (cómo agregar un handler nuevo, cómo sobreescribir la respuesta de un test puntual con `server.use(...)`) para que se reutilice en la próxima feature con llamadas HTTP (p. ej. cuando se reimplemente `add-squads-screen`).
- **No** se migran los tests unitarios existentes que mockean `httpClient`/`authService` directamente (siguen siendo válidos para probar lógica aislada) — se agrega la capa de red como complemento, no como reemplazo obligatorio.
- **Fuera de alcance de este change**: mocking en modo desarrollo/navegador (MSW browser worker para levantar la app sin backend) y frameworks de E2E con navegador real (Playwright/Cypress) — el pedido, según se aclaró, es habilitar pruebas de Vitest/Testing Library de punta a punta, no un nuevo framework de navegador.

## Capabilities

### New Capabilities
- `api-mocking`: infraestructura de mocking de API a nivel de red (MSW) para los tests del frontend, reutilizable entre features.

### Modified Capabilities
(ninguna — no existen specs previas de testing en este repo)

## Impact

- **Frontend**: nueva carpeta `frontend/src/mocks/` (server MSW + handlers), cambios en `frontend/vitest-setup.ts` (arranque del servidor de mocks) y en `frontend/package.json` (nueva devDependency `msw`). No afecta código de producción ni el bundle de la app.
- **Backend**: ningún cambio.
- **Sin cambios de contrato de API** — los handlers de mock reflejan los contratos ya existentes (`authService`), no los definen.
