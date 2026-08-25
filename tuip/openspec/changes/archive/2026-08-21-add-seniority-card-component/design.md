## Context

Ver `proposal.md — Why` para la motivación. Lo que sigue es el estado del repositorio que condiciona el cómo.

**El sistema ya tiene dos vocabularios de color fuera del semántico.** `identity-colors.ts` (doce tonos de Fluent, para distinguir personas) es el precedente estructural: archivo propio, prefijo propio de CSS Variable, función propia en el preset de Tailwind, y sus propios casos en `verify-tokens.ts`. `lib/categorical-color.ts` es un tercero, más liviano: seis nombres de tono que se resuelven contra familias semánticas existentes.

**Tailwind no genera clases construidas en runtime.** El preset reemplaza la paleta nativa en vez de extenderla, así que un color fuera del vocabulario no compila; y la contracara es que un `bg-accent-${tone}-fill` armado con template string no produce CSS. Todo componente que elige color por dato lo resuelve con un mapa literal de clases completas — está así en `avatar.tsx` y en `progress.tsx`, con el comentario que explica por qué.

**El CLI `tuip` no existe.** `packages/cli` no está en el monorepo; quedan `tokens` y `components`. La app consume `@tuya-ui/components` como dependencia de runtime (hoy vía `.tgz` local). El README todavía describe el flujo del CLI y el requisito `Tokens instalables en un proyecto consumidor` de `design-tokens` todavía dice "mediante el CLI": deuda anterior a esta HU, no se toca acá.

**Ningún paquete del monorepo tiene runner de pruebas.** `pnpm test` corre `tsc --noEmit` en `components`, `verify-tokens.ts` en `tokens`, y la auditoría de dependencias en la raíz. La DoD de la HU pide pruebas automatizadas de dimensión fija, escala cerrada y contraste — dos de las tres necesitan renderizar.

**La escala de espaciado ya tiene el paso que la HU pide.** El gap de 4 px de CA3 es exactamente `spaceAlias.hug`, disponible como `gap-hug`. El alias `space.tight` que la HU nombra no existe y no hace falta inventarlo.

**La revisión visual cambió la pieza.** Este documento refleja el diseño después de esa revisión: la card perdió el fondo teñido, el borde y la sombra, y su etiqueta pasó a texto neutro. Lo que sigue explica qué arrastró cada una de esas decisiones, porque entre las tres reescribieron buena parte de EXT-1 y EXT-2.

## Goals / Non-Goals

**Goals:**

- Que la paleta de acento entre como vocabulario de primera clase —distribuido, tipado, verificado, documentado— y no como cuatro constantes dentro del componente.
- Que `SeniorityCard` no contenga ninguna decisión visual propia: color, medida y espaciado salen del sistema, y la pieza sólo los compone.
- Que `LevelMeter` sirva a la próxima escala de cuatro pasos sin tocarlo, y a una de cinco cambiando un número.
- Que las tres garantías que la HU exige por prueba —dimensión, escala cerrada, contraste— fallen el build cuando se rompan.

**Non-Goals:**

- Reconstruir el CLI. Ver `proposal.md — Distribución`.
- Rehacer el vocabulario categórico existente ni fusionarlo con el de acento.
- Extender `Card`, publicar los pasos `ink` y `surface`, o implementar el estado seleccionado. Los tres estaban en el alcance original y salieron tras la revisión visual; el porqué está en las decisiones 1, 3 y 6.

## Decisions

### 1. La card no es una superficie: es un bloque de contenido

Ésta es la decisión de la que cuelgan casi todas las demás. Tras la revisión visual la pieza queda sin fondo, sin borde y sin sombra: la etiqueta del nivel y, debajo, los cuatro segmentos. Nada más.

La consecuencia inmediata es que **no compone `Card`**. `Card` existe para aportar exactamente los tres elementos que se eliminaron; componerla para después apagarlos con `shadow-none` y un tono transparente sería usar una pieza por su caja y luego negarla. `SeniorityCard` pasa a renderizar un contenedor plano con las medidas de su capa de token.

Eso deja **EXT-2 sin su primer entregable**: la HU pide extender la card base con `tone` y `density` para que la seniority-card se apoye en una superficie teñida. Sin superficie teñida, esas dos props no tienen consumidor. Se retiran del alcance en vez de dejarlas como API que el catálogo publica y nadie usa — una prop sin consumidor no se puede evolucionar con confianza, porque nada la ejercita. Lo que sobrevive de EXT-2 es su tercer punto, que era el que tenía valor propio: publicar `level-meter` como pieza reutilizable.

**Alternativa considerada:** dejar la extensión de `Card` igual, cumpliendo EXT-2 al pie de la letra y anticipando el próximo patrón teñido. Descartada: el sistema ya tiene la respuesta para cuando ese patrón aparezca —extender `Card` entonces, con un consumidor real que diga qué necesita— y hoy sólo agregaría superficie de API que mantener.

El nombre `SeniorityCard` se conserva pese a que ya no es una card. Renombrarlo es un cambio de API pública con su propio costo, y la HU llama a la pieza "card de seniority"; el comentario del componente aclara qué es y qué no.

### 2. La paleta de acento es un vocabulario propio, no una relectura de familias existentes

La HU pide `accent.slate`, `accent.blue`, `accent.teal` y `accent.purple`, y dos de esos cuatro se parecen a algo que ya existe: el relleno de `slate` cae cerca de la rampa neutra, y `accent.blue` (`#3B7ACB`) queda a un paso de `info` (`#5A94EC`).

**Se implementa como familia propia**, en `packages/tokens/src/accent-colors.ts`. La razón es que la escala tiene que leerse como **una sola progresión con pasos parejos**: los cuatro matices comparten tratamiento porque están pensados como cuatro posiciones de la misma escala, no como cuatro familias sueltas que casualmente aparecen juntas. Armarla prestando `neutral`, `info` y `discovery` la ataría a tres decisiones que se toman por otros motivos: el día que `info` se recalibre para un banner, el segundo escalón del seniority se movería sin que nadie lo haya pedido.

**Sobre el parecido con `CategoricalColor`:** ahora que cada matiz tiene un solo paso, los dos vocabularios se parecen bastante — ambos son listas de tonos sin significado de estado. Lo que los separa es que éste tiene **orden**. `CategoricalColor` responde "¿es éste el mismo que aquél?" y sus nombres son intercambiables; `accent` responde "¿cuánto?" y su orden es el dato. Reordenar `accent` le cambia el tono a todos los niveles; reordenar `CategoricalColor` no cambia nada. Esa diferencia justifica los dos vocabularios incluso con un paso cada uno, pero conviene revisarla si `accent` no gana un segundo consumidor.

### 3. Un solo paso por matiz, y sólo porque hay algo que lo usa

EXT-1 pide tres pasos por matiz: `ink 600` para texto, `fill 400` para gráficos, `surface 50` para fondos. Entra uno.

- `surface` se cayó con la Decisión 1: no hay fondo teñido que pintar.
- `ink` se cayó con la etiqueta en texto neutro (Decisión 4): no hay texto teñido que pintar.

Queda `fill`, que es lo que tiñe los segmentos. La regla aplicada es la que el resto del sistema de tokens ya sigue: **un token entra cuando algo lo usa.** Publicar `ink` y `surface` "porque la tabla los lista" produciría tres cuartas partes de una paleta que nadie ejercita, sin nadie que note si su valor deja de servir. Los dos valores quedan registrados en el `proposal.md` para cuando aparezca el patrón que los pida.

El nombre conserva el rol del paso (`--color-accent-blue-fill`, no `--color-accent-blue`). Es la convención del sistema —el nombre dice para qué sirve— y además evita que agregar `ink` mañana obligue a renombrar lo que ya está distribuido.

### 4. La etiqueta va en texto neutro

Todos los niveles usan el mismo color de texto del sistema. El matiz queda exclusivamente en el medidor.

Además de ser lo que se pidió, tiene una consecuencia buena: el contraste de la etiqueta deja de depender del matiz. Con la etiqueta teñida había que verificar cuatro colores de texto contra cada superficie posible, y el más flojo (`teal`, 5.61:1) marcaba el piso. Con texto neutro se verifica el token de texto que ya está verificado, y lo único que queda por medir de la paleta es el relleno de los segmentos.

El estado vacío conserva el texto neutro **atenuado** en vez del normal: la ausencia de dato se lee más callada que un nivel real, que es lo que corresponde, y no compite en la columna con las filas que sí tienen nivel.

### 5. La paleta es independiente del tema

Con un solo paso y sin superficie propia, el valor de cada matiz tiene que funcionar sobre lo que sea que haya debajo. Se midió contra las cuatro superficies del sistema donde la pieza puede caer:

| Matiz | Fila blanca | Lienzo | Fila seleccionada | Fila oscura |
| --- | --- | --- | --- | --- |
| `slate` | 3.38:1 | 3.24:1 | 3.08:1 | 5.29:1 |
| `blue` | 4.35:1 | 4.17:1 | 3.96:1 | 4.11:1 |
| `teal` | 3.46:1 | 3.32:1 | 3.15:1 | 5.17:1 |
| `purple` | 4.38:1 | 4.20:1 | 3.99:1 | 4.08:1 |

Los cuatro pasan el mínimo de 3:1 en todas, así que **un valor por matiz sirve en los dos temas**. No hay asignación por tema como en la capa semántica ni derivación como en identidad: hay un valor, y `accent-colors.ts` es un mapa de constantes sin lógica.

Eso también retira una deuda que el diseño anterior cargaba: los valores de modo oscuro se derivaban por una regla escrita acá porque la HU sólo traía los claros, y quedaban marcados como "no aprobados por diseño". Ya no hacen falta.

`slate` es el más ajustado (3.08:1 sobre la fila seleccionada, contra un piso de 3:1). La verificación mide esa combinación explícitamente, así que un futuro cambio de la superficie de selección o del matiz falla el build en vez de degradarse en silencio.

### 6. El estado seleccionado sale del alcance

CA7 pide que la card refuerce con doble aro del propio tono al elegirse en un formulario o al seleccionarse su fila. Ninguno de los dos casos existe: el formulario no adopta la pieza (ver el change de la app) y el listado no tiene selección de fila. Y sin caja, un doble aro no tendría dónde apoyarse — rodearía el texto y los segmentos, no un borde.

Se documenta como no implementado con su motivo, en vez de inventar un refuerzo para un estado que nada dispara. Si mañana el listado gana selección de fila, lo que corresponde es resolverlo ahí con lo que el sistema ya usa para una fila activa, y decidir entonces si la pieza necesita algo propio.

### 7. Las medidas fijas entran como capa de token de componente

116 px de ancho, 44 px de alto en densidad amplia y 36 px en compacta. Ninguna sale de una escala existente: `controlHeight` tiene 32/40/48. Escribirlas como `w-[116px]` dentro del componente sería exactamente el "valor local" que los guardarraíles de la HU prohíben, así que se declaran en la tercera capa que `design-tokens` ya admite.

El alto fijo se conserva aunque ya no haya caja que dibujar, y vale decir por qué: mantiene parejas las filas de un listado. Sin él, una fila con nivel y otra sin nivel podrían medir distinto y la columna dejaría de leerse como una columna. Dos observaciones que conviene no perder: 44 px coincide exactamente con `touchTarget`, y 36 px es el único de los tres que no coincide con nada del sistema — si aparece un segundo componente que lo necesite, la corrección correcta es extender `controlHeight`, no duplicar el token.

### 8. `LevelMeter` es pieza nueva, no una variante de `SegmentedBar`

`SegmentedBar` reparte un ancho proporcional a valores: sus segmentos son desiguales por diseño y suman un total. `LevelMeter` cuenta pasos de una escala ordinal: sus segmentos son iguales y lo que varía es cuántos están llenos. Meter las dos lecturas en un componente exigiría una prop que cambie el significado de `segments`, que es la clase de bifurcación que la HU pide evitar. Se publican separados y la documentación establece cuál es cuál (requisito propio en el spec).

`steps` con default 4 existe desde el principio, no como previsión vaga: es la mitigación que la propia HU nombra para el riesgo Bajo. `SeniorityCard` no lo expone — su escala es cerrada.

El aro de los segmentos vacíos sigue siendo necesario aunque ya no haya fondo teñido: el relleno del segmento vacío es la misma superficie neutra que tiene debajo, así que sin aro no habría nada que ver. Es el borde neutro fuerte, que ya cambia solo entre temas y ya está verificado.

### 9. La verificación anti-hex es un script, no una regla de ESLint

`verify-tokens.ts` ya establece la forma en que este repositorio verifica invariantes del sistema de diseño: un script con salida legible, enganchado a `pnpm test`, que falla con el archivo y la línea. Escribir una regla de ESLint personalizada obligaría a montar un plugin local para una sola regla, y la config actual es deliberadamente mínima.

El script recorre `packages/components/src/**` **ignorando comentarios**. Hay exactamente una ocurrencia de un hexadecimal en todo el fuente de componentes, y está en un comentario de `navbar.tsx` que cita el valor de `neutral.800` para explicar una decisión. Esa explicación es útil y no pinta nada; la regla persigue el color que se renderiza, no el que se menciona. El spec lo dice explícitamente para que no se lea como un agujero.

### 10. Entra vitest en `packages/components`

Dos de las tres pruebas que la DoD exige —dimensión fija y escala cerrada con su estado vacío— necesitan renderizar. No hay runner en el monorepo, así que este change agrega vitest y testing-library como devDependencies de `packages/components`, y `test` pasa a correr `tsc --noEmit` **y** la suite.

**Alternativa considerada:** verificar las clases que el componente emite, con funciones puras y sin DOM. No agrega dependencias, pero compara cadenas: no vería que la utilidad dejó de existir en el preset, ni que el token cambió de valor. Descartada por eso.

**Con un límite que conviene dejar escrito:** jsdom no tiene motor de layout, así que ninguna prueba de este repositorio mide píxeles pintados — `getBoundingClientRect()` devuelve ceros. Lo que jsdom sí hace es la cascada de CSS, así que `getComputedStyle().width` devuelve lo que una hoja de estilos le haya asignado. El setup de la suite genera esa hoja **desde el preset de Tailwind**, el mismo objeto que consume el build, y las pruebas afirman contra ella. Eso cubre lo que la garantía necesita —que los cuatro niveles pidan la misma medida, que la etiqueta no la mueva, que cada densidad tome la suya, y que el valor salga del token— y no cubre lo que haría falta un navegador para ver. Eso queda para la revisión visual del sitio.

La tercera prueba, la de contraste, **no** va acá: el contraste de la pieza está enteramente determinado por pares de tokens, y el lugar donde se mide contraste en este repositorio es `verify-tokens.ts`, que ya tiene el helper. Se agregan ahí los pares de cada matiz contra cada superficie.

### 11. Decisiones menores registradas como supuestos

La HU no las fija; se resuelven así y quedan visibles por si diseño quiere otra cosa:

- **Estado vacío (CA2):** etiqueta `Sin nivel` en texto neutro atenuado y cuatro segmentos vacíos. Ocupa la misma dimensión fija, para que una fila sin dato no rompa la alineación de la columna.
- **Variante de ancho reducido (CA5):** se pide con una prop que oculta la etiqueta; la pieza toma entonces su propio ancho fijo, más angosto, y el nombre del nivel viaja en `aria-label` y en el tooltip. La HU la nombra pero no le da medida.
- **Valores de entrada:** la pieza recibe el nivel por su nombre de la escala (`"Principiante" | "Competente" | "Avanzado" | "Experto"`), no por el número 1–4. El número es una convención del backend de la app; mapearlo es trabajo del consumidor, y meterlo en el sistema de diseño ataría el componente a un esquema de datos ajeno.

## Risks / Trade-offs

- **`accent.*` se usa como estado, pese a todo** → Nombre sin semántica, prefijo propio, advertencia explícita en fundamentos exigida por spec. La regla de lint que la HU propone (prohibir `accent.*` en componentes de estado) no se implementa: no hay forma barata de decidir automáticamente qué componente "es de estado", y una lista mantenida a mano envejece peor que la documentación. Se deja como control de revisión, no automatizado — desviación consciente respecto de la mitigación que propone la HU.
- **Un vocabulario nuevo de cuatro tonos con un paso cada uno** → Es poca sustancia para una familia propia, y se parece a `CategoricalColor`. Mitigación: lo que lo distingue está escrito (Decisión 2) y la página de fundamentos los presenta juntos como escala ordenada. Si `accent` no gana un segundo consumidor, conviene revisar si no debería ser una variante ordenada del vocabulario categórico.
- **`slate` queda a 3.08:1 sobre la fila seleccionada** → Pasa, pero con 0.08 de margen. La verificación mide esa combinación explícitamente, así que se entera el build y no el usuario.
- **Primer runner de pruebas del monorepo** → Alcance acotado a `packages/components`; `turbo run test` ya orquesta el script de cada paquete, así que CI lo levanta sin cambios en el workflow.
- **La verificación anti-hex puede fallar en código existente** → Se corrió la búsqueda: hay una sola ocurrencia y es un comentario, que la regla ignora por diseño.
- **CA7 queda sin implementar** → La HU lo lista como criterio de aceptación. Se documenta el motivo en el `proposal.md` y en la revisión de DoD; no se cierra como si estuviera hecho.
- **Sin caja, la pieza depende de que su contenedor la separe** → Un bloque sin borde pegado a otro contenido se lee peor que uno con contorno. En una celda de tabla el padding de la celda ya lo resuelve; fuera de una tabla, es responsabilidad de quien la coloca. La documentación lo dice en la guía de uso.

## Migration Plan

Ningún cambio rompe la API pública: la familia `accent` sólo agrega tokens y los dos componentes son nuevos.

1. `@tuya-ui/tokens` y `@tuya-ui/components` suben `MINOR` vía changeset.
2. Se reconstruye el pipeline (`tokens → components`), que regenera `tokens.css`, el `registry.json` y la Skill.
3. Se republica el `.tgz` local (`pnpm run publish:local`) para que la app pueda tomarlo.
4. La app actualiza su dependencia en su propio change.

Rollback: revertir el changeset y republicar la versión anterior. No hay migración de datos ni estado persistido.

## Open Questions

- **El ancho de la variante reducida (CA5)** no está en la HU. Se implementa con un valor fijo propio y queda como token de componente; ajustarlo después es cambiar un número en un solo lugar.
- **La correspondencia entre seniority y nivel SFIA** sigue sin acordarse con Gestión Humana (riesgo Medio de la HU). No afecta a este change: la pieza muestra el nivel de seniority y nada más.
