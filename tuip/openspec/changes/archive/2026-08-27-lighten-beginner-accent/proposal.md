## Why

El primer paso de la escala de acento —`sky`, el que el consumidor usa para el nivel más bajo de una progresión— se lee más pesado de lo que significa. La escala partió de una referencia cuyo primer matiz era un celeste pálido (`#93C5FD`), y ese valor se **oscureció a propósito** hasta `#0A8FD0` para que el relleno alcanzara el piso de 3:1 de un componente de interfaz. El resultado cumple la regla y falla el propósito: el paso que debería leerse como "apenas empieza" pesa casi tanto como el siguiente.

La regla que lo obliga se escribió para toda la paleta de una sola vez, y no distingue **qué carga el significado** en cada pieza que la consume. Donde la escala tiñe los segmentos de un medidor de nivel, lo que dice el nivel es *cuántos segmentos están llenos*, no de qué color están: el segmento vacío se dibuja con su propio aro oscuro, así que la cuenta se lee sin depender del matiz. Ahí el color es codificación redundante, y exigirle el contraste de un elemento gráfico portador de significado es aplicarle un piso que su función no necesita.

## What Changes

- **`sky` se aclara**, hasta un tono que se lea como el primer paso de una progresión y no como un azul pleno.
- **El piso de contraste deja de ser el mismo para los cuatro matices.** Los otros tres lo conservan. `sky` pasa a responder a un piso propio y más pertinente: seguir distinguiéndose de un segmento vacío, que es de lo que depende la lectura.
- **La verificación automática cambia de regla, no se apaga.** `sky` se sigue comprobando en cada build, contra su piso nuevo. Una excepción que desactiva un control es cómo una paleta se reabre sin que nadie se entere.
- **La documentación del token dice por qué.** Hoy explica que `sky` es el celeste bajado hasta pasar el piso; pasa a explicar cuál es su piso y de qué depende realmente la lectura del nivel.

### Fuera de alcance

- Los otros tres matices, su orden y sus valores.
- El vocabulario semántico y los roles de estado, que no participan de esto.
- Cualquier pieza que quiera teñir **texto** con acento: la paleta sigue sin exponer un paso de texto.

## Capabilities

### Modified Capabilities

- `design-tokens`: el requisito del vocabulario de acento deja de exigir 3:1 contra la superficie a los cuatro matices por igual, y define para `sky` un piso propio verificado con el mismo rigor.

## Impact

- **Accesibilidad — decisión declarada**: `sky` va a quedar por debajo de 3:1 contra las superficies claras. Es una excepción deliberada y acotada a un matiz cuyo consumidor no le pide al color que porte el significado. Queda escrita, con su motivo y su piso de reemplazo, en el requisito y en la definición del token. Cualquier pieza futura que quiera usar `sky` **como único portador** de una distinción tiene que resolver el contraste por su cuenta.
- **Tokens**: `packages/tokens/src/accent-colors.ts` (valor claro de `sky` y el comentario que lo justifica) y `verify-tokens.ts` (la regla que lo comprueba).
- **Consumidores**: la aplicación toma el valor nuevo al reinstalar el paquete; no cambia una línea de su código.
- **Orden**: `Vocabulario de acento sin significado de estado` vive en `openspec/specs` **y** en `retune-accent-scale`, sin archivar. El delta parte del texto pendiente, no del principal.
