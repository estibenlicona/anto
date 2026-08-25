## Context

Ver proposal.md - Why. `add-api-mocking` dejó `frontend/src/mocks/handlers/auth.handlers.ts` con los paths hardcodeados contra `http://localhost:3000/` (el origen que jsdom usa por defecto en Vitest — ver ese design.md, Decisión 3/el diagnóstico de `window.location.href` hecho durante su implementación). En desarrollo (`pnpm dev`), la app corre contra `http://localhost:5173` (`VITE_BASE_PUBLIC_URL`) con `VITE_BASE_URL=/`. `frontend/src/main.tsx` renderiza sincrónicamente (`ReactDOM.createRoot(...).render(...)`) sin ningún paso asíncrono previo. No existe hoy `frontend/src/vite-env.d.ts` — por eso `import.meta.env` ya da error de tipos en `httpClient.ts` (gap preexistente, no introducido por este change).

## Goals / Non-Goals

**Goals:**
- Definir cómo el mismo handler de mock matchea peticiones sin importar el origen (Node en tests vs. navegador en dev).
- Definir dónde y cómo se activa `setupWorker`, y cómo se garantiza que nunca corra en producción.
- Definir el archivo de Service Worker generado y dónde vive.

**Non-Goals:**
- No se agrega ningún framework de E2E con navegador real.
- No se resuelve el gap más amplio de `VITE_BASE_URL` indefinido en tests (ya documentado como no-goal en `add-api-mocking`).
- No se decide todavía la estrategia de mocks para features que no existen (squads) — se extiende cuando corresponda, siguiendo `frontend/src/mocks/README.md`.

## Decisions

**1. Handlers con path relativo (`"/"`), no origen hardcodeado.**
MSW interpreta un path relativo como "matchear ese path contra cualquier origen" — es la forma soportada de que el mismo handler funcione tanto contra `http://localhost:3000` (Node/tests) como contra `http://localhost:5173` (navegador/dev) sin duplicar handlers. Se cambia `auth.handlers.ts`: `http.post(AUTH_URL, ...)` con `AUTH_URL = "http://localhost:3000/"` pasa a `http.post("/", ...)` (y análogo para el `GET`). Alternativa descartada: mantener el handler actual y agregar una copia paralela para el navegador — duplica la lógica de negocio del mock (qué credenciales fallan, forma de la respuesta) en dos lugares que podrían desalinearse.

**2. `setupWorker` vive en `frontend/src/mocks/browser.ts`, separado de `server.ts`.**
Mismo patrón que MSW documenta: un entrypoint por entorno (`server.ts` para Node, `browser.ts` para navegador), ambos importando el mismo `handlers` de `frontend/src/mocks/handlers/index.ts`. Ninguno de los dos importa al otro — evita que el bundle de producción arrastre código de `setupServer` (que no tiene sentido en el navegador) o viceversa.

**3. Activación condicional en `main.tsx`, gateando el render hasta que el worker esté listo.**
```ts
async function prepareApp() {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    const { worker } = await import("@/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

prepareApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(...);
});
```
El `import()` dinámico asegura que `msw/browser` y los handlers **no** entren al bundle cuando `VITE_USE_MOCKS` no está seteado (tree-shaking/code-splitting de Vite lo deja en un chunk aparte que nunca se pide). `onUnhandledRequest: "bypass"` (a diferencia de `"warn"` en el modo Node) porque en el navegador la app también pide assets estáticos y otros recursos que no son parte de los mocks — no tiene sentido advertir por esos.

**4. `VITE_USE_MOCKS` se lee de `import.meta.env`, nunca hardcodeado, y nunca `true` en el build de producción.**
Vite solo incluye variables `VITE_*` presentes en el modo de build activo (`.env.production` no la define, y no se agrega). Aun si alguien la seteara manualmente en el entorno de un build de producción, la Decisión 3 solo hace el `import()` dinámico condicionado a esa misma variable — pero como salvaguarda adicional (Decisión 4b) el script `build:prod` de `package.json` no permite pasar `VITE_USE_MOCKS` por línea de comando sin modificar el script explícitamente, dejando el gateo en dos capas: la variable de entorno y el propio código de `main.tsx`.

**5. Se agrega `frontend/src/vite-env.d.ts` con la referencia estándar de Vite (`/// <reference types="vite/client" />`).**
Necesario para que `import.meta.env.VITE_USE_MOCKS` (Decisión 3) tipe correctamente. Efecto colateral: esto también resuelve el error de tipos preexistente en `httpClient.ts` (`Property 'env' does not exist on type 'ImportMeta'`), presente desde antes de este change — se corrige porque el archivo nuevo lo necesita de todas formas, no como un fix aparte fuera de alcance.

**6. Plugin de Vite que borra `dist/mockServiceWorker.js` en el build de producción.**
Vite copia todo `public/` a `dist/` sin importar el modo — el archivo del Service Worker (Decisión 2) quedaría en el build de producción aunque nunca se registre (Decisión 3 ya garantiza que el código que lo invocaría se elimina por tree-shaking). Para que ni siquiera quede el archivo, se agrega un plugin (`removeMockWorkerInProduction` en `vite.config.ts`) que lo borra en el hook `closeBundle`, solo cuando `mode === "production"`. Verificado: presente en `build:dev`/`build:test`, ausente en `build:prod`.

## Risks / Trade-offs

- **[Riesgo] Activar mocks por accidente en un entorno compartido** (p. ej. alguien deja `VITE_USE_MOCKS=true` en un `.env.development` commiteado) → Mitigación: la variable se documenta como algo que cada quien setea localmente (o vía script `dev:mock`, tarea de implementación), no se agrega a ningún `.env.*` versionado.
- **[Trade-off] Dos entrypoints de MSW (`server.ts`/`browser.ts`) a mantener** → aceptable: ambos son configuración mínima (unas pocas líneas), la lógica real vive una sola vez en `handlers/`.
