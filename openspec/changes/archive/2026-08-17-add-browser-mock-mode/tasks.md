## 1. Generalizar los handlers existentes

- [x] 1.1 En `frontend/src/mocks/handlers/auth.handlers.ts`, cambiar el matching de `http://localhost:3000/` (hardcodeado) a un path relativo (`"/"`), para que funcione contra cualquier origen.
- [x] 1.2 Ejecutar la suite de tests existente (`useLogin.e2e.test.ts` y el resto) y confirmar que sigue pasando igual que antes — el cambio de matching no debe alterar ningún resultado en modo Node.

## 2. Modo navegador de MSW

- [x] 2.1 Generar el Service Worker con `npx msw init public/ --save` (crea `frontend/public/mockServiceWorker.js`).
- [x] 2.2 Crear `frontend/src/mocks/browser.ts` con `setupWorker(...handlers)`, importando `handlers` desde `./handlers` (el mismo arreglo que usa `server.ts`).
- [x] 2.3 Agregar `frontend/src/vite-env.d.ts` con `/// <reference types="vite/client" />`.

## 3. Activación condicional en el arranque de la app

- [x] 3.1 En `frontend/src/main.tsx`, envolver el render en una función `prepareApp()` que, si `import.meta.env.VITE_USE_MOCKS === "true"`, hace `import()` dinámico de `mocks/browser` y espera `worker.start({ onUnhandledRequest: "bypass" })` antes de renderizar.
- [x] 3.2 Agregar un script `dev:mock` en `frontend/package.json` (p. ej. `cross-env VITE_USE_MOCKS=true vite --port 4300` o equivalente ya usado en el proyecto) para activar el modo mock sin tener que exportar la variable a mano.
- [x] 3.3 Confirmar que `VITE_USE_MOCKS` no está definida en ningún `.env.*` versionado (development/production/certification) — se activa solo vía el script/variable de entorno local.

## 4. Verificación manual

- [x] 4.1 Levantar `pnpm dev:mock`, abrir la app en el navegador, iniciar sesión con credenciales que el handler de mock acepta, y confirmar que el login funciona sin el backend levantado.
- [x] 4.2 Levantar `pnpm dev` (sin el modo mock) y confirmar que el comportamiento es idéntico al actual (intenta llamar al backend real, sin ningún Service Worker interceptando).
- [x] 4.3 Generar un build de producción (`npm run build:prod`) e inspeccionar el bundle/red para confirmar que no incluye `msw/browser` ni arranca ningún worker.
- [x] 4.4 Agregar un plugin en `vite.config.ts` que borre `dist/mockServiceWorker.js` en el build de producción — Vite copia todo `public/` a `dist/` sin importar el modo, así que el archivo (inerte, nunca registrado) quedaba igual en el output. Verificado: ausente en `build:prod`, presente en `build:dev`/`build:test`.

## 5. Verificación final

- [x] 5.1 Ejecutar `npm run lint` y `npx vitest run` en `frontend/` y confirmar que ambos pasan sin regresiones nuevas.
- [x] 5.2 Actualizar `frontend/src/mocks/README.md` documentando el modo navegador (cómo activarlo, y que nunca corre en producción).
