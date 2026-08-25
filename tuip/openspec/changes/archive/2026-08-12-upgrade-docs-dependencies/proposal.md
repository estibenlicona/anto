## Why

`add-security-hardening` dejó el control de dependencias bloqueante, con dos vulnerabilidades registradas como excepciones fechadas porque su arreglo exige un salto mayor y no cabía mezclarlo con el endurecimiento del código. Este change existe para eliminar esas dos excepciones resolviendo lo que las motivó. Mientras existan, el proyecto convive con:

- **`vite` — GHSA-fx2h-pf6j-xcff, severidad alta.** Bypass de `server.fs.deny` en rutas alternas de Windows. Es la única vulnerabilidad alta del proyecto. Afecta al servidor de desarrollo, no al sitio construido, y la máquina de desarrollo de este proyecto es Windows — o sea que es justo la combinación en la que aplica. `apps/docs` está en `vite ^5.4.0` (resuelto: 5.4.21) y el parche solo existe desde 6.4.3: no hay arreglo dentro de la línea 5.
- **`react-router` — GHSA-337j-9hxr-rhxg, 4 moderadas.** Llegan por `react-router-dom ^6.26.0` (resuelto: 6.30.4) y son las únicas vulnerabilidades del proyecto en dependencias de *runtime*, no de herramientas. El parche está desde 7.18.0.

Las dos son la misma clase de trabajo — una migración mayor confinada a `apps/docs` — así que se resuelven juntas y no en dos changes que tocarían el mismo `package.json` y el mismo build.

## What Changes

- `apps/docs` migra de `vite` 5 a 6, con el ajuste de `@vitejs/plugin-react` que esa versión requiera.
- `apps/docs` migra de `react-router-dom` 6 a 7. El sitio usa el enrutado declarativo (`BrowserRouter`, `Routes`, `Route`, `Navigate`), que es la forma que la versión 7 mantiene compatible; no usa data routers ni loaders, que es donde están los cambios de fondo.
- Se eliminan de `security-exceptions.json` las dos excepciones que este change resuelve, dejando el archivo vacío y el control en verde sin nada tapado.

## Capabilities

Ninguna. Es una actualización de dependencias: el sitio de documentación hace exactamente lo mismo antes y después, y ningún requisito de `docs-site` cambia. Por eso el change declara `skip_specs`.

El requisito que este trabajo satisface — que una excepción venza y vuelva a poner la verificación en rojo si nadie la resolvió — ya está especificado en la capability `security` que introdujo `add-security-hardening`. Acá se lo cumple, no se lo modifica.

## Impact

- `apps/docs/package.json`: `vite`, `@vitejs/plugin-react` y `react-router-dom` a sus líneas nuevas.
- `apps/docs/vite.config.ts`: los ajustes que pida la migración a Vite 6, si los pide.
- `apps/docs/src/main.tsx`, `apps/docs/src/App.tsx`: los ajustes que pida React Router 7, si los pide.
- `security-exceptions.json`: quedan eliminadas las dos excepciones, y el archivo vacío.
- `pnpm-lock.yaml`: resolución nueva.
