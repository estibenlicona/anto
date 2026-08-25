## Context

Tailwind v3 traía, dentro de Preflight, `button, [role="button"] { cursor: pointer }`. Tailwind v4 la quitó: la decisión declarada es no imponer un cursor que el agente de usuario no da por sí solo. El catálogo nunca declaró esa regla porque el framework la traía, así que la migración a v4 la borró de todos los componentes que no llevaban `cursor-pointer` a mano.

Quiénes sobrevivieron y quiénes no lo dice el propio código: `checkbox`, `combobox`, `command-palette`, `file-input`, `file-uploader`, `menu`, `navbar`, `notification-menu`, `option-card`, `radio-group`, `segmented-control`, `select`, `slider` y `switch` traen la clase; `button`, `chip`, `date-field`, `date-range-field`, `drawer`, `filter-button`, `modal`, `pagination`, `sidebar`, `table` y `app-shell` no. No hay criterio detrás de esa división: es quién necesitó la clase por otro motivo.

Dos hechos que condicionan la solución:

- **La hoja del paquete es la que llega a la aplicación**, y la arma `build-css.ts`: compila las utilidades desde una entrada que él mismo genera y concatena el resultado con `tokens.css` en `dist/styles.css`, que es lo que el paquete exporta como `./styles.css` y lo que la app y la documentación importan.

  `packages/components/src/styles.css` **no** participa de eso: nadie lo importa y conserva las directivas `@tailwind` de la v3. Parece el punto de entrada de la hoja y no lo es — una regla escrita ahí no llegaría a ningún consumidor. (Descubierto al implementar; el archivo muerto queda para limpiar aparte.)
- **Ya existe un lugar donde se vigila la hoja compilada.** `scripts/verify-stylesheet.ts` compila la hoja publicada y falla si pierde propiedades que compilar no garantiza; corre dentro de `pnpm test`. Es el mismo tipo de defecto: algo que desaparece sin que nada se rompa.

## Goals / Non-Goals

**Goals:**

- Que todo lo accionable del catálogo vuelva a mostrar la manito, sin depender de que cada componente se acuerde.
- Que lo deshabilitado conserve el cursor de no permitido.
- Que la pérdida de esta regla vuelva a ser detectable: hoy desapareció en silencio.

**Non-Goals:**

- Auditar el resto de las diferencias de Preflight entre v3 y v4.
- Tocar colores, tamaños o estados de hover.
- Agregar `cursor-pointer` componente por componente.

## Decisions

### 1. Una regla base en la hoja del paquete, dentro de `@layer base`

En un archivo propio, `packages/components/src/base.css`, que `build-css.ts` concatena al final de `dist/styles.css`:

```css
@layer base {
  button:not(:disabled):not([aria-disabled="true"]),
  [role="button"]:not(:disabled):not([aria-disabled="true"]) {
    cursor: pointer;
  }

  button:disabled,
  [aria-disabled="true"] {
    cursor: not-allowed;
  }
}
```

- **Un archivo `.css` y no una cadena dentro del script**: la regla se lee, se busca y se comenta como CSS. El script sólo la concatena.
- **Al final de la hoja y no al principio**: es `@layer base`, y entre capas manda el orden que la hoja declara, no el de aparición. Ubicarla al final no la pone por encima de nada.
- **Preflight de la v4 no declara `cursor` sobre `button`** —comprobado en la hoja compilada—, así que la regla no compite contra un reset sin capa, que sí le ganaría.

- **Dentro de `@layer base`** y no suelta: la app importa esta hoja junto con sus propias utilidades, y una regla sin capa gana por orden de aparición sobre cualquier utilidad, sin importar la especificidad. En `base`, un `cursor-*` puntual del consumidor sigue mandando. La app ya aprendió esto con su reset (ver el comentario de `styles.css` del frontend).
- **`:not(:disabled)` en el selector**, y no confiar en que la regla de deshabilitado gane después: dos reglas de igual especificidad se resuelven por orden, y ese orden es exactamente lo que se rompe cuando alguien reordena el archivo. Excluir en el selector hace que no exista el conflicto.
- **`[aria-disabled="true"]` además de `:disabled`**: los componentes de Radix deshabilitan ítems sin usar el atributo nativo. `:disabled` no los alcanza.

**Alternativa descartada — agregar `cursor-pointer` a cada componente afectado.** Son once archivos hoy, y no resuelve el doce: el componente que se escriba mañana vuelve a nacer sin cursor, porque nada obliga a acordarse. El defecto es una base que se perdió; la reparación va en la base.

**Alternativa descartada — restaurar la regla completa de Preflight v3.** Preflight v3 también aplicaba `cursor: pointer` a elementos que hoy el catálogo pinta de otra manera; copiarla entera reintroduce decisiones de v3 que nadie revisó. La regla se acota a lo accionable.

### 2. Qué cuenta como accionable

`button` y `[role="button"]`. Deliberadamente **no** entran:

- `a[href]`: el navegador ya le da la manito por sí solo.
- `label`, `summary`, `[role="menuitem"]`, `[role="tab"]`, `[role="option"]`: los componentes que los usan ya traen su `cursor-pointer` propio —Menu, SegmentedControl, Select, Combobox—, y ampliar el selector para cubrirlos alcanzaría también a marcado de terceros que el catálogo no controla. Si aparece un caso concreto, se agrega con su motivo; hoy sería especular.

### 3. La verificación vive donde ya se vigila la hoja

`verify-stylesheet.ts` gana una tercera comprobación: compilar la hoja publicada y exigir que contenga la regla de cursor, con su exclusión de lo deshabilitado. Corre en `pnpm test`.

Por qué ahí y no en una prueba de componente: jsdom no aplica hojas de estilo externas, así que un `expect(getComputedStyle(button).cursor)` en Vitest daría `auto` con la regla puesta y sin ella — una prueba que no distingue el defecto de su arreglo. Lo que sí se puede afirmar es que la hoja que se publica contiene la regla, que es justo lo que dejó de ser cierto en la migración.

## Risks / Trade-offs

- **La comprobación mira la hoja, no el navegador.** Si mañana un consumidor pisa el cursor con su propio CSS, esto no lo detecta. Es el mismo alcance que las otras dos comprobaciones del archivo, y cubre el modo real en que este defecto apareció.
- **`[aria-disabled="true"] { cursor: not-allowed }` alcanza a cualquier elemento con ese atributo**, no sólo a los accionables. Es intencional: un elemento marcado como deshabilitado no debería invitar a hacer clic, sea cual sea su etiqueta.
- **El arreglo llega a la aplicación sólo al reempacar e reinstalar.** Es el ciclo normal del paquete local, con su versión incrementada; sin eso, la app sigue viendo la hoja vieja y el defecto parece no haberse arreglado.
