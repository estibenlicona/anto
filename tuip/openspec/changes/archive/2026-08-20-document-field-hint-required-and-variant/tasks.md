## 1. Documentación de `Input`

- [x] 1.1 Anatomía: mostrar en `renderParts` un campo con `required`, `hint` y adorno (`suffix`), y sumar las partes "Celda de adorno" y "Texto de ayuda" con sus tokens.
- [x] 1.2 Estados: sumar un estado que muestre el campo con adorno y otro con ayuda, para que ambos se vean sin abrir el código.
- [x] 1.3 Uso: sumar pares do/dont para `hint` vs `error` (el error desplaza a la ayuda) y para `required` (marca visual + `aria-required`, sin validación nativa).
- [x] 1.4 Accesibilidad: sumar la fila de `aria-required` y actualizar la de `aria-describedby` para reflejar que ahora apunta al hint cuando no hay error.

## 2. Documentación de `Select`

- [x] 2.1 Anatomía: reflejar `required` y `hint` en `renderParts` y sumar la parte del texto de ayuda.
- [x] 2.2 Uso: sumar el par do/dont de `hint` vs `error`, alineado con el de `Input`.
- [x] 2.3 Accesibilidad: sumar `aria-required` y el `aria-describedby` hacia el hint.

## 3. Documentación de `SegmentedControl`

- [x] 3.1 **Corregir** la parte "Separador entre segmentos": hoy describe `border-l` como si fuera siempre; pasa a ser específica de `variant="joined"`.
- [x] 3.2 Sumar una parte que describa `variant="separated"` (borde y radio por segmento, `gap` entre ellos, mismo `<fieldset>`).
- [x] 3.3 Estados: ilustrar las dos variantes lado a lado.
- [x] 3.4 Uso: sumar el par do/dont sobre cuándo elegir cada variante.

## 4. Verificación

- [x] 4.1 Correr `pnpm run lint` (tsc --noEmit) en `apps/docs` y confirmar que compila.
- [ ] 4.2 Levantar `pnpm docs:dev` y revisar las tres páginas.
