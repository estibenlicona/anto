<!--
Los grupos 1 a 9 son el registro de lo que ya se construyó, y quedan marcados.
La revisión visual posterior cambió la pieza —sin fondo, sin borde, etiqueta en
texto neutro— y eso invalidó parte de ese trabajo. El grupo 10 es el delta: lo
que hay que revertir y ajustar para llegar al diseño que describen el proposal,
los specs y el design actualizados. Las tareas de los grupos 1 a 9 que el grupo
10 deshace están señaladas ahí, no reescritas acá: borrar el registro haría
perder por qué el código está como está.
-->

## 1. Paleta de acento en el paquete de tokens

- [x] 1.1 Crear `packages/tokens/src/accent-colors.ts` con los cuatro matices (`slate`, `blue`, `teal`, `purple`) y sus tres pasos por rol (`ink`, `fill`, `surface`), tomando los valores claros de la tabla de la HU. Documentar en el encabezado del archivo, al estilo de `identity-colors.ts`: de qué paso de rampa sale cada valor, por qué los pasos se nombran por rol y no por número, y que la paleta no significa estado.
- [x] 1.2 Definir en ese mismo archivo la derivación del modo oscuro como regla escrita (tinta ← paso de relleno; superficie ← tinte oscuro del propio matiz), computarla, y marcar explícitamente que los valores oscuros son derivados y no aprobados por diseño, a diferencia de los claros.
- [x] 1.3 Exportar la paleta y sus tipos desde `packages/tokens/src/tokens.ts`, con la agrupación por modo (`accentColor = { light, dark }`) siguiendo la forma de `identityColor`.
- [x] 1.4 Emitir las CSS Variables en `packages/tokens/scripts/generate-css.ts` bajo el segmento `accent` — una variable por paso (`--color-accent-slate-ink`, `--color-accent-slate-fill`, `--color-accent-slate-surface`), en los bloques claro y oscuro.
- [x] 1.5 Mapear las utilidades en `packages/tokens/src/tailwind-preset.ts` con una función propia análoga a `identityVars`: `bg-accent-<matiz>-surface` y `bg-accent-<matiz>-fill` en `backgroundColor`, `text-accent-<matiz>-ink` en `textColor`, `border-accent-<matiz>-*` en `borderColor` y `ring-accent-<matiz>-ink` vía `colors` — todas apuntando a la variable del paso, no a una variable por propiedad.

## 2. Medidas de componente y verificación de contraste

- [x] 2.1 Declarar las tres medidas fijas de la card (ancho, alto en densidad amplia, alto en compacta) como capa de token de componente en el paquete de tokens, con nombre propio, y anotar que 44 px coincide con `touchTarget` y que 36 px es el único valor fuera de las escalas existentes.
- [x] 2.2 Emitir esas medidas como CSS Variables y exponerlas como utilidades en el preset, para que el componente no escriba ningún valor arbitrario.
- [x] 2.3 Agregar a `packages/tokens/scripts/verify-tokens.ts` los casos de contraste de la paleta de acento, en ambos modos: tinta sobre su propia superficie (≥ 4.5:1), relleno sobre esa superficie (≥ 3:1) y tinta contra blanco. Verificar que la ejecución falle cuando un paso queda por debajo.
- [x] 2.4 Correr `pnpm --filter @tuya-ui/tokens build` y `pnpm --filter @tuya-ui/tokens test`, y confirmar que el CSS generado queda sincronizado y que los cuatro matices pasan contraste en los dos modos.

## 3. Card con tono y densidad

- [x] 3.1 Agregar las props `tone` y `density` a `Card` en `packages/components/src/card.tsx`, con `tone="neutral"` y `density="comfortable"` como valores por defecto que reproducen exactamente el markup actual.
- [x] 3.2 Resolver el tono dentro de `Card` con un mapa literal de clases completas, con el comentario que explica la restricción de Tailwind (mismo criterio que `avatar.tsx` y `progress.tsx`).
- [x] 3.3 Propagar la densidad a `CardHeader`, `CardBody` y `CardFooter` por contexto, siguiendo el `DensityContext` que ya usa `table.tsx`, en vez de exigir que el consumidor la pase a cada subparte.
- [x] 3.4 Documentar cada prop nueva con su comentario de documentación, que es lo que alimenta la tabla de props del sitio.
- [x] 3.5 Verificar que las Cards existentes de `apps/docs` no cambien de aspecto al no especificar ninguna de las dos props.

## 4. LevelMeter

- [x] 4.1 Crear `packages/components/src/level-meter.tsx`: fila de segmentos de igual ancho, `steps` con 4 por defecto, gap de `gap-hug`, llenos con el paso de relleno del tono recibido y vacíos sobre superficie clara con aro en el neutro que pide CA3.
- [x] 4.2 Exponer el valor y el total de pasos a tecnologías de asistencia, de modo que el nivel no dependa de percibir el color.
- [x] 4.3 Resolver el tono con mapa literal de clases, igual que en Card.
- [x] 4.4 Documentar cada prop propia con su comentario de documentación.

## 5. SeniorityCard

- [x] 5.1 Crear `packages/components/src/seniority-card.tsx` componiendo `Card` (con `tone` y `density`) más `LevelMeter`, sin reimplementar borde, radio ni sombra.
- [x] 5.2 Definir la escala cerrada de cuatro niveles por nombre (`"Principiante" | "Competente" | "Avanzado" | "Experto"`) y su correspondencia fija con los cuatro matices, en el orden gris → azul → turquesa → morado.
- [x] 5.3 Implementar el estado vacío para un valor fuera de la escala: tono neutro, etiqueta `Sin nivel`, cero segmentos llenos, misma dimensión fija — ni tono inventado ni fallo silencioso.
- [x] 5.4 Aplicar las medidas fijas del paso 2 con `box-sizing: border-box`, de modo que el ancho no varíe con el nivel ni con la longitud de la etiqueta y `Principiante` entre sin recorte.
- [x] 5.5 Implementar la variante de ancho reducido que omite la etiqueta visible y hace viajar el nombre del nivel en `aria-label` y en el tooltip.
- [x] 5.6 Implementar el estado seleccionado: doble aro del propio tono del nivel y etiqueta en peso 600, sin rojo de marca y sin alterar la dimensión.
- [x] 5.7 Documentar cada prop propia con su comentario de documentación.
- [x] 5.8 Exportar `SeniorityCard` y `LevelMeter` desde `packages/components/src/index.ts`.

## 6. Verificaciones automatizadas

- [x] 6.1 Crear el script de verificación anti-hex en `packages/components`: recorre `src/**`, ignora comentarios, y falla reportando archivo y línea cuando encuentra un literal de color en el código.
- [x] 6.2 Engancharlo al `test` del paquete y confirmar que hoy pasa — la única ocurrencia de un hexadecimal en el fuente es un comentario en `navbar.tsx`, que la regla ignora por diseño.
- [x] 6.3 Verificar que el script falla de verdad: introducir un hexadecimal temporal en el código de un componente, comprobar el fallo y revertirlo.
- [x] 6.4 Agregar vitest y testing-library como devDependencies de `packages/components`, con su configuración y el entorno de DOM, y componer `test` para que corra `tsc --noEmit` y la suite.
- [x] 6.5 Escribir la prueba de dimensión fija: los cuatro niveles miden el mismo ancho, la etiqueta más larga no se recorta, y cada densidad toma su alto con el borde dentro de la caja.
- [x] 6.6 Escribir la prueba de escala cerrada: cada nivel válido llena la cantidad de segmentos que le corresponde, y un valor fuera de la escala renderiza el estado vacío documentado.
- [x] 6.7 Escribir la prueba del estado seleccionado: refuerza con el tono del nivel, no usa el rol de marca, y no cambia la dimensión.

## 7. Catálogo y distribución

- [x] 7.1 Declarar `level-meter` y `seniority-card` en `packages/components/registry/definitions.ts`: nombre, categoría, descripción, estado de madurez, dependencias internas (`seniority-card` depende de `card` y de `level-meter`) y `extendsElement`.
- [x] 7.2 Regenerar el manifiesto con `pnpm --filter @tuya-ui/components generate:registry` y confirmar que ambos componentes aparecen con su estado y sus dependencias.
- [x] 7.3 Crear el changeset con el `MINOR` de `@tuya-ui/tokens` y `@tuya-ui/components`, describiendo por componente qué se agrega y dejando explícito que la adición de tokens es puramente aditiva.
- [x] 7.4 Correr el pipeline completo (`pnpm run build`, `pnpm test`, `pnpm lint`) y confirmar que la Skill generada y el `registry.json` empaquetado quedan al día.

## 8. Documentación

- [x] 8.1 Agregar la paleta de acento a la página de color de fundamentos (`apps/docs/src/content/fundamentos.tsx`): los cuatro matices con sus tres pasos, el nombre del token de cada paso y su contraste medido, en una sección propia separada de las familias semánticas.
- [x] 8.2 Escribir en esa sección la advertencia explícita de que `accent.*` no comunica estado y no reemplaza a `success`, `warning`, `danger` ni `info`, y dejar anotado que los valores de modo oscuro son derivados.
- [x] 8.3 Escribir el contenido de `LevelMeter` en `apps/docs/src/content/level-meter.tsx` (Uso, Anatomía, Accesibilidad) incluyendo cuándo corresponde `LevelMeter` y cuándo `SegmentedBar`, y registrarlo en `content/index.ts`.
- [x] 8.4 Escribir el contenido de `SeniorityCard` en `apps/docs/src/content/seniority-card.tsx` con las cuatro pestañas, y registrarlo en `content/index.ts`.
- [x] 8.5 Escribir los ejemplos ejecutables de ambos componentes en `apps/docs/src/examples/<componente>/`: la escala completa, la densidad compacta, el estado seleccionado, el estado vacío y la variante sin etiqueta.
- [x] 8.6 Registrar ambos componentes en `apps/docs/src/data/navigation.ts` bajo su categoría y verificar que aparecen en el catálogo, en el sidebar y en la búsqueda.
- [ ] 8.7 Levantar el sitio (`pnpm run docs:dev`) y revisar las cuatro pestañas de cada componente, que la tabla de props se haya generado desde los tipos y que no queden estados de "documentación pendiente".

## 9. Cierre

- [x] 9.1 Republicar el paquete local (`pnpm run publish:local`) para dejar el `.tgz` disponible al change de la app.
- [x] 9.2 Revisar la DoD de la HU punto por punto y anotar cuáles quedan cubiertos acá y cuál queda para `adopt-seniority-card-in-people` en el repo de la app.

## 10. Ajustes tras la revisión visual

La pieza pierde fondo, borde y sombra, y su etiqueta pasa a texto neutro. Ver `design.md`, decisiones 1, 3, 4 y 6.

### 10.1 Tokens: la paleta baja a un paso por matiz

- [x] 10.1.1 Reescribir `packages/tokens/src/accent-colors.ts`: dejar sólo el paso `fill` de cada matiz (`slate #8B8B93`, `blue #3B7ACB`, `teal #2E97A3`, `purple #8A63D2`). Retirar `ink` y `surface`. *(Deshace parte de 1.1.)*
- [x] 10.1.2 Retirar la derivación del modo oscuro entera: el helper `mix`, las constantes `CANVAS_DARK` / `DARK_SURFACE_STRENGTH` / `DARK_INK_STRENGTH` y la función `assemble`. La paleta pasa a ser un mapa de constantes independiente del tema. Explicar en el encabezado por qué un valor por matiz alcanza para los dos temas. *(Deshace 1.2.)*
- [x] 10.1.3 Ajustar los exports de `packages/tokens/src/tokens.ts`: `accentColor` deja de estar agrupado por modo (`{ light, dark }`) y pasa a ser la paleta única. Actualizar los tipos que exporta. *(Ajusta 1.3.)*
- [x] 10.1.4 En `scripts/generate-css.ts`, emitir las variables de acento **una sola vez** en el bloque independiente del tema, junto a `spacing` y `radius`, y retirarlas de los bloques claro y oscuro. *(Ajusta 1.4.)*
- [x] 10.1.5 En `src/tailwind-preset.ts`, dejar sólo `bg-accent-<matiz>-fill` en `backgroundColor`. Retirar el mapeo de acento de `textColor`, `borderColor` y `colors`, que existían para la etiqueta teñida y el aro de selección. *(Ajusta 1.5.)*
- [x] 10.1.6 Reescribir los casos de contraste de acento en `scripts/verify-tokens.ts`: cada matiz contra las cuatro superficies donde la pieza puede quedar apoyada —fila blanca, lienzo, fila seleccionada y fila en tema oscuro—, con un piso de 3:1. Retirar los pares contra la superficie del propio matiz, que ya no existe. *(Reemplaza 2.3.)*
- [x] 10.1.7 Correr `pnpm --filter @tuya-ui/tokens build` y `test`, y confirmar los 16 pares nuevos. `slate` sobre la fila seleccionada es el más ajustado (3.08:1): comprobar que la verificación lo mide y no lo saltea.

### 10.2 Componentes: revertir `Card`, aplanar `SeniorityCard`

- [x] 10.2.1 Revertir `packages/components/src/card.tsx` a su estado anterior: sin `tone`, sin `density`, sin `DensityContext`, sin el mapa `toneClasses`. `CardHeader`, `CardBody` y `CardFooter` vuelven a su padding fijo. *(Deshace 3.1–3.4.)*
- [x] 10.2.2 Reescribir `packages/components/src/seniority-card.tsx` como contenedor plano: sin `Card`, sin fondo, sin borde, sin sombra. Conserva las medidas fijas, la etiqueta y el medidor. *(Reemplaza 5.1.)*
- [x] 10.2.3 Pasar la etiqueta a `text-neutral-default` en los cuatro niveles, y `text-neutral-subtle` en el estado vacío. Retirar el mapa `labelClasses` por matiz.
- [x] 10.2.4 Retirar la prop `selected` y el mapa `selectedRingClasses`. *(Deshace 5.6.)*
- [x] 10.2.5 Ajustar el padding interno, que antes venía de la densidad de `Card`, para que la pieza siga respetando sus altos fijos sin la caja.
- [x] 10.2.6 Actualizar en `lib/accent-tone.ts` el tipo `CardTone`, que existía para la superficie teñida de `Card` y queda sin consumidor: dejar sólo `AccentTone` y su lista ordenada.
- [x] 10.2.7 Revisar `level-meter.tsx`: el mapa de clases no cambia (`bg-accent-<matiz>-fill` sigue igual), pero sí el comentario sobre los segmentos vacíos, que ya no se apoyan en un fondo teñido sino en la superficie que tengan debajo.
- [x] 10.2.8 Actualizar los comentarios de documentación de las props que sobreviven — son los que alimentan la tabla de props del sitio.

### 10.3 Pruebas

- [x] 10.3.1 Retirar de `src/seniority-card.test.tsx` el bloque completo del estado seleccionado. *(Deshace 6.7.)*
- [x] 10.3.2 Agregar la prueba de que la pieza no dibuja fondo, borde ni sombra, y de que la etiqueta usa el color de texto neutro en los cuatro niveles.
- [x] 10.3.3 Revisar las pruebas de dimensión: siguen valiendo, pero la hoja generada desde el preset ya no incluye lo que se retiró. Confirmar que las cuatro medidas se siguen resolviendo.
- [x] 10.3.4 Correr `pnpm --filter @tuya-ui/components test` y confirmar que pasa entera.

### 10.4 Catálogo, documentación y cierre

- [x] 10.4.1 En `registry/definitions.ts`: `seniority-card` deja de depender de `card`; la entrada de `card` vuelve a su descripción y dependencias anteriores. Regenerar el manifiesto. *(Ajusta 7.1.)*
- [x] 10.4.2 Reescribir la sección de acento en `apps/docs/src/content/fundamentos.tsx`: un paso por matiz, la tabla de contraste contra las cuatro superficies, y el callout de tema oscuro retirado — ya no hay valores derivados que advertir. *(Ajusta 8.1–8.2.)*
- [x] 10.4.3 Actualizar `apps/docs/src/content/seniority-card.tsx`: quitar de Anatomía las partes de fondo y borde, quitar el estado seleccionado de la lista de estados, y corregir en Accesibilidad los contrastes medidos y el consejo de envolver en un radio.
- [x] 10.4.4 Actualizar `apps/docs/src/content/level-meter.tsx`: la nota sobre el fondo teñido en Anatomía y en Accesibilidad.
- [x] 10.4.5 Retirar el ejemplo `seniority-card/03-eleccion-en-un-formulario.tsx`, que muestra el estado seleccionado en un formulario, y `level-meter/03-sobre-un-fondo-tenido.tsx`, que compone `Card` con tono. Renumerar los que queden. *(Ajusta 8.5.)*
- [x] 10.4.6 Actualizar el changeset: la paleta tiene un paso por matiz y es independiente del tema; `Card` no cambia; no hay estado seleccionado. *(Ajusta 7.3.)*
- [x] 10.4.7 Correr el pipeline completo (`pnpm run build`, `pnpm test`, `pnpm lint`) y republicar el `.tgz` local con `pnpm run publish:local`.
- [x] 10.4.8 Actualizar `dod-tuip-214.md` con lo que cambió: EXT-1 entrega un paso de tres, EXT-2 entrega sólo `level-meter`, y CA7 queda sin implementar con su motivo.
- [ ] 10.4.9 Revisar el sitio y confirmar que la pieza se ve como se pidió: sin caja, etiqueta negra, sólo los guiones teñidos. Es la revisión que originó estos ajustes, así que conviene cerrarla mirando.
