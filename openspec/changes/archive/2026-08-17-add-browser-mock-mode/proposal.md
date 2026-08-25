## Why

`add-api-mocking` agregó un servidor de mocks (MSW en modo Node, `setupServer`) que intercepta las llamadas HTTP durante los tests de Vitest, dejando explícitamente fuera de alcance el modo navegador. Hoy no hay forma de recorrer manualmente la app en `pnpm dev` sin un backend real levantado — cualquier prueba manual (como las tareas 8.1/8.2, pendientes, de `add-squads-screen`) requiere el backend .NET corriendo. Se necesita poder activar los mismos handlers de mock, pero interceptando a nivel de navegador (Service Worker), para probar manualmente sin depender del backend.

## What Changes

- Se agrega el modo navegador de MSW (`setupWorker`, vía Service Worker) como complemento del modo Node ya existente, **reutilizando los mismos handlers** de `frontend/src/mocks/handlers/`.
- Se genera el archivo de Service Worker (`public/mockServiceWorker.js`, vía `npx msw init`).
- El arranque del worker es **condicional y explícito**: solo se activa si una variable de entorno (`VITE_USE_MOCKS=true`) está presente, y nunca en modo `production`. Sin esa variable, `pnpm dev` se comporta exactamente igual que hoy (llamando al backend real).
- Se generaliza el matching de los handlers existentes (`auth.handlers.ts`, hoy hardcodeados contra `http://localhost:3000/`, el origen que usa jsdom en los tests) para que matcheen por **path relativo**, de forma que el mismo handler funcione tanto en Node (tests, origen `http://localhost:3000`) como en el navegador (dev, origen `http://localhost:5173` u otro).
- Se documenta cómo activar el modo mock en desarrollo (variable de entorno, script npm o ambos).

**Fuera de alcance de este change:**
- Cualquier framework de E2E con navegador real (Playwright/Cypress) — sigue fuera de alcance, igual que en `add-api-mocking`.
- Activar mocks en build de producción — explícitamente prohibido por diseño.
- Mocks para features que no existen todavía (p. ej. squads) — se agregan cuando esa feature se implemente, siguiendo el mismo patrón ya documentado en `frontend/src/mocks/README.md`.

## Capabilities

### New Capabilities
- `api-mocking`: `add-api-mocking` (completo, aún no archivado) introdujo esta capability pero su spec todavía no existe en `openspec/specs/` — solo vive como delta dentro de ese change. Este change agrega sus propios requisitos (modo navegador) como otro delta de la misma capability; al archivar ambos, se combinan en la misma spec principal.

### Modified Capabilities
(ninguna — no hay spec principal de `api-mocking` todavía contra la cual generar un delta de modificación)

## Impact

- **Frontend**: nuevo `frontend/src/mocks/browser.ts` (`setupWorker`), nuevo `frontend/public/mockServiceWorker.js` (generado), cambio condicional en `frontend/src/main.tsx` (arranca el worker antes de renderizar si `VITE_USE_MOCKS=true`), cambio en `frontend/src/mocks/handlers/auth.handlers.ts` (matching por path relativo en vez de origen hardcodeado), posible nueva entrada en `.env.development` o script npm dedicado.
- **Backend**: ningún cambio.
- **Sin cambios de contrato de API.**
