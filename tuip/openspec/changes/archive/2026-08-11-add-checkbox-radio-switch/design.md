## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- `add-select-and-combobox` estableció el precedente: adoptar una primitiva de Radix cuando el patrón de accesibilidad es difícil de acertar a mano (listbox, combobox), y construir a mano cuando el elemento HTML nativo ya resuelve el problema. Este change es la primera vez que ese criterio se aplica a un grupo de componentes que no son todos iguales entre sí: dos de los tres (Checkbox, Radio) tienen equivalente HTML nativo con teclado y semántica correctos de fábrica; el tercero (Switch) no.
- `Select` fijó el patrón de "un componente, un array de opciones" (`options: SelectOption[]`) en vez de exponer sub-componentes que el consumidor ensambla. `RadioGroup` sigue el mismo patrón por la misma razón: un grupo de radios es, para quien lo consume, una sola decisión con una lista de alternativas — no una colección de `Radio` sueltos que hay que conectar a mano por `name`.
- El campo `ComponentStatus` es `"stable" | "beta"` (ver `add-select-and-combobox`), un juicio del equipo declarado en el registro, no derivado. Los tres componentes de este change entran directo como `stable`.

## Goals / Non-Goals

**Goals:**

- Que Checkbox y Radio hereden gratis la accesibilidad del `<input>` nativo, sin reimplementar lo que el navegador ya resuelve.
- Que Switch, el único de los tres sin equivalente nativo, se apoye en la misma familia de primitivas que ya se adoptó y verificó para Select y Combobox, en vez de abrir una tercera fuente de patrones de accesibilidad.
- Que la distinción de uso entre Checkbox y Switch —instantáneo vs. requiere guardar— quede en la documentación de ambos, no solo en uno.

**Non-Goals:**

- No se expone un componente `Radio` individual en el catálogo. `RadioGroup` es la única forma de usar radios; si en el futuro aparece un caso real que necesite radios sueltos fuera de un grupo, se reconsidera con su propio change.
- No se resuelve el estado de error para estos tres componentes más allá de lo que la definición ilustra (ninguno muestra mensaje de error en el documento fuente). Si aparece la necesidad, es una extensión futura, no algo que este change tenga que anticipar.
- No cambia ningún componente existente. Button, Input, Card, Badge, Select y Combobox no se tocan.

## Decisions

### Checkbox y Radio se construyen a mano; Switch se apoya en Radix

`Checkbox` envuelve un `<input type="checkbox">` y `RadioGroup` un conjunto de `<input type="radio">` que comparten `name` — ambos con la semántica y el teclado que el navegador ya provee sin código adicional. `Switch` se implementa sobre `@radix-ui/react-switch`, que resuelve `role="switch"`, `aria-checked` y el manejo de teclado (Espacio y Enter) sin que haya que construirlo a mano.

*Por qué:* es el mismo criterio de `add-select-and-combobox`, aplicado componente por componente en vez de como política general. Un `<input>` nativo ya es accesible; envolverlo en una librería headless no agrega nada y sí agrega peso. Un `role="switch"` a mano es una superficie de accesibilidad chica —mucho más chica que un combobox—, pero ya existe una primitiva de la misma familia que el catálogo ya adoptó y ya declaró como dependencia aceptable, así que reusarla cuesta menos que mantener una segunda implementación de un patrón que Radix ya resolvió.

*Alternativa considerada para Switch:* construirlo a mano, como Checkbox y Radio. Se consideró viable —el patrón `role="switch"` es acotado y bien documentado—, pero se prefirió Radix porque el catálogo ya paga el costo de esa dependencia desde Select, y sumar un componente más a la misma familia no es un costo nuevo, mientras que mantener dos filosofías de construcción (nativo vs. Radix) para tres componentes muy parecidos entre sí sí lo sería para quien lea el código más adelante.

### El indeterminado de Checkbox se fija por ref, no por prop

El estado indeterminado de un `<input type="checkbox">` no existe como atributo de HTML ni como prop controlable por JSX estándar — se asigna imperativamente sobre el nodo DOM (`element.indeterminate = true`). `Checkbox` expone una prop `indeterminate` y la aplica internamente vía `useEffect` sobre un ref.

*Por qué:* es la única forma que el navegador ofrece. No hay alternativa declarativa real; documentarlo así es más honesto que fingir que es una prop común.

### RadioGroup es un componente, no un Radio suelto

`RadioGroup` recibe `options: RadioOption[]` (mismo shape que `SelectOption`: `value`, `label`, `disabled?`) y gestiona la selección como una unidad, igual que `Select`.

*Por qué:* la definición nunca ilustra un radio suelto — siempre aparece como parte de un grupo con una pregunta común ("Transformación / BAU / Sin clasificar"). Exponer un `Radio` individual invitaría a ensamblarlo a mano con el riesgo de romper el `name` compartido o el orden de tabulación, que es exactamente el tipo de error silencioso que agrupar en un solo componente evita.

*Alternativa considerada:* `RadioGroup` + `RadioGroupItem` compuestos, al estilo de `Card`/`CardHeader`. Se descarta por ahora: a diferencia de `Card`, donde cada parte tiene layout propio que vale la pena componer, las opciones de un radio group son intercambiables entre sí — no hay nada que un `RadioGroupItem` suelto necesite exponer que `options` no cubra ya.

### La distinción Checkbox/Switch se documenta en ambos, cruzada

Igual que el umbral radios/Select/Combobox del change anterior: la guía de uso de Checkbox menciona cuándo corresponde Switch, y la de Switch menciona cuándo corresponde Checkbox.

*Por qué:* es la misma decisión ya tomada y ya funcionando — dos componentes que resuelven casos vecinos se orientan mutuamente, en vez de una tercera página de "patrones" que nadie pediría abrir.

### El estado apagado de Switch usa un tinte de marca, no gris neutro puro

`Switch` en apagado usa dos tokens a nivel de componente — `trackOff` (`brand.100`) y
`thumbOff` (`brand.700`) — en vez de la combinación anterior (`background.neutral.default`
para el track, `text.neutral.inverse` para el thumb). El estado encendido no cambia.

*Por qué:* referencia visual aportada explícitamente por el equipo (tres combinaciones
comparadas: gris neutro, gris azulado, derivado de marca). Se eligió la derivada de marca
porque ata el interruptor a la identidad del sistema incluso en reposo, en vez de un gris
genérico que podría venir de cualquier librería. Los valores exactos de la referencia no
coinciden con ningún primitivo ya definido (la opción de gris azulado, en particular, es la
escala `slate` de Tailwind, ajena a la paleta del sistema); se usan los primitivos `brand.100`
y `brand.700` ya existentes, los más cercanos en el mismo tono, en vez de introducir hex
sueltos o una escala nueva.

*Alternativa considerada:* reutilizar los tokens semánticos ya expuestos
(`background.brand.subtle` = `brand.50`, `background.brand.boldHover` = `brand.700`). Se
descarta reutilizar `boldHover` para un estado de reposo: ese token comunica "este es el tono
al pasar el mouse", no "este es el color del thumb apagado", y usarlo así sería una lectura
falsa para quien lea el código más adelante. Se prefieren dos tokens nuevos a nivel de
componente — la tercera capa que la arquitectura de tokens ya reserva para exactamente este
caso: un valor que ningún rol semántico general nombra.

## Risks / Trade-offs

- **Una dependencia más (`@radix-ui/react-switch`) por un componente cuyo patrón de accesibilidad es simple.** → Aceptado porque el costo marginal de sumar un paquete a una familia ya adoptada es menor que el de mantener una segunda filosofía de construcción para un solo componente.
- **`RadioGroup` sin sub-componentes limita la personalización por opción** (por ejemplo, una opción con descripción larga o un ícono propio). → No es un caso que la definición ilustre. Si aparece, es una razón real para reconsiderar el compuesto, no una que este change tenga que prevenir de antemano.
- **El estado indeterminado depende de un efecto sobre un ref, que es más frágil que una prop declarativa.** → Es la única vía que el DOM ofrece; se documenta explícitamente en vez de dejarlo como detalle de implementación oculto.
- **Dos tokens nuevos a nivel de componente (`trackOff`, `thumbOff`) solo para Switch.** → Aceptado: es más honesto que forzar un token semántico con un nombre que no describe el uso real, y la capa de tokens ya prevé esta salida para casos puntuales.

## Migration Plan

1. Agregar `@radix-ui/react-switch` al paquete de componentes.
2. Construir `Checkbox` sobre `<input type="checkbox">`, con marcado, desmarcado e indeterminado.
3. Construir `RadioGroup` sobre `<input type="radio">` compartiendo `name`, con `options: RadioOption[]`.
4. Construir `Switch` sobre `@radix-ui/react-switch`.
5. Registrar los tres en `definitions.ts` como `stable`, y regenerar `registry.json`.
6. Escribir el contenido de documentación de los tres, con la orientación cruzada Checkbox/Switch en ambas guías de uso.
7. Verificar teclado (Espacio en Checkbox y Switch, flechas en RadioGroup) y el peso, la tabla de props y el código fuente mostrados en el sitio.
8. Agregar los tokens de componente `trackOff`/`thumbOff` a Switch y aplicarlos al estado apagado.

Cada paso deja el monorepo compilando. Ningún paso toca un componente existente.

## Open Questions

Ninguna.
