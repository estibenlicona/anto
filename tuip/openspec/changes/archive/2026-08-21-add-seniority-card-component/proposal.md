## Why

El listado de personas necesita mostrar el nivel de seniority (Principiante, Competente, Avanzado, Experto) de forma comparable entre filas, y hoy el catálogo no tiene con qué. Cada pantalla lo resuelve por su cuenta: en unas es texto plano, en otras un `Badge` — y `Badge` ya está ocupado por el estado del elemento, así que un badge de seniority y un badge de vinculación conviven en la misma fila diciendo cosas distintas con el mismo vocabulario visual.

El patrón que falta es una pieza de ancho fijo con la etiqueta del nivel y cuatro segmentos que marcan su posición en la escala. No existe en la biblioteca y su paleta excede la actual, así que el change cubre las tres capas del sistema: tokens, componentes y distribución (HU TUIP-214).

## What Changes

### Paleta de acento (EXT-1)

- **Familia de color `accent` nueva, sin significado de estado.** Cuatro matices —`slate`, `blue`, `teal`, `purple`— con **un paso cada uno**: `fill`, el relleno de los segmentos. Vive en su propio archivo (`packages/tokens/src/accent-colors.ts`) y bajo su propio prefijo de CSS Variable (`--color-accent-blue-fill`), siguiendo el precedente de `identity-colors.ts`: un vocabulario aparte del semántico, con su propio prefijo, precisamente para que nadie pueda pedir "accent" donde quería decir "danger".
- **Es independiente del tema.** Un mismo valor por matiz sirve en claro y en oscuro, porque el paso `fill` supera el mínimo de 3:1 sobre las cuatro superficies donde la pieza puede caer: la fila blanca (3.38–4.38:1), el lienzo de la página (3.24–4.20:1), la fila seleccionada (3.08–3.99:1) y la fila en tema oscuro (4.08–5.29:1). No hay una asignación por tema como en la capa semántica ni una derivación como en identidad — hay un valor.
- **Se documenta explícitamente que `accent.*` no significa estado**: no reemplaza a `success`, `warning`, `danger` ni `info`.

**Desviación respecto de la HU, deliberada.** EXT-1 pide tres pasos por matiz (`ink 600` para texto, `fill 400` para gráficos, `surface 50` para fondos). Entra sólo `fill`, porque tras la revisión visual la pieza perdió el fondo teñido y su etiqueta pasó a texto neutro: ni `surface` ni `ink` tienen consumidor. La regla que se aplicó es la misma que el resto del sistema de tokens sigue —un token entra cuando algo lo usa, no por completar una tabla—, y los otros dos pasos quedan registrados acá para cuando aparezca el patrón que sí los necesite.

`accent.slate` reusa un valor cercano a los primitivos neutros y `accent.blue` queda a un paso de `info`. Se acepta esa cercanía a cambio de que la progresión gris → azul → turquesa → morado se lea como **una sola escala** con pasos parejos; una escala armada con familias prestadas no tendría por qué mantener esa paridad cuando cualquiera de ellas se recalibre. La decisión y su alternativa quedan en `design.md`.

### Componentes (EXT-2)

- **`LevelMeter` nuevo, como pieza independiente.** El medidor de segmentos discretos —N pasos de igual ancho, los llenos con el matiz, los vacíos claros con aro— se publica por separado para reutilizarlo en criticidad, madurez y cualquier escala futura. Acepta `steps` (por defecto 4) justamente para no quedar atado a la escala de seniority. Es una pieza distinta de `SegmentedBar`, que reparte un ancho **proporcional a valores** y no cuenta pasos discretos.
- **`SeniorityCard` nuevo.** Ancho y alto fijos, etiqueta del nivel en texto neutro y, debajo, el medidor de cuatro segmentos teñido según el nivel. Escala cerrada de cuatro; un valor fuera de ella renderiza el estado vacío documentado.
- **`Card` no se toca.** La HU pide en EXT-2 extender la card base con `tone` y `density` para que `SeniorityCard` se apoye en una superficie teñida. Esa superficie ya no existe: la pieza no dibuja borde ni fondo, así que componer `Card` sólo le agregaría un contorno y una sombra que hay que apagar. La extensión se retira del alcance en vez de dejarla como API sin consumidor.

### Distribución (EXT-3, ajustado al proyecto actual)

La HU escribe CA8 y EXT-3 en términos del CLI `tuip` (`tuip add`, `tuip list`, `tuip update --tokens-only`, `tuip diff`). **Ese CLI ya no existe**: fue reemplazado deliberadamente por el paquete publicado `@tuya-ui/components` (`packages/cli` no está en el monorepo; la app lo consume como dependencia de runtime). Los criterios se cumplen con el mecanismo vigente, que resuelve la misma intención:

- **CA8 → el componente viaja en el paquete.** `SeniorityCard` y `LevelMeter` se exportan desde `@tuya-ui/components` y se declaran en `registry/definitions.ts`, el manifiesto que alimenta el catálogo del sitio, la búsqueda y la Skill de Claude generada — el mismo inventario que antes leía `tuip list`. Cada uno declara su estado de madurez y sus dependencias internas.
- **EXT-3 → los tokens propagan por versión, no por comando.** La adición de la familia `accent` es **puramente aditiva**: ningún token existente cambia de valor ni de nombre, así que un consumidor que sube la versión de `@tuya-ui/tokens` recibe el matiz nuevo sin que nada suyo se pise. Es la garantía que buscaba `tuip update --tokens-only`, obtenida por construcción en vez de por un flag. El changeset y el changelog cumplen el rol de `tuip diff`.
- **La regla de lint sí se implementa literalmente.** Hoy "sin valores de estilo embebidos que no provengan de un token" es una regla en prosa que nadie verifica. Este change la vuelve una verificación automática que falla el build cuando el código fuente de un componente contiene un literal hexadecimal, que es lo que sostiene CA9 más allá de la revisión manual.

### Documentación

- **Ficha de `SeniorityCard` y de `LevelMeter`** en el sitio, con las pestañas Uso, Anatomía, API y Accesibilidad que el sitio ya genera para todo componente, más sus ejemplos ejecutables.
- **La página de color de Fundamentos suma la paleta de acento**, con su contraste medido y la advertencia explícita de que no es un vocabulario de estado.

### Fuera de alcance de este change

- **El estado seleccionado de la card (CA7).** Existía para elegir el nivel en un formulario; el formulario no adopta la pieza (ver el change de la app), y el listado no tiene selección de fila. Un doble aro sobre un bloque sin caja tampoco tendría dónde apoyarse. Queda documentado como no implementado, con su motivo.
- **Extender `Card` con `tone` y `density`** (parte de EXT-2), por lo dicho arriba.
- **Los pasos `ink` y `surface` de la paleta de acento** (parte de EXT-1), por lo dicho arriba.
- **Adoptar la pieza en el listado de personas** (último punto de la DoD de la HU): vive en el repo de la app, que solo puede consumirla una vez publicada la versión. Va como change propio en `app-gestion-capacidad` — `adopt-seniority-card-in-people`.
- **Editar el seniority desde el listado**, historial de cambios de nivel, mapeo automático entre seniority y nivel SFIA, y cards de nivel para entidades distintas de personas — fuera de alcance por la propia HU.
- **Revisar el requisito `Tokens instalables en un proyecto consumidor`** de `design-tokens`, que todavía habla del CLI retirado. Es deuda real y anterior a esta HU; corregirla acá mezclaría dos motivos de cambio.

## Capabilities

### Modified Capabilities

- `design-tokens`: se agrega la familia de acento como vocabulario propio sin significado de estado, con un paso por matiz e independiente del tema (ADDED); la verificación automática de contraste deja de estar acotada a las combinaciones semánticas y pasa a cubrir toda combinación documentada, incluidos los vocabularios no semánticos (MODIFIED).
- `component-library`: se agregan `LevelMeter` y `SeniorityCard` (ADDED); la prohibición de valores de color embebidos pasa de regla en prosa a verificación automática de build (MODIFIED).
- `docs-site`: la página de color de fundamentos documenta además la paleta de acento, su contraste medido y su distinción explícita respecto de las paletas semánticas (MODIFIED).

## Impact

- **Tokens** (`packages/tokens`): nuevo `src/accent-colors.ts`; exports en `src/tokens.ts`; emisión de CSS Variables en `scripts/generate-css.ts` bajo el segmento `accent`, en el bloque independiente del tema; utilidades de Tailwind en `src/tailwind-preset.ts`; casos de contraste nuevos en `scripts/verify-tokens.ts`, medidos contra las superficies donde la pieza se apoya.
- **Componentes** (`packages/components`): nuevos `src/level-meter.tsx` y `src/seniority-card.tsx`; nuevo `src/lib/accent-tone.ts` con el vocabulario de tonos y el mapeo literal de clases que Tailwind necesita; barrel `src/index.ts`; entradas nuevas en `registry/definitions.ts`; verificación anti-hex nueva enganchada al script de test del paquete. **`src/card.tsx` no cambia.**
- **Documentación** (`apps/docs`): fichas y ejemplos de los dos componentes nuevos; contenido nuevo en `src/content/fundamentos.tsx` para la paleta de acento; registro en `src/content/index.ts`.
- **Compatibilidad**: ningún cambio rompe la API pública. La familia `accent` sólo agrega tokens y los dos componentes son nuevos. Corresponde un `MINOR` en `@tuya-ui/components` y en `@tuya-ui/tokens`.
- **Consumidores**: la app `app-gestion-capacidad` recibe los cambios recién al actualizar su dependencia; nada de lo que ya usa cambia de aspecto al hacerlo.
