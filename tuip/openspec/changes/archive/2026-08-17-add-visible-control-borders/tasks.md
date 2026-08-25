## 1. Revertir el escalón intermedio

- [x] 1.1 Quitar el paso `450` de la escala neutra en `packages/tokens/src/primitives.ts`, y sacarlo del tipo `NeutralScale`.
- [x] 1.2 Quitar `border.neutral.strong` de `semantic-colors.ts`, en modo claro y oscuro, y de la interfaz `NeutralBorder`.
- [x] 1.3 Quitar sus cuatro comprobaciones de `verify-tokens.ts`.
- [x] 1.4 Confirmar que no queda ninguna referencia a `border-neutral-strong` en el catálogo ni en docs.

## 2. Tokens nuevos

- [x] 2.1 Registrar el trazo translúcido `#8080802E` como token de borde neutro en `semantic-colors.ts`, con un nombre que lo distinga de los trazos opacos.
- [x] 2.2 Un solo valor para los dos modos: es translúcido, así que se compone sobre la superficie que tenga debajo. Anotar eso junto al token, que es la razón de que sea translúcido y no un gris sólido.
- [x] 2.3 Anotar también que NO es apto para delimitar un componente de forma accesible, para que nadie lo elija creyendo que sí.
- [x] 2.4 Registrar los tonos de anillo de foco derivados de los colores base: marca, destructivo y neutro, cada uno translúcido.
- [x] 2.5 Elegir la opacidad de esos tonos mirándolos sobre su propio relleno: tienen que verse encendidos sobre el color del botón, no lavados. El valor sale de mirar, no de calcular.
- [x] 2.6 NO sumar ninguno de estos tokens a `verify-tokens.ts`: no persiguen un mínimo de contraste, y auditarlos sería declarar un umbral que el cambio decidió no perseguir.

## 3. El anillo de foco que nadie vio

- [x] 3.1 Corregir los 34 usos de `ring-border-<rol>-focus` a `ring-<rol>-focus` en `packages/components/src/`. Sin esto ninguna de las tareas siguientes se puede verificar: el anillo queda azul haga lo que haga.
- [x] 3.2 Confirmar contra el CSSOM que las clases corregidas ahora sí generan regla, en vez de confiar en que el cambio bastó.
- [x] 3.3 Llevar el offset del anillo a cero, para que se apoye en el borde. Revisar si el token de offset se usa en otro lado antes de tocarlo.
- [x] 3.4 Dar a cada variante de Button su tono de anillo, derivado de su color base.
- [x] 3.6 Llevar al anillo neutro los controles que capturan un valor: input, select, combobox, date-field, date-range-field, file-input, file-uploader, checkbox, radio-group, switch, slider y segmented-control. NO tocar los demás — ver la asimetría anotada en design.md.
- [x] 3.7 Confirmar que el anillo de error sigue en el tono destructivo, para que un campo con problema se distinga de uno enfocado sin problema.
- [x] 3.5 Revisar qué pasa con el resto de los componentes enfocables: al corregir el prefijo van a mostrar por primera vez el anillo de marca. Confirmar que ninguno queda peor que con el azul.

## 4. Button

- [x] 4.1 Cambiar el borde de `secondary` al trazo translúcido.
- [x] 4.2 Confirmar que `subtle` y `link` siguen sin borde visible y con su borde transparente de alineación.
- [x] 4.3 Actualizar el comentario del mapa de variantes: cambia el trazo y cambia el anillo.

## 5. Card

- [x] 5.1 Cambiar el contorno de `Card` al trazo translúcido.
- [x] 5.2 Rehacer el escalón `sm` en `packages/tokens/src/shadow.ts` para que se proyecte desde arriba: más desplazamiento que difuminado y spread negativo, en la familia de `md` (`0 4px 8px -2px`). `Card` conserva su sombra; lo que cambia es que deje de rodearla.
- [x] 5.3 Verificar la geometría antes de mirarla: calcular cuánto sobresale la sombra por abajo y por los costados con los valores elegidos, y confirmar que por arriba no asoma. Es lo que distingue una sombra proyectada de un halo, y a ojo a 6% de opacidad no se juzga.
- [x] 5.4 Confirmar que ningún otro componente usa `shadow-sm` antes de tocar el token — hoy es exclusivo de `Card`, pero eso hay que comprobarlo, no recordarlo.
- [x] 5.5 Llevar `CardHeader` y `CardFooter` al mismo trazo que el contorno, para que la tarjeta se lea como una pieza.
- [x] 5.6 Actualizar los comentarios, que hoy explican una jerarquía entre contorno y divisiones que deja de existir.
- [x] 5.7 Revisar que una `Table flush` dentro de una Card siga sin duplicar borde.

## 6. Documentación

- [x] 6.1 En la página de color, reemplazar la explicación de los tres trazos: vuelven a ser dos opacos más el translúcido, y hay que decir cuál sirve para qué y cuál no delimita de forma accesible.
- [x] 6.2 Sacar `strong` de la leyenda de nomenclatura.
- [x] 6.3 En la anatomía de Button, corregir el borde y el anillo de foco, que hoy describe `ring-2 ring-offset-2`.
- [x] 6.4 En la anatomía de Card, corregir la jerarquía de trazos y describir qué hace cada cosa: el trazo delimita, la sombra eleva.
- [x] 6.5 En la accesibilidad de Button, corregir la fila del foco, que hoy dice `ring-2 ring-offset-2`.

## 7. Reconstrucción y propagación

- [x] 7.1 Reconstruir `@tuya-ui/tokens` y confirmar que el CSS generado tiene los tokens nuevos y ya no tiene `strong`.
- [x] 7.2 Correr `verify-tokens` y confirmar que pasa sin las comprobaciones retiradas.
- [x] 7.3 Reconstruir `@tuya-ui/components`.
- [x] 7.4 Empaquetar ambos con `pnpm pack`.
- [x] 7.5 Reinstalar los `.tgz` en `frontend` y limpiar la caché de Vite antes de levantarlo.

## 8. Verificación

- [x] 8.1 Confirmar que el borde de `secondary` y el de Card son el mismo trazo, y que se ven suaves.
- [x] 8.2 Confirmar que la sombra de Card se lee proyectada hacia abajo y ya no rodea el contorno.
- [x] 8.3 Enfocar por teclado cada variante de Button y confirmar que el anillo va pegado al borde, sin franja intermedia.
- [x] 8.4 Confirmar que el anillo de cada variante de Button está en el tono de su propio color base, y que ninguno quedó azul.
- [x] 8.9 Enfocar un campo de formulario y confirmar que su anillo es neutro; enfocar uno en estado de error y confirmar que el suyo es rojo. Los dos, uno al lado del otro: lo que se verifica es que se distingan.
- [x] 8.5 Confirmar que las cinco variantes siguen teniendo la misma altura en una fila.
- [x] 8.6 Comprobar todo lo anterior también en modo oscuro, donde el trazo translúcido se compone sobre otra superficie.
- [x] 8.7 En `frontend`, confirmar en el navegador que los cambios llegaron — es el único lugar donde se comprueba la propagación.
- [x] 8.8 Mostrar el resultado y confirmar que efectivamente se ve mejor. Es un cambio de criterio visual: quien decide si quedó bien no es una medición.
