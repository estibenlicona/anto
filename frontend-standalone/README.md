# Gestión de Capacidad — versión independiente

La misma aplicación que el host monta como módulo federado, pero corriendo **sola, sin Module Federation**: login simulado, barra propia y datos de mocks. Para probar el módulo completo sin levantar emulador + host + remote.

**No tiene pantallas propias.** Importa el código de `../frontend/src` tal cual (aliases `@features`, `@pages`, `@shared`, `@front`): lo que cambies en `frontend/` se ve acá al instante, sin mantener dos copias. Este proyecto sólo aporta lo que en producción pone el host: la sesión, la barra y la ruta base bajo la que se monta el módulo (`/app`).

```bash
cd frontend-standalone
pnpm install      # sus propias dependencias; el resto lo resuelve desde ../frontend/node_modules
pnpm dev          # http://localhost:4500 → login simulado → /app
pnpm typecheck
pnpm build && pnpm preview
```

## Cómo entra la sesión

`/auth/login` ofrece perfiles (`src/session/profiles.ts`) con la misma forma que las personas que siembra el host en el emulador: Ana (administradora, 12 secciones), Tomás, Isabella y Paula (líderes de expertise con distinto alcance de chapter) y Rita (sin permisos). El perfil elegido se guarda en `sessionStorage`; "Cerrar sesión" en la barra lo borra.

`src/session/store.ts` implementa el contrato de montaje del módulo — `source` (sesión con referencia estable + suscripción) y `acquireToken` — con un JWT de utilería cuyo payload trae el `oid` (con él los mocks resuelven el alcance del chapter) y los sub-claims `Capacidad.*` (los permisos de sección). El módulo no sabe que es simulado: recibe exactamente lo que le daría el host.

## Por qué funciona compartir el código

- `vite.config.ts` apunta los aliases a `../frontend/src` y **dedupea** `react`, `react-dom`, `react-router-dom` y `@tuya-ui/components`: sin eso, los archivos compartidos resolverían sus copias desde `../frontend/node_modules` y habría dos React (hooks y contextos rotos).
- `src/styles.css` importa la hoja del módulo y agrega `@source "../../frontend/src"`: Tailwind detecta clases desde la raíz de este proyecto, y hay que decirle que escanee también el código compartido.
- `public/mockServiceWorker.js` es copia del de `frontend/public`: el módulo registra los mocks contra el origen actual, y en esta versión el origen es este servidor.

Dos versiones, una sola base: si te encontrás editando algo dentro de `frontend-standalone/src` que no sea sesión, barra o arranque, va en `frontend/`.
