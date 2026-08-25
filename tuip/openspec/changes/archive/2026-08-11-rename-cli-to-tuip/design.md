## Context

Ver `proposal.md` — Why para la motivación, y `specs/cli-installer/spec.md` para el contrato de comportamiento que cambia.

Estado actual relevante:

- `packages/cli/package.json` publica el paquete como `"name": "tuya-ui"` con `"bin": { "tuya-ui": "./dist/index.js" }`. Ese es el nombre que un usuario escribe en `npm install -g` y el comando que queda en su PATH.
- `packages/cli/src/project-config.ts` fija `configPath()` en `tuya-ui.json` y el valor por defecto de `tokensCssPath` en `src/styles/tuya-ui-tokens.css`. Son nombres de archivo que el CLI escribe en el repositorio del consumidor, no en este repo.
- Cinco strings de consola en `commands/{init,add,list}.ts` e `index.ts` nombran el binario en mensajes de ayuda y error.
- `apps/docs/package.json` depende del paquete como `"tuya-ui": "workspace:*"`, y `Header.tsx` importa `tuya-ui/package.json` solo para leer `version` y mostrarla en el wordmark.
- El sitio de documentación transcribe comandos de ejemplo y salidas de terminal como texto literal en `content/{cli,instalacion,estructura}.ts`, `pages/{Home,ComponentDetail}.tsx` y `content/iconografia.tsx` — no los deriva de ningún lugar, así que cada uno hay que corregirlo a mano.

## Goals / Non-Goals

**Goals:**

- Que todo lo que un usuario instala, ejecuta o lee del CLI se llame `tuip`, sin una segunda identidad `tuya-ui` conviviendo en ningún lugar visible.

**Non-Goals:**

- No se renombran los paquetes internos del monorepo (`@tuya-ui/tokens`, `@tuya-ui/components`). Son nombres de workspace, invisibles para quien usa el CLI o el sitio; renombrarlos es un cambio mecánico sin efecto en la experiencia que motiva este change, y se puede hacer aparte si alguna vez importa.
- No se migra automáticamente ningún proyecto que ya haya corrido `tuya-ui init`. Sus archivos `tuya-ui.json` y `tuya-ui-tokens.css` quedan como están; no hay manera de alcanzarlos desde este repositorio.
- No cambia el comportamiento de ningún comando. `init`, `add` y `list` hacen exactamente lo mismo; solo cambia cómo se los invoca y qué imprimen.

## Decisions

### El renombre se hace de una sola vez, no en paralelo

No se sostiene `tuya-ui` como alias del binario nuevo. El paquete se publica como `tuip` y el nombre viejo deja de existir.

*Por qué:* un alias que convive con el nombre nuevo es exactamente la incoherencia que este change corrige —dos nombres para una misma cosa—, solo que dentro del propio CLI en vez de entre el CLI y la marca.

*Alternativa considerada:* publicar `tuip` y dejar `tuya-ui` como paquete puente que reexporta el mismo binario, para no romper instalaciones existentes. Se descarta: con el catálogo de consumidores actual el costo de mantener dos paquetes publicados no se justifica, y es la misma decisión que ya se tomó al renombrar los tokens.

### El archivo de configuración también se renombra

`tuya-ui.json` pasa a `tuip.json`, y `tuya-ui-tokens.css` a `tuip-tokens.css`. No son nombres arbitrarios: son lo primero que ve alguien que abre el repositorio de un proyecto que instaló el sistema, y dejarlos con el nombre viejo sería la misma inconsistencia sobreviviendo un nivel más abajo.

*Riesgo asumido:* un proyecto que ya corrió `init` tiene el archivo viejo. Volver a correr `init` con el binario nuevo no lo detecta —busca `tuip.json`, no `tuya-ui.json`— así que escribe una segunda configuración en vez de avisar que el proyecto ya está inicializado. Es un caso raro (implica migrar de una versión vieja del CLI a la nueva sobre el mismo proyecto) y no tiene mitigación automática posible desde este repo; se documenta en la página de instalación.

### La instalación global es el flujo principal; npx es la alternativa

Toda página que muestre un comando del CLI enseña primero `npm install -g tuip` y después el comando directo (`tuip init`, `tuip add <nombre>`, `tuip list`). `npx tuip <comando>` se documenta como alternativa para quien no quiere instalar el paquete, no como el flujo por defecto.

*Por qué:* el paquete ya está armado para el uso directo —`bin` correcto, shebang, `publishConfig.access: public`— así que no ejecutar `npx` en cada comando no es una limitación técnica, es simplemente lo que pasa después de instalar. La página de inicio ya enseñaba este flujo; la de instalación, la de CLI y la de iconografía mostraban únicamente `npx`, dando la impresión de que era obligatorio. Es una inconsistencia entre páginas del propio sitio, no una decisión que hubiera que tomar de nuevo.

*Por qué ahora, y no en el resto del sitio:* el rename es lo que hizo visible el problema. Con el binario llamándose `tuya-ui`, escribirlo a mano ya era suficientemente incómodo como para que nadie notara si además hacía falta `npx`; con `tuip`, la fricción de más que aporta `npx` se nota.

### El Purpose del spec principal se corrige por fuera del delta

`openspec/specs/cli-installer/spec.md` abre con «Provee `tuya-ui`, un CLI…». Un delta no tiene una operación para modificar `## Purpose` —la regla del esquema es que un Purpose en el delta de una capacidad existente se ignora—, así que esa línea se corrige editando el spec principal directamente, como paso de la implementación de este change, no como parte del delta versionado.

## Risks / Trade-offs

- **Cualquier script o pipeline externo que invoque `tuya-ui` deja de funcionar en cuanto se publique la versión nueva.** → Es el mismo trade-off que el renombre de tokens ya aceptó: con el catálogo de consumidores actual, publicar como versión mayor y documentar el cambio es más barato que sostener dos nombres.
- **Un proyecto que corre `init` dos veces —una con el binario viejo, otra con el nuevo— termina con `tuya-ui.json` y `tuip.json` a la vez, y el CLI no lo detecta.** → Documentado arriba. No se resuelve porque no hay forma de leer el proyecto consumidor desde este repo antes de publicar.

## Migration Plan

1. Renombrar el paquete y el binario en `packages/cli/package.json`, y los cinco mensajes de consola que lo nombran.
2. Renombrar el archivo de configuración y la ruta por defecto de tokens en `project-config.ts`.
3. Actualizar `apps/docs/package.json` y el import en `Header.tsx` al nombre nuevo del paquete.
4. Corregir el Purpose de `openspec/specs/cli-installer/spec.md`.
5. Corregir el contenido del sitio: los seis archivos que transcriben comandos, salidas de terminal o el nombre del archivo de configuración.
6. Corregir el `README.md` raíz.

Cada paso deja el monorepo compilando. El paso 1 es el único que rompe hacia afuera, y solo al publicarse.

## Open Questions

Ninguna.
