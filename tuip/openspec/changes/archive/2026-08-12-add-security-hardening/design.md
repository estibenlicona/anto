## Context

Ver proposal.md - Why. Tres hechos del estado actual condicionan el diseño y conviene tenerlos delante:

- **El proyecto no es un repositorio git y no tiene remoto.** No hay `.git` ni `.github`. Un workflow de CI, por sí solo, sería un archivo que no ejecuta nada.
- **`pnpm audit` no filtra por paquete del workspace.** `pnpm --filter tuip audit` falla con `Unknown option: 'recursive'`. Lo que sí distingue es `--prod` (solo dependencias de runtime) frente a la auditoría completa (incluye herramientas).
- **Las 9 vulnerabilidades no están donde uno supondría.** 4 de las moderadas están en dependencias de runtime (`react-router` en el sitio de docs), no solo en herramientas. Las rutas de advisory tocan `apps/docs` (12 apariciones), `packages/cli` (2, vía `tsup`) y `packages/tokens` (1, vía `tsup`). `commander` y `prompts` — el runtime de lo que se publica a npm — no aparecen en ninguna.

## Goals / Non-Goals

**Goals:**
- Cerrar los dos sinks del código propio en su origen, de modo que el contenido que llega a ellos sea confiable por construcción y no por vigilancia.
- Que la verificación corra **sola**, encadenada a lo que ya se ejecuta, y no como un comando que alguien tenga que acordarse de invocar.
- Que el control quede bloqueante desde el primer día, sin que las dos migraciones mayores pendientes lo obliguen a nacer en rojo ni a aflojar el umbral.

**Non-Goals:**
- **Las migraciones mayores de `apps/docs`** (`vite` 5→6 y `react-router` 6→7). Van en el change `upgrade-docs-dependencies`. Acá quedan registradas como excepciones con fecha: mezclar dos migraciones mayores con el endurecimiento del código haría que un problema en cualquiera de las dos frene lo demás, que es exactamente lo contrario de lo que se busca.
- Análisis estático de código (CodeQL, Semgrep). Sin remoto no corre, y el valor inmediato está en los puntos concretos ya identificados, no en un barrido genérico sobre un repositorio de este tamaño.
- Firma de paquetes y procedencia de npm. Depende de tener CI andando con un remoto; corresponde a un change posterior, cuando exista lo que este deja preparado.
- Sanear el documento de diseño en sí. Lo que se acota es lo que la extracción **emite**, no lo que el documento contiene: el documento es fuente editable a mano y su desprolijidad debe verse, no corregirse sola.
- Reemplazar `dangerouslySetInnerHTML` en `Icon`. Ver Decisions.

## Decisions

### Contención por rutas resueltas, no por prefijo de texto

La verificación resuelve raíz y destino a rutas absolutas y luego calcula la ruta relativa entre ambas: el destino está contenido si esa relativa no empieza por `..` y no es absoluta. Comparar prefijos de texto (`target.startsWith(root)`) deja pasar un directorio hermano cuyo nombre empieza igual que la raíz — `…/proyecto-malicioso` contra la raíz `…/proyecto` — que es exactamente el caso que el tercer escenario del delta de `cli-installer` fija.

Se usa `resolve` y no `join` para componer el destino: `join(cwd, "/otra/cosa")` reinterpreta en silencio la ruta absoluta como relativa y la mete dentro del proyecto, mientras que `resolve` la deja absoluta y la verificación la rechaza explícitamente. Un destino absoluto en la configuración es un error que conviene ver, no normalizar.

Se aplica a los tres destinos que hoy salen de configuración: `componentsRoot`, `tailwindConfigPath` y `tokensCssPath`.

### Validar el lote entero antes de escribir el primer archivo

`runAdd` hoy resuelve y escribe dentro del mismo bucle, así que un destino inválido en el tercer componente dejaría los dos primeros ya escritos. La verificación se hace sobre todos los destinos del lote antes de abrir el primer archivo. Es lo que hace cumplible el escenario "ningún archivo escrito a medias" — sin eso, el requisito sería cierto solo por casualidad según el orden de los componentes.

### Allowlist derivada del set actual, y rechazo en vez de limpieza

La lista de elementos y atributos admitidos no se escribe de memoria: se deriva escaneando los iconos que la librería ya publica, de modo que el conjunto sea exactamente lo que el set necesita y ni un elemento más. El cuarto escenario del delta de `iconography` es la prueba de que esa derivación se hizo bien — si algún icono vigente resulta rechazado, la lista quedó corta.

Ante algo fuera del conjunto, la extracción **rechaza e informa** en vez de quitarlo y continuar. Limpiar en silencio convierte un documento de diseño comprometido en un build verde, que es precisamente la señal que no queremos perder.

### Emitir el módulo con serialización, no con un template literal

El escape actual (`icon.body.replace(/\`/g, "\\\`")`) es una lista de casos que alguien recordó, y le falta `${`. Reemplazarlo por serializar cada cuerpo como cadena JSON no arregla ese caso: elimina la categoría entera, porque la serialización escapa cualquier contenido posible por construcción. Es la diferencia entre tapar el agujero encontrado y quitar la clase de agujero.

Es también la razón por la que este arreglo va aunque exista el allowlist: son dos defensas independientes sobre el mismo camino, y la segunda no depende de que la primera haya previsto todo.

### `Icon` sigue usando `dangerouslySetInnerHTML`

La alternativa era parsear la geometría a elementos React y eliminar el sink. Se descarta: con el allowlist en la extracción, el contenido del módulo es confiable por construcción y validado en tiempo de build, mientras que parsear en runtime costaría peso de bundle y trabajo en cada render de cada aplicación consumidora, para revalidar algo que ya se validó una vez donde correspondía. Arreglar en el origen y dejar el consumo barato es preferible a pagar el chequeo en cada consumidor para siempre.

### Dos umbrales, que es lo que la herramienta permite distinguir

El requisito pide un umbral más estricto para lo que llega a una máquina ajena. Como `pnpm audit` no filtra por paquete del workspace, la separación implementable es:

- `pnpm audit --prod` con umbral en **moderate**: dependencias de runtime, las que terminan ejecutándose en la máquina o el navegador de otra persona.
- `pnpm audit` completo con umbral en **high**: incluye la cadena de build, donde una vulnerabilidad tiene que ser grave para justificar detener el trabajo.

Queda una limitación que conviene dejar escrita y no disimular: esto no aísla *el paquete publicado* (`tuip`) del resto del runtime — el `--prod` mezcla las dependencias de `tuip` con las del sitio de docs. Hoy no molesta porque el runtime de `tuip` está limpio, y aislarlo de verdad requeriría herramienta adicional. Si en algún momento el runtime de `tuip` incorpora algo, ese es el momento de separarlo.

### La automatización va enganchada a la tubería, y sin caché

Con el proyecto sin repositorio git, lo único que se ejecuta de verdad es lo que corre al construir o probar. La auditoría se define como tarea de raíz de Turbo (`//#security:audit`) y `test` pasa a depender de ella, de modo que corre con `pnpm test` y con `pnpm build` sin que nadie la invoque aparte — que es literalmente lo que pide el primer escenario del requisito. Si la semántica de tarea de raíz resultara incómoda, la alternativa equivalente es componerla en el script `test` de la raíz; lo que no es aceptable es dejarla como comando suelto.

**La tarea se declara `cache: false`, y esto no es un detalle.** El resultado de una auditoría no depende de los archivos del repositorio sino de la base de advisories, que cambia sola. Cacheada por Turbo, una vulnerabilidad divulgada mañana sobre código que no cambió no se detectaría nunca — justo el escenario "vulnerabilidad publicada sobre código que no cambió" que el requisito exige cubrir. El caché convertiría el control en decorado.

El workflow de GitHub Actions se escribe igual, con la auditoría y el disparo programado que cubre la parte periódica, y se activa solo cuando el proyecto tenga remoto. Se escribe ahora porque escribirlo después significa recordarlo después.

### El control nace bloqueante, con las dos migraciones como excepciones fechadas

La versión anterior de este diseño resolvía las 9 vulnerabilidades antes de encender el control, para que no naciera en rojo. Al sacar las dos migraciones mayores del alcance, esa vía desaparece y quedan dos salidas: aflojar el umbral hasta que lo actual pase, o registrar excepciones explícitas. Se elige lo segundo.

Aflojar el umbral esconde de más: un umbral bajo tapa también todo lo que nadie evaluó, y no deja rastro de qué se decidió aceptar ni de cuándo revisarlo. Una excepción nombra el paquete, el motivo, quién lo asume y hasta cuándo — y vence, con lo cual el rojo vuelve solo si nadie hizo nada. El control queda bloqueante desde el primer día y las dos migraciones pendientes quedan a la vista en un archivo, no disueltas en una configuración.

El vencimiento se evalúa contra la fecha de corrida, así que una excepción olvidada reaparece sin que nadie tenga que acordarse — que es la única forma de que "lo vemos después" no signifique "nunca".

## Risks / Trade-offs

- **Las dos vulnerabilidades quedan sin resolver al cerrar este change, una de ellas la única alta** → Mitigación: quedan bloqueantes-con-excepción, no ignoradas: registradas con fecha, visibles en un archivo del repositorio, y con un change propio (`upgrade-docs-dependencies`) que existe para eliminarlas. Ambas están confinadas a `apps/docs`, que no se publica; la alta afecta al servidor de desarrollo, no al sitio construido. El riesgo real es que el change 2 se postergue — por eso la excepción vence en vez de ser permanente.
- **El allowlist puede quedar corto y rechazar un icono legítimo** → Mitigación: se deriva del set vigente en lugar de escribirse de memoria, y el cuarto escenario del delta de `iconography` verifica exactamente eso. El modo de fallo, además, es ruidoso y en tiempo de build: un icono rechazado se ve al instante, no se descubre en producción.
- **La auditoría sin caché agrega latencia a cada `pnpm test`** → Mitigación: es el costo de que el control sea real; `pnpm audit` sobre este árbol tarda segundos, no minutos. Cachearla para ahorrarlos la volvería inútil justo en el caso que más importa.
- **El control es local hasta que exista un remoto** → Mitigación: por eso se engancha a la tubería en vez de quedar como comando suelto, y por eso el workflow se escribe ahora. Es una mejora sobre el estado actual — donde no lo mira nada — no una garantía completa, y conviene no describirla como si lo fuera.
