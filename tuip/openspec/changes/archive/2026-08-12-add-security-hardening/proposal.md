## Why

Nada en este proyecto mira su propia seguridad, y eso ya tiene un costo medible: al correr `pnpm audit` por primera vez aparecen **9 vulnerabilidades — 1 alta, 7 moderadas, 1 baja**. Ninguna es nueva; simplemente nadie las estaba mirando. La alta (`vite <=6.4.2`, bypass de `server.fs.deny` en rutas alternas de Windows) afecta al servidor de desarrollo del sitio de documentación, que se levantó varias veces en esta misma máquina durante el desarrollo del catálogo.

Además de las dependencias, hay dos lugares del código propio donde entra algo que no se valida y sale por un sink peligroso:

- **El CLI compone rutas de escritura desde configuración sin verificar contención.** `readProjectConfig` hace `{ ...DEFAULT_CONFIG, ...JSON.parse(raw) }` sobre el `tuip.json` del proyecto (`packages/cli/src/project-config.ts`), y `runAdd` usa ese `componentsRoot` en `join(cwd, …)` y `join(componentsRoot, file.target)` sin comprobar que el destino resultante siga dentro del proyecto (`packages/cli/src/commands/add.ts`). Un `tuip.json` con `"componentsRoot": "../../.."` hace que `tuip add button` escriba fuera del proyecto. `tuip` se publica público en npm y corre en máquinas ajenas, así que el `tuip.json` de un repositorio clonado no es una entrada confiable.
- **La extracción de iconos no acota qué markup copia, y lo emite con un escape incompleto.** `extract-icons.ts` solo verifica que el cuerpo *contenga* alguna figura dibujable — no que no traiga nada más — así que un atributo de evento pasa la comprobación. Ese cuerpo termina inyectado con `dangerouslySetInnerHTML` en cada aplicación consumidora (`icon.tsx`). Y al escribir el módulo generado escapa las comillas invertidas pero no `${`, de modo que un `${…}` dentro de un `<svg>` del documento de diseño no quedaría como texto sino como interpolación real del template literal: código que se evalúa al importar el módulo, en el build de cada consumidor. El documento de diseño se edita a mano — se le agregaron dos iconos así en el ciclo anterior — con lo cual no es una fuente sobre la que convenga apoyarse sin validar.

Lo que sí está bien y conviene no perder: **lo que se publica a npm está limpio.** Las dependencias de runtime de `tuip` son `commander` y `prompts`, y ninguna aparece en la ruta de ningún advisory. Las 9 se concentran en el sitio de documentación (12 de 15 apariciones) y en la cadena de build (`tsup` → `esbuild`).

## What Changes

- **Contención de escrituras en el CLI.** Todo destino que el CLI derive de configuración se resuelve y se verifica contra la raíz del proyecto antes de escribir nada; si queda afuera, se rechaza informando el motivo y no se escribe ningún archivo del lote, en vez de dejar la mitad escrita.
- **Allowlist en la extracción de iconos.** La extracción pasa de "tiene que haber un dibujo" a "no puede haber nada que no sea dibujo": un conjunto cerrado de elementos y atributos, derivado del set actual para no romper ninguno, y rechazo — no limpieza silenciosa — de cualquier icono que traiga otra cosa.
- **Emisión segura del módulo generado.** El módulo de iconos pasa a escribirse con serialización de cadena en vez de un template literal con escapes a mano. Elimina la clase entera de fallo, no solo el caso del `${` que se encontró.
- **Verificación automatizada de dependencias, encadenada a lo que ya se corre.** No un comando aparte que alguien deba acordarse de invocar: la auditoría se engancha a la tubería de tareas del monorepo, de modo que corre sola con `pnpm test` y `pnpm build`. Como el proyecto todavía no es un repositorio git ni tiene remoto, ese enganche es el control que efectivamente se aplica hoy; el workflow de CI se deja escrito y se activa solo cuando el proyecto tenga remoto.
- **Excepciones explícitas y con vencimiento.** Una vulnerabilidad que no se pueda resolver de inmediato se registra con paquete, motivo, responsable y fecha de revisión, y vuelve a poner la verificación en rojo al vencer. Es la única forma admitida de convivir con una vulnerabilidad conocida: bajar el umbral general no lo es.
- **Integridad de la publicación.** `release:cli` deja de publicar con `--no-git-checks`, que hoy permite publicar desde un árbol sucio o una rama equivocada.
- **Se resuelven las vulnerabilidades que no exigen un salto mayor** (la cadena `tsup` → `esbuild`). Las dos que sí lo exigen — `vite` 5→6 y `react-router` 6→7, ambas confinadas a `apps/docs` — quedan registradas como excepciones con fecha y se resuelven en el change `upgrade-docs-dependencies`, que existe precisamente para eso. Este change no las migra: mezclar dos migraciones mayores con el endurecimiento del código haría que un problema en cualquiera de las dos frene todo lo demás.

## Capabilities

### New Capabilities

- `security`: las garantías del proyecto en sus dos fronteras de confianza — lo que incorpora de terceros y lo que publica hacia terceros.

### Modified Capabilities

- `cli-installer`: se agrega el requisito de que el CLI escriba únicamente dentro del proyecto sobre el que se lo invoca.
- `iconography`: se agrega el requisito de que el módulo de iconos generado contenga solo geometría y nada interpretable como código.

## Impact

- `packages/cli/src/project-config.ts`, `packages/cli/src/commands/add.ts`, `packages/cli/src/commands/init.ts`: resolución y verificación de contención de los destinos de escritura, y validación previa al lote.
- `packages/components/scripts/extract-icons.ts`: allowlist de elementos y atributos, y emisión del módulo con serialización en vez de template literal.
- `scripts/security-audit.ts` (nuevo, en la raíz): corre la auditoría con los dos umbrales, aplica el archivo de excepciones y falla ante una excepción vencida o incompleta.
- `security-exceptions.json` (nuevo, en la raíz): las excepciones vigentes, con motivo, responsable y fecha de revisión.
- `turbo.json` y `package.json` (raíz): la auditoría encadenada a la tubería de tareas, y `release:cli` sin `--no-git-checks`.
- `.github/workflows/ci.yml`: nuevo, latente hasta que el proyecto tenga remoto.
- `packages/cli/package.json`, `packages/tokens/package.json`: actualización de `tsup` (y con ella `esbuild`).
- `openspec/specs/security/spec.md`: capability nueva.
- `openspec/specs/cli-installer/spec.md`, `openspec/specs/iconography/spec.md`: un requisito nuevo en cada una.
