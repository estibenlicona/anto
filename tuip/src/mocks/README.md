# Mocks de API (MSW)

Capa de mocking de red compartida por dos modos:

- **Node (`server.ts`)** — para los tests de Vitest. Arranca automáticamente para toda la suite desde `vitest-setup.ts`.
- **Navegador (`browser.ts`)** — para probar la app manualmente en `pnpm dev` sin backend real. Se activa a demanda (ver abajo), nunca en producción.

Ambos modos usan los mismos handlers de `src/mocks/handlers/` — path relativo (no origen hardcodeado), para que matcheen sin importar el modo.

## Agregar handlers para una feature nueva

1. Crear `src/mocks/handlers/<feature>.handlers.ts`, exportando un arreglo de handlers de `msw` (`http.get`, `http.post`, etc.) que reflejen el path/método real que llama el `service` de esa feature — no inventes un contrato nuevo, copiá el que ya existe. Usá paths relativos (`"/algun-endpoint"`), no un origen hardcodeado.
2. Sumarlo en `src/mocks/handlers/index.ts`:
   ```ts
   import { miFeatureHandlers } from "./mi-feature.handlers";
   export const handlers = [...authHandlers, ...miFeatureHandlers];
   ```

## Sobreescribir un handler en un test puntual

Sin tocar el archivo de handlers, dentro del test:

```ts
import { server } from "../server"; // o el import relativo correspondiente
import { http, HttpResponse } from "msw";

server.use(
  http.get("/algun-endpoint", () =>
    HttpResponse.json({ message: "Error de servidor" }, { status: 500 })
  )
);
```

`server.resetHandlers()` corre en `afterEach` (ver `vitest-setup.ts`), así que el override solo aplica a ese test — el resto de la suite sigue usando el handler por defecto.

## Modo navegador (probar la app sin backend)

```
pnpm dev:mock
```

Arranca Vite con `VITE_USE_MOCKS=true`. `main.tsx` detecta esa variable, registra el Service Worker (`setupWorker` de `browser.ts`) y solo entonces renderiza la app — desde ahí, cualquier request que haga `httpClient` queda interceptada por los mismos handlers que usan los tests.

- `pnpm dev` (sin `:mock`) se comporta exactamente igual que siempre: llama al backend real. `VITE_USE_MOCKS` nunca debe agregarse a un `.env.*` versionado — es algo que cada quien activa localmente.
- En un build de producción, el código de `browser.ts` se elimina por tree-shaking (el `import()` que lo trae es dinámico y condicional) y el archivo `mockServiceWorker.js` se borra explícitamente del output (`vite.config.ts`) — no queda ningún rastro del modo mock en producción.
