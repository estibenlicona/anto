## 1. Colores de identidad en la paleta (tuip)

- [x] 1.1 Obtener de la fuente de Fluent UI los valores de su paleta de personas y elegir ~12 bien separados en tono. **No inventar ni aproximar hexadecimales**; si la fuente no resulta accesible, frenar y preguntar (ver design.md - Decisions).
- [x] 1.2 Agregar esos colores a `tuip/packages/tokens/src/` como vocabulario de identidad, separado de las siete familias semánticas, con su par fondo/texto para tema claro y oscuro.
- [x] 1.3 Verificar el contraste de cada par fondo/texto contra el mínimo para texto pequeño, en ambos temas. Reemplazar el valor de Fluent por un paso más oscuro del mismo tono en los que no lleguen, y anotar cuáles se ajustaron.

## 2. Vocabulario y reparto (tuip)

- [x] 2.1 Crear el tipo del vocabulario de identidad en `tuip/packages/components/src/lib/`, junto a `categorical-color.ts` pero como tipo aparte, con un comentario que explique por qué no se fusiona con `CategoricalColor`.
- [x] 2.2 Escribir la función determinista de identificador a color: misma entrada, siempre el mismo color, y reparto razonablemente parejo entre los ~12.
- [x] 2.3 Tests de la función: estabilidad (la misma entrada da el mismo color muchas veces), cobertura (un conjunto grande de ids toca todos los colores) y que no lance con cadena vacía.

## 3. Avatar (tuip)

- [x] 3.1 Cambiar el tratamiento de `Avatar` de fondo sólido + texto inverso a fondo tenue + texto del mismo tono, escribiendo las clases literales por color (Tailwind no genera clases construidas en runtime — mismo motivo que ya documenta `colorClasses`).
- [x] 3.2 Agregar la prop del identificador y derivar el color con la función del grupo 2 cuando se pasa.
- [x] 3.3 Reescribir el JSDoc de la prop de color: hoy afirma que el color nunca se deriva de datos de la persona, que es lo contrario de lo que el componente pasará a hacer.
- [x] 3.4 Revisar `AvatarGroup`: confirmar que el anillo `bg-neutral-default` sigue separando los círculos ahora que los fondos son tenues. **Resultado: separa poco.** Medido contra los 12 rellenos, el peor caso es 1.31:1 en tema claro (anillo blanco sobre seafoam) y 1.20:1 en oscuro (anillo #17171B sobre purple). Es la contrapartida que design.md anticipó al pasar de rellenos sólidos a tenues, y es inherente al estilo: Fluent tiene el mismo comportamiento en sus facepiles. No se mitiga acá porque la decisión es visual y el único uso de `AvatarGroup` son los avatares chicos del resumen; queda para juicio del usuario en la verificación de la tarea 6.3, con estos números sobre la mesa.

## 4. Documentación (tuip)

- [x] 4.1 Reescribir en `tuip/apps/docs/src/content/avatar.tsx` el par do/dont que dice "Calcular el color a partir del nombre, el id, o cualquier otro dato de la persona" — pasa a distinguir identificador estable (correcto) de dato mutable como el nombre (incorrecto).
- [x] 4.2 Actualizar la nota de anatomía que repite la regla vieja, y sumar una parte que describa el par fondo/texto del tratamiento tenue.
- [x] 4.3 Ilustrar en los estados varios avatares con colores distintos, para que se vea el reparto y no sólo un color.

## 5. Consumo en la aplicación

- [x] 5.1 Pasar el id de la persona al `Avatar` de `frontend/src/features/people/components/PeopleList.tsx`.
- [x] 5.2 Pasar el id de la persona a los `Avatar` de `frontend/src/features/people/components/PeopleStatsCards.tsx`.
- [x] 5.3 Sumar cobertura de que la misma persona recibe el mismo color en el listado y en el resumen.

## 6. Publicación y verificación

- [x] 6.1 Correr `pnpm run publish:local` en `tuip/` y `pnpm install` en `frontend/` para que la aplicación tome el paquete nuevo.
- [x] 6.2 Ejecutar `npm run lint` y `npx vitest run` en `frontend/`, y `tsc --noEmit` en `tuip/apps/docs`, confirmando que no hay regresiones nuevas frente al baseline conocido. Resultado final: 332/333, con los 2 fallos preexistentes de siempre. Nota: expandir el mock de 5 a 20 personas rompió 6 tests que fijaban como constantes los valores de la semilla; se reescribieron para derivar lo esperado del propio listado, así que ahora verifican la agregación y no cuánta gente hay cargada de ejemplo.
- [ ] 6.3 Levantar `pnpm dev:mock` y revisar el listado de Personas y el resumen: colores variados, la misma persona del mismo color en ambos lugares, iniciales legibles sobre el fondo tenue, y el `AvatarGroup` con los círculos bien separados. Repetir en tema oscuro.
- [ ] 6.4 Revisar la página de Avatar en el docs (`pnpm docs:dev`) con los ejemplos y el texto nuevos.
