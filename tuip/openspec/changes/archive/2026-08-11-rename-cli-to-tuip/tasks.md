## 1. Paquete y binario del CLI

- [x] 1.1 Renombrar `name` y `bin` en `packages/cli/package.json` de `tuya-ui` a `tuip`
- [x] 1.2 Actualizar `program.name(...)` en `packages/cli/src/index.ts`
- [x] 1.3 Actualizar los mensajes de consola de `commands/init.ts` que nombran el binario (ya inicializado, sugerencia de fusión de Tailwind, confirmación de inicialización, import de la hoja de tokens)
- [x] 1.4 Actualizar los mensajes de consola de `commands/add.ts` (uso, sugerencia de `list`)
- [x] 1.5 Actualizar el mensaje de consola de `commands/list.ts` (sugerencia de `add`)

## 2. Archivos que el CLI escribe en el proyecto consumidor

- [x] 2.1 Renombrar el archivo de configuración de `tuya-ui.json` a `tuip.json` en `project-config.ts`
- [x] 2.2 Renombrar la ruta por defecto de tokens de `src/styles/tuya-ui-tokens.css` a `src/styles/tuip-tokens.css`
- [x] 2.3 Verificar que `init` y `add` siguen funcionando de punta a punta contra un proyecto temporal con los nombres nuevos

## 3. Dependencia del sitio de documentación

- [x] 3.1 Cambiar la clave de la dependencia en `apps/docs/package.json` de `"tuya-ui"` a `"tuip"`
- [x] 3.2 Cambiar el import en `Header.tsx` de `tuya-ui/package.json` a `tuip/package.json`
- [x] 3.3 Verificar que la versión sigue mostrándose en el wordmark del header

## 4. Spec principal

- [x] 4.1 Corregir el `## Purpose` de `openspec/specs/cli-installer/spec.md` para nombrar `tuip` en vez de `tuya-ui`

## 5. Contenido del sitio

- [x] 5.1 Corregir `content/instalacion.ts`: comando de inicialización, salida de terminal, nombre del archivo de configuración, comando de `add`
- [x] 5.2 Corregir `content/cli.ts`: los tres comandos documentados y sus salidas de ejemplo
- [x] 5.3 Corregir `content/estructura.ts`: el árbol de carpetas que muestra `tuya-ui.json`
- [x] 5.4 Corregir `pages/Home.tsx` y `pages/ComponentDetail.tsx`: comandos de instalación mostrados
- [x] 5.5 Corregir `content/iconografia.tsx`: el comando `npx tuya-ui add icon`
- [x] 5.6 Recorrer el sitio corriendo y confirmar que ningún comando, salida de terminal o nombre de archivo mostrado dice `tuya-ui`
- [x] 5.7 Reescribir los comandos de ejemplo de `content/instalacion.ts`, `content/cli.ts` y `content/iconografia.tsx` para enseñar `npm install -g tuip` seguido del comando directo (`tuip init`, `tuip list`, `tuip add <nombre>`) como flujo principal, con `npx tuip <comando>` documentado como alternativa sin instalar
- [x] 5.8 Confirmar que las cuatro superficies que enseñan cómo invocar el CLI —inicio, instalación, CLI e iconografía— muestran el mismo patrón

## 6. Repositorio

- [x] 6.1 Corregir `README.md`: el nombre del CLI en la introducción, el nombre del paquete publicado, los comandos de ejemplo (`tuya-ui list`, `tuya-ui add`), los `pnpm --filter tuya-ui` y el nombre de la carpeta raíz en el árbol del monorepo

## 7. Cierre

- [x] 7.1 Buscar `tuya-ui` en todo el repositorio y confirmar que cada aparición restante es un paquete interno del workspace (`@tuya-ui/tokens`, `@tuya-ui/components`), no el CLI
- [x] 7.2 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
