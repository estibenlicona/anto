# Mocks de API (MSW)

Capa de mocking de red compartida por dos modos:

- **Node (`server.ts`)** — para los tests de Vitest. Arranca automáticamente para toda la suite desde `vitest-setup.ts`.
- **Navegador (`browser.ts`)** — para probar el módulo bajo el host con `pnpm dev` sin backend real. Se activa por variable de build (ver abajo), nunca en producción.

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

## Modo navegador (el módulo bajo el host, sin backend)

```
pnpm dev
```

Arranca el dev server del remote con `VITE_USE_MOCKS=true`. `src/module/CapacityModule.tsx` detecta esa variable al montarse dentro del host y registra el Service Worker (`setupWorker` de `browser.ts`) — desde ahí, cualquier request que haga `httpClient` queda interceptada por los mismos handlers que usan los tests.

- El worker se registra **contra el origen del host** (`${window.location.origin}/mockServiceWorker.js`): los service workers son por origen, y el módulo corre en la página del host (`http://localhost:4400`). Por eso el host sirve una copia de `public/mockServiceWorker.js` en su propio `public/` (ver `../../../host/README.md`). Si se regenera el worker (`npx msw init public`), hay que copiarlo también al host.
- `VITE_USE_MOCKS` nunca debe agregarse a un `.env.*` versionado: lo fija el script `dev` y, para un build de verificación, se pasa a mano (`VITE_USE_MOCKS=true vite build --mode development`).
- En un build de producción la condición se resuelve en compilación: la rama muere, ningún chunk de `src/mocks` entra al remote y `mockServiceWorker.js` se borra explícitamente del output (`vite.config.ts`) — no queda ningún rastro del modo mock en producción.
