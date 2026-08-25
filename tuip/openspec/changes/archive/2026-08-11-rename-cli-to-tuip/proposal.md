## Why

El CLI se llama `tuya-ui` en todo lo que un usuario escribe o lee —el paquete de npm, el binario, el archivo de configuración que genera, la hoja de tokens que copia— pero el producto se llama `tuip`: es el título del sitio, el wordmark del header, y el nombre con el que este repositorio se identifica en cada otra parte. Un usuario que instala el CLI escribe `npm install -g tuya-ui` y termina con un comando `tuya-ui` en su terminal, para un producto que en cualquier otro lugar se presenta como `tuip`. La marca y la herramienta que la distribuye no coinciden.

## What Changes

- **BREAKING** El paquete de npm se renombra de `tuya-ui` a `tuip`. El binario que queda instalado pasa de `tuya-ui` a `tuip`.
- **BREAKING** El archivo de configuración que el CLI genera en el proyecto consumidor pasa de `tuya-ui.json` a `tuip.json`.
- **BREAKING** El archivo de tokens que el CLI copia pasa de `src/styles/tuya-ui-tokens.css` a `src/styles/tuip-tokens.css`.
- Todos los mensajes que el CLI imprime en pantalla (ayuda, errores, confirmaciones de `init` y `add`) se actualizan al nombre nuevo.
- El sitio de documentación deja de mostrar `tuya-ui` en cualquier comando de ejemplo, salida de terminal, o nombre de archivo: la página de instalación, la de CLI, la de anatomía de un proyecto, la cabecera de cada componente y la página de inicio.
- El sitio deja de enseñar `npx tuip <comando>` como la forma por defecto de usar el CLI: la instalación global (`npm install -g tuip`) pasa a ser el flujo principal en toda página que muestre comandos, con `npx tuip` documentado como la alternativa sin instalar. La página de inicio ya enseñaba el flujo global; la de instalación, la de CLI y la de iconografía solo mostraban `npx`, en contradicción con ella.

## Capabilities

### Modified Capabilities

- `cli-installer`: el nombre del paquete, del binario, del archivo de configuración y del archivo de tokens cambian de `tuya-ui` a `tuip`. El comportamiento de cada comando no cambia.

El sitio de documentación (`docs-site`) no cambia de requisitos: sus escenarios ya piden "el comando del CLI" y "el comando exacto" en términos genéricos, sin nombrar `tuya-ui`. Corregir el contenido para que muestre `tuip` es una corrección de implementación bajo esos mismos requisitos, no una capacidad modificada — se hace en `tasks.md`.

## Impact

- `packages/cli/package.json`: `name` y `bin` pasan de `tuya-ui` a `tuip`.
- `packages/cli/src/index.ts`: el nombre declarado del programa.
- `packages/cli/src/commands/{init,add,list}.ts`: los mensajes de consola que nombran el binario.
- `packages/cli/src/project-config.ts`: el nombre del archivo de configuración y el valor por defecto de la ruta de tokens.
- `apps/docs/package.json`: la clave de la dependencia de workspace, hoy `"tuya-ui": "workspace:*"`.
- `apps/docs/src/components/Header.tsx`: importa la versión publicada desde `tuya-ui/package.json`.
- `apps/docs/src/content/{cli,instalacion,estructura}.ts`, `apps/docs/src/pages/{Home,ComponentDetail}.tsx`, `apps/docs/src/content/iconografia.tsx`: comandos de ejemplo, salidas de terminal y nombres de archivo mostrados al usuario.
- `openspec/specs/cli-installer/spec.md`: el Purpose y el escenario de instalación nombran el paquete explícitamente.
- `README.md` raíz del repositorio.
- **Consumidores existentes**: cualquier proyecto que ya haya corrido `tuya-ui init` tiene `tuya-ui.json` y `tuya-ui-tokens.css` en su repositorio, y `tuya-ui` instalado globalmente. No hay ruta de migración automática: son archivos que viven fuera de este repositorio.
