## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- Los cuatro componentes existentes (`button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`) están hechos a mano: HTML semántico, clases de Tailwind respaldadas por tokens, sin ninguna librería headless. Ninguno necesitó gestionar un estado abierto/cerrado, un listbox, ni foco atrapado en un overlay.
- `packages/components/registry/definitions.ts` ya tiene el campo `npmDependencies` por entrada, y `packages/cli/src/commands/add.ts` ya imprime esa lista al agregar un componente (`Make sure these npm dependencies are installed: react`). El mecanismo para declarar una dependencia de runtime de terceros existe y no cambia.
- El contenido de documentación por componente (`content/{name}.ts`, `examples/{name}/*.tsx`) sigue un patrón fijo: `UsageGuidance`, `AnatomyContent` opcional, y una lista de `AccessibilityRow`. `content/index.ts` es un mapa explícito que hay que extender a mano por cada componente nuevo.
- El sitio deriva la tabla de props, el peso y el código fuente mostrado directamente del registro (`registry.json`), generado por `packages/components/registry/generate.ts` a partir de los tipos reales del componente. Esa derivación no se toca: Select y Combobox la heredan automáticamente en cuanto están en `definitions.ts`.

## Goals / Non-Goals

**Goals:**

- Que Select y Combobox cumplan accesibilidad de listbox/combobox real —foco, teclado, `aria-activedescendant` o equivalente, anuncio de estado— apoyándose en primitivas ya auditadas, no reimplementadas.
- Que la elección de base headless quede documentada como precedente: los once componentes restantes del núcleo que necesiten overlay (Modal, Drawer, Tooltip, Menu, Date field) parten de la misma decisión en vez de discutirla de nuevo cada vez.
- Que el umbral radios/Select/Combobox quede en la documentación como orientación accionable, no como texto suelto.

**Non-Goals:**

- No se construye el grupo de radios. Es un componente propio (Fase 2, mismo capítulo del documento) que queda para su propio change.
- No se resuelve todavía si Modal, Drawer, Tooltip y Menu también se apoyan en Radix. Es probable, dado que son la misma familia de problema (overlay, foco, posicionamiento), pero se decide en el change de cada uno — no todos comparten exactamente la misma primitiva de Radix.
- No cambia el mecanismo de distribución. El CLI sigue copiando código fuente; lo nuevo es que ese código fuente, para estos dos componentes, importa un paquete que el consumidor instala aparte, igual que ya instala `react`.

## Decisions

### Select y Combobox se construyen sobre primitivas de Radix, no a mano

`Select` se implementa sobre `@radix-ui/react-select`. `Combobox` se implementa sobre `@radix-ui/react-popover` para el posicionamiento y el cierre, y `cmdk` para la lista filtrable con tipeo — Radix Primitives no publica un combobox propio, y `cmdk` es la combinación que el propio ecosistema de Radix usa para ese patrón (es la misma base que usa shadcn/ui, la referencia visual que ya sigue Button).

*Por qué:* un listbox y un combobox accesibles de verdad exigen gestionar foco, `aria-activedescendant` o roving tabindex, tipeo para saltar a una opción, y comportamiento correcto de Escape y de click afuera. Es exactamente la clase de comportamiento que el documento fuente señala como la razón de adoptar una base headless (su Q3), y que hasta ahora este change no había necesitado poner a prueba porque Button e Input no lo requerían.

*Alternativa considerada:* construirlo a mano, como los cuatro componentes existentes. Se descarta para estos dos: el costo de acertar el patrón ARIA de combobox a mano es alto y el margen de error silencioso —funciona con mouse, falla con teclado o con lector de pantalla— es precisamente el tipo de defecto que una base auditada evita.

*Consecuencia:* es la primera vez que un componente del catálogo depende de algo más que `react`. El mecanismo para eso ya existe (`npmDependencies`); lo que cambia es que por primera vez tiene contenido.

### La dependencia se declara, no se oculta

`@radix-ui/react-select`, `@radix-ui/react-popover` y `cmdk` se declaran en `npmDependencies` de sus respectivas entradas del registro, y el CLI las lista al agregar el componente — el mismo mecanismo que ya usa para `react`. No se intenta empaquetarlas dentro del código copiado ni ocultar que existen.

*Por qué:* el requisito de distribución dice que el CLI copia código fuente editable, no que el componente no pueda tener dependencias. Ocultar la dependencia sería peor que declararla: un `import` que resuelve a un paquete no instalado rompe el build del consumidor sin explicación.

### El umbral se documenta en ambos componentes, no en una página aparte

La orientación "hasta 6 usa radios, de 7 a 20 Select, más de 20 Combobox" aparece en la guía de uso de Select y en la de Combobox, cada uno señalando cuándo el otro extremo es la opción correcta. No se crea una página de "patrones de selección" separada.

*Por qué:* es la misma estructura que ya usa `UsageGuidance` (`whenToUse` / `whenNotToUse`) para decidir cuándo un componente no es la herramienta correcta. El documento fuente trata esto como parte de la guía de uso del capítulo, no como un patrón aparte, y crear una página nueva es una decisión de alcance mayor que este change no necesita tomar.

### El vocabulario de madurez es `stable`/`beta`, no una traducción

`ComponentStatus` pasa de `"estable" | "beta"` a `"stable" | "beta"`, y los seis componentes del catálogo se actualizan a la vez — no solo Select y Combobox, que es lo que motivó revisar el campo.

*Por qué:* es la distinción que el ecosistema ya usa para esto — la misma que separa un dist-tag `latest` de uno `beta` en npm, o la que documentan Radix y MUI para sus propios componentes. Alguien que lee `stable` no necesita traducirlo para saber qué significa; alguien que lee `estable` sí, y además queda preguntándose si es un concepto propio del sistema o el estándar de siempre con otro nombre.

*Alternativa descartada:* `"latest"` en vez de `"stable"`. Se decidió no usarla porque nombra el eje equivocado: en npm, `latest` es una etiqueta de *versión* — cuál build es la más reciente publicada —, no de *madurez de API*. Un componente puede ser la versión más reciente y seguir en beta; ambos ejes son independientes, y usar `latest` para "la API ya no se mueve" produciría un campo que, para cualquiera que conozca la convención de npm, dice una cosa mientras comunica otra.

*Por qué los seis y no solo los dos nuevos:* dejar `Button`/`Input`/`Card`/`Badge` en `"estable"` mientras `Select`/`Combobox` estrenan `"stable"` deja el catálogo con dos idiomas para el mismo campo, hasta que otro change lo notara y lo corrigiera. Se resuelve ahora porque este change ya está tocando el campo para decidir el estado de los dos componentes nuevos.

*Consecuencia:* el chip de estado en la página de cada componente muestra el valor tal cual (`stable`/`beta`), sin traducir — es exactamente lo que se buscaba: el término se lee igual en el sitio que en cualquier changelog del ecosistema.

## Risks / Trade-offs

- **Tres paquetes nuevos en el árbol de dependencias del monorepo, y dos en el de cada consumidor que agregue Select o Combobox.** → Es el costo directo de la decisión de adoptar Radix; se acepta porque la alternativa (ARIA de combobox a mano) tiene más riesgo de accesibilidad real que de mantenimiento de dependencias.
- **`cmdk` no es de Radix, así que la garantía de "misma familia de primitivas" no es completa.** → Es la combinación estándar del ecosistema para este patrón exacto (Popover de Radix + lista de cmdk), no una elección aislada; se documenta en este design para que el próximo componente con overlay parta de la misma decisión informado, no la repita sin saber por qué.
- **El peso del componente (que el sitio ya muestra por cada uno) va a saltar respecto a los cuatro existentes**, porque ahora incluye una dependencia externa en el cálculo de qué copia el CLI. → No es un error: es la cifra honesta de lo que realmente se instala. No se oculta ni se recalcula aparte.

## Migration Plan

1. Agregar las dependencias de Radix y `cmdk` al paquete de componentes.
2. Construir `Select` sobre `@radix-ui/react-select`, con sus variantes, tamaños y el estado de carga.
3. Construir `Combobox` sobre `@radix-ui/react-popover` y `cmdk`, con filtrado, selección múltiple con chips, y estado sin resultados.
4. Registrar ambos en `definitions.ts` con sus `npmDependencies`, y regenerar `registry.json`.
5. Escribir el contenido de documentación de ambos: ejemplos, anatomía, notas de accesibilidad y guía de uso con el umbral cruzado entre los tres patrones.
6. Verificar el peso, la tabla de props derivada y el código fuente mostrado en el sitio para los dos componentes nuevos.

Cada paso deja el monorepo compilando. No hay paso que rompa hacia atrás: los cuatro componentes existentes no se tocan.

## Open Questions

Ninguna.
