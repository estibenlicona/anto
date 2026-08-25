## Context

`apps/docs` es una SPA de React + Vite que consume `@tuya-ui/tokens` y `@tuya-ui/components` del monorepo, y lee el manifiesto `registry.json` que genera `packages/components/registry/generate.ts`. Ese manifiesto ya es la fuente única compartida entre el CLI y el sitio, y hoy contiene nombre, categoría, descripción, dependencias y el contenido de los archivos fuente de cada componente. El sitio ya tiene temas claro/oscuro vía `data-theme`, header + sidebar, y un `CodeBlock` con resaltado que sigue el tema activo. Ver `proposal.md` - Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Que la documentación de API y los snippets no puedan quedar desincronizados del código: ambos se derivan del código real, no se transcriben a mano.
- Reusar el manifiesto existente como fuente única en vez de introducir un segundo canal de metadata entre `packages/components` y el sitio.
- Cubrir teclado y semántica en los controles nuevos (pestañas, búsqueda) sin sumar dependencias de UI.

**Non-Goals:**
- No se construye un playground editable en vivo (editar el código del ejemplo en el navegador y ver el resultado). Los ejemplos son estáticos y su código es de solo lectura.
- No se agrega búsqueda de texto completo sobre prosa ni indexado externo: el alcance es filtrar componentes y secciones conocidas.
- No se rediseña el sistema de tokens ni los componentes en sí; este change consume lo que ya existe.
- No se aborda el diseño responsive/mobile del sidebar y el índice lateral (sigue fuera de alcance, igual que en el change anterior).

## Decisions

### 1. Props extraídas de los tipos con `react-docgen-typescript`, dentro del generador del manifiesto
La extracción corre en `packages/components/registry/generate.ts`, que ya lee cada archivo fuente. Se agrega un campo `props` a cada entrada del manifiesto; el CLI simplemente lo ignora.

Configuración clave — `propFilter` descarta las props cuya declaración vive en `node_modules`:

```ts
propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes("node_modules")
```

Sin ese filtro, `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>` arrastraría cientos de atributos DOM declarados en `@types/react` y la tabla sería inservible. Con el filtro quedan solo las props propias (`variant`, `label`, `error`, …). Como contrapartida, props que el usuario sí usa pero vienen de React (`className`, `disabled`, `children`) tampoco aparecen: por eso cada tabla se acompaña de una nota que indica qué elemento HTML extiende el componente y que acepta todos sus atributos nativos — el mismo enfoque que usan shadcn/ui y Radix.

**Componentes sin props propias**: `Card`, `CardHeader`, `CardBody` y `CardFooter` solo extienden `HTMLAttributes<HTMLDivElement>`, así que su lista de props propias queda vacía de forma legítima. Para no confundir "no tiene props propias" con "falló la extracción", el generador SHALL emitir siempre el campo `props` (aunque sea un arreglo vacío) y fallar si algún componente del registro quedó sin analizar; el sitio muestra la nota de atributos heredados cuando el arreglo está vacío.

**Alternativa considerada**: declarar las props a mano en `registry/definitions.ts`. Descartada por decisión explícita del usuario y porque reintroduce exactamente el riesgo de desincronización que el requisito busca eliminar.

### 2. Ejemplos como módulos reales, con su código leído del mismo archivo
Cada ejemplo vive en su propio archivo bajo `apps/docs/src/examples/<componente>/<NN>-<slug>.tsx`, exporta por defecto el componente que se renderiza, y exporta un `meta` con su título y descripción:

```tsx
export const meta = { title: "Variantes", description: "..." };
export default function Example() { /* ... */ }
```

El sitio los recoge con dos globs sobre los mismos archivos — uno para el módulo ejecutable y otro para su texto fuente:

```ts
const modules = import.meta.glob("../examples/*/*.tsx", { eager: true });
const sources = import.meta.glob("../examples/*/*.tsx", { eager: true, query: "?raw", import: "default" });
```

Como el render y el snippet salen del mismo archivo, es estructuralmente imposible que difieran — que es justamente el escenario "el código mostrado corresponde al render" del spec. El prefijo numérico del nombre de archivo define el orden. Antes de mostrarlo se recorta del texto la sentencia `export const meta = …`, que es andamiaje del sitio y no parte del ejemplo; los `import` se conservan porque son parte de lo que alguien copiaría.

**Alternativa considerada**: declarar el código como string y evaluarlo en el navegador (estilo `react-live`). Descartada: agrega un evaluador en runtime y peso de bundle para resolver un problema que el `?raw` de Vite ya resuelve en build.

### 3. Guías de uso y notas de accesibilidad como módulos de contenido tipados
Contenido curado a mano en `apps/docs/src/content/<componente>.ts`, con una forma tipada compartida (`whenToUse`, `whenNotToUse`, pares `do`/`dont` con su justificación; y para accesibilidad, filas de teclado, atributos ARIA y notas de lector de pantalla). Un mapa por nombre de componente los enlaza al registro.

Cuando un componente no tiene contenido cargado, la pestaña muestra un estado explícito de "documentación pendiente" en vez de romper o aparecer vacía — así el faltante es visible y no silencioso.

**Alternativa considerada**: MDX. Descartada: requiere un plugin de Vite y pierde el chequeo de tipos sobre la forma del contenido, que aquí es estructurado (listas y pares contrastados) más que prosa larga.

### 4. Pestañas con estado en la URL, sin dependencias nuevas
La pestaña activa vive en un parámetro de búsqueda (`?tab=props`), leído y escrito con `useSearchParams` de `react-router-dom`, que ya es dependencia. Si el parámetro falta o no es válido, se cae a la pestaña de ejemplos.

El patrón accesible se implementa a mano: `role="tablist"` / `role="tab"` con `aria-selected` y `aria-controls`, `role="tabpanel"` con `aria-labelledby`, `tabindex` móvil y navegación con flechas, Home y End.

**Alternativa considerada**: rutas anidadas (`/components/button/props`). Igualmente enlazable, pero obliga a expandir la configuración de rutas; el parámetro de búsqueda logra lo mismo con menos superficie.

### 5. Búsqueda sobre el elemento `<dialog>` nativo
La búsqueda se monta en un `<dialog>` abierto con `showModal()`, que aporta atrapado de foco, cierre con Escape, fondo inerte y restauración del foco al disparador — todo sin librería de focus trap. El filtrado es coincidencia de subcadena sin distinguir mayúsculas sobre nombre, descripción y categoría de los componentes del manifiesto, más una lista estática de las secciones de tokens. Flechas para moverse entre resultados y Enter para navegar; el atajo global (Ctrl/Cmd + K) se registra en el layout.

### 6. Rutas y página de inicio
- `/` → inicio (introducción, instalación del CLI, accesos destacados)
- `/components` → catálogo
- `/components/:name` → detalle (misma forma que hoy)
- `/tokens` → tokens

El catálogo deja de vivir en `/`. No hace falta redirección: `/` sigue resolviendo, ahora al inicio, con el catálogo a un clic. El sidebar y el header se actualizan para reflejar las rutas nuevas.

### 7. Índice de página a partir de secciones declaradas
Cada página que quiera índice declara una sola vez su arreglo de secciones (`{ id, label }`) y lo usa tanto para renderizar el índice como para renderizar los encabezados con esos mismos `id` — así el índice no puede apuntar a un ancla inexistente. El resaltado de la sección visible usa `IntersectionObserver` sobre los elementos de sección. Las páginas que no declaran secciones no renderizan índice; la beneficiaria principal es la página de tokens, que hoy es un scroll muy largo.

**Alternativa considerada**: rastrear los encabezados del DOM tras el render. Descartada porque deja el índice dependiente de la estructura renderizada y falla silenciosamente si un encabezado cambia de nivel o de id.

### 8. Tipografía del sitio sobre la escala `heading.*`
El preset de Tailwind expone la escala de encabezados como utilidades compuestas, aprovechando que Tailwind admite tamaño + interlineado + peso en una sola entrada de `fontSize`:

```ts
"heading-large": [heading.large.fontSize, { lineHeight: heading.large.lineHeight, fontWeight: heading.large.fontWeight }]
```

Con eso, el sitio reemplaza combinaciones sueltas como `text-2xl font-bold` por una sola clase `text-heading-large`. Esto toca `packages/tokens`, pero es implementación de un requisito ya especificado en `design-tokens` ("usa un token `heading.*` en vez de combinar manualmente tamaño, peso y alto de línea"), no un cambio de comportamiento especificado — por eso este change no lleva delta de `design-tokens`.

### 9. Estados de interacción para el rol `danger`
La variante destructiva de Button necesita `hover` y `pressed`, que hasta ahora solo existían para `brand` y `neutral`. El diseño original dejó anotado que esos roles se ampliarían "cuando surja un caso de uso concreto"; este es ese caso, así que se agregan `background.danger.boldHover` y `background.danger.boldPressed`, derivados de la escala primitiva `danger` como el resto.

Los pasos elegidos deben mantener legible el texto fijo `text.danger.onBold` que ya se usa sobre el fondo destructivo, así que las combinaciones nuevas se suman a la lista de verificación de contraste — si un paso no alcanza el mínimo, el build falla en vez de publicar un botón ilegible.

### 10. Selector de tema como panel de opciones
El control de tema pasa de ser un botón que alterna a ser un botón que abre un panel con las opciones de modo de color, cada una con una miniatura que anticipa cómo se ve. Las opciones se implementan con `<input type="radio">` nativos dentro de un grupo etiquetado: eso da la semántica de "elegir uno entre varios" y la navegación con flechas sin escribir manejadores de teclado propios.

El panel se cierra con Escape y al hacer clic fuera, mediante un manejador sobre `document`. Se descartó la API nativa de Popover (`popovertarget`), que daría el cierre por luz automáticamente, porque los tipos de React 18 todavía no incluyen esos atributos y forzaría casts en el JSX.

**Alternativa considerada**: mantener el botón que alterna directamente. Descartada por pedido explícito: con más de dos modos previstos a futuro, un panel con opciones escala mejor que un interruptor.

### 11. Sub-elementos del componente activo en el sidebar
Bajo el componente que se está viendo, el sidebar despliega sus ejemplos —que son sus variaciones— tomados del mismo índice de ejemplos que alimenta la página de detalle. Solo se expande el componente activo: mantener todo desplegado convertiría el menú en una lista larga donde cuesta ubicarse.

Cada sub-elemento enlaza al ancla del ejemplo dentro de la pestaña de ejemplos, así que la navegación funciona igual desde el sidebar que desde el índice de la derecha.

### 12. Índice de página en el detalle de un componente
La página de detalle publica como secciones sus ejemplos, pero solo mientras la pestaña de ejemplos está activa: en las demás pestañas el contenido no tiene sub-secciones que valga la pena indexar, y dejar un índice obsoleto sería peor que no tenerlo. Se apoya en el mismo mecanismo de secciones declaradas que ya usa la página de tokens, así que los anclas y las entradas del índice siguen saliendo de una sola lista.

## Migration

El único cambio observable para alguien que ya usa el sitio es que `/` pasa de mostrar el catálogo a mostrar el inicio. No hay estado persistido que migrar; la preferencia de tema en `localStorage` sigue siendo válida sin cambios.

## Risks / Trade-offs

- **[Riesgo] `react-docgen-typescript` puede no extraer bien componentes envueltos en `forwardRef`** (`Button` e `Input` lo usan) → **Mitigación**: los componentes ya declaran `displayName`, que es lo que la herramienta usa para identificarlos; además el generador falla si algún componente del registro queda sin analizar, de modo que una extracción rota se detecta en el build y no se publica como tabla vacía.
- **[Riesgo] La tabla oculta props que el usuario sí usa** (`className`, `disabled`, `children`), por venir de `@types/react` → **Mitigación**: cada tabla declara qué elemento HTML extiende el componente y que acepta sus atributos nativos; sin el filtro la tabla sería ilegible, así que el intercambio es deliberado.
- **[Riesgo] Recortar el `meta` del texto del ejemplo es una transformación de texto frágil** → **Mitigación**: el recorte se aplica a una sentencia con una forma fija y conocida, y si no coincide el peor caso es cosmético (se muestra una línea de más), no un fallo funcional.
- **[Trade-off] Las guías de uso y las notas de accesibilidad son contenido manual** y se vuelven deuda cuando se agregan componentes → aceptado conscientemente; el estado "documentación pendiente" mantiene el faltante visible en vez de simularlo.
- **[Trade-off] Todos los ejemplos y el contenido se cargan de forma eager en el bundle** → aceptado por ahora: son módulos chicos frente a los ~250 KB actuales, y evita la complejidad de carga diferida en un sitio interno.
- **[Riesgo] El change es grande y toca casi todos los archivos del sitio** → **Mitigación**: las tareas están agrupadas para que cada grupo deje el sitio compilando y usable (primero el manifiesto y los datos, después la estructura, después cada pestaña), en vez de un único corte donde todo se rompe a la vez.

## Open Questions

- ¿La búsqueda debería, más adelante, indexar también nombres de props y el texto de las guías de uso, y no solo nombre/descripción/categoría de componentes y secciones? Es una ampliación posterior del mismo componente de búsqueda: no cambia los specs, el enfoque ni el desglose de tareas de esta iteración.
