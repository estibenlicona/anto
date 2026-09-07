# anto — Dimensionamiento TI

| Carpeta | Qué es | Cómo se corre |
|---|---|---|
| `host/` | Barra común de la plataforma, sesión (Entra ID / emulador entra-local) y portal de módulos. Carga los módulos federados. | `pnpm dev` → http://localhost:4400 (ver su README: emulador + semilla) |
| `frontend/` | Gestión de Capacidad como **remote de Module Federation** que el host monta bajo `/capacidad`. Datos con MSW. | `pnpm dev` (remote en 4300, con el host) · `pnpm dev:mock` (solo, host falso, mocks) |
| `frontend-standalone/` | Gestión de Capacidad como **app independiente** (sin MF): login simulado con perfiles + barra propia, importando las pantallas de `frontend/src`. | `pnpm dev` → http://localhost:4500 |
| `backend/` | API .NET (PostgreSQL). Contrato en `oas.json`, semáforo de alineación en `ENDPOINTS.md`. | ver `backend/ARCHITECTURE.md` |
| `tuip/` | Design system (`@tuya-ui/components`, `@tuya-ui/tokens`), consumido por tarball desde `.local-packages/`. | `pnpm run publish:local` para republicar |
| `openspec/` | Cambios y specs de producto/backend (OpenSpec). `frontend/openspec/` guarda las specs de pantallas previas a la plataforma. | `openspec list` desde la raíz |
