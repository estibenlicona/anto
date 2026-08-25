## Context

Ver proposal.md - Why. Hoy `frontend/src/shared/services/httpClient.ts` expone una única instancia de axios (`baseURL` desde `VITE_BASE_URL`, interceptor que inyecta `Authorization: Bearer <token>` desde `localStorage`). El único consumidor real hoy es `authService` (`login`/`logout`/`getCurrentUser`, todos contra el mismo `baseURL` sin path adicional — ver nota en `openspec/changes/add-squads-screen/design.md` sobre este mismo punto). En tests, `VITE_BASE_URL` no está definido (no existe `.env.test`), por lo que `httpClient.defaults.baseURL` es `undefined` durante la suite — un gap preexistente y ajeno a este change (ya lo evidencia el test que falla hoy en `httpClient.test.ts`).

## Goals / Non-Goals

**Goals:**
- Definir dónde vive el servidor de mocks (MSW) y sus handlers, y cómo se integra al ciclo de vida global de Vitest.
- Definir el primer conjunto de handlers (auth) y el formato de sus respuestas, reflejando el contrato real de `authService`.
- Definir cómo un test individual sobreescribe un handler sin filtrar ese cambio a otros tests.

**Non-Goals:**
- No se migra ningún test existente que ya mockea `httpClient`/`authService` por módulo — siguen siendo válidos.
- No se resuelve el gap de `VITE_BASE_URL` indefinido en tests — los handlers de MSW interceptan por path relativo, que funciona igual con o sin `baseURL` definido (axios en jsdom resuelve URLs relativas contra `http://localhost/`).
- No se agrega MSW en modo navegador (`setupWorker`) para desarrollo sin backend, ni ningún framework de E2E — fuera de alcance (ver proposal.md).

## Decisions

**1. MSW en modo Node (`setupServer`), no `setupWorker`.**
Los tests corren en Vitest con entorno `jsdom` (Node), no en un navegador real — `setupServer` es la API de MSW pensada para ese entorno. `setupWorker` (Service Worker de navegador) queda fuera de alcance porque no hay hoy un flujo de desarrollo sin backend que resolver (ver proposal.md, fuera de alcance).

**2. Ubicación: `frontend/src/mocks/`, con `handlers/` por feature.**
```
frontend/src/mocks/
  server.ts          # setupServer(...handlers)
  handlers/
    index.ts          # combina todos los handlers
    auth.handlers.ts   # login, logout, getCurrentUser
```
Un archivo de handlers por feature (siguiendo el mismo criterio de organización por feature que `frontend/src/features/`) para que agregar la próxima feature con llamadas HTTP (p. ej. squads, cuando se reimplemente) sea agregar `squads.handlers.ts` y sumarlo al `index.ts`, sin tocar el resto.

**3. Arranque del servidor en `vitest-setup.ts`, con reset entre tests.**
```ts
import { server } from "./src/mocks/server";
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```
`onUnhandledRequest: "warn"` (no `"error"`) porque los tests unitarios existentes que mockean `httpClient` por módulo nunca llegan a la capa de red — no deben fallar por no tener un handler MSW correspondiente. `resetHandlers()` en `afterEach` es lo que permite que un `server.use(...)` puntual (Decisión 4) no se filtre entre tests.

**4. Sobreescritura puntual con `server.use(...)` dentro del test, no una variante de handler pre-armada.**
Para simular un caso de error específico, el test llama `server.use(http.post(path, () => HttpResponse.json(..., { status: 500 })))` directamente, en vez de mantener un catálogo de handlers alternativos (`authHandlersError`, etc.). Alternativa descartada: variantes de handlers por escenario — con pocos endpoints hoy, un catálogo de variantes agrega indirección sin necesidad; se reconsidera si el número de escenarios de error crece mucho.

**5. Los handlers reflejan el contrato de `authService`, no lo redefinen.**
El path y el método de cada handler igualan exactamente lo que `authService` ya llama (`httpClient.post("")`, `httpClient.get("")`, contra el mismo `baseURL`). Si `authService` cambia su contrato, los handlers se actualizan junto con él — no son una fuente de verdad independiente del contrato real.

## Risks / Trade-offs

- **[Riesgo] `baseURL` indefinido en tests** (gap preexistente, ver Contexto) podría hacer que una petición relativa no calce con el path exacto que espera un handler → Mitigación: los handlers matchean por path relativo tal como lo llama `authService` hoy (`""`, resuelto por axios/jsdom contra `http://localhost/`), verificado en la tarea de implementación antes de darla por completa.
- **[Trade-off] Los tests unitarios existentes (`vi.mock` de `httpClient`/`authService`) no se migran** → package de mocks queda con dos patrones conviviendo (mock de módulo para tests unitarios aislados, MSW para flujos de punta a punta) — aceptable porque resuelven necesidades distintas; no son mutuamente excluyentes.
