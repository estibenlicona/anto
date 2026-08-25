## 1. Vocabulario de color compartido

- [x] 1.1 Crear `packages/components/src/lib/categorical-color.ts` con la unión de seis tonos (`gray`, `green`, `blue`, `amber`, `red`, `purple`) y el mapa a las escalas de rol, documentando que no llevan significado de estado. SIN el mapa a roles: Tailwind solo genera clases que encuentra literales en el fuente, así que un `bg-${rol}-subtle` derivado no produciría CSS. El módulo exporta el tipo y documenta la correspondencia; cada componente escribe sus literales.
- [x] 1.2 Hacer que `packages/components/src/tag.tsx` importe desde ese módulo y conserve `export type TagColor` como alias, de modo que nada que hoy lo importe se rompa.
- [x] 1.3 Agregar la entrada del módulo en `packages/components/registry/definitions.ts` (categoría `utility`, sin dependencias, como `utils`) y sumarla a las dependencias de `tag`.
- [x] 1.4 Reconstruir y confirmar que `Tag` sigue renderizando igual — el refactor no debe cambiar su salida.

## 2. Componente Slider

- [x] 2.1 Agregar `@radix-ui/react-slider` a las dependencias de `packages/components`.
- [x] 2.2 Crear `packages/components/src/slider.tsx` sobre `@radix-ui/react-slider`, con `value: number[]`, `onValueChange`, `min`, `max`, `step` y un pulgar por valor.
- [x] 2.3 Exponer la separación mínima entre pulgares en la unidad del rango, mapeándola a lo que el primitivo espera.
- [x] 2.4 Aceptar un nombre accesible por pulgar, para que cada uno se anuncie distinguible en un slider de varios.
- [x] 2.5 Verificar que el primitivo ya impide el cruce entre pulgares; si no lo hace por defecto, activarlo en vez de resolverlo a mano. NO alcanzaba: el primitivo impide el cruce pero al arrastrar EMPUJA al vecino, mientras que con el teclado se detiene. Hubo que reducir lo que emite a un solo pulgar movido — ver la decisión agregada en design.md.
- [x] 2.6 Exportar desde `packages/components/src/index.ts`.

## 3. Segmentos

- [x] 3.1 Aceptar `segments` opcional, con rótulo y color por tramo, tomando el color del módulo compartido del grupo 1.
- [x] 3.2 Pintar cada tramo entre pulgares con su color y su rótulo, incluyendo el que va del inicio del rango al primer pulgar y el del último al final.
- [x] 3.3 Sin `segments`, renderizar la pista como un slider corriente, sin colores ni rótulos por tramo.
- [x] 3.4 Documentar en el JSDoc que `segments` lleva exactamente un elemento más que `value`.

## 4. Registro y documentación

- [x] 4.1 Agregar la entrada de `slider` en `definitions.ts`, con `npmDependencies: ["react", "@radix-ui/react-slider"]` y la dependencia del módulo de color, siguiendo la forma de la entrada de `tabs`.
- [x] 4.2 Crear `apps/docs/src/content/slider.tsx` con `usage`, `anatomy` y `accessibility`, incluyendo cuándo va Slider y cuándo `SegmentedBar` (editable vs. solo lectura).
- [x] 4.3 Registrar `sliderContent` en `apps/docs/src/content/index.ts`.
- [x] 4.4 Crear un ejemplo de un solo pulgar, sin segmentos.
- [x] 4.5 Crear un ejemplo de partición con segmentos rotulados y coloreados, del tipo que motivó el componente.
- [x] 4.6 Reconstruir el paquete y confirmar que `slider` aparece en el registry y en la skill.

## 5. Verificación

- [x] 5.1 Arrastrar un pulgar y confirmar que sólo cambia su valor, y que los dos tramos que separa se ajustan a la vez. Verificado con un arrastre corto: 20→30 movió solo XS y S.
- [x] 5.2 Intentar cruzar dos pulgares y confirmar que se detienen antes, respetando la separación mínima. Verificado tras el fix: arrastrar de 20 hacia 51% se detiene en 35 y el vecino no se mueve, igual que con teclado.
- [x] 5.3 Operar los pulgares con el teclado y confirmar que respetan los mismos límites que el arrastre. Verificado: 30 pulsaciones desde 20 se detienen en 35 (vecino en 40, minDistance 5) sin mover a los demás.
- [x] 5.4 Revisar en el árbol de accesibilidad que cada pulgar aparece como un control propio, con valor, límites y nombre distinguible. Verificado en el DOM: 5 elementos role="slider", cada uno con valuenow/valuemin/valuemax, enfocables, y nombres derivados ("Límite entre XS y S", etc.).
- [x] 5.5 Confirmar que un Slider sin `segments` se ve como un control de valor corriente.
- [x] 5.6 Confirmar que `Tag` no cambió su render tras la extracción del tipo de color. Los Tag del ejemplo renderizan con sus colores correctos tras la extracción.
- [x] 5.7 Correr `tsc --noEmit` en `packages/components` y `apps/docs`, y el chequeo de tokens en `packages/tokens`. tsc limpio en ambos paquetes.
