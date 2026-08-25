## ADDED Requirements

### Requirement: Modo navegador de los mocks, activado explícitamente
El sistema SHALL permitir interceptar en el navegador (Service Worker), durante `pnpm dev`, las mismas peticiones HTTP que el modo Node intercepta en los tests, usando los mismos handlers. El sistema SHALL activar este modo únicamente cuando una variable de entorno lo indique explícitamente, y SHALL NOT activarlo en un build de producción bajo ninguna circunstancia.

#### Scenario: Desarrollador activa el modo mock
- **WHEN** se levanta `pnpm dev` con `VITE_USE_MOCKS=true`
- **THEN** las peticiones HTTP que haga la app (por ejemplo, al iniciar sesión) son interceptadas por el Service Worker de mocks y responden con los datos de los handlers, sin llegar a ningún backend real

#### Scenario: Desarrollo sin la variable de entorno
- **WHEN** se levanta `pnpm dev` sin `VITE_USE_MOCKS` (o en `false`)
- **THEN** la app se comporta igual que hoy: las peticiones HTTP van al backend real configurado en `VITE_BASE_URL`

#### Scenario: Build de producción
- **WHEN** se genera un build de producción (`npm run build:prod` o equivalente)
- **THEN** el Service Worker de mocks no se incluye ni se activa, sin importar el valor de `VITE_USE_MOCKS`

### Requirement: Los handlers de mock funcionan igual en Node y en navegador
El sistema SHALL usar los mismos handlers de mock (los definidos en `frontend/src/mocks/handlers/`) tanto para el modo Node (tests) como para el modo navegador (desarrollo), sin duplicar su definición ni acoplarlos a un origen específico.

#### Scenario: Un handler ya existente funciona en ambos modos
- **WHEN** un handler de mock (por ejemplo, el de login) se ejercita tanto desde un test de Vitest como desde el navegador en modo mock
- **THEN** responde de forma equivalente en ambos casos, sin necesitar una versión distinta del handler para cada modo
